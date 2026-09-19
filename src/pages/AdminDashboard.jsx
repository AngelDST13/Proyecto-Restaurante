import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeatherByLocation } from '../services/weatherService';
import Toast from '../components/Toast';
import { 
  LayoutDashboard, ShoppingBag, 
  Layers, Users, Mail, Search, CloudSun, Send, 
  Eye, Edit3, Trash2, Plus, DollarSign, Clock, LogOut, 
  TrendingUp, ArrowUpRight, ArrowDownRight, Truck, CheckCircle2, AlertTriangle, RefreshCw, PhoneCall, Building2
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

  const [suppliers] = useState([
    { id: 1, nombre: 'Distribuidora Carnes del Sur', contacto: 'Don Mario Vargas', telefono: '50688881111', dep: 'Carnes & Cerdo', sede: 'escazu' },
    { id: 2, nombre: 'Vegetales Frescos Cartago', contacto: 'Doña Elena Ramos', telefono: '50688882222', dep: 'Verduras & Yuca', sede: 'cartago' },
    { id: 3, nombre: 'Avícola & Granos La Central', contacto: 'Carlos Jiménez', telefono: '50688883333', dep: 'Granos & Huevos', sede: 'santa_ana' },
    { id: 4, nombre: 'Cervecería Artesanal El Cacique', contacto: 'Bryan Gómez', telefono: '50688884444', dep: 'Bebidas & Licores', sede: 'heredia' }
  ]);

  const [inventory, setInventory] = useState([
    { id: 1, ingrediente: 'Chicharrón de Concha', cat: 'Carnes', stock: 65, max: 120, unidad: 'kg', estado: 'Normal', valor: '₡325,000', sede: 'escazu' },
    { id: 2, ingrediente: 'Yuca Criolla Fina', cat: 'Vegetales', stock: 14, max: 90, unidad: 'kg', estado: 'Crítico', valor: '₡21,000', sede: 'escazu' },
    { id: 3, ingrediente: 'Frijoles Tiernos Cubaces', cat: 'Granos', stock: 80, max: 100, unidad: 'kg', estado: 'Normal', valor: '₡120,000', sede: 'santa_ana' },
    { id: 4, ingrediente: 'Aguacate Hass Premium', cat: 'Vegetales', stock: 9, max: 60, unidad: 'kg', estado: 'Crítico', valor: '₡36,000', sede: 'cartago' },
    { id: 5, ingrediente: 'Costilla Cerdo Ahumada', cat: 'Carnes', stock: 40, max: 80, unidad: 'kg', estado: 'Normal', valor: '₡240,000', sede: 'heredia' }
  ]);

  const [employees, setEmployees] = useState([
    { id: 1, nombre: 'Bryan Gómez', rol: 'Mesero Jefe', turno: 'Mañana (11:00 AM - 5:00 PM)', estado: 'Activo', sede: 'escazu' },
    { id: 2, nombre: 'Víctor González', rol: 'Chef Ejecutivo', turno: 'Tarde (4:00 PM - 11:00 PM)', estado: 'Activo', sede: 'escazu' },
    { id: 3, nombre: 'María Fernández', rol: 'Cajera Central', turno: 'Completo (10:00 AM - 8:00 PM)', estado: 'Descanso', sede: 'santa_ana' },
    { id: 4, nombre: 'Luis Solano', rol: 'Pailero Maestro', turno: 'Mañana (11:00 AM - 5:00 PM)', estado: 'Activo', sede: 'cartago' }
  ]);

  const [newStock, setNewStock] = useState({ ingrediente: '', cat: 'Carnes', stock: '', unidad: 'kg', valor: '' });
  const [newEmp, setNewEmp] = useState({ nombre: '', rol: 'Mesero Jefe', turno: 'Mañana (11:00 AM - 5:00 PM)' });
  const [emailForm, setEmailForm] = useState({ dep: 'Administración', para: '', asunto: '', mensaje: '' });

  useEffect(() => {
    getWeatherByLocation(selectedSede).then(res => setWeather(res));
  }, [selectedSede]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleAddStock = (e) => {
    e.preventDefault();
    if (!newStock.ingrediente) return;
    const item = {
      id: Date.now(),
      ...newStock,
      stock: Number(newStock.stock),
      max: 100,
      estado: Number(newStock.stock) < 15 ? 'Crítico' : 'Normal',
      sede: selectedSede
    };
    setInventory([...inventory, item]);
    setNewStock({ ingrediente: '', cat: 'Carnes', stock: '', unidad: 'kg', valor: '' });
    showToast(`Insumo agregado a la sede ${selectedSede.toUpperCase()}`, 'success');
  };

  const handleDeleteStock = (id) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    showToast('Insumo eliminado del sistema', 'info');
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmp.nombre) return;
    const emp = {
      id: Date.now(),
      ...newEmp,
      estado: 'Activo',
      sede: selectedSede
    };
    setEmployees([...employees, emp]);
    setNewEmp({ nombre: '', rol: 'Mesero Jefe', turno: 'Mañana (11:00 AM - 5:00 PM)' });
    showToast(`Empleado asignado a la sede ${selectedSede.toUpperCase()}`, 'success');
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    showToast('Empleado retirado de la planilla', 'info');
  };

  const handleCallSupplier = (phone) => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent('Hola, le saludamos de Chicharronera El Cacique para consultar disponibilidad de insumos.')}`, '_blank');
    showToast('Iniciando contacto vía WhatsApp API...', 'info');
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    showToast(`Correo despachado al Departamento de ${emailForm.dep} (${emailForm.para})`, 'success');
    setEmailForm({ dep: 'Administración', para: '', asunto: '', mensaje: '' });
  };

  const filteredInventory = inventory.filter(i => i.sede === selectedSede && i.ingrediente.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredEmployees = employees.filter(e => e.sede === selectedSede && e.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSuppliers = suppliers.filter(s => s.sede === selectedSede);

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
              onClick={() => setActiveTab('inventory')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-[#D16014]/10 text-[#D16014] font-extrabold' : 'hover:bg-gray-50'}`}
            >
              <Layers className="w-4 h-4" /> <span>Inventario por Sede</span>
            </button>

            <button 
              onClick={() => setActiveTab('employees')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'employees' ? 'bg-[#D16014]/10 text-[#D16014] font-extrabold' : 'hover:bg-gray-50'}`}
            >
              <Users className="w-4 h-4" /> <span>Personal &amp; Planilla</span>
            </button>

            <button 
              onClick={() => setActiveTab('suppliers')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'suppliers' ? 'bg-[#D16014]/10 text-[#D16014] font-extrabold' : 'hover:bg-gray-50'}`}
            >
              <PhoneCall className="w-4 h-4" /> <span>Proveedores WhatsApp</span>
            </button>

            <button 
              onClick={() => setActiveTab('email')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'email' ? 'bg-[#D16014]/10 text-[#D16014] font-extrabold' : 'hover:bg-gray-50'}`}
            >
              <Mail className="w-4 h-4" /> <span>Correos Departamentales</span>
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

      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar insumos, personal o proveedores..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-700 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button onClick={() => showToast('Datos actualizados en tiempo real', 'info')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl" title="Refrescar">
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 bg-[#00241B] px-3.5 py-1.5 rounded-xl border border-[#659B5E]/30 text-xs text-[#F8FFE5]">
              <Building2 className="w-4 h-4 text-[#D16014]" />
              <span className="font-bold">Local Activo:</span>
              <select 
                value={selectedSede} 
                onChange={(e) => setSelectedSede(e.target.value)}
                className="bg-transparent font-extrabold text-[#659B5E] focus:outline-none cursor-pointer"
              >
                <option value="escazu" className="bg-[#00241B]">Sede Escazú</option>
                <option value="santa_ana" className="bg-[#00241B]">Sede Santa Ana</option>
                <option value="cartago" className="bg-[#00241B]">Sede Cartago</option>
                <option value="heredia" className="bg-[#00241B]">Sede Heredia</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#F0FDF4] px-3 py-1.5 rounded-xl border border-[#DCFCE7] text-xs">
              <CloudSun className="w-4 h-4 text-[#16A34A]" />
              <span className="font-bold text-[#15803D]">{weather ? `${weather.temp}°C` : '--'}</span>
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#D16014]" />
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Métricas de {selectedSede.toUpperCase()} 👋</h1>
                  <p className="text-xs text-gray-400 mt-0.5">Estado general del restaurante y comandas activas.</p>
                </div>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600">
                <button onClick={() => setTimeFilter('hoy')} className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === 'hoy' ? 'bg-[#D16014] text-white' : ''}`}>Hoy</button>
                <button onClick={() => setTimeFilter('semana')} className={`px-3 py-1.5 rounded-lg transition-all ${timeFilter === 'semana' ? 'bg-[#D16014] text-white' : ''}`}>Semana</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center"><ArrowUpRight className="w-3 h-3" /> +12.5%</span>
                </div>
                <span className="text-xs text-gray-400 font-semibold">Ventas del Local</span>
                <div className="text-2xl font-black text-gray-900">₡485,250</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-blue-600">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-[10px] font-bold bg-blue-50 px-2 py-0.5 rounded-full flex items-center"><ArrowUpRight className="w-3 h-3" /> +8.2%</span>
                </div>
                <span className="text-xs text-gray-400 font-semibold">Comandas Atendidas</span>
                <div className="text-2xl font-black text-gray-900">1,284</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-purple-600">
                  <Users className="w-5 h-5" />
                  <span className="text-[10px] font-bold bg-purple-50 px-2 py-0.5 rounded-full flex items-center"><ArrowUpRight className="w-3 h-3" /> +15.3%</span>
                </div>
                <span className="text-xs text-gray-400 font-semibold">Personal Activo</span>
                <div className="text-2xl font-black text-gray-900">{filteredEmployees.length} Empleados</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-amber-600">
                  <Clock className="w-5 h-5" />
                  <span className="text-[10px] font-bold bg-amber-50 px-2 py-0.5 rounded-full flex items-center"><ArrowDownRight className="w-3 h-3" /> -3.1%</span>
                </div>
                <span className="text-xs text-gray-400 font-semibold">Promedio Cocción</span>
                <div className="text-2xl font-black text-gray-900">18 min</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-gray-900">Despacho de Cocina</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl text-emerald-800 font-bold">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Órdenes Servidas</span>
                    <span>834</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl text-blue-800 font-bold">
                    <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-blue-600" /> En Servicio Salón</span>
                    <span>194</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-gray-900">Alertas de Stock</h3>
                {filteredInventory.filter(i => i.estado === 'Crítico').length === 0 ? (
                  <p className="text-xs text-emerald-600 font-semibold">No hay insumos en estado crítico en esta sede.</p>
                ) : (
                  filteredInventory.filter(i => i.estado === 'Crítico').map(item => (
                    <div key={item.id} className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs flex justify-between items-center">
                      <div className="flex items-center gap-2 text-red-800 font-bold">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>{item.ingrediente} ({item.stock} {item.unidad})</span>
                      </div>
                      <button onClick={() => setActiveTab('suppliers')} className="px-2.5 py-1 bg-red-600 text-white font-bold rounded-lg text-[10px]">
                        Pedir a Proveedor
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-gray-900">Agregar Insumo a Sede: <span className="text-[#D16014] uppercase">{selectedSede}</span></h3>
              <form onSubmit={handleAddStock} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                <input type="text" placeholder="Ingrediente / Insumo" required value={newStock.ingrediente} onChange={e => setNewStock({ ...newStock, ingrediente: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800" />
                <select value={newStock.cat} onChange={e => setNewStock({ ...newStock, cat: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800">
                  <option value="Carnes">Carnes</option>
                  <option value="Vegetales">Vegetales</option>
                  <option value="Granos">Granos</option>
                  <option value="Licores">Licores</option>
                </select>
                <input type="number" placeholder="Cantidad Stock" required value={newStock.stock} onChange={e => setNewStock({ ...newStock, stock: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800" />
                <input type="text" placeholder="Valor Estimado" required value={newStock.valor} onChange={e => setNewStock({ ...newStock, valor: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800" />
                <button type="submit" className="py-2 bg-[#D16014] text-white font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-[#b8510f]">
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-gray-900">Inventario Disponible</h3>
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
                    {filteredInventory.length === 0 ? (
                      <tr><td colSpan={6} className="py-4 text-center text-gray-400">No hay insumos registrados para esta sede.</td></tr>
                    ) : (
                      filteredInventory.map(item => (
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-gray-900">Registrar Empleado en Sede: <span className="text-[#D16014] uppercase">{selectedSede}</span></h3>
              <form onSubmit={handleAddEmployee} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <input type="text" placeholder="Nombre Completo" required value={newEmp.nombre} onChange={e => setNewEmp({ ...newEmp, nombre: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800" />
                <select value={newEmp.rol} onChange={e => setNewEmp({ ...newEmp, rol: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800">
                  <option value="Mesero Jefe">Mesero Jefe</option>
                  <option value="Chef Ejecutivo">Chef Ejecutivo</option>
                  <option value="Cajera Central">Cajera Central</option>
                  <option value="Pailero Maestro">Pailero Maestro</option>
                </select>
                <select value={newEmp.turno} onChange={e => setNewEmp({ ...newEmp, turno: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800">
                  <option value="Mañana (11:00 AM - 5:00 PM)">Mañana (11:00 AM - 5:00 PM)</option>
                  <option value="Tarde (4:00 PM - 11:00 PM)">Tarde (4:00 PM - 11:00 PM)</option>
                  <option value="Completo (10:00 AM - 8:00 PM)">Completo (10:00 AM - 8:00 PM)</option>
                </select>
                <button type="submit" className="py-2 bg-[#D16014] text-white font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-[#b8510f]">
                  <Plus className="w-4 h-4" /> Asignar
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-gray-900">Planilla Registrada</h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 bg-gray-50/50">
                      <th className="py-3 px-3">Empleado</th>
                      <th>Rol</th>
                      <th>Turno Asignado</th>
                      <th>Estado</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEmployees.length === 0 ? (
                      <tr><td colSpan={5} className="py-4 text-center text-gray-400">No hay personal registrado en esta sede.</td></tr>
                    ) : (
                      filteredEmployees.map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50/80">
                          <td className="py-3.5 px-3 font-bold text-gray-900">{emp.nombre}</td>
                          <td>{emp.rol}</td>
                          <td>{emp.turno}</td>
                          <td><span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{emp.estado}</span></td>
                          <td className="text-center">
                            <button onClick={() => handleDeleteEmployee(emp.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-base text-gray-900">Directorio de Proveedores</h3>
              <p className="text-xs text-gray-400">Contacto directo vía WhatsApp API para pedidos de reabastecimiento</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {filteredSuppliers.map(sup => (
                <div key={sup.id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50 space-y-3 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">{sup.nombre}</span>
                    <span className="text-[#D16014] font-semibold block">{sup.dep}</span>
                    <span className="text-gray-500 block text-[11px]">Contacto: {sup.contacto}</span>
                  </div>
                  <button 
                    onClick={() => handleCallSupplier(sup.telefono)}
                    className="px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                  >
                    <PhoneCall className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="max-w-xl bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900">Despacho de Correos Departamentales</h3>
            <form onSubmit={handleSendEmail} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Departamento Destino</label>
                <select 
                  value={emailForm.dep} 
                  onChange={e => setEmailForm({ ...emailForm, dep: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800"
                >
                  <option value="Administración">Administración Central</option>
                  <option value="Cocina & Paila">Cocina &amp; Paila</option>
                  <option value="Proveedores">Proveedores &amp; Compras</option>
                  <option value="Servicio Salón">Servicio Salón &amp; Meseros</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">Correo Electrónico</label>
                <input 
                  type="email" 
                  required 
                  value={emailForm.para} 
                  onChange={e => setEmailForm({ ...emailForm, para: e.target.value })} 
                  placeholder="departamento@elcacique.com" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800" 
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">Asunto</label>
                <input 
                  type="text" 
                  required 
                  value={emailForm.asunto} 
                  onChange={e => setEmailForm({ ...emailForm, asunto: e.target.value })} 
                  placeholder="Notificación / Reporte Interno" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800" 
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">Mensaje</label>
                <textarea 
                  rows={4} 
                  required 
                  value={emailForm.mensaje} 
                  onChange={e => setEmailForm({ ...emailForm, mensaje: e.target.value })} 
                  placeholder="Escriba el comunicado oficial..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800"
                ></textarea>
              </div>

              <button type="submit" className="w-full py-3 bg-[#D16014] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#b8510f]">
                <Send className="w-4 h-4" /> Enviar Correo Oficial
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}