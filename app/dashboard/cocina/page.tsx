import prisma from "@/lib/prisma";
import CocinaPageClient from "@/components/modules/cocina/CocinaPageClient";

export default async function CocinaPage() {
  // Obtener pedidos activos de la DB (Pendientes, En Preparación, Listos)
  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PENDIENTE", "EN_PREPARACION", "LISTO"]
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return <CocinaPageClient initialOrders={orders} />;
}
