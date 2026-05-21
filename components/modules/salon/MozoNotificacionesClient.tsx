"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { 
  Bell,
  Clock,
  CheckCircle2,
  UtensilsCrossed,
  PartyPopper
} from "lucide-react";
import { updateOrderItemStatus } from "@/app/actions/orders";

interface ReadyItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  notes?: string | null;
  modifiers?: any;
  status: string;
  product: {
    name: string;
    price: number;
  };
  order: {
    tableId: number;
    createdAt: string | Date;
    waiter: {
      name: string;
    } | null;
  };
}

export default function MozoNotificacionesClient({ initialItems }: { initialItems: any[] }) {
  const normalize = (raw: any): ReadyItem => ({
    id: raw.id,
    orderId: raw.orderId,
    productId: raw.productId,
    quantity: raw.quantity,
    notes: raw.notes,
    modifiers: raw.modifiers,
    status: raw.status,
    product: raw.product,
    order: raw.order
  });

  const [items, setItems] = useState<ReadyItem[]>(initialItems.map(normalize));
  const [delivering, setDelivering] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Cuando un ítem cambia estado desde la cocina
    socket.on("item-status-changed", (data: { id: string; status: string }) => {
      if (data.status === "LISTO") {
        // No tenemos los datos completos, así que solo recargaremos si no existe
        // El mecanismo de revalidación del server action se encarga del re-render
      } else if (data.status !== "LISTO") {
        // Remover si ya no está listo
        setItems(prev => prev.filter(item => item.id !== data.id));
      }
    });

    // Cuando un nuevo pedido llega podría contener platos "LISTO"
    socket.on("order-update", () => {
      // Revalidation via server will handle this
    });

    // Si una orden se marca como PAGADA, remover todos sus platos
    socket.on("status-changed", (data: { id: string; status: string }) => {
      if (data.status === "PAGADO") {
        setItems(prev => prev.filter(item => item.orderId !== data.id));
      }
    });

    return () => {
      socket.off("item-status-changed");
      socket.off("order-update");
      socket.off("status-changed");
    };
  }, []);

  const handleDeliver = async (itemId: string) => {
    setDelivering(prev => new Set(prev).add(itemId));
    try {
      await updateOrderItemStatus(itemId, "ENTREGADO");
      socket.emit("update-item-status", { id: itemId, status: "ENTREGADO" });
      // Animación de salida antes de remover
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== itemId));
        setDelivering(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }, 500);
    } catch (error) {
      console.error(error);
      setDelivering(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const getElapsedMinutes = (createdAt: string | Date) => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return Math.floor((now - start) / 60000);
  };

  const getUrgencyClass = (minutes: number) => {
    if (minutes >= 15) return "border-red-500/40 bg-red-500/5";
    if (minutes >= 8) return "border-amber-500/40 bg-amber-500/5";
    return "border-emerald-500/30 bg-emerald-500/5";
  };

  const getTimeBadgeClass = (minutes: number) => {
    if (minutes >= 15) return "bg-red-500/20 text-red-400";
    if (minutes >= 8) return "bg-amber-500/20 text-amber-400";
    return "bg-emerald-500/20 text-emerald-400";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="relative">
              <Bell className="w-8 h-8 text-orange-500" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-[10px] font-black text-white flex items-center justify-center animate-pulse">
                  {items.length > 9 ? "9+" : items.length}
                </span>
              )}
            </div>
            Entrega de Platos
          </h1>
          <p className="text-zinc-500 mt-1">
            {items.length === 0
              ? "No hay platos pendientes de entrega"
              : `${items.length} plato${items.length !== 1 ? "s" : ""} listo${items.length !== 1 ? "s" : ""} para entregar`}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-zinc-400 bg-white/5 rounded-xl px-4 py-2 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Actualización en tiempo real
          </div>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
          <PartyPopper className="w-20 h-20 mb-6 text-orange-500" />
          <p className="text-2xl font-black mb-2">¡Todo entregado!</p>
          <p className="text-zinc-400">No hay platos esperando ser llevados a las mesas</p>
        </div>
      )}

      {/* Grid de platos listos */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map(item => {
            const minutes = getElapsedMinutes(item.order.createdAt);
            const isDelivering = delivering.has(item.id);

            let mods: any = null;
            if (item.modifiers) {
              try {
                mods = typeof item.modifiers === "string" ? JSON.parse(item.modifiers) : item.modifiers;
              } catch {
                mods = item.modifiers;
              }
            }

            return (
              <div
                key={item.id}
                className={`rounded-[28px] border-2 p-6 flex flex-col gap-4 transition-all duration-500 ${
                  isDelivering ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
                } ${getUrgencyClass(minutes)}`}
              >
                {/* Mesa + Tiempo */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-black uppercase text-zinc-500 tracking-widest">Mesa</span>
                    <p className="text-4xl font-black leading-none">{item.order.tableId}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${getTimeBadgeClass(minutes)}`}>
                    <Clock className="w-3 h-3" />
                    {minutes} min
                  </div>
                </div>

                {/* Plato */}
                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <p className="font-bold text-base">
                      <span className="text-orange-500 mr-1.5">{item.quantity}x</span>
                      {item.product.name}
                    </p>
                  </div>

                  {/* Modificadores */}
                  {mods && Object.keys(mods).length > 0 && (
                    <div className="pl-6 text-xs text-zinc-400 space-y-0.5 border-l border-white/10 ml-2">
                      {Object.entries(mods).map(([key, val]: [string, any]) => {
                        if (!val || (Array.isArray(val) && val.length === 0)) return null;
                        const displayValue = Array.isArray(val) ? val.join(", ") : val;
                        const displayName = key.charAt(0).toUpperCase() + key.slice(1);
                        return (
                          <p key={key}>
                            <span className="text-zinc-500">{displayName}:</span> {displayValue}
                          </p>
                        );
                      })}
                    </div>
                  )}

                  {/* Indicaciones especiales */}
                  {item.notes && (
                    <p className="pl-6 text-xs text-amber-500 italic font-semibold">
                      ⚠️ "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Mozo */}
                {item.order.waiter && (
                  <p className="text-xs text-zinc-500 border-t border-white/5 pt-3">
                    Pedido por{" "}
                    <span className="text-zinc-300 font-semibold">{item.order.waiter.name}</span>
                  </p>
                )}

                {/* Botón de entrega */}
                <button
                  onClick={() => handleDeliver(item.id)}
                  disabled={isDelivering}
                  className="w-full mt-auto py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {isDelivering ? "Entregando..." : "Marcar como Entregado"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
