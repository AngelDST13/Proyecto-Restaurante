import { useState } from 'react';
import Toast from '../components/Toast';
import { 
  Flame, Clock, RefreshCw, 
  Users, ChefHat, Filter 
} from 'lucide-react';

export default function KitchenDashboard() {
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [filterSede, setFilterSede] = useState('escazu');

  // ÓRDENES ACTIVAS EN PANTALLA DE COCINA
  const [orders, setOrders] = useState([
    {
      id: 'ORD-101',
      mesa: 'Mesa 02',
      personas: 4,
      mesero: 'Carlos Ramírez',
      estado: 'En Paila',
      minutosTranscurridos: 14,
      items: [
        { cantidad: 2, nombre: 'Chifrijo Especial de Paila', notas: 'Sin cebolla picada' },
        { cantidad: 1, nombre: 'Costilla Cerdo a la Leña', notas: 'Término bien asado' },
        { cantidad: 4, nombre: 'Refresco Natural de Cas', notas: 'Con hielo' }
      ]
    },
    {
      id: 'ORD-102',
      mesa: 'Mesa 04',
      personas: 8,
      mesero: 'Carlos Ramírez',
      estado: 'En Espera',
      minutosTranscurridos: 6,
      items: [
        { cantidad: 2, nombre: 'Vigorón Criollo Cacique (1kg)', notas: 'Extra yuca al vapor' },
        { cantidad: 2, nombre: 'Patacones con Carne Desmechada', notas: 'Salsa picante aparte' },
        { cantidad: 8, nombre: 'Agua de Sapo con Jengibre', notas: '' }
      ]
    },
    {
      id: 'ORD-103',
      mesa: 'Mesa 07',
      personas: 2,
      mesero: 'Bryan Gómez',
      estado: 'Listo',
      minutosTranscurridos: 18,
      items: [
        { cantidad: 1, nombre: 'Ceviche de Tilapia Arreglado', notas: 'Galletas extra' },
        { cantidad: 1, nombre: 'Combo Caciquito: Mini Chicharroncitos', notas: 'Para niño' }
      ]
    }
  ]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // CÁLCULO DE TIEMPO ESTIMADO BASADO EN COMENSALES
  const calculateEstimatedTime = (personas) => {
    return Math.round(10 + (personas * 2.5));
  };

  const handleUpdateStatus = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: newStatus } : o));
    showToast(`Orden ${id} actualizada a status: ${newStatus.toUpperCase()}`, 'info');
  };

  const totalPersonasAtendidas = orders.reduce((acc, curr) => acc + curr.personas, 0);
  const promedioEstimadoGeneral = Math.round(
    orders.reduce((acc, curr) => acc + calculateEstimatedTime(curr.personas), 0) / (orders.length || 1)
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
            <div className="w-14 h-14 rounded-2xl bg-[#D16014]/20 border border-[#D16014]/50 flex items-center justify-center text-[#D16014]">
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
              <h1 className="text-2xl sm:text-3xl font-black text-[#F8FFE5]">Panel Operativo de Cocina</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-[#0A090C] px-4 py-2.5 rounded-2xl border border-[#F8FFE5]/15 text-xs font-bold">
              <Filter className="w-4 h-4 text-[#659B5E]" />
              <select 
                value={filterSede}
                onChange={e => setFilterSede(e.target.value)}
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
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MÉTRICAS DE TIEMPOS POR COMENSAL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-2 shadow-xl">
            <div className="flex justify-between items-center text-gray-400 font-bold">
              <span>Promedio Dinámico por Orden</span>
              <Clock className="w-4 h-4 text-[#D16014]" />
            </div>
            <div className="text-3xl font-black text-[#D16014]">{promedioEstimadoGeneral} min</div>
            <p className="text-[10px] text-gray-400">Estimado según volumen de personas por mesa.</p>
          </div>

          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-2 shadow-xl">
            <div className="flex justify-between items-center text-gray-400 font-bold">
              <span>Comensales Atendidos Hoy</span>
              <Users className="w-4 h-4 text-[#659B5E]" />
            </div>
            <div className="text-3xl font-black text-[#F8FFE5]">{totalPersonasAtendidas} Personas</div>
            <p className="text-[10px] text-[#659B5E]">Procesados en salón y paila.</p>
          </div>

          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-2 shadow-xl">
            <div className="flex justify-between items-center text-gray-400 font-bold">
              <span>Órdenes en Paila</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">
              {orders.filter(o => o.estado === 'En Paila').length} Activas
            </div>
            <p className="text-[10px] text-gray-400">En preparación activa a la leña.</p>
          </div>
        </div>

        {/* TARJETAS DE ÓRDENES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orders.map(order => {
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

                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 text-xs">
                        <div className="flex justify-between font-bold text-[#F8FFE5]">
                          <span>{item.cantidad}x {item.nombre}</span>
                        </div>
                        {item.notas && (
                          <span className="text-[10px] text-amber-400 block mt-0.5 font-mono">
                            ⚠️ {item.notas}
                          </span>
                        )}
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
          })}
        </div>

      </div>
    </div>
  );
}