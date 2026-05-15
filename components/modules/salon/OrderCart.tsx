"use client";

import { useCartStore } from "@/lib/store/useCartStore";
import { Trash2, Plus, Minus, Send, ReceiptText } from "lucide-react";
import { socket } from "@/lib/socket";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/app/actions/orders";

export default function OrderCart({ tableId }: { tableId: number }) {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendToKitchen = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      // 1. Guardar en DB mediante Server Action
      const order = await createOrder(tableId, items, getTotal());

      // 2. Notificar vía Socket
      socket.emit("new-order", {
        ...order,
        items, // Incluimos los items para que la cocina los vea
        timestamp: new Date().toISOString()
      });
      
      // 3. Limpiar y volver al mapa
      clearCart();
      router.push("/dashboard/mozo?msg=success");
    } catch (error) {
      console.error(error);
      alert("Error al enviar el pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-orange-500" />
          Pedido Actual
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
            <UtensilsCrossed className="w-12 h-12 mb-4" />
            <p className="text-sm font-medium">El carrito está vacío</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm">{item.name}</h4>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-zinc-600 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-white/10 rounded-md transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-white/10 rounded-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="font-bold text-orange-500 text-sm">S/ {item.subtotal.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-black/40 space-y-4">
        <div className="flex justify-between items-center text-zinc-400 text-sm font-medium">
          <span>Subtotal</span>
          <span>S/ {(getTotal() / 1.18).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-zinc-400 text-sm font-medium">
          <span>IGV (18%)</span>
          <span>S/ {(getTotal() - (getTotal() / 1.18)).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">Total</span>
          <span className="text-2xl font-black text-orange-500 tracking-tight">
            S/ {getTotal().toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleSendToKitchen}
          disabled={items.length === 0 || loading}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
        >
          {loading ? "Enviando..." : "Enviar a Cocina"}
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

import { UtensilsCrossed } from "lucide-react";
