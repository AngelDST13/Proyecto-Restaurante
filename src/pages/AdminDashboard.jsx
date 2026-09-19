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

  // Inventario de ejemplo para el módulo de Stock
  const [inventory, setInventory] = useState([
    { id: 1, ingrediente: 'Chicharrón de Paila', cat: 'Carnes', stock: 45, max: 100, unidad: 'kg', estado: 'Normal', valor: '₡225,000' },
    { id: 2, ingrediente: 'Yuca Criolla', cat: 'Vegetales', stock: 12, max: 80, unidad: 'kg', estado: 'Crítico', valor: '₡18,000' }
  ]);

  useEffect(() => {
    getWeatherByLocation(selectedSede).then(res => setWeather(res));
  }, [selectedSede]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleDeleteStock = (id) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    showToast('Registro de inventario eliminado', 'info');
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

      {/* MODAL DETALLES CON USO DE EYE */}
      {modalItem && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 border-b pb-2 text-gray-900 font-bold text-lg">
              <Eye className="w-5 h-5 text-[#D16014]" />
              <h3>Registro de Sistema</h3>
            </div>
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

      {/* SIDEBAR CON USO DE SHIELDALERT Y PACKAGE */}
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
              onClick={() => setActiveTab('products')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'products' ? 'bg-[#D16014]/10 text-[#D16014] font-extrabold' : 'hover:bg-gray-50'}`}
            >
              <Package className="w-4 h-4" /> <span>Catálogo de Productos</span>
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
              onClick={() => setActiveTab('security')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'security' ? 'bg-[#D16014]/10 text-[#D16014] font-extrabold' : 'hover:bg-gray-50'}`}
            >
              <ShieldAlert className="w-4 h-4" /> <span>Auditoría &amp; Sesiones</span>
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

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
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
            <button onClick={() => showToast('Datos sincronizados', 'info')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl" title="Refrescar">
              <RefreshCw className="w-4 h-4" />
            </button>
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

        {/* CONTENIDO DASHBOARD CON USO DE TRENDINGUP, TRUCK, CHECKCIRCLE2 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#D16014]" />
                <div>
                  <h1 className="text-2xl font-black text-gray-900">¡Buenas tardes, Administrador! 👋</h1>
                  <p className="text-xs text-gray-400 mt-0.5">Resumen analítico operacional de la Chicharronera El Cacique.</p>
                </div>
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

            {/* ANALÍTICA Y ESTADOS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Análisis Comparativo de Ventas</h3>
                    <p className="text-[11px] text-gray-400">Rendimiento mensual de comandas</p>
                  </div>
                </div>

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

              {/* DISTRIBUCIÓN CON CHECKCIRCLE2 Y TRUCK */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Monitoreo de Despacho</h3>
                  <p className="text-[11px] text-gray-400">Estado de comandas en cocina y salón</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl text-emerald-800">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Completados</span>
                    </div>
                    <span className="font-extrabold">834</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-xl text-blue-800">
                    <div className="flex items-center gap-2 font-bold">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>En Camino / Servicio</span>
                    </div>
                    <span className="font-extrabold">194</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Sede Escazú registra alta afluencia (+18%).</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TABLA DE INVENTARIO CON BANDERAS DE ACCIÓN Y USO DE TRASH2 / EDIT3 */}
        {activeTab === 'inventory' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-gray-900">Control de Stock e Insumos</h3>
                <p className="text-xs text-gray-400">Inventario en tiempo real</p>
              </div>
              <button onClick={() => showToast('Insumo añadido', 'success')} className="px-4 py-2 rounded-xl bg-[#D16014] text-white font-bold text-xs flex items-center gap-2">
                <Plus className="w-4 h-4" /> Agregar Insumo
              </button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 bg-gray-50/50">
                    <th className="py-3 px-3">Ingrediente</th>
                    <th>Categoría</th>
                    <th>Stock Actual</th>
                    <th>Estado</th>
                    <th>Valor</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventory.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/80">
                      <td className="py-3.5 px-3 font-bold text-gray-900">{item.ingrediente}</td>
                      <td>{item.cat}</td>
                      <td>{item.stock} {item.unidad}</td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.estado === 'Crítico' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="font-bold text-gray-700">{item.valor}</td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => setModalItem(item)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => showToast(`Editando ${item.ingrediente}`, 'info')} className="p-1.5 text-gray-500 hover:text-amber-600 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteStock(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABS SECUNDARIOS */}
        {activeTab !== 'dashboard' && activeTab !== 'inventory' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 capitalize">Módulo de {activeTab}</h3>
            <p className="text-gray-500">Gestión activa y monitoreo continuo de datos del sistema.</p>
            <button onClick={() => showToast('Acción ejecutada correctamente', 'success')} className="px-4 py-2 bg-[#D16014] text-white font-bold rounded-xl">
              Ejecutar Acción
            </button>
          </div>
        )}

      </main>
    </div>
  );
}