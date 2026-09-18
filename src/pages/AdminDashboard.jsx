import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, DollarSign, AlertTriangle, 
  RefreshCw, ShoppingBag, LayoutDashboard 
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
          </nav>
        </div>

        <div className="p-3 bg-[#00241B]/60 rounded-xl border border-[#659B5E]/30 text-xs">
          <span className="text-[#659B5E] font-bold block">Administrador Activo</span>
          <span className="text-[11px] text-[#F8FFE5]/70 truncate block">{user?.email}</span>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl mx-auto overflow-y-auto">
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

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#00241B]/70 border border-[#F8FFE5]/10 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-[#F8FFE5]/60 text-xs">
              <span>Ventas Totales</span>
              <DollarSign className="w-4 h-4 text-[#D16014]" />
            </div>
            <div className="text-2xl font-extrabold text-[#F8FFE5]">₡485,000</div>
          </div>

          <div className="bg-[#00241B]/70 border border-[#F8FFE5]/10 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-[#F8FFE5]/60 text-xs">
              <span>Comandas Hoy</span>
              <ShoppingBag className="w-4 h-4 text-[#659B5E]" />
            </div>
            <div className="text-2xl font-extrabold text-[#F8FFE5]">142 Pedidos</div>
          </div>

          <div className="bg-[#00241B]/70 border border-[#F8FFE5]/10 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-[#F8FFE5]/60 text-xs">
              <span>Insumos Críticos</span>
              <AlertTriangle className="w-4 h-4 text-[#D16014]" />
            </div>
            <div className="text-2xl font-extrabold text-[#D16014]">3 Artículos</div>
          </div>
        </div>
      </main>
    </div>
  );
}