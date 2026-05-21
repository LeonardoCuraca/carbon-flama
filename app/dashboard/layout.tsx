import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Usuario";
  const userRole = (session?.user as any)?.role || "Rol";

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header userName={userName} userRole={userRole} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
