import prisma from "@/lib/prisma";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChefHat
} from "lucide-react";

export default async function DashboardPage() {
  // Ejecutar todas las consultas en paralelo para máxima velocidad
  const [totalSales, ordersCount, tablesOccupied, lowStockCount, recentOrders] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.order.count(),
    prisma.table.count({ where: { status: { not: "DISPONIBLE" } } }),
    prisma.supply.count({ where: { status: { in: ["WARNING", "CRITICAL"] } } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { table: true }
    })
  ]);

  const stats = [
    { 
      label: "Ventas Totales", 
      value: `S/ ${(totalSales._sum.amount || 0).toFixed(2)}`, 
      icon: TrendingUp, 
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      trend: "+12.5%",
      trendUp: true 
    },
    { 
      label: "Órdenes Hoy", 
      value: ordersCount.toString(), 
      icon: ShoppingBag, 
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      trend: "+5.2%",
      trendUp: true 
    },
    { 
      label: "Mesas Ocupadas", 
      value: `${tablesOccupied}/15`, 
      icon: Users, 
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      trend: "Estable",
      trendUp: true 
    },
    { 
      label: "Alertas Stock", 
      value: lowStockCount.toString(), 
      icon: ChefHat, 
      color: "text-red-500",
      bg: "bg-red-500/10",
      trend: "-2 hoy",
      trendUp: false 
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-2">Panel de Control</h1>
        <p className="text-zinc-500 font-medium">Bienvenido de nuevo al centro de operaciones de Carbón & Flama.</p>
      </header>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group p-8 rounded-[32px] bg-[#141414] border border-white/5 hover:border-orange-500/30 transition-all duration-500 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? "text-emerald-500" : "text-red-500"} bg-white/5 px-2 py-1 rounded-lg`}>
                  {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              
              <div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Órdenes Recientes */}
        <div className="lg:col-span-2 p-8 rounded-[40px] bg-[#141414] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black tracking-tight">Actividad Reciente</h2>
            <button className="text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors">Ver todo</button>
          </div>
          
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-transparent hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-black">
                    {order.tableId}
                  </div>
                  <div>
                    <p className="font-bold">Mesa {order.tableId}</p>
                    <p className="text-xs text-zinc-500">#{order.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-orange-500">S/ {order.total.toFixed(2)}</p>
                  <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notificaciones / Alertas */}
        <div className="p-8 rounded-[40px] bg-orange-600 text-white shadow-2xl shadow-orange-600/20 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-6">Estado del Sistema</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-1 h-12 bg-white/30 rounded-full"></div>
                <div>
                  <p className="font-bold">Cocina Operativa</p>
                  <p className="text-sm opacity-80 text-white/80 leading-relaxed">Personal completo. Tiempo promedio de entrega: 14 min.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 h-12 bg-white/30 rounded-full"></div>
                <div>
                  <p className="font-bold">Stock en Alerta</p>
                  <p className="text-sm opacity-80 text-white/80 leading-relaxed">Faltan insumos críticos. Revisar módulo de inventario.</p>
                </div>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-black/20 hover:bg-black/30 py-4 rounded-2xl font-bold transition-all text-sm mt-8">
            Generar Reporte Diario
          </button>
        </div>
      </div>
    </div>
  );
}
