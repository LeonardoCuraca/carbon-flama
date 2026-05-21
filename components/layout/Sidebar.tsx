"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ChefHat, 
  Banknote, 
  Package, 
  Flame,
  ChevronLeft,
  Bell
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useSidebarStore } from "@/lib/store/useSidebarStore";
import LogoutButton from "@/components/auth/LogoutButton";
import { socket } from "@/lib/socket";
import { getReadyItemsCount } from "@/app/actions/orders";

const navItems = [
  { name: "Resumen", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN"] },
  { name: "Salón", href: "/dashboard/mozo", icon: UtensilsCrossed, roles: ["ADMIN", "MOZO"] },
  { name: "Entrega de Platos", href: "/dashboard/mozo/notificaciones", icon: Bell, roles: ["ADMIN", "MOZO"], badge: true },
  { name: "Cocina", href: "/dashboard/cocina", icon: ChefHat, roles: ["ADMIN", "COCINA"] },
  { name: "Caja", href: "/dashboard/caja", icon: Banknote, roles: ["ADMIN", "CAJA"] },
  { name: "Inventario", href: "/dashboard/inventario", icon: Package, roles: ["ADMIN", "INVENTARIO"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const { isCollapsed, toggleCollapse, setCollapsed } = useSidebarStore();
  const [readyCount, setReadyCount] = useState(0);

  // Load initial ready count
  useEffect(() => {
    getReadyItemsCount().then(setReadyCount);
  }, []);

  // Sync real-time updates
  useEffect(() => {
    const refreshCount = () => {
      getReadyItemsCount().then(setReadyCount);
    };

    socket.on("item-status-changed", refreshCount);
    socket.on("order-update", refreshCount);
    socket.on("status-changed", refreshCount);

    return () => {
      socket.off("item-status-changed", refreshCount);
      socket.off("order-update", refreshCount);
      socket.off("status-changed", refreshCount);
    };
  }, []);

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
      <div className="p-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
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
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Colapsar menú"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const showBadge = item.badge && readyCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                isActive 
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <div className="relative flex-shrink-0">
                <item.icon className="w-5 h-5" />
                {/* Badge compacto cuando el sidebar está colapsado */}
                {showBadge && isCollapsed && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                    {readyCount > 9 ? "9+" : readyCount}
                  </span>
                )}
              </div>
              <span className={`font-medium transition-all duration-300 overflow-hidden whitespace-nowrap flex-1 ${
                isCollapsed ? "w-0 opacity-0" : "w-28 opacity-100"
              }`}>
                {item.name}
              </span>
              {/* Badge visible cuando el sidebar está expandido */}
              {showBadge && !isCollapsed && (
                <span className="bg-orange-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center leading-tight animate-pulse flex-shrink-0">
                  {readyCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar (Información del Usuario y Cerrar Sesión) */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <div className={`bg-black/20 rounded-xl transition-all duration-300 overflow-hidden ${
          isCollapsed ? "p-2" : "p-3"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-xs flex-shrink-0" title={session?.user?.name || "Usuario"}>
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
        <LogoutButton />
      </div>
    </div>
  );
}
