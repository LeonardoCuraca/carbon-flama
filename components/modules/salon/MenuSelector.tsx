"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { Plus, Search, X } from "lucide-react";
import { createPortal } from "react-dom";

export default function MenuSelector({ categories }: { categories: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Estados para personalización
  const [customizingProduct, setCustomizingProduct] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartCustomize = (product: any) => {
    if (!product.optionGroups || product.optionGroups.length === 0) {
      addItem(product, 1);
      return;
    }
    
    // Inicializar opciones seleccionadas
    const initialOptions: Record<string, any> = {};
    product.optionGroups.forEach((group: any) => {
      if (group.type === "SINGLE") {
        initialOptions[group.id] = group.options[0]?.name || "";
      } else {
        initialOptions[group.id] = [];
      }
    });

    setSelectedOptions(initialOptions);
    setNotes("");
    setCustomizingProduct(product);
  };

  const calculateTotalPrice = () => {
    if (!customizingProduct) return 0;
    let extraPrice = 0;
    customizingProduct.optionGroups.forEach((group: any) => {
      const selected = selectedOptions[group.id];
      if (group.type === "SINGLE") {
        const option = group.options.find((o: any) => o.name === selected);
        if (option) extraPrice += option.price;
      } else if (Array.isArray(selected)) {
        selected.forEach((optName: string) => {
          const option = group.options.find((o: any) => o.name === optName);
          if (option) extraPrice += option.price;
        });
      }
    });
    return customizingProduct.price + extraPrice;
  };

  const handleConfirmCustomize = () => {
    if (!customizingProduct) return;

    const modifiers: Record<string, any> = {};
    customizingProduct.optionGroups.forEach((group: any) => {
      const selected = selectedOptions[group.id];
      const groupKey = group.name.toLowerCase();
      modifiers[groupKey] = selected;
    });

    const finalPrice = calculateTotalPrice();

    addItem(
      { ...customizingProduct, price: finalPrice },
      1,
      notes,
      modifiers
    );

    setCustomizingProduct(null);
  };

  // Si hay búsqueda, buscamos en todos los productos de todas las categorías
  const currentProducts = searchQuery
    ? categories.flatMap(c => 
        (c.products || []).map((p: any) => ({ ...p, categoryName: c.name }))
      ).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : categories.find(c => c.id === selectedCategory)?.products || [];

  return (
    <div className="space-y-6">
      {/* Portales para Modal de Personalización */}
      {mounted && customizingProduct && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-lg rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col justify-between">
            
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black">{customizingProduct.name}</h2>
                <p className="text-zinc-500 text-sm">Personaliza tu plato a continuación</p>
              </div>
              <button 
                onClick={() => setCustomizingProduct(null)} 
                className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Opciones */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar mb-8">
              {customizingProduct.optionGroups.map((group: any) => {
                const selected = selectedOptions[group.id];
                return (
                  <div key={group.id} className="space-y-3">
                    <label className="text-xs font-black uppercase text-zinc-500 tracking-widest block">
                      {group.name} {group.required && <span className="text-orange-500 font-bold">* Requerido</span>}
                    </label>
                    
                    {group.type === "SINGLE" ? (
                      <div className="grid grid-cols-2 gap-3">
                        {group.options.map((opt: any) => (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedOptions(prev => ({
                              ...prev,
                              [group.id]: opt.name
                            }))}
                            className={`p-4 rounded-2xl font-bold transition-all border-2 text-left text-sm ${
                              selected === opt.name
                                ? "bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20"
                                : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10"
                            }`}
                          >
                            <span>{opt.name}</span>
                            {opt.price > 0 && (
                              <span className="block text-xs font-black text-orange-400 mt-1">
                                + S/ {opt.price.toFixed(2)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {group.options.map((opt: any) => {
                          const isChecked = Array.isArray(selected) && selected.includes(opt.name);
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setSelectedOptions(prev => {
                                const currentList = prev[group.id] || [];
                                const updatedList = isChecked
                                  ? currentList.filter((name: string) => name !== opt.name)
                                  : [...currentList, opt.name];
                                return {
                                  ...prev,
                                  [group.id]: updatedList
                                };
                              })}
                              className={`p-4 rounded-2xl font-bold transition-all border-2 text-left text-sm ${
                                isChecked
                                  ? "bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20"
                                  : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10"
                              }`}
                            >
                              <span>{opt.name}</span>
                              {opt.price > 0 && (
                                <span className="block text-xs font-black text-orange-400 mt-1">
                                  + S/ {opt.price.toFixed(2)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Indicaciones especiales */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-zinc-500 tracking-widest block">
                  Indicaciones Especiales
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. bien frito, sin cebolla, salsas aparte..."
                  className="w-full bg-white/5 border border-white/5 focus:border-orange-500/50 rounded-2xl p-4 text-sm font-medium text-white placeholder-zinc-500 outline-none transition-all resize-none h-24"
                />
              </div>
            </div>

            {/* Footer / Confirmación */}
            <div className="border-t border-white/5 pt-6 flex justify-between items-center bg-black/20 -mx-8 -mb-8 p-8 rounded-b-[40px]">
              <div>
                <span className="text-zinc-500 text-xs font-bold uppercase block">Total</span>
                <span className="text-3xl font-black text-orange-500">S/ {calculateTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCustomizingProduct(null)}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmCustomize}
                  className="px-6 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-orange-600/20 cursor-pointer"
                >
                  Añadir al pedido
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Buscador */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-zinc-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar plato o bebida..."
          className="w-full bg-[#141414] border border-white/5 focus:border-orange-500/50 rounded-2xl py-4 pl-12 pr-10 text-sm font-medium text-white placeholder-zinc-500 outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Selector de Categorías */}
      <div className="flex gap-3 overflow-x-auto pb-2 sticky top-0 bg-[#0a0a0a] pt-2 z-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setSearchQuery(""); // Limpia la búsqueda al cambiar de categoría
            }}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border-2 ${
              selectedCategory === cat.id && !searchQuery
                ? "bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20" 
                : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {currentProducts.length > 0 ? (
          currentProducts.map((product: any) => (
            <div 
              key={product.id}
              className="p-5 rounded-3xl bg-[#141414] border border-white/5 hover:border-orange-500/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-bold text-lg leading-tight truncate" title={product.name}>{product.name}</h3>
                  <span className="text-orange-500 font-black text-lg flex-shrink-0">S/ {product.price.toFixed(2)}</span>
                </div>
                
                {/* Badge de Categoría en búsqueda global */}
                {searchQuery && product.categoryName && (
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded mb-3">
                    {product.categoryName}
                  </span>
                )}
                
                <p className="text-zinc-500 text-sm line-clamp-2 mb-6">{product.description || "Sin descripción disponible"}</p>
              </div>

              <button
                onClick={() => handleStartCustomize(product)}
                className="w-full bg-white/5 hover:bg-orange-600 hover:text-white text-zinc-300 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                {product.optionGroups && product.optionGroups.length > 0 ? "Personalizar" : "Añadir al pedido"}
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-zinc-500 font-bold">
            No se encontraron platos o bebidas para "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
