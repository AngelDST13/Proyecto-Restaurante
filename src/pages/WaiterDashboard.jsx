import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Utensils, LogOut, Clock, DollarSign, Layers, Plus, ShoppingBag, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function WaiterDashboard() {
  const { user, logout } = useAuth();
  const [selectedFloor, setSelectedFloor] = useState('piso1');
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const sedesNombre = {
    escazu: 'Sede Escazú • Salón Principal',
    santa_ana: 'Sede Santa Ana • Plaza Real',
    cartago: 'Sede Cartago • Paso Ancho',
    heredia: 'Sede Heredia • Vía Central'
  };

  const [tables, setTables] = useState({
    piso1: [
      { id: 1, numero: 'Mesa 01', capacidad: 4, estado: 'Libre' },
      { id: 2, numero: 'Mesa 02', capacidad: 2, estado: 'Ocupada', total: 18500 },
      { id: 3, numero: 'Mesa 03', capacidad: 6, estado: 'Libre' },
      { id: 4, numero: 'Mesa 04', capacidad: 4, estado: 'Cuenta', total: 24000 },
      { id: 5, numero: 'Mesa 05', capacidad: 8, estado: 'Reservada' },
      { id: 6, numero: 'Mesa 06', capacidad: 2, estado: 'Libre' }
    ],
    piso2: [
      { id: 7, numero: 'Mesa T1', capacidad: 4, estado: 'Libre' },
      { id: 8, numero: 'Mesa T2', capacidad: 4, estado: 'Ocupada', total: 32000 },
      { id: 9, numero: 'Mesa T3', capacidad: 6, estado: 'Libre' },
      { id: 10, numero: 'Mesa T4', capacidad: 2, estado: 'Libre' }
    ]
  });

  const platillosMenu = [
    { id: 101, nombre: 'Chifrijo Especial de Paila', precio: 6800 },
    { id: 102, nombre: 'Vigorón Criollo (1kg)', precio: 14500 },
    { id: 103, nombre: 'Costilla a la Leña', precio: 9200 },
    { id: 104, nombre: 'Imperial Helada (350ml)', precio: 2200 }
  ];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setOrderItems([]);
  };

  const handleAddItemToOrder = (item) => {
    setOrderItems(prev => [...prev, item]);
    showToast(`${item.nombre} sumado a la comanda`, 'info');
  };

  const handleSendToKitchen = () => {
    if (!selectedTable || orderItems.length === 0) return;
    
    setTables(prev => ({
      ...prev,
      [selectedFloor]: prev[selectedFloor].map(t => 
        t.id === selectedTable.id ? { ...t, estado: 'Ocupada' } : t
      )
    }));

    showToast(`Comanda despachada a cocina para ${selectedTable.numero}`, 'success');
    setOrderItems([]);
    setSelectedTable(null);
  };

  return (
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] pt-20 pb-12 px-6 font-sans">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#00241B] p-5 rounded-2xl border border-[#659B5E]/30 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D16014] flex items-center justify-center text-white font-extrabold text-lg">
              M
            </div>
            <div>
              <span className="text-[10px] text-[#659B5E] font-bold uppercase tracking-wider block">Terminal Mesero Autorizado</span>
              <h1 className="text-xl font-extrabold text-[#F8FFE5]">{user?.email?.split('@')[0]}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="px-4 py-2 bg-[#001812] border border-[#F8FFE5]/15 rounded-xl text-xs font-bold text-[#659B5E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D16014]" />
              <span>Sede Fija: {sedesNombre[user?.sede || 'escazu']}</span>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-400 rounded-xl bg-[#0A090C]">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-[#00241B]/40 p-6 rounded-2xl border border-[#F8FFE5]/10">
            <div className="flex justify-between items-center border-b border-[#F8FFE5]/10 pb-4">
              <h3 className="font-bold text-base text-[#F8FFE5] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D16014]" /> Control por Pisos
              </h3>
              
              <div className="flex bg-[#0A090C] p-1 rounded-xl text-xs font-bold border border-[#F8FFE5]/10">
                <button
                  onClick={() => setSelectedFloor('piso1')}
                  className={`px-4 py-1.5 rounded-lg transition-all ${selectedFloor === 'piso1' ? 'bg-[#D16014] text-white' : 'text-[#F8FFE5]/60'}`}
                >
                  Piso 1 (Salón)
                </button>
                <button
                  onClick={() => setSelectedFloor('piso2')}
                  className={`px-4 py-1.5 rounded-lg transition-all ${selectedFloor === 'piso2' ? 'bg-[#D16014] text-white' : 'text-[#F8FFE5]/60'}`}
                >
                  Piso 2 (Terraza)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              {tables[selectedFloor].map((table) => {
                const isSelected = selectedTable?.id === table.id;
                return (
                  <button
                    key={table.id}
                    onClick={() => handleSelectTable(table)}
                    className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-36 ${
                      isSelected 
                        ? 'border-[#D16014] bg-[#D16014]/20 ring-2 ring-[#D16014]' 
                        : table.estado === 'Ocupada'
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : table.estado === 'Cuenta'
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : table.estado === 'Reservada'
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-[#F8FFE5]/10 bg-[#001812]/80 hover:border-[#659B5E]'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-lg text-[#F8FFE5] block">{table.numero}</span>
                      <span className="text-[10px] text-[#F8FFE5]/60 font-semibold">{table.capacidad} Personas</span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${
                        table.estado === 'Libre' ? 'bg-emerald-500/20 text-emerald-400' :
                        table.estado === 'Ocupada' ? 'bg-amber-500/20 text-amber-400' :
                        table.estado === 'Cuenta' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {table.estado === 'Libre' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {table.estado === 'Ocupada' && <Clock className="w-3 h-3 text-amber-400" />}
                        {table.estado === 'Cuenta' && <DollarSign className="w-3 h-3 text-blue-400" />}
                        {table.estado}
                      </span>
                      {table.total && <span className="text-[#D16014]">₡{table.total.toLocaleString()}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#00241B]/60 p-6 rounded-2xl border border-[#F8FFE5]/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-base text-[#F8FFE5] border-b border-[#F8FFE5]/10 pb-3 flex items-center justify-between">
                <span>Comanda en Vivo</span>
                <span className="text-xs font-normal text-[#659B5E]">{selectedTable ? selectedTable.numero : 'Selecciona una mesa'}</span>
              </h3>

              {selectedTable ? (
                <>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#F8FFE5]/60 block">Agregar Platillo:</span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
                      {platillosMenu.map(p => (
                        <div key={p.id} className="p-2 bg-[#001812] rounded-xl flex justify-between items-center border border-[#F8FFE5]/10">
                          <div>
                            <span className="font-bold text-[#F8FFE5] block">{p.nombre}</span>
                            <span className="text-[10px] text-[#D16014]">₡{p.precio.toLocaleString()}</span>
                          </div>
                          <button onClick={() => handleAddItemToOrder(p)} className="p-1 bg-[#D16014] text-white rounded-lg hover:bg-[#b8510f]">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#F8FFE5]/10">
                    <span className="text-xs font-bold text-[#F8FFE5]/60 block">Ítems Seleccionados ({orderItems.length}):</span>
                    <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                      {orderItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[#F8FFE5]/80 py-1 border-b border-[#F8FFE5]/5">
                          <span>{item.nombre}</span>
                          <span className="font-bold text-[#D16014]">₡{item.precio.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-xs text-[#F8FFE5]/40 space-y-2">
                  <ShoppingBag className="w-8 h-8 mx-auto text-[#F8FFE5]/20" />
                  <p>Haz clic en cualquier mesa del plano para tomar comanda.</p>
                </div>
              )}
            </div>

            {selectedTable && (
              <button
                onClick={handleSendToKitchen}
                disabled={orderItems.length === 0}
                className="w-full py-3 rounded-xl bg-[#D16014] disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#b8510f] transition-all"
              >
                <Utensils className="w-4 h-4" /> Despachar a Cocina
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}