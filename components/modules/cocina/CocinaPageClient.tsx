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
import { updateOrderStatus } from "@/app/actions/orders";

interface Order {
  id: string;
  tableId: number;
  items: any[];
  total: number;
  createdAt: string | Date;
  status: string;
}

export default function CocinaPageClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  useEffect(() => {
    socket.on("order-update", (newOrder: Order) => {
      // Evitar duplicados si ya existe por carga inicial
      setOrders(prev => {
        if (prev.find(o => o.id === newOrder.id)) return prev;
        return [...prev, newOrder];
      });
    });

    socket.on("status-changed", (data: { id: string, status: string }) => {
      setOrders(prev => prev.map(o => 
        o.id === data.id ? { ...o, status: data.status } : o
      ));
    });

    return () => {
      socket.off("order-update");
      socket.off("status-changed");
    };
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateOrderStatus(id, status as any);
      socket.emit("update-status", { id, status });
    } catch (error) {
      console.error(error);
    }
  };

  const activeOrders = orders.filter(o => o.status !== "ENTREGADO" && o.status !== "PAGADO");
  
  const pendingOrders = activeOrders.filter(o => o.status === "PENDIENTE");
  const inPreparationOrders = activeOrders.filter(o => o.status === "EN_PREPARACION");
  const readyOrders = activeOrders.filter(o => o.status === "LISTO");

  return (
    <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-orange-500" />
          Monitor de Cocina
        </h1>
        <p className="text-zinc-500">Gestión de comandas en tiempo real</p>
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
              {pendingOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} onAction={() => handleUpdateStatus(order.id, "EN_PREPARACION")} actionIcon={<Play />} actionText="Preparar" />
            ))}
          </div>
        </div>

        {/* Columna: En Preparación */}
        <div className="flex-1 flex flex-col bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 text-blue-500">
              <Play className="w-4 h-4" />
              En Cocina
            </h2>
            <span className="bg-blue-500/20 text-blue-500 text-xs font-black px-2 py-1 rounded-md">
              {inPreparationOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {inPreparationOrders.map(order => (
              <OrderCard key={order.id} order={order} onAction={() => handleUpdateStatus(order.id, "LISTO")} actionIcon={<Check />} actionText="Listo" variant="blue" />
            ))}
          </div>
        </div>

        {/* Columna: Listos */}
        <div className="flex-1 flex flex-col bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              Para Entrega
            </h2>
            <span className="bg-emerald-500/20 text-emerald-500 text-xs font-black px-2 py-1 rounded-md">
              {readyOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {readyOrders.map(order => (
              <OrderCard key={order.id} order={order} onAction={() => handleUpdateStatus(order.id, "ENTREGADO")} actionIcon={<CheckCircle2 />} actionText="Entregar" variant="emerald" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onAction, actionIcon, actionText, variant = "orange" }: any) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(order.createdAt).getTime();
      const now = new Date().getTime();
      setTimeElapsed(Math.floor((now - start) / 60000));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [order.createdAt]);
  
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

  return (
    <div className={`p-4 rounded-2xl border-2 transition-all ${colors[variant as keyof typeof colors]}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-black uppercase text-zinc-500 tracking-widest">Mesa</span>
          <p className="text-2xl font-black leading-none">{order.tableId}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-zinc-400">
          <Clock className="w-3 h-3" />
          {timeElapsed} min
        </div>
      </div>

      <div className="space-y-2 mb-6 border-y border-white/5 py-4">
        {order.items.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <span className="font-bold text-zinc-200">
              <span className="text-orange-500 mr-2">{item.quantity}x</span>
              {item.product?.name || item.name}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onAction}
        className={`w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${btnColors[variant as keyof typeof btnColors]}`}
      >
        {actionIcon}
        {actionText}
      </button>
    </div>
  );
}
