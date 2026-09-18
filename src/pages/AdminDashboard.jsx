import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeatherByLocation } from '../services/weatherService';
import { 
  LayoutDashboard, ShoppingBag, CreditCard, Utensils, Users, 
  Calendar, Mail, Settings, LogOut, CloudSun, RefreshCw, Send, CheckCircle2 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [weather, setWeather] = useState(null);
  const [selectedSede, setSelectedSede] = useState('escazu');
  const [toastMessage, setToastMessage] = useState('');

  // Empleados y Horarios de la Semana
  const [employees, setEmployees] = useState([
    { id: 1, nombre: 'Bryan Gómez', rol: 'Mesero', turno: 'Mañana (11:00 AM - 5:00 PM)', dia: 'Lunes a Viernes', estado: 'Activo' },
    { id: 2, nombre: 'Víctor González', rol: 'Cocinero Jefe', turno: 'Tarde (4:00 PM - 11:00 PM)', dia: 'Miércoles a Domingo', estado: 'Activo' },
    { id: 3, nombre: 'María Fernández', rol: 'Cajera', turno: 'Completo', dia: 'Viernes a Domingo', estado: 'Descanso' }
  ]);

  // Formulario de Envío de Correo
  const [emailForm, setEmailForm] = useState({ para: '', asunto: '', mensaje: '' });

  useEffect(() => {
    getWeatherByLocation(selectedSede).then(res => setWeather(res));
  }, [selectedSede]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    showToast(`Correo enviado con éxito a ${emailForm.para}`);
    setEmailForm({ para: '', asunto: '', mensaje: '' });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F2937] flex font-sans">
      
      {/* TOAST CUSTOM */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SIDEBAR ADMINISTRATIVO ESTILO AAN */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D16014] text-white flex items-center justify-center font-bold text-xl">
              A
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-900 leading-none">AAN Restaurante</h2>
              <span className="text-[11px] text-gray-400 font-medium">Panel de Gestión v3.2</span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-[#FDF2E9] text-[#D16014]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <LayoutDashboard className="w-4 h-4" /> <span>Dashboard</span>
            </button>
            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-[#FDF2E9] text-[#D16014]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <ShoppingBag className="w-4 h-4" /> <span>Pedidos & Comandas</span>
            </button>
            <button onClick={() => setActiveTab('employees')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'employees' ? 'bg-[#FDF2E9] text-[#D16014]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Users className="w-4 h-4" /> <span>Empleados & Horarios</span>
            </button>
            <button onClick={() => setActiveTab('payments')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'payments' ? 'bg-[#FDF2E9] text-[#D16014]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <CreditCard className="w-4 h-4" /> <span>Control de Pagos</span>
            </button>
            <button onClick={() => setActiveTab('email')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'email' ? 'bg-[#FDF2E9] text-[#D16014]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Mail className="w-4 h-4" /> <span>Envío de Correos</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs">
            <span className="block font-bold text-gray-800 truncate">{user?.email}</span>
            <span className="block text-[10px] text-gray-400 capitalize">{user?.rol}</span>
          </div>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        
        {/* TOP BAR CLIMA & SEDES */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">¡Hola, Admin! 👋</h1>
            <p className="text-xs text-gray-400">Resumen operativo general y servicios en vivo</p>
          </div>

          <div className="flex items-center gap-4">
            {/* WIDGET CLIMA EN TIEMPO REAL */}
            <div className="flex items-center gap-3 bg-[#F0FDF4] px-3.5 py-2 rounded-xl border border-[#DCFCE7] text-xs">
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

        {/* TAB 1: DASHBOARD DE MÉTRICAS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FEF3C7]/40 border border-[#FDE68A] p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-700">Pedidos Hoy</span>
                <div className="text-3xl font-extrabold text-amber-900">142</div>
                <span className="text-[10px] text-amber-600 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">+12% vs ayer</span>
              </div>

              <div className="bg-[#DCFCE7]/40 border border-[#BBF7D0] p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-700">Ventas Hoy</span>
                <div className="text-3xl font-extrabold text-emerald-900">₡485,000</div>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">Metas alcanzadas</span>
              </div>

              <div className="bg-[#E0F2FE]/40 border border-[#BAE6FD] p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-sky-700">Ticket Promedio</span>
                <div className="text-3xl font-extrabold text-sky-900">₡12,400</div>
                <span className="text-[10px] text-sky-600 font-semibold bg-sky-100 px-2 py-0.5 rounded-full">Estable</span>
              </div>

              <div className="bg-[#FEE2E2]/40 border border-[#FECACA] p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-rose-700">Pedidos en Progreso</span>
                <div className="text-3xl font-extrabold text-rose-900">8</div>
                <span className="text-[10px] text-rose-600 font-semibold bg-rose-100 px-2 py-0.5 rounded-full">Despachando ahora</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-gray-900">Pedidos Recientes</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-900">Mesa #12 • Chifrijo Especial</span>
                      <span className="block text-[10px] text-gray-400">Hace 4 minutos</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">En Preparación</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-900">Mesa #04 • Vigorón 1kg</span>
                      <span className="block text-[10px] text-gray-400">Hace 12 minutos</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Entregado</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-gray-900">Productos Populares</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-bold text-gray-800">1. Chifrijo de Paila</span>
                    <span className="font-extrabold text-[#D16014]">84 vendidas</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-bold text-gray-800">2. Vigorón Criollo</span>
                    <span className="font-extrabold text-[#D16014]">42 vendidas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EMPLEADOS & HORARIOS */}
        {activeTab === 'employees' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-gray-900">Gestión de Personal & Turnos Semanales</h3>
              <button onClick={() => showToast('Nuevo empleado agregado al turno')} className="px-3.5 py-2 rounded-xl bg-[#D16014] text-white font-bold text-xs">
                + Agregar Empleado
              </button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400">
                    <th className="py-2">Empleado</th>
                    <th>Rol / Puesto</th>
                    <th>Días Asignados</th>
                    <th>Horario de Turno</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="py-3 font-bold text-gray-900">{emp.nombre}</td>
                      <td>{emp.rol}</td>
                      <td>{emp.dia}</td>
                      <td className="text-gray-500">{emp.turno}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${emp.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                          {emp.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ENVÍO DE CORREOS */}
        {activeTab === 'email' && (
          <div className="max-w-xl bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900">Envío de Correos a Clientes</h3>
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
                  placeholder="Confirmación de Reservación / Promoción" 
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
                  placeholder="Escriba aquí el contenido del correo..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800"
                ></textarea>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-[#D16014] text-white font-bold flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Enviar Correo Ahora
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}