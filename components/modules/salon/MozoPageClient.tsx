"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Utensils, 
  Circle, 
  AlertCircle, 
  Clock,
  CheckCircle2,
  X
} from "lucide-react";
import { socket } from "@/lib/socket";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";

export default function MozoPageClient({ initialTables, initialZone }: { initialTables: any[], initialZone?: string }) {
  const [mounted, setMounted] = useState(false);
  const [tables, setTables] = useState(initialTables);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("msg") === "success") {
      setShowSuccessModal(true);
      // Limpiar la URL después de mostrar el modal
      const newUrl = initialZone ? `/dashboard/mozo?zone=${initialZone}` : "/dashboard/mozo";
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, initialZone]);

  useEffect(() => {
    socket.on("status-changed", () => {
      router.refresh();
    });

    socket.on("order-update", () => {
      router.refresh();
    });

    return () => {
      socket.off("status-changed");
      socket.off("order-update");
    };
  }, [router]);

  useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);

  const zones = ["Salón A", "Salón B", "Terraza"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DISPONIBLE": return "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-orange-500/50";
      case "OCUPADA": return "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20";
      case "PEDIDO_ENVIADO": return "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20";
      case "PENDIENTE_PAGO": return "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20";
      default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DISPONIBLE": return <Circle className="w-4 h-4" />;
      case "OCUPADA": return <Utensils className="w-4 h-4" />;
      case "PEDIDO_ENVIADO": return <Clock className="w-4 h-4" />;
      case "PENDIENTE_PAGO": return <AlertCircle className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Modal de Éxito */}
      {showSuccessModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="fixed inset-0" 
            onClick={() => setShowSuccessModal(false)}
          ></div>
          <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center relative z-10">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            
            <h2 className="text-3xl font-black mb-4 tracking-tight">¡Pedido enviado!</h2>
            <p className="text-zinc-400 mb-10 leading-relaxed">
              El pedido ha sido recibido correctamente en la cocina y ya está en preparación.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-white text-black font-black py-5 rounded-2xl text-lg hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              Entendido
            </button>
          </div>
        </div>,
        document.body
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mapa de Mesas</h1>
          <p className="text-zinc-500">Selecciona una mesa para gestionar pedidos</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Link
            href="/dashboard/mozo"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              !initialZone ? "bg-white text-black" : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            Todos
          </Link>
          {zones.map((z) => (
            <Link
              key={z}
              href={`/dashboard/mozo?zone=${z}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                initialZone === z ? "bg-white text-black" : "bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              {z}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {tables.map((table) => (
          <Link
            key={table.id}
            href={`/dashboard/mozo/order/${table.id}`}
            className={`aspect-square rounded-3xl border-2 p-6 flex flex-col items-center justify-center gap-4 transition-all transform hover:scale-105 active:scale-95 ${getStatusColor(table.status)}`}
          >
            <span className="text-4xl font-black tracking-tighter">{table.id}</span>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
              {getStatusIcon(table.status)}
              {table.status.replace("_", " ")}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 p-6 bg-[#141414] rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
          <span className="text-xs text-zinc-400 font-medium">Gris: Disponible</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-zinc-400 font-medium">Rojo: Ocupada</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-zinc-400 font-medium">Azul: Pedido Enviado</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-xs text-zinc-400 font-medium">Ámbar: Pendiente Pago</span>
        </div>
      </div>
    </div>
  );
}
