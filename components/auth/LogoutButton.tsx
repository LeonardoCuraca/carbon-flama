"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-3 w-full px-4 py-3 text-zinc-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all group"
    >
      <LogOut className="w-5 h-5 group-hover:text-red-500" />
      <span className="font-medium">Cerrar Sesión</span>
    </button>
  );
}
