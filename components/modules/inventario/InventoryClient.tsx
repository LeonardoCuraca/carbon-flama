"use client";

import { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Trash2,
  Edit3,
  X,
  TrendingDown,
  CheckCircle2,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { createSupply, updateSupply, deleteSupply, updateSupplyStock } from "@/app/actions/orders";
import { createPortal } from "react-dom";

export default function InventoryClient({ supplies }: { supplies: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<any>(null);
  const [adjustmentSupply, setAdjustmentSupply] = useState<any>(null);
  const [adjustmentValue, setAdjustmentValue] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    stock: 0,
    minRequired: 0,
    unit: "Unidades"
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupply) {
        await updateSupply(editingSupply.id, formData);
      } else {
        await createSupply(formData);
      }
      setIsModalOpen(false);
      setIsSuccessOpen(true);
      setEditingSupply(null);
      setFormData({ name: "", stock: 0, minRequired: 0, unit: "Unidades" });
    } catch (error) {
      alert("Error al guardar");
    }
  };

  const handleQuickAdjust = async () => {
    if (!adjustmentSupply || adjustmentValue === 0) return;
    try {
      await updateSupplyStock(adjustmentSupply.id, adjustmentValue);
      setAdjustmentSupply(null);
      setAdjustmentValue(0);
    } catch (error) {
      alert("Error al ajustar stock");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este insumo?")) {
      await deleteSupply(id);
    }
  };

  const openEdit = (supply: any) => {
    setEditingSupply(supply);
    setFormData({
      name: supply.name,
      stock: supply.stock,
      minRequired: supply.minRequired,
      unit: supply.unit
    });
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OK": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "WARNING": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "CRITICAL": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-zinc-800 text-zinc-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OK": return <CheckCircle className="w-4 h-4" />;
      case "WARNING": return <AlertTriangle className="w-4 h-4" />;
      case "CRITICAL": return <TrendingDown className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 h-[calc(100vh-250px)] flex flex-col">
      {/* Portals */}
      {mounted && createPortal(
        <>
          {/* Modal CRUD (Registrar/Editar) */}
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black">{editingSupply ? "Editar Insumo" : "Registrar Insumo"}</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-2 block">Nombre:</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white"
                      placeholder="Ej: Carbón Vegetal"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-2 block">Stock Actual:</label>
                      <input 
                        type="number" 
                        required
                        value={formData.stock}
                        onChange={e => setFormData({...formData, stock: parseFloat(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-2 block">Mínimo Req.:</label>
                      <input 
                        type="number" 
                        required
                        value={formData.minRequired}
                        onChange={e => setFormData({...formData, minRequired: parseFloat(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-3 block">Unidad de Medida:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Unidades", "Kg", "L", "Paquetes"].map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setFormData({...formData, unit: u})}
                          className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                            formData.unit === u 
                              ? "bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20" 
                              : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 py-4 rounded-2xl font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 bg-orange-600 py-4 rounded-2xl font-bold hover:bg-orange-500 transition-all text-white shadow-xl shadow-orange-600/20">
                    Aceptar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modal Ajuste Rápido */}
          {adjustmentSupply && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
                <h2 className="text-2xl font-black mb-2 text-center">Ajustar Stock</h2>
                <p className="text-zinc-500 mb-10 text-center">{adjustmentSupply.name} ({adjustmentSupply.unit})</p>

                <div className="flex items-center justify-center gap-8 mb-12">
                  <button 
                    onClick={() => setAdjustmentValue(prev => prev - 1)}
                    className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-3xl font-black transition-all"
                  >
                    -
                  </button>
                  <div className="text-center w-24">
                    <span className="text-5xl font-black text-orange-500">{adjustmentValue > 0 ? `+${adjustmentValue}` : adjustmentValue}</span>
                  </div>
                  <button 
                    onClick={() => setAdjustmentValue(prev => prev + 1)}
                    className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-3xl font-black transition-all"
                  >
                    +
                  </button>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setAdjustmentSupply(null)} className="flex-1 bg-white/5 py-4 rounded-2xl font-bold text-zinc-400">Cerrar</button>
                  <button 
                    onClick={handleQuickAdjust}
                    disabled={adjustmentValue === 0}
                    className="flex-1 bg-orange-600 py-4 rounded-2xl font-bold hover:bg-orange-500 transition-all text-white disabled:opacity-20"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Éxito */}
          {isSuccessOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black mb-2">¡Operación exitosa!</h2>
                <p className="text-zinc-500 mb-8">El insumo se ha registrado correctamente.</p>
                <button 
                  onClick={() => setIsSuccessOpen(false)} 
                  className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl shadow-white/5"
                >
                  Aceptar
                </button>
              </div>
            </div>
          )}
        </>,
        document.body
      )}

      {/* Herramientas de Gestión */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
          <input 
            type="text" 
            placeholder="Filtrar por nombre..." 
            className="w-full bg-[#141414] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-orange-500/50 transition-all shadow-inner" 
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-white/5 border border-white/5 px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
            <Filter className="w-5 h-5" />
            Filtros
          </button>
          <button 
            onClick={() => { setEditingSupply(null); setIsModalOpen(true); }}
            className="flex-1 md:flex-none bg-white text-black px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
          >
            <Plus className="w-5 h-5" />
            Registrar Entrada
          </button>
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="flex-1 bg-[#141414] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#141414] z-10 border-b border-white/5">
              <tr className="bg-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">Insumo</th>
                <th className="px-8 py-6">Stock Actual</th>
                <th className="px-8 py-6">Mínimo Req.</th>
                <th className="px-8 py-6">Estado</th>
                <th className="px-8 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {supplies.map((s) => (
                <tr key={s.id} className="hover:bg-white/2 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-600/10 text-orange-500 rounded-xl flex items-center justify-center font-black">
                        {s.name[0]}
                      </div>
                      <span className="font-bold">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <span className="font-black text-2xl tracking-tighter">{s.stock}</span>
                      <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{s.unit}</span>
                      <button 
                        onClick={() => { setAdjustmentSupply(s); setAdjustmentValue(0); }}
                        className="p-1 rounded-md bg-white/5 hover:bg-orange-600/20 text-zinc-600 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-zinc-500 font-medium">{s.minRequired} {s.unit}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight border ${getStatusColor(s.status)}`}>
                      {getStatusIcon(s.status)}
                      {s.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(s)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de Estados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#141414] border border-white/5 p-8 rounded-[32px] text-center shadow-xl">
          <p className="text-xs font-black uppercase text-zinc-600 tracking-widest mb-2">Total de insumos</p>
          <p className="text-4xl font-black">{supplies.length}</p>
        </div>
        <div className="bg-red-600 p-8 rounded-[32px] text-center shadow-xl shadow-red-600/20">
          <p className="text-xs font-black uppercase text-white/60 tracking-widest mb-2">En Alerta</p>
          <p className="text-4xl font-black text-white">{supplies.filter(s => s.status === "CRITICAL").length}</p>
        </div>
        <div className="bg-amber-500 p-8 rounded-[32px] text-center shadow-xl shadow-amber-500/20">
          <p className="text-xs font-black uppercase text-black/60 tracking-widest mb-2">Crítico (Bajo Stock)</p>
          <p className="text-4xl font-black text-black">{supplies.filter(s => s.status === "WARNING").length}</p>
        </div>
      </div>
    </div>
  );
}
