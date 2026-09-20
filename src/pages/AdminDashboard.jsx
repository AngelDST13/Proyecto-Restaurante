import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { formatSedeName } from '../services/authSecurity';
import { triggerN8nAutomation } from '../services/n8nService';
import { 
  ShieldCheck, DollarSign, ShoppingBag, Users, Clock, 
  TrendingUp, RefreshCw, AlertTriangle, Plus, Trash2, Pencil, CheckCircle2,
  BarChart3, Package, CreditCard, Calendar, MapPin, LogOut, ExternalLink,
  Search, Sliders, Flame, AlertCircle, Star, Ticket, MessageSquare,
  Award, ArrowUpRight
} from 'lucide-react';
import logoNegro from '../assets/img/LogoN.svg';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('resumen');
  const [selectedSede, setSelectedSede] = useState('escazu');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // FILTROS Y BÚSQUEDA DE INVENTARIO
  const [searchInsumo, setSearchInsumo] = useState('');
  const [filterState, setFilterState] = useState('todos');

  // ESTADO DE MODAL Y FORMULARIO CON UMBRALES MÍNIMOS Y MÁXIMOS
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [itemForm, setItemForm] = useState({
    nombre: '',
    stock: '',
    minLimit: '',
    maxLimit: '',
    unidad: 'kg',
    sede: 'escazu'
  });

  // BASE DE DATOS LOCAL DE INVENTARIOS CON LÍMITES
  const [inventory, setInventory] = useState([
    { id: 1, nombre: 'Carne de Cerdo para Chicharrón', stock: 120, minLimit: 30, maxLimit: 200, unidad: 'kg', sede: 'escazu' },
    { id: 2, nombre: 'Yuca Fresca de Paila', stock: 18, minLimit: 25, maxLimit: 100, unidad: 'kg', sede: 'escazu' },
    { id: 3, nombre: 'Frijoles Cubaces Tiernos', stock: 85, minLimit: 20, maxLimit: 150, unidad: 'kg', sede: 'escazu' },
    { id: 4, nombre: 'Plátano Verde para Patacones', stock: 15, minLimit: 40, maxLimit: 200, unidad: 'unid', sede: 'santa_ana' },
    { id: 5, nombre: 'Costilla de Cerdo Ahumada', stock: 12, minLimit: 20, maxLimit: 80, unidad: 'kg', sede: 'heredia' },
    { id: 6, nombre: 'Cas Criollo para Naturales', stock: 45, minLimit: 10, maxLimit: 60, unidad: 'kg', sede: 'cartago' }
  ]);

  const topSellingFoods = [
    { rank: '#1', nombre: 'Chifrijo Especial de Paila', ventas: 342, monto: '₡2,325,600', rating: 4.9 },
    { rank: '#2', nombre: 'Costilla Cerdo a la Leña', ventas: 215, monto: '₡1,978,000', rating: 4.8 },
    { rank: '#3', nombre: 'Vigorón Criollo Cacique (1kg)', ventas: 184, monto: '₡2,668,000', rating: 5.0 },
    { rank: '#4', nombre: 'Ceviche de Tilapia Arreglado', ventas: 142, monto: '₡781,000', rating: 4.7 }
  ];

  const liveActivities = [
    { id: 1, texto: 'Nueva comanda #ORD-105 recibida', hora: 'Hace 2 min', tipo: 'pedido' },
    { id: 2, texto: 'Calificación 5 estrellas asignada por un cliente', hora: 'Hace 8 min', tipo: 'review' },
    { id: 3, texto: 'Reabastecimiento de Yuca aprobado', hora: 'Hace 15 min', tipo: 'stock' }
  ];

  const coupons = [
    { id: 1, codigo: 'CACIQUE10', descripcion: '10% de descuento en pedidos familiares', usos: 84, estado: 'Activo' },
    { id: 2, codigo: 'PAILA2026', descripcion: 'Bebida gratis en consumo mayor a ₡15,000', usos: 42, estado: 'Activo' },
    { id: 3, codigo: 'LUNESCRIOLLO', descripcion: '15% de descuento los lunes', usos: 0, estado: 'Programado' }
  ];

  const reviews = [
    { id: 1, cliente: 'María González', sede: 'Escazú', rating: 5, comentario: 'El chifrijo estuvo increíble y el servicio fue muy rápido.' },
    { id: 2, cliente: 'Diego Vargas', sede: 'Santa Ana', rating: 4, comentario: 'Muy buen sabor. La terraza es excelente para compartir.' },
    { id: 3, cliente: 'Sofía Ramírez', sede: 'Cartago', rating: 5, comentario: 'La atención del equipo y la calidad de la paila fueron excelentes.' }
  ];

  // DATOS MÉTRICOS POR SEDE
  const sedeData = {
    escazu: { ventas: 785400, comandas: 1890, clientes: 23847, personal: 12, coccion: '15 min', mesasLibres: 8, mesasTotal: 24, completados: 956, pendientes: 243, cancelados: 85 },
    santa_ana: { ventas: 540200, comandas: 1320, clientes: 18200, personal: 8, coccion: '17 min', mesasLibres: 4, mesasTotal: 18, completados: 810, pendientes: 140, cancelados: 30 },
    cartago: { ventas: 610900, comandas: 1450, clientes: 20400, personal: 10, coccion: '16 min', mesasLibres: 6, mesasTotal: 20, completados: 910, pendientes: 180, cancelados: 30 },
    heredia: { ventas: 485250, comandas: 1284, clientes: 15900, personal: 9, coccion: '18 min', mesasLibres: 3, mesasTotal: 16, completados: 740, pendientes: 110, cancelados: 40 }
  };

  const currentMetrics = sedeData[selectedSede];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // MANEJO DE MODAL DE INVENTARIO
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemForm({
      nombre: '',
      stock: '',
      minLimit: '',
      maxLimit: '',
      unidad: 'kg',
      sede: selectedSede
    });
    setIsInventoryModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setItemForm({
      nombre: item.nombre,
      stock: item.stock.toString(),
      minLimit: item.minLimit.toString(),
      maxLimit: item.maxLimit.toString(),
      unidad: item.unidad,
      sede: item.sede
    });
    setIsInventoryModalOpen(true);
  };

  const handleSaveInventoryItem = (e) => {
    e.preventDefault();
    if (!itemForm.nombre || !itemForm.stock || !itemForm.minLimit || !itemForm.maxLimit) {
      showToast('Por favor complete todos los campos requeridos', 'error');
      return;
    }

    const stockNum = parseInt(itemForm.stock, 10);
    const minNum = parseInt(itemForm.minLimit, 10);
    const maxNum = parseInt(itemForm.maxLimit, 10);

    if (editingItem) {
      setInventory(prev => prev.map(item => item.id === editingItem.id ? {
        ...item,
        nombre: itemForm.nombre,
        stock: stockNum,
        minLimit: minNum,
        maxLimit: maxNum,
        unidad: itemForm.unidad,
        sede: itemForm.sede
      } : item));
      showToast(`Insumo "${itemForm.nombre}" actualizado correctamente`, 'success');
    } else {
      const newItem = {
        id: Date.now(),
        nombre: itemForm.nombre,
        stock: stockNum,
        minLimit: minNum,
        maxLimit: maxNum,
        unidad: itemForm.unidad,
        sede: itemForm.sede
      };
      setInventory(prev => [...prev, newItem]);
      showToast(`Insumo "${itemForm.nombre}" registrado en inventario`, 'success');
    }

    setIsInventoryModalOpen(false);
  };

  const handleDeleteItem = (id, nombre) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    showToast(`Insumo "${nombre}" eliminado del registro`, 'info');
  };

  // FILTRADO DE INVENTARIO
  const branchInventory = inventory.filter(i => i.sede === selectedSede);
  const filteredInventory = branchInventory.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchInsumo.toLowerCase());
    const isCritical = item.stock <= item.minLimit;
    const isOptimal = item.stock > item.minLimit;

    if (filterState === 'critico') return matchesSearch && isCritical;
    if (filterState === 'optimo') return matchesSearch && isOptimal;
    return matchesSearch;
  });

  const criticalItemsCount = branchInventory.filter(i => i.stock <= i.minLimit).length;

  return (
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] font-sans flex flex-col lg:flex-row">
      
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      {/* SIDEBAR DE NAVEGACIÓN DEDICADO DEL PANEL ADMIN */}
      <aside className="w-full lg:w-72 bg-[#001812] border-r border-[#659B5E]/30 p-6 flex flex-col justify-between shrink-0 shadow-2xl">
        <div className="space-y-8">
          
          <div className="flex items-center gap-3 pb-6 border-b border-[#F8FFE5]/10">
            <div className="w-12 h-12 rounded-2xl bg-[#0A090C] border border-[#D16014]/50 flex items-center justify-center p-2 shrink-0">
              <img src={logoNegro} alt="El Cacique Admin" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-base text-[#F8FFE5] block leading-tight">El Cacique</span>
              <span className="text-[10px] text-[#D16014] font-black uppercase tracking-wider bg-[#D16014]/10 px-2 py-0.5 rounded border border-[#D16014]/30 inline-block mt-0.5">
                Panel Ejecutivo
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A090C] border border-[#659B5E]/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#659B5E]">
              <ShieldCheck className="w-4 h-4" />
              <span>Administradora General</span>
            </div>
            <p className="font-extrabold text-sm text-[#F8FFE5]">
              {user?.nombre || 'Angel Daniela Salazar T.'}
            </p>
            <p className="text-[10px] text-gray-400">admin@elcacique.com</p>
          </div>

          <nav className="space-y-1.5 text-xs font-bold uppercase tracking-wider">
            {[
                { id: 'resumen', label: 'Resumen & Analíticas', icon: BarChart3 },
                { id: 'inventario', label: 'Gestión de Inventario', icon: Package, badge: criticalItemsCount > 0 ? criticalItemsCount : null },
                { id: 'cupones', label: 'Cupones & Promos', icon: Ticket },
                { id: 'resenas', label: 'Reseñas & Clientes', icon: Star },
                { id: 'arqueo', label: 'Arqueo de Caja & POS', icon: CreditCard },
                { id: 'personal', label: 'Personal & Planilla', icon: Users },
                { id: 'mesas', label: 'Mesas & Reservaciones', icon: Calendar }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                    activeSection === item.id 
                      ? 'bg-[#D16014] text-white shadow-lg shadow-[#D16014]/30' 
                      : 'text-gray-400 hover:text-white hover:bg-[#0A090C]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[#F8FFE5]/10 space-y-2 text-xs font-bold">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 text-gray-300 hover:text-white hover:border-[#659B5E] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Ir a Sitio Web
          </button>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-grow p-6 sm:p-10 space-y-8 overflow-y-auto">
        
        <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#D16014] uppercase tracking-widest bg-[#D16014]/20 px-2.5 py-1 rounded-full border border-[#D16014]/40">
                Dirección General de Operaciones
              </span>
              <span className="text-[10px] text-[#659B5E] font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> El Cacique 2026
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#F8FFE5] mt-2">
              {getGreeting()}, {user?.alias || 'Angel'}!
            </h1>
            <p className="text-xs text-gray-400">
              Aquí está el resumen ejecutivo del rendimiento operacional de hoy.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#659B5E]" />
              <select
                value={selectedSede}
                onChange={e => {
                  setSelectedSede(e.target.value);
                  showToast(`Filtros aplicados para Sede ${formatSedeName(e.target.value)}`, 'info');
                }}
                className="w-full bg-[#0A090C] border border-[#659B5E]/40 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-[#F8FFE5] focus:outline-none focus:border-[#D16014] cursor-pointer"
              >
                <option value="escazu">Sede Escazú • Centro Culinario</option>
                <option value="santa_ana">Sede Santa Ana • Plaza Real</option>
                <option value="cartago">Sede Cartago • Paso Ancho</option>
                <option value="heredia">Sede Heredia • Vía Central</option>
              </select>
            </div>

            <button
              onClick={() => showToast('Métricas e inventario sincronizados', 'success')}
              className="p-3 bg-[#0A090C] border border-[#F8FFE5]/15 hover:border-[#D16014] rounded-2xl text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Sincronizar Datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ALERTA CRÍTICA */}
        {criticalItemsCount > 0 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex items-center justify-between text-xs text-amber-300 shadow-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="font-extrabold block">Atención: Reabastecimiento Requerido</strong>
                <span>Hay {criticalItemsCount} insumo(s) en Sede {formatSedeName(selectedSede)} por debajo de su Límite Mínimo.</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveSection('inventario')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl text-[11px] cursor-pointer"
            >
              Ver Insumos
            </button>
          </div>
        )}

        {/* RESUMEN Y MÉTRICAS */}
        {activeSection === 'resumen' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Ventas Acumuladas</span>
                  <DollarSign className="w-4 h-4 text-[#659B5E]" />
                </div>
                <div className="text-3xl font-black text-[#D16014]">₡{currentMetrics.ventas.toLocaleString()}</div>
                <span className="text-[10px] text-[#659B5E] font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12.5% rendimiento mensual
                </span>
              </div>

              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Órdenes de Hoy</span>
                  <ShoppingBag className="w-4 h-4 text-[#D16014]" />
                </div>
                <div className="text-3xl font-black text-[#F8FFE5]">{currentMetrics.comandas.toLocaleString()}</div>
                <span className="text-[10px] text-[#659B5E] font-bold flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +8.2% incremento diario</span>
              </div>

              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Clientes Atendidos</span>
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-[#F8FFE5]">{currentMetrics.clientes.toLocaleString()}</div>
                <span className="text-[10px] text-[#659B5E] font-bold flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +15.3% preferencia</span>
              </div>

              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Tiempo Prom. Entrega</span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-black text-[#F8FFE5]">{currentMetrics.coccion}</div>
                <span className="text-[10px] text-gray-400">Objetivo: &lt; 20 min</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 shadow-2xl">
                <div className="flex justify-between items-center border-b border-[#F8FFE5]/10 pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#F8FFE5]">Tendencia de Ventas</h3>
                    <p className="text-xs text-gray-400">Evolución mensual en Sede {formatSedeName(selectedSede)}.</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#659B5E]" />
                </div>
                <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-[#F8FFE5]/10">
                  {[60, 75, 50, 90, 80, 100].map((value, index) => (
                    <div key={value} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full bg-gradient-to-t from-[#659B5E] to-[#D16014] rounded-t-xl group-hover:brightness-125 transition-all" style={{ height: `${value}%` }} />
                      <span className="text-[10px] font-bold text-gray-400">{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'][index]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-5 shadow-2xl">
                <h3 className="font-extrabold text-base border-b border-[#F8FFE5]/10 pb-4">Estado de Órdenes</h3>
                {[
                  { label: 'Despachadas', value: currentMetrics.completados, color: 'text-[#659B5E]', icon: CheckCircle2 },
                  { label: 'En Proceso / Paila', value: currentMetrics.pendientes, color: 'text-amber-400', icon: Clock },
                  { label: 'Canceladas', value: currentMetrics.cancelados, color: 'text-red-400', icon: AlertTriangle }
                ].map(status => {
                  const StatusIcon = status.icon;
                  return (
                    <div key={status.label} className="p-3 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 flex justify-between items-center">
                      <span className={`text-xs font-bold ${status.color} flex items-center gap-2`}><StatusIcon className="w-4 h-4" /> {status.label}</span>
                      <span className="text-lg font-black text-white">{status.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-4 shadow-2xl">
                <h3 className="font-extrabold text-base border-b border-[#F8FFE5]/10 pb-3 flex items-center gap-2"><Award className="w-5 h-5 text-[#D16014]" /> Platillos Más Vendidos</h3>
                <div className="space-y-3 text-xs">
                  {topSellingFoods.map(food => (
                    <div key={food.rank} className="p-3 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><span className="font-mono font-black text-[#D16014]">{food.rank}</span><div><strong className="font-bold text-white block">{food.nombre}</strong><span className="text-[10px] text-gray-400">{food.ventas} órdenes servidas</span></div></div>
                      <div className="text-right"><span className="font-black text-[#659B5E] block">{food.monto}</span><span className="text-[10px] text-amber-400">★ {food.rating}</span></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-4 shadow-2xl">
                <h3 className="font-extrabold text-base border-b border-[#F8FFE5]/10 pb-3">Actividad en Vivo</h3>
                {liveActivities.map(activity => <div key={activity.id} className="p-3 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10"><p className="text-xs font-bold text-gray-200">{activity.texto}</p><span className="text-[10px] text-[#659B5E] font-mono">{activity.hora}</span></div>)}
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO DE INVENTARIO CON LÍMITES Y ALERTAS */}
        {activeSection === 'inventario' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 text-xs shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F8FFE5]/10 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-[#F8FFE5]">Control de Insumos &amp; Umbrales de Seguridad</h3>
                <p className="text-gray-400 text-[11px]">Establece límites mínimos de reorden y máximos de capacidad por sede.</p>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="px-5 py-3 rounded-2xl bg-[#D16014] hover:bg-[#b8510f] text-white font-extrabold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agregar Insumo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar insumo por nombre..."
                  value={searchInsumo}
                  onChange={e => setSearchInsumo(e.target.value)}
                  className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#659B5E]" />
                <select
                  value={filterState}
                  onChange={e => setFilterState(e.target.value)}
                  className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5 text-[#F8FFE5] font-bold focus:outline-none focus:border-[#D16014] cursor-pointer"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="critico">⚠️ Stock Crítico (En o bajo Límite Mínimo)</option>
                  <option value="optimo">✓ Stock Óptimo</option>
                </select>
              </div>
            </div>

            {/* TABLA DE REGISTROS */}
            <div className="overflow-x-auto rounded-2xl border border-[#F8FFE5]/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A090C] text-[#F8FFE5] border-b border-[#F8FFE5]/10 text-[11px] uppercase tracking-wider font-extrabold">
                    <th className="p-4">Insumo</th>
                    <th className="p-4">Stock Actual</th>
                    <th className="p-4">Límite Mínimo</th>
                    <th className="p-4">Límite Máximo</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FFE5]/10 font-mono">
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map(item => {
                      const isLow = item.stock <= item.minLimit;
                      return (
                        <tr key={item.id} className="hover:bg-[#0A090C]/50 transition-colors">
                          <td className="p-4 font-sans font-extrabold text-[#F8FFE5]">{item.nombre}</td>
                          <td className="p-4 text-sm font-bold text-white">{item.stock} {item.unidad}</td>
                          <td className="p-4 text-amber-400 font-bold">{item.minLimit} {item.unidad}</td>
                          <td className="p-4 text-gray-400">{item.maxLimit} {item.unidad}</td>
                          <td className="p-4 font-sans">
                            {isLow ? (
                              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black uppercase flex items-center gap-1 w-max">
                                <AlertTriangle className="w-3 h-3" /> Stock Crítico
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-[#659B5E]/20 text-[#659B5E] border border-[#659B5E]/40 text-[10px] font-black uppercase flex items-center gap-1 w-max">
                                <CheckCircle2 className="w-3 h-3" /> Óptimo
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-2 font-sans">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg cursor-pointer"
                              title="Editar Insumo y Límites"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.nombre)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                              title="Eliminar Insumo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-400 font-sans">
                        No se encontraron insumos con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'cupones' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 text-xs shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F8FFE5]/10 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-[#F8FFE5] flex items-center gap-2"><Ticket className="w-5 h-5 text-[#D16014]" /> Cupones y Promociones</h3>
                <p className="text-gray-400 text-[11px]">Gestiona campañas activas y mide su uso en Sede {formatSedeName(selectedSede)}.</p>
              </div>
              <button
                onClick={() => showToast('Formulario de nueva promoción disponible próximamente', 'info')}
                className="px-5 py-3 rounded-2xl bg-[#D16014] hover:bg-[#b8510f] text-white font-extrabold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Crear Promoción
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map(coupon => (
                <div key={coupon.id} className="p-5 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono font-black text-[#D16014] text-base">{coupon.codigo}</span>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${coupon.estado === 'Activo' ? 'bg-[#659B5E]/20 text-[#659B5E]' : 'bg-amber-500/20 text-amber-400'}`}>{coupon.estado}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{coupon.descripcion}</p>
                  <div className="flex items-center justify-between border-t border-[#F8FFE5]/10 pt-3">
                    <span className="text-gray-400">Usos registrados</span>
                    <span className="font-black text-white">{coupon.usos}</span>
                  </div>
                  <button
                    onClick={() => {
                      triggerN8nAutomation('PROMOCION_CACIQUE', { codigo: coupon.codigo, sede: selectedSede, accion: 'ACTUALIZAR_PROMOCION' });
                      showToast(`Promoción ${coupon.codigo} sincronizada`, 'success');
                    }}
                    className="w-full py-2 rounded-xl border border-[#659B5E]/30 text-[#659B5E] font-bold hover:bg-[#659B5E]/10 cursor-pointer"
                  >
                    Sincronizar Campaña
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'resenas' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F8FFE5]/10 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-[#F8FFE5] flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#D16014]" /> Reseñas y Clientes</h3>
                <p className="text-gray-400 text-[11px]">Comentarios recientes de la experiencia gastronómica.</p>
              </div>
              <div className="text-right"><span className="block text-2xl font-black text-amber-400">4.8</span><span className="text-[10px] text-gray-400">Promedio general</span></div>
            </div>

            <div className="space-y-3">
              {reviews.map(review => (
                <div key={review.id} className="p-4 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><strong className="text-white">{review.cliente}</strong><span className="text-[10px] text-[#659B5E]">Sede {review.sede}</span></div>
                    <p className="text-gray-300 leading-relaxed">{review.comentario}</p>
                  </div>
                  <div className="shrink-0 text-amber-400 tracking-wide">{'★'.repeat(review.rating)}<span className="text-gray-600">{'★'.repeat(5 - review.rating)}</span></div>
                </div>
              ))}
            </div>

            <button
              onClick={() => showToast('No hay reseñas pendientes de moderación', 'info')}
              className="px-5 py-2.5 rounded-xl bg-[#659B5E] hover:bg-[#52824c] text-white font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Revisar moderación
            </button>
          </div>
        )}

        {/* ARQUEO DE CAJA */}
        {activeSection === 'arqueo' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 text-xs shadow-2xl">
            <h3 className="font-extrabold text-base text-[#F8FFE5] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#D16014]" /> Arqueo Financiero Diario de Caja
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div className="p-4 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 space-y-1">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Efectivo en Caja:</span>
                <span className="text-xl font-bold text-[#659B5E]">₡210,500</span>
              </div>
              <div className="p-4 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 space-y-1">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Tarjetas / POS:</span>
                <span className="text-xl font-bold text-[#D16014]">₡274,750</span>
              </div>
              <div className="p-4 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 space-y-1">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Reportado:</span>
                <span className="text-xl font-bold text-[#F8FFE5]">₡485,250</span>
              </div>
            </div>

            <button
              onClick={() => showToast('Cierre de caja registrado exitosamente', 'success')}
              className="px-6 py-3.5 rounded-2xl bg-[#D16014] hover:bg-[#b8510f] text-white font-extrabold flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Registrar Cierre Diario de Caja
            </button>
          </div>
        )}

        {/* PERSONAL */}
        {activeSection === 'personal' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="font-extrabold text-base text-[#F8FFE5]">Nómina de Personal Activo - Sede {formatSedeName(selectedSede)}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#F8FFE5] block text-sm">Angel Daniela Salazar T.</span>
                  <span className="text-[10px] text-[#D16014]">Administradora General</span>
                </div>
                <span className="px-3 py-1 bg-[#659B5E]/20 text-[#659B5E] text-[10px] font-extrabold rounded-lg">Turno Activo</span>
              </div>

              <div className="p-4 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#F8FFE5] block text-sm">Carlos Ramírez</span>
                  <span className="text-[10px] text-[#659B5E]">Mesero de Salón &amp; Terraza</span>
                </div>
                <span className="px-3 py-1 bg-[#659B5E]/20 text-[#659B5E] text-[10px] font-extrabold rounded-lg">Turno Activo</span>
              </div>
            </div>
          </div>
        )}

        {/* MESAS */}
        {activeSection === 'mesas' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="font-extrabold text-base text-[#F8FFE5]">Control de Mesas - Sede {formatSedeName(selectedSede)}</h3>
            <p className="text-gray-400">Total de mesas registradas: {currentMetrics.mesasTotal} | Mesas libres: {currentMetrics.mesasLibres}</p>
          </div>
        )}

      </main>

      {/* MODAL CONFIGURADOR DE INSUMO Y UMBRALES */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#001812] border border-[#659B5E]/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-xs text-[#F8FFE5]">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#F8FFE5]">
                {editingItem ? 'Editar Insumo & Umbrales' : 'Registrar Nuevo Insumo'}
              </h3>
              <p className="text-gray-400">Define los límites mínimo y máximo de existencias por sede.</p>
            </div>

            <form onSubmit={handleSaveInventoryItem} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-bold text-gray-300">Nombre del Insumo</label>
                <input
                  type="text"
                  placeholder="ej: Carne de Cerdo para Chicharrón"
                  value={itemForm.nombre}
                  onChange={e => setItemForm({ ...itemForm, nombre: e.target.value })}
                  required
                  className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-300">Stock Actual</label>
                  <input
                    type="number"
                    placeholder="Cantidad..."
                    value={itemForm.stock}
                    onChange={e => setItemForm({ ...itemForm, stock: e.target.value })}
                    required
                    className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-300">Unidad de Medida</label>
                  <select
                    value={itemForm.unidad}
                    onChange={e => setItemForm({ ...itemForm, unidad: e.target.value })}
                    className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
                  >
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="unid">Unidades (unid)</option>
                    <option value="litros">Litros (l)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-amber-400">Límite Mínimo (Alerta)</label>
                  <input
                    type="number"
                    placeholder="ej: 30"
                    value={itemForm.minLimit}
                    onChange={e => setItemForm({ ...itemForm, minLimit: e.target.value })}
                    required
                    className="w-full bg-[#0A090C] border border-amber-500/40 rounded-xl px-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#659B5E]">Límite Máximo (Capacidad)</label>
                  <input
                    type="number"
                    placeholder="ej: 200"
                    value={itemForm.maxLimit}
                    onChange={e => setItemForm({ ...itemForm, maxLimit: e.target.value })}
                    required
                    className="w-full bg-[#0A090C] border border-[#659B5E]/40 rounded-xl px-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#659B5E]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInventoryModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 text-gray-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#D16014] hover:bg-[#b8510f] text-white font-extrabold shadow-lg cursor-pointer"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#001812] border border-red-500/40 rounded-3xl p-6 space-y-5 text-center shadow-2xl text-xs text-[#F8FFE5]">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">¿Cerrar Sesión Operativa?</h3>
              <p className="text-gray-400">Se finalizará la sesión activa de administración general.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 text-gray-300 font-bold hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold shadow-lg cursor-pointer"
              >
                Sí, Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}