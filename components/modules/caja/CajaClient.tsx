"use client";

import { useState, useEffect } from "react";
import { 
  Banknote, 
  CreditCard, 
  Wallet, 
  Users,
  Receipt,
  CheckCircle2,
  X,
  Printer,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { processPayment } from "@/app/actions/orders";
import { socket } from "@/lib/socket";
import { createPortal } from "react-dom";

export default function CajaClient({ occupiedTables }: { occupiedTables: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [docType, setDocType] = useState("BOLETA");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePayment = async (method: string) => {
    if (!selectedTable) return;
    setIsProcessing(true);
    try {
      const orderId = selectedTable.orders[0].id;
      const total = selectedTable.orders[0].total;
      
      await processPayment(orderId, total, method);
      socket.emit("status-changed", { id: orderId, status: "PAGADO" });
      
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      setSelectedTable(null);
    } catch (error) {
      alert("Error al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-200px)]">
      {/* Portals */}
      {mounted && createPortal(
        <>
          {/* Modal de Pago */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black">Cerrar Mesa {selectedTable?.id}</h2>
                  <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-white/5 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-3 block">Tipo de Comprobante</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["BOLETA", "FACTURA"].map(t => (
                        <button
                          key={t}
                          onClick={() => setDocType(t)}
                          className={`py-4 rounded-2xl font-bold transition-all border-2 ${
                            docType === t ? "bg-orange-600 border-orange-500 text-white" : "bg-white/5 border-transparent text-zinc-400"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/40 p-6 rounded-3xl border border-white/5 text-center">
                    <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Total a Cobrar</p>
                    <p className="text-4xl font-black text-orange-500">S/ {selectedTable?.orders[0]?.total.toFixed(2)}</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-1 block">Método de Pago</label>
                    <button 
                      onClick={() => handlePayment("EFECTIVO")}
                      className="w-full bg-white/5 hover:bg-emerald-600 hover:text-white p-5 rounded-2xl flex items-center gap-4 transition-all group font-bold"
                    >
                      <Banknote className="w-6 h-6 text-emerald-500 group-hover:text-white" />
                      Efectivo
                    </button>
                    <button 
                      onClick={() => handlePayment("TARJETA")}
                      className="w-full bg-white/5 hover:bg-blue-600 hover:text-white p-5 rounded-2xl flex items-center gap-4 transition-all group font-bold"
                    >
                      <CreditCard className="w-6 h-6 text-blue-500 group-hover:text-white" />
                      Tarjeta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Éxito */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black mb-2">¡Comprobante generado!</h2>
                <p className="text-zinc-500 mb-8">La mesa ha sido liberada correctamente.</p>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-white text-black font-black py-5 rounded-2xl text-lg"
                >
                  Aceptar
                </button>
              </div>
            </div>
          )}
        </>,
        document.body
      )}

      {/* Grid de Mesas (Izquierda/Centro) */}
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-zinc-400">
          <Users className="w-5 h-5 text-orange-500" />
          Selecciona una mesa para generar la cuenta
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {occupiedTables.map(table => (
            <div 
              key={table.id} 
              onClick={() => setSelectedTable(table)}
              className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${
                selectedTable?.id === table.id 
                  ? "bg-orange-600/10 border-orange-500 shadow-lg shadow-orange-500/10" 
                  : "bg-[#141414] border-white/5 hover:border-white/10"
              }`}
            >
              <span className="text-xs font-black uppercase text-zinc-500">Mesa</span>
              <span className="text-4xl font-black leading-none">{table.id}</span>
              <div className="bg-black/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-500">
                Cuenta Activa
              </div>
              <p className="font-bold text-orange-500 mt-2">S/ {table.orders.reduce((acc: number, o: any) => acc + o.total, 0).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detalle de Pedido (Derecha) */}
      <div className="w-full lg:w-[400px] flex flex-col bg-[#141414] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
        {selectedTable ? (
          <div className="flex flex-col h-full">
            <div className="p-8 border-b border-white/5 bg-white/5">
              <h3 className="text-xl font-black">Resumen de pedido: Mesa {selectedTable.id}</h3>
              <p className="text-zinc-500 text-sm">#{selectedTable.orders[0]?.id.slice(-6).toUpperCase()}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {selectedTable.orders[0]?.items.map((item: any) => {
                let mods: any = null;
                if (item.modifiers) {
                  try {
                    mods = typeof item.modifiers === "string" ? JSON.parse(item.modifiers) : item.modifiers;
                  } catch (e) {
                    mods = item.modifiers;
                  }
                }
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <span className="font-black text-orange-500">{item.quantity}</span>
                        <div>
                          <p className="font-bold text-sm">{item.product?.name || item.name}</p>
                          <p className="text-xs text-zinc-500">Unit: S/ {item.product?.price?.toFixed(2) || item.price?.toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-sm">S/ {item.subtotal.toFixed(2)}</span>
                    </div>

                    {/* Modificadores */}
                    {mods && Object.keys(mods).length > 0 && (
                      <div className="pl-8 text-xs text-zinc-400 space-y-0.5">
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
                      <p className="pl-8 text-xs text-amber-500 italic">
                        Nota: "{item.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-8 border-t border-white/5 bg-black/40 space-y-6">
              <div className="space-y-2 text-sm text-zinc-400 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>S/ {(selectedTable.orders[0]?.total / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGV (18%)</span>
                  <span>S/ {(selectedTable.orders[0]?.total - (selectedTable.orders[0]?.total / 1.18)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-white pt-2">
                  <span>Total</span>
                  <span className="text-orange-500">S/ {selectedTable.orders[0]?.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all">
                  <Printer className="w-5 h-5" />
                  <span className="text-xs">Imp. Precuenta</span>
                </button>
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-orange-600 hover:bg-orange-500 py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-xl shadow-orange-600/20"
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs">Cobrar</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30 grayscale">
            <ClipboardList className="w-16 h-16 mb-6" />
            <p className="text-lg font-black tracking-tight">Selecciona una mesa</p>
            <p className="text-sm">Para visualizar el detalle y procesar el pago</p>
          </div>
        )}
      </div>
    </div>
  );
}
