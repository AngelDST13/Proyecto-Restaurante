import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, Package, Users, DollarSign, AlertTriangle, 
  TrendingUp, RefreshCw, ShoppingBag, LayoutDashboard, Layers 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#070609] text-[#F8FFE5] flex pt-16">
      
      {/* SIDEBAR OPERATIVO ESTILO FOODX */}
      <aside className="w-64 bg-[#0A090C] border-r border-[#F8FFE5]/10 p-4 hidden lg:flex flex-col justify-between">
        <div className="space-y-6">
          <div className="px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#659B5E]">Panel de Control</span>
            <h2 className="text-lg font-bold text-[#F8FFE5]">FoodX Analytics</h2>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'overview' ? 'bg-[#D16014] text-white shadow-lg shadow-[#D16014]/30' : 'text-[#F8FFE5]/70 hover:bg-[#00241B]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Resumen General</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'inventory' ? 'bg-[#D16014] text-white shadow-lg shadow-[#D16014]/30' : 'text-[#F8FFE5]/70 hover:bg-[#00241B]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Inventario Crítico</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'users' ? 'bg-[#D16014] text-white shadow-lg shadow-[#D16014]/30' : 'text-[#F8FFE5]/70 hover:bg-[#00241B]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Usuarios (db.json)</span>
            </button>
          </nav>
        </div>

        <div className="p-3 bg-[#00241B]/60 rounded-xl border border-[#659B5E]/30 text-xs">
          <span className="text-[#659B5E] font-bold block">Administrador Activo</span>
          <span className="text-[11px] text-[#F8FFE5]/70 truncate block">{user?.email}</span>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DE CONTENIDO */}
      <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl mx-auto overflow-y-auto">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F8FFE5]/10 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#F8FFE5]">Food Dashboard &amp; Métricas</h1>
            <p className="text-xs text-[#F8FFE5]/60 mt-0.5">
              Monitoreo en tiempo real de ventas, comandas de salón e inventario de cocina.
            </p>
          </div>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00241B] border border-[#659B5E]/40 text-xs font-bold text-[#659B5E]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Actualizar Datos
          </button>
        </div>

        {/* TARJETAS DE MÉTRICAS RÁPIDAS (FOODX TOP CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#00241B]/70 border border-[#F8FFE5]/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center text-[#F8FFE5]/60 text-xs">
              <span>Ventas Totales</span>
              <DollarSign className="w-4 h-4 text-[#D16014]" />
            </div>
            <div className="text-2xl font-extrabold text-[#F8FFE5]">₡485,000</div>
            <span className="inline-block text-[10px] font-bold text-[#659B5E] bg-[#659B5E]/15 px-2 py-0.5 rounded">
              +18.4% vs ayer
            </span>
          </div>

          <div className="bg-[#00241B]/70 border border-[#F8FFE5]/10 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-[#F8FFE5]/60 text-xs">
              <span>Comandas Hoy</span>
              <ShoppingBag className="w-4 h-4 text-[#659B5E]" />
            </div>
            <div className="text-2xl font-extrabold text-[#F8FFE5]">142 Pedidos</div>
            <span className="inline-block text-[10px] font-bold text-[#659B5E] bg-[#659B5E]/15 px-2 py-0.5 rounded">
              88% Completados
            </span>
          </div>

          <div className="bg-[#00241B]/70 border border-[#F8FFE5]/10 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-[#F8FFE5]/60 text-xs">
              <span>Mesas Ocupadas</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-[#F8FFE5]">14 / 18</div>
            <span className="inline-block text-[10px] font-bold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded">
              77% Ocupación
            </span>
          </div>

          <div className="bg-[#00241B]/70 border border-[#F8FFE5]/10 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-[#F8FFE5]/60 text-xs">
              <span>Insumos Críticos</span>
              <AlertTriangle className="w-4 h-4 text-[#D16014]" />
            </div>
            <div className="text-2xl font-extrabold text-[#D16014]">3 Artículos</div>
            <span className="inline-block text-[10px] font-bold text-[#D16014] bg-[#D16014]/15 px-2 py-0.5 rounded">
              Requieren Reorden
            </span>
          </div>
        </div>

        {/* SECCIÓN PRINCIPAL: GRÁFICA & TABLA CRÍTICA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* GRÁFICO DE FACTURACIÓN HORARIA */}
          <div className="lg:col-span-8 bg-[#0A090C] border border-[#F8FFE5]/10 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-[#F8FFE5]">Facturación por Horario (Hoy)</h3>
                <p className="text-xs text-[#F8FFE5]/60">Picos de demanda en salón y takeout</p>
              </div>
              <span className="text-xs font-bold text-[#D16014]">Promedio: ₡40,500/hr</span>
            </div>

            <div className="h-56 flex items-end justify-between gap-3 pt-8 px-2 border-b border-[#F8FFE5]/10">
              <div className="flex-1 bg-[#00241B] hover:bg-[#D16014] h-20 rounded-t transition-all relative group">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] hidden group-hover:block bg-black px-1.5 py-0.5 rounded">11am</span>
              </div>
              <div className="flex-1 bg-[#00241B] hover:bg-[#D16014] h-36 rounded-t transition-all relative group">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] hidden group-hover:block bg-black px-1.5 py-0.5 rounded">1pm</span>
              </div>
              <div className="flex-1 bg-[#D16014] h-52 rounded-t shadow-lg shadow-[#D16014]/30 relative group">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#D16014] bg-black px-1.5 py-0.5 rounded">3pm (Pico)</span>
              </div>
              <div className="flex-1 bg-[#00241B] hover:bg-[#D16014] h-28 rounded-t transition-all relative group">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] hidden group-hover:block bg-black px-1.5 py-0.5 rounded">6pm</span>
              </div>
              <div className="flex-1 bg-[#659B5E] h-44 rounded-t transition-all relative group">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] hidden group-hover:block bg-black px-1.5 py-0.5 rounded">8pm</span>
              </div>
            </div>
          </div>

          {/* ARTÍCULOS MÁS VENDIDOS */}
          <div className="lg:col-span-4 bg-[#0A090C] border border-[#F8FFE5]/10 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-[#F8FFE5]">Platillos Más Vendidos</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#00241B]/50 rounded-xl border border-[#F8FFE5]/10 flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#F8FFE5]">1. Chifrijo Especial</div>
                  <div className="text-[10px] text-[#F8FFE5]/60">84 Unidades despachadas</div>
                </div>
                <span className="font-bold text-[#D16014]">₡571,200</span>
              </div>

              <div className="p-3 bg-[#00241B]/50 rounded-xl border border-[#F8FFE5]/10 flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#F8FFE5]">2. Vigorón de Paila</div>
                  <div className="text-[10px] text-[#F8FFE5]/60">42 Unidades despachadas</div>
                </div>
                <span className="font-bold text-[#D16014]">₡609,000</span>
              </div>

              <div className="p-3 bg-[#00241B]/50 rounded-xl border border-[#F8FFE5]/10 flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#F8FFE5]">3. Costilla a la Leña</div>
                  <div className="text-[10px] text-[#F8FFE5]/60">29 Unidades despachadas</div>
                </div>
                <span className="font-bold text-[#D16014]">₡266,800</span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}