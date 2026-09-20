import { useState } from 'react';
import Toast from '../components/Toast';
import { 
  ShieldCheck, DollarSign, ShoppingBag, Users, Clock, 
  TrendingUp, RefreshCw, AlertTriangle, Plus, Trash2, CheckCircle2 
} from 'lucide-react';
import logoNegro from '../assets/img/LogoN.svg';

export default function AdminDashboard() {
  const [selectedSede, setSelectedSede] = useState('escazu');
  const [activeTab, setActiveTab] = useState('metricas');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // ESTADO DE INVENTARIO INTERACTIVO (CRUD)
  const [inventory, setInventory] = useState([
    { id: 1, nombre: 'Carne de Cerdo para Chicharrón', stock: 120, unidad: 'kg', estado: 'Óptimo', sede: 'escazu' },
    { id: 2, nombre: 'Yuca Fresca para Vigorón', stock: 18, unidad: 'kg', estado: 'Crítico', sede: 'escazu' },
    { id: 3, nombre: 'Frijoles Cubaces Tiernos', stock: 85, unidad: 'kg', estado: 'Óptimo', sede: 'escazu' },
    { id: 4, nombre: 'Plátano Verde para Patacones', stock: 200, unidad: 'unid', estado: 'Óptimo', sede: 'santa_ana' },
    { id: 5, nombre: 'Costilla de Cerdo Ahumada', stock: 12, unidad: 'kg', estado: 'Crítico', sede: 'heredia' }
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemStock, setNewItemStock] = useState('');

  // DATOS MÉTRICOS DINÁMICOS POR SEDE
  const sedeMetrics = {
    escazu: { ventas: 785400, comandas: 1890, personal: 12, coccion: '15 min' },
    santa_ana: { ventas: 540200, comandas: 1320, personal: 8, coccion: '17 min' },
    cartago: { ventas: 610900, comandas: 1450, personal: 10, coccion: '16 min' },
    heredia: { ventas: 485250, comandas: 1284, personal: 9, coccion: '18 min' }
  };

  const currentData = sedeMetrics[selectedSede];
  const currentBranchItems = inventory.filter(item => item.sede === selectedSede);
  const criticalCount = currentBranchItems.filter(i => i.stock < 25).length;

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // OPERACIONES CRUD DE INVENTARIO
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemStock) return;

    const stockNum = parseInt(newItemStock, 10);
    const newItem = {
      id: Date.now(),
      nombre: newItemName,
      stock: stockNum,
      unidad: 'kg',
      estado: stockNum < 25 ? 'Crítico' : 'Óptimo',
      sede: selectedSede
    };

    setInventory(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemStock('');
    showToast(`Insumo "${newItemName}" agregado al inventario de ${selectedSede.toUpperCase()}`, 'success');
  };

  const handleDeleteItem = (id) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    showToast('Insumo eliminado del registro local', 'info');
  };

  return (
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] pt-24 pb-16 px-6 font-sans">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TARJETA DE PERFIL EJECUTIVO - ANGEL DANIELA SALAZAR T. */}
        <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#0A090C] border border-[#D16014]/50 flex items-center justify-center p-2.5 shadow-xl shrink-0">
              <img src={logoNegro} alt="Logo El Cacique" className="w-full h-full object-contain" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#D16014] uppercase tracking-widest bg-[#D16014]/20 px-3 py-1 rounded-full border border-[#D16014]/40">
                  Panel Ejecutivo
                </span>
                <span className="text-xs text-[#659B5E] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Administradora General
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-[#F8FFE5] mt-1">
                ¡Bienvenida de vuelta, Angel!
              </h1>
              <p className="text-xs text-gray-400">
                Angel Daniela Salazar T. • Control Operacional &amp; Dirección Nacional de Sedes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedSede}
              onChange={e => {
                setSelectedSede(e.target.value);
                showToast(`Vista cambiada a Sede ${e.target.value.toUpperCase()}`, 'info');
              }}
              className="bg-[#0A090C] border border-[#659B5E]/40 rounded-2xl px-4 py-3 text-xs font-bold text-[#F8FFE5] focus:outline-none focus:border-[#D16014] cursor-pointer"
            >
              <option value="escazu">Sede Escazú • Centro Culinario</option>
              <option value="santa_ana">Sede Santa Ana • Plaza Real</option>
              <option value="cartago">Sede Cartago • Paso Ancho</option>
              <option value="heredia">Sede Heredia • Vía Central</option>
            </select>

            <button
              onClick={() => showToast('Métricas e inventario sincronizados en tiempo real', 'success')}
              className="p-3 bg-[#0A090C] border border-[#F8FFE5]/15 hover:border-[#D16014] rounded-2xl text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Sincronizar Datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <div className="flex flex-wrap gap-3 border-b border-[#F8FFE5]/10 pb-4 text-xs font-extrabold uppercase tracking-wider">
          {[
            { id: 'metricas', label: 'Métricas & Ventas' },
            { id: 'arqueo', label: 'Arqueo de Caja & Pagos' },
            { id: 'inventario', label: 'Insumos por Sede (CRUD)' },
            { id: 'planilla', label: 'Personal & Planilla' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-[#D16014] text-white shadow-lg shadow-[#D16014]/30' 
                  : 'bg-[#001812] text-gray-400 hover:text-white border border-[#F8FFE5]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PESTAÑA 1: MÉTRICAS Y ALERTAS */}
        {activeTab === 'metricas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Ventas Acumuladas</span>
                  <DollarSign className="w-4 h-4 text-[#659B5E]" />
                </div>
                <div className="text-3xl font-black text-[#D16014]">₡{currentData.ventas.toLocaleString()}</div>
                <span className="text-[10px] text-[#659B5E] font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12.5% rendimiento mensual
                </span>
              </div>

              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Comandas Atendidas</span>
                  <ShoppingBag className="w-4 h-4 text-[#D16014]" />
                </div>
                <div className="text-3xl font-black text-[#F8FFE5]">{currentData.comandas.toLocaleString()}</div>
                <span className="text-[10px] text-gray-400">Despachadas en Paila y Salón</span>
              </div>

              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Personal Activo</span>
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-[#F8FFE5]">{currentData.personal} Empleados</div>
                <span className="text-[10px] text-[#659B5E]">Cocina, Salón y Caja</span>
              </div>

              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Promedio Cocción</span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-black text-[#F8FFE5]">{currentData.coccion}</div>
                <span className="text-[10px] text-gray-400">Eficiencia POS Salón</span>
              </div>
            </div>

            <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-4">
              <h3 className="font-extrabold text-base text-[#F8FFE5] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Estado del Inventario de Sede
              </h3>
              {criticalCount > 0 ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300">
                  ⚠️ Atención: Hay {criticalCount} insumo(s) con nivel de stock por debajo del límite seguro en {selectedSede.toUpperCase()}.
                </div>
              ) : (
                <div className="p-4 bg-[#659B5E]/10 border border-[#659B5E]/30 rounded-2xl text-xs text-[#659B5E]">
                  ✓ Todos los insumos de esta sede se encuentran en niveles óptimos de abastecimiento.
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: ARQUEO DE CAJA */}
        {activeTab === 'arqueo' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 text-xs">
            <h3 className="font-extrabold text-base text-[#F8FFE5] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#D16014]" /> Control Financiero y Arqueo Diario
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div className="p-4 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 space-y-1">
                <span className="text-gray-400 block text-[10px]">EFECTIVO EN CAJA:</span>
                <span className="text-xl font-bold text-[#659B5E]">₡210,500</span>
              </div>
              <div className="p-4 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 space-y-1">
                <span className="text-gray-400 block text-[10px]">TARJETAS &amp; POS:</span>
                <span className="text-xl font-bold text-[#D16014]">₡274,750</span>
              </div>
              <div className="p-4 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 space-y-1">
                <span className="text-gray-400 block text-[10px]">TOTAL CERRADO:</span>
                <span className="text-xl font-bold text-[#F8FFE5]">₡485,250</span>
              </div>
            </div>

            <button
              onClick={() => showToast('Cierre de caja registrado exitosamente', 'success')}
              className="px-6 py-3 rounded-xl bg-[#D16014] hover:bg-[#b8510f] text-white font-extrabold flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Registrar Cierre Diario de Caja
            </button>
          </div>
        )}

        {/* PESTAÑA 3: INSUMOS Y CRUD INTERACTIVO */}
        {activeTab === 'inventario' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-extrabold text-base text-[#F8FFE5]">Gestión de Insumos - Sede {selectedSede.toUpperCase()}</h3>
                <p className="text-gray-400 text-[11px]">Agrega, modifica o elimina insumos requeridos para cocina y salón.</p>
              </div>
            </div>

            {/* FORMULARIO PARA AGREGAR INSUMO */}
            <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0A090C] p-4 rounded-2xl border border-[#F8FFE5]/10">
              <input 
                type="text" 
                placeholder="Nombre del nuevo insumo..."
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                required
                className="bg-[#001812] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
              />
              <input 
                type="number" 
                placeholder="Cantidad inicial en kg/unid..."
                value={newItemStock}
                onChange={e => setNewItemStock(e.target.value)}
                required
                className="bg-[#001812] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
              />
              <button 
                type="submit" 
                className="py-2.5 px-4 bg-[#659B5E] hover:bg-[#52824c] font-extrabold text-white rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agregar Insumo
              </button>
            </form>

            {/* TABLA DE INSUMOS */}
            <div className="space-y-2">
              {currentBranchItems.length > 0 ? (
                currentBranchItems.map(item => (
                  <div key={item.id} className="p-3 bg-[#0A090C] rounded-xl border border-[#F8FFE5]/10 flex justify-between items-center">
                    <span className="font-bold text-[#F8FFE5]">{item.nombre}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 font-mono font-bold">{item.stock} {item.unidad}</span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${item.stock < 25 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-[#659B5E]/20 text-[#659B5E] border border-[#659B5E]/40'}`}>
                        {item.stock < 25 ? 'Stock Crítico' : 'Stock Óptimo'}
                      </span>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        title="Eliminar Insumo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No hay insumos registrados para esta sede.</p>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 4: PLANILLA */}
        {activeTab === 'planilla' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-[#F8FFE5]">Nómina de Personal Activo - Sede {selectedSede.toUpperCase()}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#F8FFE5] block">Angel Daniela Salazar T.</span>
                  <span className="text-[10px] text-[#D16014]">Administradora General</span>
                </div>
                <span className="px-2 py-1 bg-[#659B5E]/20 text-[#659B5E] text-[10px] font-bold rounded-lg">Turno Completo</span>
              </div>

              <div className="p-4 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#F8FFE5] block">Carlos Ramírez</span>
                  <span className="text-[10px] text-[#659B5E]">Mesero de Salón &amp; Terraza</span>
                </div>
                <span className="px-2 py-1 bg-[#659B5E]/20 text-[#659B5E] text-[10px] font-bold rounded-lg">Turno Activo</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}