import prisma from "@/lib/prisma";
import MenuSelector from "@/components/modules/salon/MenuSelector";
import OrderCart from "@/components/modules/salon/OrderCart";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId: tableIdStr } = await params;
  const tableId = parseInt(tableIdStr);
  
  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: { isAvailable: true },
        include: {
          optionGroups: {
            include: {
              options: true
            }
          }
        }
      }
    }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard/mozo" 
          className="p-2 hover:bg-white/5 rounded-xl transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold">Mesa {tableId}</h1>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Lado Izquierdo: Menú */}
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <MenuSelector categories={categories} />
        </div>

        {/* Lado Derecho: Carrito */}
        <div className="w-96 flex flex-col bg-[#141414] rounded-3xl border border-white/5 overflow-hidden">
          <OrderCart tableId={tableId} />
        </div>
      </div>
    </div>
  );
}
