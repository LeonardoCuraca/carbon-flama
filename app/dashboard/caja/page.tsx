import prisma from "@/lib/prisma";
import CajaClient from "@/components/modules/caja/CajaClient";
import { Banknote } from "lucide-react";

export default async function CajaPage() {
  const occupiedTables = await prisma.table.findMany({
    where: {
      status: {
        in: ["OCUPADA", "PEDIDO_ENVIADO", "PENDIENTE_PAGO"]
      }
    },
    include: {
      orders: {
        where: { status: { not: "PAGADO" } },
        include: { 
          items: {
            include: { product: true }
          }
        }
      }
    }
  });

  // Cálculo simple de ventas del día (podría ser más complejo)
  const todaySales = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0,0,0,0))
      }
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Módulo de Caja</h1>
          <p className="text-zinc-500">Cuentas activas y facturación</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase">Caja Hoy</p>
              <p className="text-xl font-black">S/ {(todaySales._sum.amount || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <CajaClient occupiedTables={occupiedTables} />
    </div>
  );
}
