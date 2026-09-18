import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeatherByLocation } from '../services/weatherService';
import Toast from '../components/Toast';
import { 
  LayoutDashboard, ShoppingBag, CreditCard, Users, 
  Mail, LogOut, CloudSun, Send, Eye, Edit3, Trash2, 
  Package, Clock, CheckCircle2, AlertTriangle, ShieldAlert, Plus, Search, Filter
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [weather, setWeather] = useState(null);
  const [selectedSede, setSelectedSede] = useState('escazu');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Modal State para "Ver / Editar"
  const [modalItem, setModalItem] = useState(null);

  // 1. ESTADO DE INVENTARIO (CONTROL DE STOCK)
  const [inventory, setInventory] = useState([
    { id: 1, ingrediente: 'Chicharrón de Paila', cat: 'Carnes', stock: 45, max: 100, unidad: 'kg', estado: 'Normal', valor: '₡225,000' },
    { id: 2, ingrediente: 'Yuca Criolla', cat: 'Vegetales', stock: 12, max: 80, unidad: 'kg', estado: 'Crítico', valor: '₡18,000' },
    { id: 3, ingrediente: 'Frijoles Tiernos', cat: 'Granos', stock: 60, max: 100, unidad: 'kg', estado: 'Normal', valor: '₡90,000' },
    { id: 4, ingrediente: 'Aguacate Hass', cat: 'Vegetales', stock: 8, max: 50, unidad: 'kg', estado: 'Crítico', valor: '₡32,000' },
  ]);

  // 2. ESTADO DE EMPLEADOS & HORARIOS
  const [employees, setEmployees] = useState([
    { id: 1, nombre: 'Bryan Gómez', rol: 'Mesero', turno: 'Mañana (11:00 AM - 5:00 PM)', dia: 'Lunes a Viernes', estado: 'Activo' },
    { id: 2, nombre: 'Víctor González', rol: 'Cocinero Jefe', turno: 'Tarde (4:00 PM - 11:00 PM)', dia: 'Miércoles a Domingo', estado: 'Activo' },
    { id: 3, nombre: 'María Fernández', rol: 'Cajera', turno: 'Completo (10:00 AM - 8:00 PM)', dia: 'Viernes a Domingo', estado: 'Descanso' }
  ]);
  const [newEmp, setNewEmp] = useState({ nombre: '', rol: 'Mesero', turno: 'Mañana', dia: 'Lunes a Viernes' });

  // 3. ESTADO DE SESIONES ACTIVAS DE USUARIOS
  const [activeSessions, setActiveSessions] = useState([
    { id: 'S1', usuario: 'admin@gourmetsync.com', rol: 'administrador', dispositivo: 'Chrome (Windows 11)', ip: '192.168.1.45', inicio: 'Hace 45 min' },
    { id: 'S2', usuario: 'mesero1@gourmetsync.com', rol: 'mesero', dispositivo: 'Tablet iPad OS (Salón)', ip: '192.168.1.88', inicio: 'Hace 2 horas' },
    { id: 'S3', usuario: 'cliente_vip@gmail.com', rol: 'cliente', dispositivo: 'Mobile Android', ip: '201.192.44.12', inicio: 'Hace 10 min' }
  ]);

  // 4. ENVÍO DE CORREOS
  const [emailForm, setEmailForm] = useState({ para: '', asunto: '', mensaje: '' });

  useEffect(() => {
    getWeatherByLocation(selectedSede).then(res => setWeather(res));
  }, [selectedSede]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // ACCIONES DE INVENTARIO
  const handleDeleteStock = (id) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    showToast('Ingrediente eliminado del inventario correctamente', 'info');
  };

  // ACCIONES DE EMPLEADOS
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

  // ACCIONES DE SESIONES
  const handleKillSession = (id) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    showToast('Sesión cerrada forzosamente por el administrador', 'info');
  };

  // CORREOS
  const handleSendEmail = (e) => {
    e.preventDefault();
    showToast(`Correo despachado con éxito a ${emailForm.para}`, 'success');
    setEmailForm({ para: '', asunto: '', mensaje: '' });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F2937] flex font-sans pt-16">
      
      {/* NOTIFICACIÓN TOAST */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      {/* MODAL VER DETALLES */}
      {modalItem && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up">
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

      {/* SIDEBAR MODERNO CLARO ESTILO AAN */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D16014] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-[#D16014]/20">
              G
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-900 leading-none">GourmetSync</h2>
              <span className="text-[11px] text-gray-400 font-medium">Gestión de Restaurante</span>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'dashboard' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> <span>Dashboard</span>
            </button>

            <button 
              onClick={() => setActiveTab('inventory')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'inventory' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4" /> <span>Control de Inventario</span>
            </button>

            <button 
              onClick={() => setActiveTab('employees')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'employees' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" /> <span>Empleados & Turnos</span>
            </button>

            <button 
              onClick={() => setActiveTab('sessions')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'sessions' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4" /> <span>Sesiones Activas</span>
            </button>

            <button 
              onClick={() => setActiveTab('email')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'email' ? 'bg-[#FDF2E9] text-[#D16014] font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Mail className="w-4 h-4" /> <span>Envío de Correos</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs">
            <span className="block font-bold text-gray-800 truncate">{user?.email}</span>
            <span className="block text-[10px] text-[#D16014] capitalize font-bold">{user?.rol}</span>
          </div>
          <button onClick={logout} title="Cerrar Sesión" className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL DE LA PÁGINA */}
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto">
        
        {/* TOP BAR CLIMA & SEDES EN VIVO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Control &amp; Administración</h1>
            <p className="text-xs text-gray-400 mt-0.5">Operación en vivo de cocina, inventarios y sesiones de usuario</p>
          </div>

          <div className="flex items-center gap-3">
            {/* WIDGET DEL CLIMA API */}
            <div className="flex items-center gap-3 bg-[#F0FDF4] px-4 py-2 rounded-xl border border-[#DCFCE7] text-xs">
              <CloudSun className="w-5 h-5 text-[#16A34A]" />
              <div>
                <span className="block font-bold text-[#15803D]">{weather ? `${weather.temp}°C` : '--'} • {weather?.location}</span>
                <span className="block text-[10px] text-gray-500">Viento: {weather?.windspeed || 0} km/h</span>
              </div>
            </div>

            <select 
              value={selectedSede} 
              onChange={(e) => setSelectedSede(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none"
            >
              <option value="escazu">Sede Escazú</option>
              <option value="santa_ana">Sede Santa Ana</option>
              <option value="cartago">Sede Cartago</option>
              <option value="heredia">Sede Heredia</option>
            </select>
          </div>
        </div>

        {/* MÓDULO 1: DASHBOARD GENERAL */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FEF3C7]/50 border border-[#FDE68A] p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-800">Pedidos Hoy</span>
                <div className="text-3xl font-extrabold text-amber-950">142</div>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full">+12% vs ayer</span>
              </div>

              <div className="bg-[#DCFCE7]/50 border border-[#BBF7D0] p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-800">Ventas Totales</span>
                <div className="text-3xl font-extrabold text-emerald-950">₡485,000</div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">Meta superada</span>
              </div>

              <div className="bg-[#E0F2FE]/50 border border-[#BAE6FD] p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-sky-800">Ticket Promedio</span>
                <div className="text-3xl font-extrabold text-sky-950">₡12,400</div>
                <span className="text-[10px] text-sky-700 font-bold bg-sky-100 px-2.5 py-0.5 rounded-full">Estable</span>
              </div>

              <div className="bg-[#FEE2E2]/50 border border-[#FECACA] p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-rose-800">Insumos Bajo Stock</span>
                <div className="text-3xl font-extrabold text-rose-950">2 Críticos</div>
                <span className="text-[10px] text-rose-700 font-bold bg-rose-100 px-2.5 py-0.5 rounded-full">Reordenar hoy</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-gray-900">Últimos Pedidos en Cocina</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-100">
                    <div>
                      <span className="font-bold text-gray-900 block">Mesa #12 • Chifrijo de Paila</span>
                      <span className="text-[10px] text-gray-400">Hace 4 minutos</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">En Preparación</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-100">
                    <div>
                      <span className="font-bold text-gray-900 block">Mesa #04 • Vigorón 1kg</span>
                      <span className="text-[10px] text-gray-400">Hace 12 minutos</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Entregado</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-gray-900">Platillos Más Demandados</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-bold text-gray-800">1. Chifrijo Especial de Paila</span>
                    <span className="font-extrabold text-[#D16014]">84 Unidades</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-bold text-gray-800">2. Vigorón Criollo (1kg)</span>
                    <span className="font-extrabold text-[#D16014]">42 Unidades</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">3. Costilla a la Leña</span>
                    <span className="font-extrabold text-[#D16014]">29 Unidades</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO 2: CONTROL DE INVENTARIO (CON BOTONES VER, EDITAR, BORRAR) */}
        {activeTab === 'inventory' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-base text-gray-900">Gestión de Inventario &amp; Stock</h3>
                <p className="text-xs text-gray-400">Monitoreo de ingredientes y reposición de bodega</p>
              </div>
              <button 
                onClick={() => showToast('Insumo agregado al inventario', 'success')} 
                className="px-4 py-2 rounded-xl bg-[#D16014] text-white font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Agregar Ingrediente
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
                    <th>Valor Aprox.</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventory.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-gray-900">{item.ingrediente}</td>
                      <td>{item.cat}</td>
                      <td>
                        <div className="space-y-1">
                          <span className="font-bold">{item.stock} / {item.max} {item.unidad}</span>
                          <div className="w-28 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.stock < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${(item.stock / item.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.estado === 'Crítico' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="font-bold text-gray-700">{item.valor}</td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1">
                          <button 
                            onClick={() => setModalItem(item)} 
                            title="Ver Registro" 
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => showToast(`Editando ${item.ingrediente}`, 'info')} 
                            title="Editar Stock" 
                            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteStock(item.id)} 
                            title="Eliminar Insumo" 
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MÓDULO 3: EMPLEADOS & HORARIOS DE LA SEMANA */}
        {activeTab === 'employees' && (
          <div className="space-y-6 animate-fade-in">
            {/* FORMULARIO AGREGAR EMPLEADO */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-gray-900">Registrar Nuevo Empleado / Asignar Horario</h3>
              <form onSubmit={handleAddEmployee} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <input 
                  type="text" 
                  placeholder="Nombre del Empleado" 
                  required 
                  value={newEmp.nombre} 
                  onChange={e => setNewEmp({ ...newEmp, nombre: e.target.value })} 
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800"
                />
                <select 
                  value={newEmp.rol} 
                  onChange={e => setNewEmp({ ...newEmp, rol: e.target.value })} 
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800"
                >
                  <option value="Mesero">Mesero</option>
                  <option value="Cocinero">Cocinero</option>
                  <option value="Cajero">Cajero</option>
                  <option value="Administrador">Administrador</option>
                </select>
                <select 
                  value={newEmp.turno} 
                  onChange={e => setNewEmp({ ...newEmp, turno: e.target.value })} 
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800"
                >
                  <option value="Mañana (11am - 5pm)">Mañana (11am - 5pm)</option>
                  <option value="Tarde (4pm - 11pm)">Tarde (4pm - 11pm)</option>
                  <option value="Completo (10am - 8pm)">Completo (10am - 8pm)</option>
                </select>
                <button type="submit" className="py-2 bg-[#D16014] text-white font-bold rounded-xl hover:bg-[#b8510f]">
                  + Registrar Empleado
                </button>
              </form>
            </div>

            {/* TABLA DE EMPLEADOS */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-gray-900">Personal Registrado &amp; Horarios Semanales</h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 bg-gray-50/50">
                      <th className="py-3 px-3">Empleado</th>
                      <th>Rol / Puesto</th>
                      <th>Días Semanales</th>
                      <th>Turno Asignado</th>
                      <th>Estado</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-gray-50/80">
                        <td className="py-3.5 px-3 font-bold text-gray-900">{emp.nombre}</td>
                        <td>{emp.rol}</td>
                        <td>{emp.dia}</td>
                        <td className="text-gray-500 font-medium">{emp.turno}</td>
                        <td>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            emp.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {emp.estado}
                          </span>
                        </td>
                        <td className="text-center">
                          <button 
                            onClick={() => handleDeleteEmployee(emp.id)} 
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all" 
                            title="Retirar Empleado"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO 4: CONTROL DE SESIONES ACTIVAS (CIERRE DE SESIÓN FORZADO) */}
        {activeTab === 'sessions' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h3 className="font-bold text-base text-gray-900">Control de Sesiones de Usuario Activas</h3>
              <p className="text-xs text-gray-400">Monitoreo de accesos concurrentes y cierre forzado de seguridad</p>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 bg-gray-50/50">
                    <th className="py-3 px-3">Usuario / Email</th>
                    <th>Rol</th>
                    <th>Dispositivo / Navegador</th>
                    <th>Dirección IP</th>
                    <th>Inicio de Sesión</th>
                    <th className="text-center">Cierre Forzado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeSessions.map(sess => (
                    <tr key={sess.id} className="hover:bg-gray-50/80">
                      <td className="py-3.5 px-3 font-bold text-gray-900">{sess.usuario}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-bold capitalize text-[10px]">
                          {sess.rol}
                        </span>
                      </td>
                      <td className="text-gray-500">{sess.dispositivo}</td>
                      <td className="font-mono text-gray-600">{sess.ip}</td>
                      <td className="text-gray-400">{sess.inicio}</td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleKillSession(sess.id)} 
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition-all flex items-center justify-center gap-1 mx-auto"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Borrar Sesión
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MÓDULO 5: ENVÍO DE CORREOS */}
        {activeTab === 'email' && (
          <div className="max-w-xl bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 animate-fade-in">
            <h3 className="font-bold text-base text-gray-900">Envío de Correos Institucionales</h3>
            <form onSubmit={handleSendEmail} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Correo Destinatario</label>
                <input 
                  type="email" 
                  required 
                  value={emailForm.para}
                  onChange={(e) => setEmailForm({ ...emailForm, para: e.target.value })}
                  placeholder="cliente@correo.com" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800" 
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Asunto</label>
                <input 
                  type="text" 
                  required 
                  value={emailForm.asunto}
                  onChange={(e) => setEmailForm({ ...emailForm, asunto: e.target.value })}
                  placeholder="Confirmación de Reservación / Promoción de Sede" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800" 
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Mensaje</label>
                <textarea 
                  rows={4} 
                  required 
                  value={emailForm.mensaje}
                  onChange={(e) => setEmailForm({ ...emailForm, mensaje: e.target.value })}
                  placeholder="Escriba aquí el contenido del mensaje..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800"
                ></textarea>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-[#D16014] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#b8510f]">
                <Send className="w-4 h-4" /> Enviar Correo Ahora
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}