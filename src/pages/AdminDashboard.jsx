import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeatherByLocation } from '../services/weatherService';
import Toast from '../components/Toast';
import { 
  LayoutDashboard, ShoppingBag, Monitor, Package, 
  Layers, Users, ShieldAlert, Mail, Search, CloudSun, Send, 
  Eye, Edit3, Trash2, Plus, DollarSign, Clock, LogOut, 
  Folder, PlusSquare, UserCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState('hoy');
  const [weather, setWeather] = useState(null);
  const [selectedSede, setSelectedSede] = useState('escazu');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State para "Ver / Editar"
  const [modalItem, setModalItem] = useState(null);

  // INVENTARIO & STOCK
  const [inventory, setInventory] = useState([
    { id: 1, ingrediente: 'Chicharrón de Paila', cat: 'Carnes', stock: 45, max: 100, unidad: 'kg', estado: 'Normal', valor: '₡225,000' },
    { id: 2, ingrediente: 'Yuca Criolla', cat: 'Vegetales', stock: 12, max: 80, unidad: 'kg', estado: 'Crítico', valor: '₡18,000' },
    { id: 3, ingrediente: 'Frijoles Tiernos', cat: 'Granos', stock: 60, max: 100, unidad: 'kg', estado: 'Normal', valor: '₡90,000' },
    { id: 4, ingrediente: 'Aguacate Hass', cat: 'Vegetales', stock: 8, max: 50, unidad: 'kg', estado: 'Crítico', valor: '₡32,000' }
  ]);

  // PRODUCTOS / PLATILLOS
  const [products] = useState([
    { id: 101, nombre: 'Chifrijo Especial de Paila', cat: 'Bocas', precio: 6800, stock: 84, estado: 'Disponible' },
    { id: 102, nombre: 'Vigorón Criollo (1kg)', cat: 'Platos Fuertes', precio: 14500, stock: 42, estado: 'Disponible' },
    { id: 103, nombre: 'Costilla a la Leña', cat: 'Cortes', precio: 9200, stock: 29, estado: 'Poco Stock' }
  ]);

  // EMPLEADOS & HORARIOS
  const [employees, setEmployees] = useState([
    { id: 1, nombre: 'Bryan Gómez', rol: 'Mesero', turno: 'Mañana (11:00 AM - 5:00 PM)', dia: 'Lunes a Viernes', estado: 'Activo' },
    { id: 2, nombre: 'Víctor González', rol: 'Cocinero Jefe', turno: 'Tarde (4:00 PM - 11:00 PM)', dia: 'Miércoles a Domingo', estado: 'Activo' },
    { id: 3, nombre: 'María Fernández', rol: 'Cajera', turno: 'Completo (10:00 AM - 8:00 PM)', dia: 'Viernes a Domingo', estado: 'Descanso' }
  ]);
  const [newEmp, setNewEmp] = useState({ nombre: '', rol: 'Mesero', turno: 'Mañana', dia: 'Lunes a Viernes' });

  // SESIONES ACTIVAS
  const [activeSessions, setActiveSessions] = useState([
    { id: 'S1', usuario: 'admin@gourmetsync.com', rol: 'administrador', dispositivo: 'Chrome (Windows 11)', ip: '192.168.1.45', inicio: 'Hace 45 min' },
    { id: 'S2', usuario: 'mesero1@gourmetsync.com', rol: 'mesero', dispositivo: 'Tablet iPad OS (Salón)', ip: '192.168.1.88', inicio: 'Hace 2 horas' },
    { id: 'S3', usuario: 'cliente_vip@gmail.com', rol: 'cliente', dispositivo: 'Mobile Android', ip: '201.192.44.12', inicio: 'Hace 10 min' }
  ]);

  // CORREOS
  const [emailForm, setEmailForm] = useState({ para: '', asunto: '', mensaje: '' });

  useEffect(() => {
    getWeatherByLocation(selectedSede).then(res => setWeather(res));
  }, [selectedSede]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleDeleteStock = (id) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    showToast('Registro eliminado correctamente', 'info');
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmp.nombre) return;
    const item = { id: Date.now(), ...newEmp, estado: 'Activo' };
    setEmployees([...employees, item]);
    setNewEmp({ nombre: '', rol: 'Mesero', turno: 'Mañana', dia: 'Lunes a Viernes' });
    showToast('Nuevo empleado registrado al turno', 'success');
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    showToast('Empleado retirado del sistema', 'info');
  };

  const handleKillSession = (id) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    showToast('Sesión cerrada forzosamente', 'info');
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    showToast(`Correo despachado a ${emailForm.para}`, 'success');
    setEmailForm({ para: '', asunto: '', mensaje: '' });
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

      {modalItem && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Detalles del Registro</h3>
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

      {/* SIDEBAR ESTILO AAN RESTAURANTE */}
      <aside className="w-64 bg-white border-r border-gray-200 p-5 flex flex-col justify-between hidden lg:flex shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#D16014] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#D16014]/20">
              A
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-900 leading-none">AAN Restaurante</h2>
              <span className="text-[11px] text-gray-400 font-medium">Panel de Gestión</span>
            </div>
          </div>

          <nav className="space-y-0.5 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> <span>Dashboard</span>
            </button>

            <button 
              onClick={() => setActiveTab('orders')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ShoppingBag className="w-4 h-4" /> <span>Pedidos</span>
            </button>

            <button 
              onClick={() => setActiveTab('pos')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'pos' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Monitor className="w-4 h-4" /> <span>Terminal POS</span>
            </button>

            <button 
              onClick={() => setActiveTab('products')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'products' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Package className="w-4 h-4" /> <span>Productos</span>
            </button>

            <button 
              onClick={() => setActiveTab('inventory')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Layers className="w-4 h-4" /> <span>Control Stock</span>
            </button>

            <button 
              onClick={() => setActiveTab('employees')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'employees' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Users className="w-4 h-4" /> <span>Empleados & Turnos</span>
            </button>

            <button 
              onClick={() => setActiveTab('sessions')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'sessions' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ShieldAlert className="w-4 h-4" /> <span>Sesiones Activas</span>
            </button>

            <button 
              onClick={() => setActiveTab('email')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'email' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Mail className="w-4 h-4" /> <span>Envío de Correos</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-800 text-white font-bold flex items-center justify-center text-xs uppercase">
              {user?.email?.[0] || 'A'}
            </div>
            <div className="text-xs max-w-[120px]">
              <span className="block font-bold text-gray-800 leading-tight truncate">{user?.email || 'Admin AAN'}</span>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar pedidos, productos..." 
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

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">¡Hola, Admin!</h1>
                <p className="text-xs text-gray-400 mt-0.5">Resumen de Hoy vs Ayer</p>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600">
                <button onClick={() => setTimeFilter('hoy')} className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === 'hoy' ? 'bg-[#D16014] text-white' : 'hover:text-gray-900'}`}>Hoy</button>
                <button onClick={() => setTimeFilter('ayer')} className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === 'ayer' ? 'bg-[#D16014] text-white' : 'hover:text-gray-900'}`}>Ayer</button>
                <button onClick={() => setTimeFilter('semana')} className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === 'semana' ? 'bg-[#D16014] text-white' : 'hover:text-gray-900'}`}>Esta Semana</button>
                <button onClick={() => setTimeFilter('mes')} className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === 'mes' ? 'bg-[#D16014] text-white' : 'hover:text-gray-900'}`}>Este Mes</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-[#FFFBEB] border border-[#FDE68A] p-4 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700"><Folder className="w-4 h-4" /></div>
                <div className="text-2xl font-extrabold text-amber-950">142</div>
                <span className="text-[11px] text-amber-800 font-semibold">Pedidos Hoy</span>
              </div>

              <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-4 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700"><DollarSign className="w-4 h-4" /></div>
                <div className="text-2xl font-extrabold text-emerald-950">₡485,000</div>
                <span className="text-[11px] text-emerald-800 font-semibold">Ventas Hoy</span>
              </div>

              <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-4 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700"><PlusSquare className="w-4 h-4" /></div>
                <div className="text-2xl font-extrabold text-blue-950">₡12,400</div>
                <span className="text-[11px] text-blue-800 font-semibold">Ticket Promedio</span>
              </div>

              <div className="bg-[#F5F3FF] border border-[#DDD6FE] p-4 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700"><UserCheck className="w-4 h-4" /></div>
                <div className="text-2xl font-extrabold text-purple-950">18</div>
                <span className="text-[11px] text-purple-800 font-semibold">Clientes Activos</span>
              </div>

              <div className="bg-[#FEFCE8] border border-[#FEF08A] p-4 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-700"><Clock className="w-4 h-4" /></div>
                <div className="text-2xl font-extrabold text-yellow-950">8</div>
                <span className="text-[11px] text-yellow-800 font-semibold">En Progreso</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-gray-900">Pedidos Recientes</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-100">
                    <div>
                      <span className="font-bold text-gray-900 block">Mesa #12 • Chifrijo de Paila</span>
                      <span className="text-[10px] text-gray-400">Hace 4 minutos</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">En Preparación</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-gray-900">Productos Populares</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-bold text-gray-800">1. Chifrijo Especial de Paila</span>
                    <span className="font-extrabold text-[#D16014]">84 vendidas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-gray-900">Gestión de Inventario</h3>
                <p className="text-xs text-gray-400">Monitoreo de insumos e ingredientes de cocina</p>
              </div>
              <button onClick={() => showToast('Nuevo insumo registrado', 'success')} className="px-4 py-2 rounded-xl bg-[#D16014] text-white font-bold text-xs flex items-center gap-2">
                <Plus className="w-4 h-4" /> Actualizar Stock
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

        {activeTab === 'products' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-gray-900">Catálogo de Productos</h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 bg-gray-50/50">
                    <th className="py-3 px-3">Platillo</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/80">
                      <td className="py-3.5 px-3 font-bold text-gray-900">{p.nombre}</td>
                      <td>{p.cat}</td>
                      <td className="font-bold text-[#D16014]">₡{p.precio.toLocaleString()}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => setModalItem(p)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => showToast(`Editando ${p.nombre}`, 'info')} className="p-1.5 text-gray-500 hover:text-amber-600 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-gray-900">Registrar Nuevo Empleado</h3>
              <form onSubmit={handleAddEmployee} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <input type="text" placeholder="Nombre" required value={newEmp.nombre} onChange={e => setNewEmp({ ...newEmp, nombre: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800" />
                <select value={newEmp.rol} onChange={e => setNewEmp({ ...newEmp, rol: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800">
                  <option value="Mesero">Mesero</option>
                  <option value="Cocinero">Cocinero</option>
                  <option value="Cajero">Cajero</option>
                </select>
                <select value={newEmp.turno} onChange={e => setNewEmp({ ...newEmp, turno: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800">
                  <option value="Mañana (11am - 5pm)">Mañana (11am - 5pm)</option>
                  <option value="Tarde (4pm - 11pm)">Tarde (4pm - 11pm)</option>
                </select>
                <button type="submit" className="py-2 bg-[#D16014] text-white font-bold rounded-xl hover:bg-[#b8510f]">
                  + Registrar
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-gray-900">Personal Registrado</h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 bg-gray-50/50">
                      <th className="py-3 px-3">Empleado</th>
                      <th>Rol</th>
                      <th>Turno</th>
                      <th>Estado</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-gray-50/80">
                        <td className="py-3.5 px-3 font-bold text-gray-900">{emp.nombre}</td>
                        <td>{emp.rol}</td>
                        <td>{emp.turno}</td>
                        <td><span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{emp.estado}</span></td>
                        <td className="text-center">
                          <button onClick={() => handleDeleteEmployee(emp.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-gray-900">Control de Sesiones de Usuario</h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 bg-gray-50/50">
                    <th className="py-3 px-3">Usuario</th>
                    <th>Rol</th>
                    <th>Dispositivo</th>
                    <th>IP</th>
                    <th className="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeSessions.map(sess => (
                    <tr key={sess.id} className="hover:bg-gray-50/80">
                      <td className="py-3.5 px-3 font-bold text-gray-900">{sess.usuario}</td>
                      <td><span className="px-2 py-0.5 bg-gray-100 text-gray-800 font-bold rounded text-[10px]">{sess.rol}</span></td>
                      <td className="text-gray-500">{sess.dispositivo}</td>
                      <td className="font-mono">{sess.ip}</td>
                      <td className="text-center">
                        <button onClick={() => handleKillSession(sess.id)} className="px-3 py-1 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100">
                          Cerrar Sesión
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="max-w-xl bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900">Envío de Correos Institucionales</h3>
            <form onSubmit={handleSendEmail} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Destinatario</label>
                <input type="email" required value={emailForm.para} onChange={e => setEmailForm({ ...emailForm, para: e.target.value })} placeholder="cliente@correo.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800" />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Asunto</label>
                <input type="text" required value={emailForm.asunto} onChange={e => setEmailForm({ ...emailForm, asunto: e.target.value })} placeholder="Notificación / Promoción" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800" />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Mensaje</label>
                <textarea rows={4} required value={emailForm.mensaje} onChange={e => setEmailForm({ ...emailForm, mensaje: e.target.value })} placeholder="Escriba aquí el mensaje..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800"></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-[#D16014] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8510f]">
                <Send className="w-4 h-4" /> Enviar Correo
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}