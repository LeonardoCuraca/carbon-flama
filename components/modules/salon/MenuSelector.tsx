"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { Plus, Minus, Info } from "lucide-react";

export default function MenuSelector({ categories }: { categories: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id);
  const addItem = useCartStore((state) => state.addItem);

  const currentProducts = categories.find(c => c.id === selectedCategory)?.products || [];

  return (
    <div className="space-y-8">
      {/* Selector de Categorías */}
      <div className="flex gap-3 overflow-x-auto pb-4 sticky top-0 bg-[#0a0a0a] pt-2 z-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border-2 ${
              selectedCategory === cat.id 
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
        {currentProducts.map((product: any) => (
          <div 
            key={product.id}
            className="p-5 rounded-3xl bg-[#141414] border border-white/5 hover:border-orange-500/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                <span className="text-orange-500 font-black text-lg">S/ {product.price.toFixed(2)}</span>
              </div>
              <p className="text-zinc-500 text-sm line-clamp-2 mb-6">{product.description || "Sin descripción disponible"}</p>
            </div>

            <button
              onClick={() => addItem(product, 1)}
              className="w-full bg-white/5 hover:bg-orange-600 hover:text-white text-zinc-300 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Añadir al pedido
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
