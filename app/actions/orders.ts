"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus, TableStatus, OrderItemStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createOrder(tableId: number, items: any[], total: number) {
  const session = await getServerSession(authOptions);
  
  if (!session) throw new Error("No autenticado");

  // 1. Crear la orden en la DB
  const order = await prisma.order.create({
    data: {
      tableId,
      userId: (session.user as any).id,
      status: OrderStatus.PENDIENTE,
      total,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          subtotal: item.subtotal,
          notes: item.notes,
          modifiers: item.modifiers
        }))
      }
    }
  });

  // 2. Actualizar el estado de la mesa (limpia también la nota de reserva)
  await prisma.table.update({
    where: { id: tableId },
    data: { status: TableStatus.PEDIDO_ENVIADO, reservationNote: null }
  });

  revalidatePath("/dashboard/mozo");
  return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });

  // Si la orden se marca como PAGADA, liberamos la mesa
  if (status === OrderStatus.PAGADO) {
    await prisma.table.update({
      where: { id: order.tableId },
      data: { status: TableStatus.DISPONIBLE }
    });
  }

  revalidatePath("/dashboard/cocina");
  revalidatePath("/dashboard/mozo");
  return order;
}

export async function updateOrderItemStatus(itemId: string, status: OrderItemStatus) {
  const item = await prisma.orderItem.update({
    where: { id: itemId },
    data: { status },
    include: { order: true }
  });

  // Recalcular el estado de la Orden general en base a sus ítems
  const allItems = await prisma.orderItem.findMany({
    where: { orderId: item.orderId }
  });

  let newOrderStatus: OrderStatus = OrderStatus.PENDIENTE;
  if (allItems.every(i => i.status === OrderItemStatus.ENTREGADO)) {
    newOrderStatus = OrderStatus.ENTREGADO;
  } else if (allItems.every(i => i.status === OrderItemStatus.LISTO || i.status === OrderItemStatus.ENTREGADO)) {
    newOrderStatus = OrderStatus.LISTO;
  } else if (allItems.some(i => i.status === OrderItemStatus.EN_PREPARACION || i.status === OrderItemStatus.LISTO || i.status === OrderItemStatus.ENTREGADO)) {
    newOrderStatus = OrderStatus.EN_PREPARACION;
  }

  await prisma.order.update({
    where: { id: item.orderId },
    data: { status: newOrderStatus }
  });

  revalidatePath("/dashboard/cocina");
  revalidatePath("/dashboard/mozo");
  return item;
}

export async function processPayment(orderId: string, amount: number, method: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) throw new Error("Orden no encontrada");

  await prisma.payment.create({
    data: {
      orderId,
      amount,
      method: method as any,
    }
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.PAGADO }
  });

  await prisma.table.update({
    where: { id: order.tableId },
    data: { status: TableStatus.DISPONIBLE }
  });

  revalidatePath("/dashboard/caja");
  revalidatePath("/dashboard/mozo");
}

export async function toggleReservation(tableId: number, note?: string) {
  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table) throw new Error("Mesa no encontrada");

  if (table.status === TableStatus.RESERVADO) {
    // Liberar la reserva
    await prisma.table.update({
      where: { id: tableId },
      data: { status: TableStatus.DISPONIBLE, reservationNote: null }
    });
  } else if (table.status === TableStatus.DISPONIBLE) {
    // Marcar como reservada
    await prisma.table.update({
      where: { id: tableId },
      data: { status: TableStatus.RESERVADO, reservationNote: note || null }
    });
  }

  revalidatePath("/dashboard/mozo");
}

export async function updateSupplyStock(supplyId: string, quantity: number) {
  const supply = await prisma.supply.update({
    where: { id: supplyId },
    data: { stock: { increment: quantity } }
  });
  
  // Actualizar estado basado en el nuevo stock
  await prisma.supply.update({
    where: { id: supplyId },
    data: { status: supply.stock <= supply.minRequired ? "CRITICAL" : supply.stock <= supply.minRequired * 1.5 ? "WARNING" : "OK" }
  });

  revalidatePath("/dashboard/inventario");
}

export async function createSupply(data: { name: string, stock: number, minRequired: number, unit: string }) {
  const supply = await prisma.supply.create({
    data: {
      ...data,
      status: data.stock <= data.minRequired ? "CRITICAL" : data.stock <= data.minRequired * 1.5 ? "WARNING" : "OK"
    }
  });
  revalidatePath("/dashboard/inventario");
  return supply;
}

export async function updateSupply(id: string, data: any) {
  const supply = await prisma.supply.update({
    where: { id },
    data: {
      ...data,
      status: data.stock <= data.minRequired ? "CRITICAL" : data.stock <= data.minRequired * 1.5 ? "WARNING" : "OK"
    }
  });
  revalidatePath("/dashboard/inventario");
  return supply;
}

export async function deleteSupply(id: string) {
  await prisma.supply.delete({
    where: { id }
  });
  revalidatePath("/dashboard/inventario");
}

export async function getReadyItemsCount() {
  return await prisma.orderItem.count({
    where: {
      status: "LISTO"
    }
  });
}

