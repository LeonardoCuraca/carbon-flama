"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import Link from "next/link";
import {
  Utensils,
  Circle,
  Clock,
  CalendarClock,
  X,
  CheckCircle2,
  BookOpen,
  Trash2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { socket } from "@/lib/socket";
import { toggleReservation } from "@/app/actions/orders";

function ElapsedTime({ createdAt }: { createdAt: string | Date }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const update = () => {
      const diffMs = Date.now() - new Date(createdAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) {
        setElapsed("<1m");
      } else if (diffMins < 60) {
        setElapsed(`${diffMins}m`);
      } else {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        setElapsed(`${hours}h ${mins}m`);
      }
    };

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <div className="flex items-center gap-1 text-[10px] font-black text-zinc-400">
      <Clock className="w-3 h-3 text-zinc-500 flex-shrink-0" />
      <span>{elapsed}</span>
    </div>
  );
}

// ── Menú contextual flotante ──────────────────────────────────────────────────
interface ContextMenuProps {
  table: any;
  position: { x: number; y: number };
  onClose: () => void;
  onReserve: () => void;
  onRelease: () => void;
}

function TableContextMenu({ table, position, onClose, onReserve, onRelease }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Ajustar posición para que no se salga de pantalla
  const [pos, setPos] = useState(position);
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setPos({
        x: Math.min(position.x, vw - rect.width - 12),
        y: Math.min(position.y, vh - rect.height - 12),
      });
    }
  }, [position]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: "fixed", top: pos.y, left: pos.x, zIndex: 9999 }}
      className="bg-[#1c1c1c] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 p-2 min-w-[210px] animate-in zoom-in-95 fade-in duration-150"
    >
      <div className="px-3 py-2 mb-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Mesa {table.id}
        </p>
        <p className="text-xs font-bold text-zinc-300">{table.zone}</p>
      </div>
      <div className="h-px bg-white/5 mx-2 mb-1" />

      {table.status === "DISPONIBLE" && (
        <>
          <Link
            href={`/dashboard/mozo/order/${table.id}`}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-semibold text-white w-full"
          >
            <Utensils className="w-4 h-4 text-orange-400" />
            Nuevo pedido
          </Link>
          <button
            onClick={onReserve}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-violet-500/10 transition-colors text-sm font-semibold text-violet-300 w-full"
          >
            <CalendarClock className="w-4 h-4 text-violet-400" />
            Reservar mesa
          </button>
        </>
      )}

      {table.status === "RESERVADO" && (
        <>
          {table.reservationNote && (
            <div className="px-3 py-2 mb-1 bg-violet-500/10 rounded-xl mx-1">
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-0.5">Nota</p>
              <p className="text-xs text-violet-200 font-medium">{table.reservationNote}</p>
            </div>
          )}
          <Link
            href={`/dashboard/mozo/order/${table.id}`}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-semibold text-white w-full"
          >
            <Utensils className="w-4 h-4 text-orange-400" />
            Tomar pedido
          </Link>
          <button
            onClick={onRelease}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-semibold text-red-400 w-full"
          >
            <Trash2 className="w-4 h-4" />
            Liberar reserva
          </button>
        </>
      )}
    </div>,
    document.body
  );
}

// ── Modal de reserva ──────────────────────────────────────────────────────────
interface ReservationModalProps {
  tableId: number;
  onClose: () => void;
  onConfirm: (note: string) => void;
  isPending: boolean;
}

function ReservationModal({ tableId, onClose, onConfirm, isPending }: ReservationModalProps) {
  const [note, setNote] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(note.trim());
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative z-10">
        {/* Ícono */}
        <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6">
          <CalendarClock className="w-7 h-7 text-violet-400" />
        </div>

        <h2 className="text-xl font-black mb-1 tracking-tight">Reservar Mesa {tableId}</h2>
        <p className="text-zinc-500 text-sm mb-6">
          Agrega una nota opcional (nombre del cliente, hora, etc.)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: García - 8:00 pm"
            maxLength={60}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 transition-all"
          />

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-bold hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Guardando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function MozoPageClient({
  initialTables,
  initialZone,
}: {
  initialTables: any[];
  initialZone?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [tables, setTables] = useState(initialTables);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Menú contextual
  const [contextMenu, setContextMenu] = useState<{ table: any; x: number; y: number } | null>(null);
  // Modal de reserva
  const [reservingTable, setReservingTable] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (searchParams.get("msg") === "success") {
      setShowSuccessModal(true);
      const newUrl = initialZone ? `/dashboard/mozo?zone=${initialZone}` : "/dashboard/mozo";
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, initialZone]);

  useEffect(() => {
    socket.on("status-changed", () => router.refresh());
    socket.on("order-update", () => router.refresh());
    return () => {
      socket.off("status-changed");
      socket.off("order-update");
    };
  }, [router]);

  useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);

  const zones = ["Salón A", "Salón B", "Terraza"];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "DISPONIBLE":
        return "bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-orange-500/40 hover:bg-zinc-700/80";
      case "PEDIDO_ENVIADO":
        return "bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/15";
      case "RESERVADO":
        return "bg-violet-500/10 text-violet-300 border-violet-500/30 hover:bg-violet-500/15";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DISPONIBLE":    return <Circle className="w-4 h-4" />;
      case "PEDIDO_ENVIADO": return <Utensils className="w-4 h-4" />;
      case "RESERVADO":    return <CalendarClock className="w-4 h-4" />;
      default:             return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DISPONIBLE":    return "Disponible";
      case "PEDIDO_ENVIADO": return "Pedido Enviado";
      case "RESERVADO":    return "Reservada";
      default:             return status;
    }
  };

  const handleTableClick = (e: React.MouseEvent, table: any) => {
    // Mesas con pedido activo → ir directo
    if (table.status === "PEDIDO_ENVIADO") return;

    e.preventDefault();
    setContextMenu({ table, x: e.clientX, y: e.clientY });
  };

  const handleConfirmReservation = (note: string) => {
    if (reservingTable === null) return;
    startTransition(async () => {
      await toggleReservation(reservingTable, note);
      setReservingTable(null);
      setContextMenu(null);
      router.refresh();
    });
  };

  const handleReleaseReservation = (tableId: number) => {
    startTransition(async () => {
      await toggleReservation(tableId);
      setContextMenu(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      {/* Modal de éxito de pedido */}
      {showSuccessModal && mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="fixed inset-0" onClick={() => setShowSuccessModal(false)} />
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

      {/* Menú contextual */}
      {contextMenu && mounted && (
        <TableContextMenu
          table={contextMenu.table}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onReserve={() => setReservingTable(contextMenu.table.id)}
          onRelease={() => handleReleaseReservation(contextMenu.table.id)}
        />
      )}

      {/* Modal de reserva */}
      {reservingTable !== null && mounted && (
        <ReservationModal
          tableId={reservingTable}
          onClose={() => setReservingTable(null)}
          onConfirm={handleConfirmReservation}
          isPending={isPending}
        />
      )}

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mapa de Mesas</h1>
          <p className="text-zinc-500">
            Click en una mesa disponible para ver opciones · Click en mesa con pedido para gestionarlo
          </p>
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

      {/* Grid de mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {tables.map((table) => {
          const hasOrders = table.orders && table.orders.length > 0;
          const isPedido = table.status === "PEDIDO_ENVIADO";

          const card = (
            <div
              key={table.id}
              onClick={(e) => handleTableClick(e, table)}
              className={`min-h-[175px] rounded-[32px] border-2 p-5 flex flex-col justify-between transition-all transform hover:scale-[1.03] active:scale-[0.97] cursor-pointer select-none ${getStatusStyle(table.status)}`}
            >
              {/* Número e ícono */}
              <div className="flex justify-between items-start w-full">
                <span className="text-4xl font-black tracking-tighter leading-none">{table.id}</span>
                <div className="p-2 bg-black/20 rounded-xl flex-shrink-0">
                  {getStatusIcon(table.status)}
                </div>
              </div>

              {/* Badge estado */}
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-black/20 px-2.5 py-1 rounded-full self-start">
                {getStatusLabel(table.status)}
              </div>

              {/* Nota de reserva */}
              {table.status === "RESERVADO" && table.reservationNote && (
                <div className="w-full pt-3 mt-1 border-t border-white/5">
                  <p className="text-[10px] text-violet-300 font-medium truncate flex items-center gap-1">
                    <BookOpen className="w-3 h-3 flex-shrink-0 text-violet-400" />
                    {table.reservationNote}
                  </p>
                </div>
              )}

              {/* Info de pedido activo */}
              {hasOrders && (
                <div className="w-full pt-3 mt-1 border-t border-white/5 space-y-1.5 text-left">
                  <p
                    className="text-[10px] text-zinc-300 font-bold truncate flex items-center gap-1"
                    title={table.orders[0].waiter.name}
                  >
                    <span className="text-zinc-500 font-normal">Mozo:</span>{" "}
                    {table.orders[0].waiter.name}
                  </p>
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-black/10 px-2 py-0.5 rounded">
                      {table.orders.length} {table.orders.length === 1 ? "pedido" : "pedidos"}
                    </span>
                    <ElapsedTime createdAt={table.orders[0].createdAt} />
                  </div>
                </div>
              )}
            </div>
          );

          // Mesas con pedido → wrapper con Link
          return isPedido ? (
            <Link key={table.id} href={`/dashboard/mozo/order/${table.id}`}>
              {card}
            </Link>
          ) : (
            <div key={table.id}>{card}</div>
          );
        })}
      </div>

      {/* Leyenda (3 estados) */}
      <div className="flex flex-wrap items-center gap-6 mt-10 px-6 py-4 bg-[#141414] rounded-2xl border border-white/5">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mr-2">Leyenda</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
          <span className="text-xs text-zinc-400 font-medium">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-zinc-400 font-medium">Pedido Enviado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span className="text-xs text-zinc-400 font-medium">Reservada</span>
        </div>
      </div>
    </div>
  );
}
