"use client";

import LogoutButton from "@/components/auth/LogoutButton";
import { ChevronLeft } from "lucide-react";
import { useSidebarStore } from "@/lib/store/useSidebarStore";

interface HeaderProps {
  userName: string;
  userRole: string;
}

export default function Header({ userName, userRole }: HeaderProps) {
  const { isCollapsed, toggleCollapse } = useSidebarStore();

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
      {/* Lado izquierdo: Botón de colapso si el sidebar está abierto */}
      <div className="h-full flex items-center">
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="px-3 py-1.5 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer border border-white/5 bg-zinc-900/20"
            title="Colapsar menú"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Ocultar Menú</span>
          </button>
        )}
      </div>

      {/* Lado derecho: Sesión de usuario y botón de cerrar sesión */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-zinc-100">{userName}</p>
            <p className="text-[10px] font-black uppercase tracking-wider text-orange-500">{userRole}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="w-48">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
