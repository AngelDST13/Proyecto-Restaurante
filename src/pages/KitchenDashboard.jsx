import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { formatSedeName } from '../services/authSecurity';
import { triggerN8nAutomation } from '../services/n8nService';
import { 
  Flame, Clock, RefreshCw, 
  Users, ChefHat, Filter, AlertCircle, LogOut, CheckSquare, Square
} from 'lucide-react';

export default function KitchenDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [filterSede, setFilterSede] = useState('escazu');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // BASE DE DATOS DE COMANDAS DE COCINA KDS
  const [orders, setOrders] = useState([
    {
      id: 'ORD-101',
      mesa: 'Mesa 02',
      personas: 4,
      mesero: 'Carlos Ramírez',
      sede: 'escazu',
      estado: 'En Paila',
      minutosTranscurridos: 14,
      items: [
        { id: 1, cantidad: 2, nombre: 'Chifrijo Especial de Paila', notas: 'Sin cebolla picada', listo: false },
        { id: 2, cantidad: 1, nombre: 'Costilla Cerdo a la Leña', notas: 'Término bien asado', listo: false },
        { id: 3, cantidad: 4, nombre: 'Refresco Natural de Cas', notas: 'Con hielo', listo: true }
      ]
    },
    {
      id: 'ORD-102',
      mesa: 'Mesa 04',
      personas: 8,
      mesero: 'Bryan Gómez',
      sede: 'santa_ana',
      estado: 'En Espera',
      minutosTranscurridos: 6,
      items: [
        { id: 4, cantidad: 2, nombre: 'Vigorón Criollo Cacique (1kg)', notas: 'Extra yuca al vapor', listo: false },
        { id: 5, cantidad: 2, nombre: 'Patacones con Carne Desmechada', notas: 'Salsa picante aparte', listo: false },
        { id: 6, cantidad: 8, nombre: 'Agua de Sapo con Jengibre', notas: '', listo: false }
      ]
    },
    {
      id: 'ORD-103',
      mesa: 'Mesa 07',
      personas: 2,
      mesero: 'Aiden Ruiz',
      sede: 'cartago',
      estado: 'Listo',
      minutosTranscurridos: 18,
      items: [
        { id: 7, cantidad: 1, nombre: 'Ceviche de Tilapia Arreglado', notas: 'Galletas extra', listo: true },
        { id: 8, cantidad: 1, nombre: 'Combo Caciquito: Mini Chicharroncitos', notas: 'Para niño', listo: true }
      ]
    },
    {
      id: 'ORD-104',
      mesa: 'Mesa 01',
      personas: 6,
      mesero: 'Victor González',
      sede: 'heredia',
      estado: 'En Paila',
      minutosTranscurridos: 12,
      items: [
        { id: 9, cantidad: 3, nombre: 'Chicharrones de Carne en Tira', notas: 'Bien tostados', listo: false },
        { id: 10, cantidad: 6, nombre: 'Cerveza Imperial Helada', notas: 'Jarra congelada', listo: true }
      ]
    }
  ]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const calculateEstimatedTime = (personas) => {
    return Math.round(10 + (personas * 2.5));
  };

  const handleUpdateStatus = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: newStatus } : o));
    showToast(`Comanda ${id} actualizada a: ${newStatus.toUpperCase()}`, 'info');

    // Notificar a n8n
    const targetOrder = orders.find(o => o.id === id);
    if (targetOrder) {
      triggerN8nAutomation('PEDIDO_MENU', {
        nombre: `Mesa ${targetOrder.mesa} (${formatSedeName(targetOrder.sede)})`,
        personas: targetOrder.personas,
        estadoActual: newStatus
      });
    }
  };

  const handleToggleItemStatus = (orderId, itemId) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedItems = o.items.map(i => i.id === itemId ? { ...i, listo: !i.listo } : i);
        return { ...o, items: updatedItems };
      }
      return o;
    }));
  };

  const filteredOrders = orders.filter(o => o.sede === filterSede);
  const totalPersonasAtendidas = filteredOrders.reduce((acc, curr) => acc + curr.personas, 0);
  const promedioEstimadoGeneral = Math.round(
    filteredOrders.reduce((acc, curr) => acc + calculateEstimatedTime(curr.personas), 0) / (filteredOrders.length || 1)
  );

  return (
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] pt-24 pb-16 px-6 font-sans">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ENCABEZADO KDS */}
        <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D16014]/20 border border-[#D16014]/50 flex items-center justify-center text-[#D16014] shrink-0">
              <ChefHat className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[#D16014] uppercase tracking-widest bg-[#D16014]/20 px-2.5 py-0.5 rounded-full border border-[#D16014]/40">
                  Pantalla KDS
                </span>
                <span className="text-xs text-[#659B5E] font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Control de Paila &amp; Fuego
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#F8FFE5]">
                Panel Operativo de Cocina - Sede {formatSedeName(filterSede)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-[#0A090C] px-4 py-2.5 rounded-2xl border border-[#F8FFE5]/15 text-xs font-bold">
              <Filter className="w-4 h-4 text-[#659B5E]" />
              <select 
                value={filterSede}
                onChange={e => {
                  setFilterSede(e.target.value);
                  showToast(`Comandas filtradas para Sede ${formatSedeName(e.target.value)}`, 'info');
                }}
                className="bg-transparent text-[#F8FFE5] focus:outline-none cursor-pointer"
              >
                <option value="escazu">Sede Escazú</option>
                <option value="santa_ana">Sede Santa Ana</option>
                <option value="cartago">Sede Cartago</option>
                <option value="heredia">Sede Heredia</option>
              </select>
            </div>

            <button
              onClick={() => showToast('Comandas de cocina sincronizadas', 'success')}
              className="p-3 bg-[#0A090C] border border-[#F8FFE5]/15 hover:border-[#D16014] rounded-2xl text-gray-300 hover:text-white cursor-pointer"
              title="Sincronizar Comandas"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 rounded-2xl text-red-400 cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MÉTRICAS DE TIEMPOS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-2 shadow-xl">
            <div className="flex justify-between items-center text-gray-400 font-bold">
              <span>Promedio Dinámico por Orden</span>
              <Clock className="w-4 h-4 text-[#D16014]" />
            </div>
            <div className="text-3xl font-black text-[#D16014]">{promedioEstimadoGeneral} min</div>
            <p className="text-[10px] text-gray-400">Estimado según personas por mesa.</p>
          </div>

          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-2 shadow-xl">
            <div className="flex justify-between items-center text-gray-400 font-bold">
              <span>Comensales en Salón</span>
              <Users className="w-4 h-4 text-[#659B5E]" />
            </div>
            <div className="text-3xl font-black text-[#F8FFE5]">{totalPersonasAtendidas} Personas</div>
            <p className="text-[10px] text-[#659B5E]">Atendidos en paila y parrilla.</p>
          </div>

          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-2 shadow-xl">
            <div className="flex justify-between items-center text-gray-400 font-bold">
              <span>Órdenes Activas</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">
              {filteredOrders.filter(o => o.estado !== 'Listo').length} Comandas
            </div>
            <p className="text-[10px] text-gray-400">En proceso de preparación.</p>
          </div>
        </div>

        {/* TARJETAS DE COMANDAS ACTIVAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => {
              const estimacion = calculateEstimatedTime(order.personas);
              const isDelayed = order.minutosTranscurridos > estimacion;

              return (
                <div 
                  key={order.id}
                  className={`bg-[#001812] border rounded-3xl p-6 space-y-5 flex flex-col justify-between shadow-2xl ${
                    isDelayed ? 'border-red-500/60' : 'border-[#659B5E]/30'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-[#F8FFE5]/10 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#D16014] uppercase font-bold">{order.id}</span>
                        <h3 className="text-xl font-black text-[#F8FFE5]">{order.mesa}</h3>
                        <span className="text-[10px] text-gray-400">Mesero: {order.mesero}</span>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="px-2.5 py-1 bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl font-mono text-[10px] text-[#659B5E] font-bold block">
                          👥 {order.personas} Pers.
                        </span>
                        <span className={`text-[10px] font-bold ${isDelayed ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
                          ⏱️ Est: {estimacion} min
                        </span>
                      </div>
                    </div>

                    {/* ITEMS CON CHECKLIST */}
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => handleToggleItemStatus(order.id, item.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                            item.listo ? 'bg-[#659B5E]/10 border-[#659B5E]/40 opacity-70' : 'bg-[#0A090C] border-[#F8FFE5]/10'
                          }`}
                        >
                          <div className="mt-0.5 text-[#659B5E]">
                            {item.listo ? <CheckSquare className="w-4 h-4 text-[#659B5E]" /> : <Square className="w-4 h-4 text-gray-500" />}
                          </div>
                          <div className="flex-grow text-xs">
                            <span className={`font-bold block ${item.listo ? 'line-through text-gray-400' : 'text-[#F8FFE5]'}`}>
                              {item.cantidad}x {item.nombre}
                            </span>
                            {item.notas && (
                              <span className="text-[10px] text-amber-400 font-mono block mt-0.5">
                                ⚠️ {item.notas}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[#F8FFE5]/10">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'En Paila')}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-extrabold uppercase cursor-pointer transition-all ${
                          order.estado === 'En Paila' ? 'bg-[#D16014] text-white shadow-md' : 'bg-[#0A090C] text-gray-400 border border-[#F8FFE5]/10'
                        }`}
                      >
                        En Paila
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Listo')}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-extrabold uppercase cursor-pointer transition-all ${
                          order.estado === 'Listo' ? 'bg-[#659B5E] text-white shadow-md' : 'bg-[#0A090C] text-gray-400 border border-[#F8FFE5]/10'
                        }`}
                      >
                        Listo Servir
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="col-span-3 p-12 text-center bg-[#001812] border border-[#659B5E]/30 rounded-3xl text-gray-400 font-bold">
              No hay comandas pendientes registradas para Sede {formatSedeName(filterSede)}.
            </div>
          )}
        </div>

      </div>

      {/* MODAL CIERRE SESIÓN */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
          <div className="w-full max-w-sm bg-[#001812] border border-red-500/40 rounded-3xl p-6 space-y-5 text-center shadow-2xl text-xs text-[#F8FFE5]">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">¿Cerrar Sesión de Cocina?</h3>
              <p className="text-gray-400">Saldrás del panel operativo KDS.</p>
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