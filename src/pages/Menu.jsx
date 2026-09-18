import { useState } from 'react';
import Toast from '../components/Toast';
import ReservationModal from '../components/ReservationModal';
import { Plus, ShoppingBag, Calendar } from 'lucide-react';

export default function Menu() {
  const [selectedCat, setSelectedCat] = useState('todos');
  const [cart, setCart] = useState([]);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const platillos = [
    { id: 1, nombre: 'Chifrijo Especial de Paila', cat: 'bocas', precio: 6800, img: 'https://images.unsplash.com/photo-1544025162-d76694265947', desc: 'Chicharrones crujientes, frijoles tiernos, arroz, pico de gallo y aguacate.' },
    { id: 2, nombre: 'Vigorón Criollo (1kg)', cat: 'platos', precio: 14500, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', desc: 'Surtido de chicharrón con yuca cocida al vapor y ensalada de repollo arreglada.' },
    { id: 3, nombre: 'Costilla a la Leña', cat: 'cortes', precio: 9200, img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b', desc: 'Costilla de cerdo bañado en salsa barbacoa de la casa con tortillas palmeadas.' }
  ];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const addToCart = (item) => {
    setCart(prev => [...prev, item]);
    showToast(`${item.nombre} agregado a la comanda`, 'success');
  };

  const filteredPlatillos = selectedCat === 'todos' 
    ? platillos 
    : platillos.filter(p => p.cat === selectedCat);

  return (
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] pt-24 pb-16 px-4 font-sans">
      
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <ReservationModal 
        isOpen={isReservationOpen} 
        onClose={() => setIsReservationOpen(false)} 
        onShowToast={showToast} 
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#00241B]/80 p-6 rounded-2xl border border-[#F8FFE5]/15 backdrop-blur-md">
          <div>
            <span className="text-xs font-bold text-[#D16014] uppercase tracking-widest">Chicharronera El Cacique</span>
            <h1 className="text-3xl font-extrabold text-[#F8FFE5]">Menú Digital &amp; Terminal de Comandas</h1>
            <p className="text-xs text-[#F8FFE5]/70 mt-1">Explora nuestras especialidades criollas o agenda tu mesa en vivo</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsReservationOpen(true)}
              className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-[#D16014] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D16014]/30 hover:bg-[#b8510f]"
            >
              <Calendar className="w-4 h-4" /> Reservar Mesa
            </button>
            <div className="px-4 py-3 rounded-xl bg-[#001812] border border-[#659B5E]/40 text-xs font-bold flex items-center gap-2 text-[#659B5E]">
              <ShoppingBag className="w-4 h-4 text-[#D16014]" />
              <span>Comanda: {cart.length} items</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 text-xs font-bold">
          {['todos', 'bocas', 'platos', 'cortes'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-5 py-2.5 rounded-xl uppercase tracking-wider transition-all ${
                selectedCat === cat 
                  ? 'bg-[#D16014] text-white shadow-md' 
                  : 'bg-[#00241B] text-[#F8FFE5]/60 hover:text-[#F8FFE5]'
              }`}
            >
              {cat === 'todos' ? 'Todos los Platillos' : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPlatillos.map((p) => (
            <div key={p.id} className="bg-[#00241B]/40 border border-[#F8FFE5]/10 rounded-2xl overflow-hidden hover:border-[#D16014]/50 transition-all flex flex-col justify-between">
              <div className="relative h-48">
                <img src={p.img} alt={p.nombre} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 px-3 py-1 bg-[#0A090C]/80 backdrop-blur-md rounded-full text-xs font-extrabold text-[#D16014]">
                  ₡{p.precio.toLocaleString()}
                </span>
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#F8FFE5]">{p.nombre}</h3>
                  <p className="text-xs text-[#F8FFE5]/70 mt-1">{p.desc}</p>
                </div>
                <button
                  onClick={() => addToCart(p)}
                  className="w-full py-2.5 rounded-xl bg-[#D16014] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#b8510f] transition-all"
                >
                  <Plus className="w-4 h-4" /> Agregar a Comanda
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}