"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ChefHat, 
  Banknote, 
  Package, 
  Settings,
  Flame
} from "lucide-react";
import { useSession } from "next-auth/react";

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

  const filteredItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 bg-[#141414] border-r border-white/5 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight">C&F</span>
      </div>

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
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-black/20 rounded-xl p-3 mb-4">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Usuario</p>
          <p className="font-medium truncate">{session?.user?.name || "Cargando..."}</p>
          <p className="text-xs text-orange-500 font-bold">{userRole}</p>
        </div>
      </div>
    </div>
  );
}
