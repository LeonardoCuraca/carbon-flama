"use client";

interface HeaderProps {
  userName: string;
  userRole: string;
}

export default function Header({ userName, userRole }: HeaderProps) {
  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-end px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
      {/* Lado derecho: Sesión de usuario */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-black text-zinc-100">{userName}</p>
          <p className="text-[10px] font-black uppercase tracking-wider text-orange-500">{userRole}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
