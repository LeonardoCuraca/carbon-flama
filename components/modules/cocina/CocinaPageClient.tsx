"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Play, 
  Check,
  AlertCircle
} from "lucide-react";
import { updateOrderItemStatus } from "@/app/actions/orders";

interface KitchenItem {
  id: string;
  orderId: string;
  tableId: number;
  productId: string;
  name: string;
  quantity: number;
  notes?: string;
  modifiers?: any;
  status: string;
  createdAt: string | Date;
}

export default function CocinaPageClient({ initialOrders }: { initialOrders: any[] }) {
  const getInitialItems = (ordersList: any[]): KitchenItem[] => {
    return ordersList.flatMap(order => 
      (order.items || []).map((item: any) => ({
        id: item.id,
        orderId: order.id,
        tableId: order.tableId,
        productId: item.productId,
        name: item.product?.name || item.name,
        quantity: item.quantity,
        notes: item.notes,
        modifiers: item.modifiers,
        status: item.status,
        createdAt: order.createdAt
      }))
    );
  };

  const [items, setItems] = useState<KitchenItem[]>(() => getInitialItems(initialOrders));

  useEffect(() => {
    // Al recibir un nuevo pedido, aplanamos sus ítems y los agregamos a la lista
    socket.on("order-update", (newOrder: any) => {
      setItems(prev => {
        const existingOrderItems = prev.filter(i => i.orderId === newOrder.id);
        if (existingOrderItems.length > 0) return prev;

        const newItems = (newOrder.items || []).map((item: any) => ({
          id: item.id,
          orderId: newOrder.id,
          tableId: newOrder.tableId,
          productId: item.productId,
          name: item.product?.name || item.name,
          quantity: item.quantity,
          notes: item.notes,
          modifiers: item.modifiers,
          status: item.status || "PENDIENTE",
          createdAt: newOrder.createdAt
        }));
        return [...prev, ...newItems];
      });
    });

    // Al cambiar el estado de un plato individual
    socket.on("item-status-changed", (data: { id: string, status: string }) => {
      setItems(prev => prev.map(item => 
        item.id === data.id ? { ...item, status: data.status } : item
      ));
    });

    // Si una orden se marca como PAGADA, removemos todos sus platos
    socket.on("status-changed", (data: { id: string, status: string }) => {
      if (data.status === "PAGADO") {
        setItems(prev => prev.filter(item => item.orderId !== data.id));
      }
    });

    return () => {
      socket.off("order-update");
      socket.off("item-status-changed");
      socket.off("status-changed");
    };
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateOrderItemStatus(id, status as any);
      socket.emit("update-item-status", { id, status });
    } catch (error) {
      console.error(error);
    }
  };

  const pendingItems = items.filter(i => i.status === "PENDIENTE");
  const inPreparationItems = items.filter(i => i.status === "EN_PREPARACION");
  const readyItems = items.filter(i => i.status === "LISTO");

  return (
    <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-orange-500" />
          Monitor de Cocina (Platos)
        </h1>
        <p className="text-zinc-500">Gestión de platos individuales en tiempo real</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Columna: Pendientes */}
        <div className="flex-1 flex flex-col bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 text-amber-500">
              <AlertCircle className="w-4 h-4" />
              Pendientes
            </h2>
            <span className="bg-amber-500/20 text-amber-500 text-xs font-black px-2 py-1 rounded-md">
              {pendingItems.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {pendingItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onAction={() => handleUpdateStatus(item.id, "EN_PREPARACION")} 
                actionIcon={<Play className="w-4 h-4" />} 
                actionText="Preparar" 
              />
            ))}
          </div>
        </div>

        {/* Columna: En Cocina */}
        <div className="flex-1 flex flex-col bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 text-blue-500">
              <Play className="w-4 h-4" />
              En Cocina
            </h2>
            <span className="bg-blue-500/20 text-blue-500 text-xs font-black px-2 py-1 rounded-md">
              {inPreparationItems.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {inPreparationItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onAction={() => handleUpdateStatus(item.id, "LISTO")} 
                actionIcon={<Check className="w-4 h-4" />} 
                actionText="Listo" 
                variant="blue" 
              />
            ))}
          </div>
        </div>

        {/* Columna: Listos / Para Entrega */}
        <div className="flex-1 flex flex-col bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              Para Entrega
            </h2>
            <span className="bg-emerald-500/20 text-emerald-500 text-xs font-black px-2 py-1 rounded-md">
              {readyItems.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {readyItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onAction={() => handleUpdateStatus(item.id, "ENTREGADO")} 
                actionIcon={<CheckCircle2 className="w-4 h-4" />} 
                actionText="Entregar" 
                variant="emerald" 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemCard({ item, onAction, actionIcon, actionText, variant = "orange" }: { item: KitchenItem, onAction: () => void, actionIcon: React.ReactNode, actionText: string, variant?: string }) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(item.createdAt).getTime();
      const now = new Date().getTime();
      setTimeElapsed(Math.floor((now - start) / 60000));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [item.createdAt]);

  const colors = {
    orange: "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40",
    blue: "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40",
    emerald: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
  };

  const btnColors = {
    orange: "bg-orange-600 hover:bg-orange-500",
    blue: "bg-blue-600 hover:bg-blue-500",
    emerald: "bg-emerald-600 hover:bg-emerald-500"
  };

  let mods: any = null;
  if (item.modifiers) {
    try {
      mods = typeof item.modifiers === "string" ? JSON.parse(item.modifiers) : item.modifiers;
    } catch (e) {
      mods = item.modifiers;
    }
  }

  return (
    <div className={`p-4 rounded-2xl border-2 transition-all ${colors[variant as keyof typeof colors]}`}>
      {/* Cabecera de Tarjeta: Mesa + Tiempo */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-black uppercase text-zinc-500 tracking-widest">Mesa</span>
          <p className="text-2xl font-black leading-none">{item.tableId}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-zinc-400">
          <Clock className="w-3 h-3" />
          {timeElapsed} min
        </div>
      </div>

      {/* Info del Plato */}
      <div className="space-y-2 mb-4 border-t border-white/5 pt-3">
        <div className="text-sm">
          <span className="font-bold text-zinc-200">
            <span className="text-orange-500 mr-2">{item.quantity}x</span>
            {item.name}
          </span>
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

      {/* Acciones */}
      <button
        onClick={onAction}
        className={`w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${btnColors[variant as keyof typeof btnColors]}`}
      >
        {actionIcon}
        {actionText}
      </button>
    </div>
  );
}
