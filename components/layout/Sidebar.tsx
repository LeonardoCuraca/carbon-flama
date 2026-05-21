"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ChefHat, 
  Banknote, 
  Package, 
  Flame
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useSidebarStore } from "@/lib/store/useSidebarStore";

const navItems = [
  { name: "Resumen", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN"] },
  { name: "Salón", href: "/dashboard/mozo", icon: UtensilsCrossed, roles: ["ADMIN", "MOZO"] },
  { name: "Cocina", href: "/dashboard/cocina", icon: ChefHat, roles: ["ADMIN", "COCINA"] },
  { name: "Caja", href: "/dashboard/caja", icon: Banknote, roles: ["ADMIN", "CAJA"] },
  { name: "Inventario", href: "/dashboard/inventario", icon: Package, roles: ["ADMIN", "INVENTARIO"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const { isCollapsed, toggleCollapse, setCollapsed } = useSidebarStore();

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, [setCollapsed]);

  const filteredItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className={`bg-[#141414] border-r border-white/5 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out relative ${
      isCollapsed ? "w-20" : "w-64"
    }`}>
      {/* Header del Sidebar */}
      <div className="p-6 flex items-center gap-3">
        <button
          onClick={isCollapsed ? toggleCollapse : undefined}
          disabled={!isCollapsed}
          className={`w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isCollapsed ? "cursor-pointer hover:bg-orange-500 transition-colors" : "cursor-default"
          }`}
          title={isCollapsed ? "Expandir menú" : undefined}
        >
          <Flame className="w-5 h-5 text-white" />
        </button>
        <span className={`font-bold text-xl tracking-tight transition-all duration-300 overflow-hidden whitespace-nowrap ${
          isCollapsed ? "w-0 opacity-0" : "w-16 opacity-100"
        }`}>
          C&F
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={`font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${
                isCollapsed ? "w-0 opacity-0" : "w-28 opacity-100"
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar (Información del Usuario) */}
      <div className="p-4 border-t border-white/5">
        <div className={`bg-black/20 rounded-xl transition-all duration-300 overflow-hidden ${
          isCollapsed ? "p-2" : "p-3 mb-4"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-xs flex-shrink-0">
              {(session?.user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${
              isCollapsed ? "w-0 opacity-0" : "w-36 opacity-100"
            }`}>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-none mb-1">
                Usuario
              </p>
              <p className="text-sm font-medium truncate text-zinc-200">
                {session?.user?.name || "Cargando..."}
              </p>
              <p className="text-[10px] text-orange-500 font-bold uppercase mt-0.5">
                {userRole}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
