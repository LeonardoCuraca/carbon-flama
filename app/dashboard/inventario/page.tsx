import prisma from "@/lib/prisma";
import InventoryClient from "@/components/modules/inventario/InventoryClient";
import { Package, Plus, History } from "lucide-react";

export default async function InventarioPage() {
  const supplies = await prisma.supply.findMany({
    orderBy: { status: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-500" />
            Control de Inventario
          </h1>
          <p className="text-zinc-500">Insumos, stock y alertas críticas</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all">
            <Plus className="w-5 h-5" />
            Nuevo Insumo
          </button>
          <button className="flex items-center gap-2 bg-[#141414] border border-white/5 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/5 transition-all">
            <History className="w-5 h-5" />
            Historial
          </button>
        </div>
      </div>

      <InventoryClient supplies={supplies} />
    </div>
  );
}
