"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useSidebarStore } from "@/lib/store/useSidebarStore";

export default function LogoutButton() {
  const { isCollapsed } = useSidebarStore();

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-3 w-full px-4 py-3 text-zinc-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all group cursor-pointer"
      title={isCollapsed ? "Cerrar Sesión" : undefined}
    >
      <LogOut className="w-5 h-5 group-hover:text-red-500 flex-shrink-0" />
      <span className={`font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${
        isCollapsed ? "w-0 opacity-0" : "w-28 opacity-100"
      }`}>
        Cerrar Sesión
      </span>
    </button>
  );
}
