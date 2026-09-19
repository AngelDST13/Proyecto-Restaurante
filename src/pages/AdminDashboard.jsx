import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeatherByLocation } from '../services/weatherService';
import Toast from '../components/Toast';
import { 
  LayoutDashboard, ShoppingBag, Monitor, Package, 
  Layers, Users, ShieldAlert, Mail, Search, CloudSun, Send, 
  Eye, Edit3, Trash2, Plus, DollarSign, Clock, LogOut, 
  TrendingUp, ArrowUpRight, ArrowDownRight, Truck, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState('semana');
  const [weather, setWeather] = useState(null);
  const [selectedSede, setSelectedSede] = useState('escazu');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [searchTerm, setSearchTerm] = useState('');
  const [modalItem, setModalItem] = useState(null);

  useEffect(() => {
    getWeatherByLocation(selectedSede).then(res => setWeather(res));
  }, [selectedSede]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F2937] flex font-sans pt-16">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      {/* MODAL DETALLES */}
      {modalItem && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Registro de Sistema</h3>
            <pre className="text-xs bg-gray-50 p-4 rounded-xl text-gray-700 overflow-x-auto">
              {JSON.stringify(modalItem, null, 2)}
            </pre>
            <button 
              onClick={() => setModalItem(null)} 
              className="w-full py-2.5 rounded-xl bg-[#D16014] text-white font-bold text-xs"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      )}

      {/* SIDEBAR EJECUTIVO (FOODFLOW PRO STYLE) */}
      <aside className="w-64 bg-white border-r border-gray-200 p-5 flex flex-col justify-between hidden lg:flex shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-[#D16014] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-[#D16014]/30">
              C
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900 leading-none">El Cacique</h2>
              <span className="text-[10px] text-amber-600 font-bold tracking-wider uppercase">Pro Dashboard</span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-bold text-gray-600">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-[#D16014]/10 text-[#D16014] font-extrabold' : 'hover:bg-gray-50'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> <span>Dashboard Analítico</span>
            </button>

            <button 
              onClick={() => setActiveTab('orders')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-[#D16014]/10 text-[#D16014] font-extrabold' : 'hover:bg-gray-50'}`}
            >
              <ShoppingBag className="w-4 h-4" /> <span>Gestión de Pedidos</span>
            </button>

            <button 
              onClick={() => setActiveTab('pos')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'pos' ? 'bg-[#D16014]/10 text-[#D16014] font-extrabold' : 'hover:bg-gray-50'}`}
            >
              <Monitor className="w-4 h-4" /> <span>Terminal POS Salón</span>
            </button>

            <button 
              onClick={() => setActiveTab('inventory')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-[#D16014]/10 text-[#D16014] font-extrabold' : 'hover:bg-gray-50'}`}
            >
              <Layers className="w-4 h-4" /> <span>Inventario &amp; Stock</span>
            </button>

            <button 
              onClick={() => setActiveTab('employees')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'employees' ? 'bg-[#D16014]/10 text-[#D16014] font-extrabold' : 'hover:bg-gray-50'}`}
            >
              <Users className="w-4 h-4" /> <span>Personal &amp; Turnos</span>
            </button>

            <button 
              onClick={() => setActiveTab('email')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'email' ? 'bg-[#D16014]/10 text-[#D16014] font-extrabold' : 'hover:bg-gray-50'}`}
            >
              <Mail className="w-4 h-4" /> <span>Notificaciones Email</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D16014] text-white font-bold flex items-center justify-center text-xs">
              A
            </div>
            <div className="text-xs max-w-[120px]">
              <span className="block font-bold text-gray-800 leading-tight truncate">{user?.email || 'Admin El Cacique'}</span>
              <span className="block text-[10px] text-gray-400 capitalize">{user?.rol || 'administrador'}</span>
            </div>
          </div>
          <button onClick={logout} title="Salir" className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto">
        
        {/* BARRA SUPERIOR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar órdenes, productos, clientes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-700 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2.5 bg-[#F0FDF4] px-3.5 py-1.5 rounded-xl border border-[#DCFCE7] text-xs">
              <CloudSun className="w-4 h-4 text-[#16A34A]" />
              <div>
                <span className="block font-bold text-[#15803D]">{weather ? `${weather.temp}°C` : '--'} • {weather?.location}</span>
                <span className="block text-[9px] text-gray-500">Viento: {weather?.windspeed || 0} km/h</span>
              </div>
            </div>

            <select 
              value={selectedSede} 
              onChange={(e) => setSelectedSede(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none"
            >
              <option value="escazu">Sede Escazú</option>
              <option value="santa_ana">Sede Santa Ana</option>
              <option value="cartago">Sede Cartago</option>
              <option value="heredia">Sede Heredia</option>
            </select>
          </div>
        </div>

        {/* CONTENIDO DASHBOARD ESTILO FOODFLOW PRO */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900">¡Buenas tardes, Administrador! 👋</h1>
                <p className="text-xs text-gray-400 mt-0.5">Aquí está el resumen operacional de la Chicharronera El Cacique hoy.</p>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600">
                <button onClick={() => setTimeFilter('hoy')} className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === 'hoy' ? 'bg-[#D16014] text-white' : ''}`}>Hoy</button>
                <button onClick={() => setTimeFilter('semana')} className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === 'semana' ? 'bg-[#D16014] text-white' : ''}`}>Semana</button>
                <button onClick={() => setTimeFilter('mes')} className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === 'mes' ? 'bg-[#D16014] text-white' : ''}`}>Mes</button>
              </div>
            </div>

            {/* TARJETAS DE MÉTRICAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" /> +12.5%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold">Ingresos Totales</span>
                  <div className="text-2xl font-black text-gray-900">₡485,250</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" /> +8.2%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold">Órdenes de Hoy</span>
                  <div className="text-2xl font-black text-gray-900">1,284</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" /> +15.3%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold">Clientes Totales</span>
                  <div className="text-2xl font-black text-gray-900">23,847</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <ArrowDownRight className="w-3 h-3" /> -3.1%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold">Tiempo Prom. Servicio</span>
                  <div className="text-2xl font-black text-gray-900">18 min</div>
                </div>
              </div>
            </div>

            {/* GRÁFICOS Y ANALÍTICA DE RENDIMIENTO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COMPARATIVA DE INGRESOS */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Análisis de Ingresos &amp; Ventas</h3>
                    <p className="text-[11px] text-gray-400">Rendimiento mensual comparativo por sede</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-block w-3 h-3 bg-[#D16014] rounded-full"></span>
                    <span className="text-gray-600 font-semibold">Ingresos</span>
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full ml-2"></span>
                    <span className="text-gray-600 font-semibold">Órdenes</span>
                  </div>
                </div>

                {/* BARRAS GRÁFICAS REPRESENATIVAS */}
                <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b pb-2">
                  {[
                    { mes: 'Ene', v1: 40, v2: 60 },
                    { mes: 'Feb', v1: 55, v2: 75 },
                    { mes: 'Mar', v1: 70, v2: 85 },
                    { mes: 'Abr', v1: 65, v2: 90 },
                    { mes: 'May', v1: 80, v2: 95 },
                    { mes: 'Jun', v1: 90, v2: 100 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        <div style={{ height: `${item.v1}%` }} className="w-3 bg-[#D16014] rounded-t-md"></div>
                        <div style={{ height: `${item.v2}%` }} className="w-3 bg-blue-500 rounded-t-md"></div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">{item.mes}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DISTRIBUCIÓN DE PEDIDOS */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Estado de Pedidos en Tiempo Real</h3>
                  <p className="text-[11px] text-gray-400">Distribución porcentual del servicio</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-emerald-700">Completados (65%)</span>
                      <span>834</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="w-[65%] h-full bg-emerald-500"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-amber-700">En Preparación (20%)</span>
                      <span>256</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="w-[20%] h-full bg-amber-500"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-blue-700">En Camino / Mesa (15%)</span>
                      <span>194</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="w-[15%] h-full bg-blue-500"></div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Sede Escazú presenta alta demanda en salón (+18%).</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* OTROS MÓDULOS DE ADMINISTRACIÓN */}
        {activeTab !== 'dashboard' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 capitalize">Módulo de {activeTab}</h3>
            <p className="text-gray-500">Gestión activa y monitoreo continuo de datos del sistema.</p>
          </div>
        )}

      </main>
    </div>
  );
}