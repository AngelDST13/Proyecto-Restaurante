import { useState } from 'react';
import Toast from '../components/Toast';
import { 
  Utensils, Search, Flame, ShoppingBag, Plus, Minus, Trash2, 
  Send, Sparkles, AlertCircle, Award, Coffee, FileText 
} from 'lucide-react';

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // CATÁLOGO EXTENDIDO DE PLATILLOS DE CHICHARRONERA EL CACIQUE
  const fullMenu = [
    { id: 1, nombre: 'Chifrijo Especial de Paila', cat: 'paila', precio: 6800, desc: 'Chicharrón crujiente de concha y carne, frijoles tiernos cubaces, pico de gallo y aguacate Hass.', badge: 'Más Vendido' },
    { id: 2, nombre: 'Vigorón Criollo Cacique (1kg)', cat: 'paila', precio: 14500, desc: 'Surtido de chicharrón con yuca al vapor, ensalada de repollo y chimichurri criollo.', badge: 'Familiar' },
    { id: 3, nombre: 'Costilla Cerdo a la Leña', cat: 'cortes', precio: 9200, desc: 'Costilla jugosa ahumada con leña de café, acompañada de plátanos maduros con queso.', badge: 'Recomendado' },
    { id: 4, nombre: 'Ceviche de Tilapia Arreglado', cat: 'bocas', precio: 5500, desc: 'Marinado en jugo de limón natural, chile dulce, cilantro, aguacate y galletas soda.', badge: 'Fresco' },
    { id: 5, nombre: 'Surtido Cacique Familiar (4 Personas)', cat: 'platos', precio: 24500, desc: 'Combinación de chicharrones, costilla a la leña, yuca, patacones, frijoles molidos y tortillas.', badge: 'Combo' },
    { id: 6, nombre: 'Patacones con Carne Desmechada', cat: 'bocas', precio: 4800, desc: 'Patacones dobles crujientes cubiertos de frijoles refritos, carne desmechada y queso frito.' },
    { id: 7, nombre: 'Sopa de Mondongo Criolla', cat: 'platos', precio: 6500, desc: 'Sopa tradicional cocinada con verduras de la zona y acompañada de arroz blanco.' },
    { id: 8, nombre: 'Cerveza Imperial Helada (350ml)', cat: 'bebidas', precio: 2200, desc: 'Cerveza nacional fría servida en vaso cervecero congelado.' },
    { id: 9, nombre: 'Refresco Natural de Cas (500ml)', cat: 'bebidas', precio: 1800, desc: 'Cas criollo recien licuado con hielo frappé.' },
    { id: 10, nombre: 'Empanada Arreglada de Chicharrón', cat: 'bocas', precio: 2800, desc: 'Empanada artesanal de maíz rellena de chicharrón y repollo condimentado.' },
    { id: 11, nombre: 'Flan de Coco Casero', cat: 'postres', precio: 2500, desc: 'Postre tradicional bañado en caramelo de caña dulce.' },
    { id: 12, nombre: 'Café Chorreado en Guacal', cat: 'bebidas', precio: 1500, desc: 'Café gourmet de altura chorreado al momento.' }
  ];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleAddToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
    showToast(`${item.nombre} agregado al pedido`, 'info');
  };

  const handleQuantityChange = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cantidad + delta;
        return newQty > 0 ? { ...item, cantidad: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleRemoveFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = cart.reduce((acc, curr) => acc + (curr.precio * curr.cantidad), 0);
  const iva = Math.round(subtotal * 0.13);
  const servicio = Math.round(subtotal * 0.10);
  const totalGeneral = subtotal + iva + servicio;

  const handleSendOrder = () => {
    if (cart.length === 0) return;
    showToast('¡Su comanda ha sido enviada exitosamente a la cocina!', 'success');
    setCart([]);
    setIsCartOpen(false);
  };

  const filteredItems = fullMenu.filter(item => {
    const matchesCat = activeCategory === 'todos' || item.cat === activeCategory;
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] pt-24 pb-16 px-6 font-sans">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ENCABEZADO DEL MENÚ DIGITAL */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D16014]/20 border border-[#D16014]/50 text-[#D16014] text-xs font-black tracking-widest uppercase">
            <Flame className="w-4 h-4" /> Especialidades de Paila &amp; Leña
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-[#F8FFE5] tracking-tight">
            MENÚ DIGITAL &amp; COMANDA
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            Selecciona tus platillos criollos favoritos y realiza tu orden en tiempo real para mesa o para llevar.
          </p>
        </div>

        {/* BARRA DE BÚSQUEDA Y CATEGORÍAS */}
        <div className="space-y-4 bg-[#001812] p-6 rounded-3xl border border-[#659B5E]/30 shadow-xl">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por platillo, ingrediente o especialidad..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs font-bold uppercase tracking-wider pt-2">
            {[
              { id: 'todos', label: 'Todos los Platillos' },
              { id: 'paila', label: 'Chicharrones & Paila' },
              { id: 'cortes', label: 'Cortes a la Leña' },
              { id: 'platos', label: 'Platos Fuertes' },
              { id: 'bocas', label: 'Bocas & Ceviches' },
              { id: 'bebidas', label: 'Bebidas & Licores' },
              { id: 'postres', label: 'Postres Criollos' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeCategory === cat.id ? 'bg-[#D16014] text-white shadow-lg shadow-[#D16014]/30' : 'bg-[#0A090C] text-gray-400 hover:text-white border border-[#F8FFE5]/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* REJILLA DE PLATILLOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="bg-[#001812]/80 border border-[#659B5E]/30 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-[#D16014] transition-all group shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-lg text-[#F8FFE5] group-hover:text-[#D16014] transition-colors">{item.nombre}</h3>
                  {item.badge && (
                    <span className="px-2.5 py-1 bg-[#D16014]/20 border border-[#D16014]/50 text-[#D16014] text-[10px] font-black uppercase rounded-lg">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#F8FFE5]/10">
                <span className="text-xl font-black text-[#D16014]">₡{item.precio.toLocaleString()}</span>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="px-4 py-2 rounded-xl bg-[#659B5E] hover:bg-[#52824c] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* BOTÓN FLOTANTE DEL CARRITO */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="px-6 py-3.5 rounded-2xl bg-[#D16014] text-white font-extrabold text-xs flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Ver Comanda ({cart.reduce((a, b) => a + b.cantidad, 0)})</span>
              <span className="bg-white/20 px-2 py-1 rounded-lg">₡{totalGeneral.toLocaleString()}</span>
            </button>
          </div>
        )}

        {/* DESPLEGABLE DEL CARRITO DE COMANDA */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-md bg-[#001812] h-full p-6 space-y-6 flex flex-col justify-between border-l border-[#659B5E]/30 text-xs">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#F8FFE5]/10 pb-4">
                  <h3 className="font-extrabold text-base text-[#F8FFE5] flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#D16014]" /> Resumen de tu Comanda
                  </h3>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white font-bold">Cerrar</button>
                </div>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="p-3 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#F8FFE5] block">{item.nombre}</span>
                        <span className="text-[10px] text-[#D16014]">₡{item.precio.toLocaleString()} c/u</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-[#001812] px-2 py-1 rounded-lg border border-[#F8FFE5]/10">
                          <button onClick={() => handleQuantityChange(item.id, -1)} className="text-gray-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                          <span className="font-bold text-[#F8FFE5] px-1">{item.cantidad}</span>
                          <button onClick={() => handleQuantityChange(item.id, 1)} className="text-gray-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESGLOSE FINANCIERO CON IVA Y SERVICIO */}
              <div className="space-y-4 pt-4 border-t border-[#F8FFE5]/10">
                <div className="space-y-1.5 font-semibold text-gray-400">
                  <div className="flex justify-between"><span>Subtotal:</span><span>₡{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>IVA (13%):</span><span>₡{iva.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Servicio (10%):</span><span>₡{servicio.toLocaleString()}</span></div>
                  <div className="flex justify-between text-base font-black text-[#F8FFE5] pt-2 border-t border-[#F8FFE5]/10">
                    <span>Total General:</span>
                    <span className="text-[#D16014]">₡{totalGeneral.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleSendOrder}
                  className="w-full py-3.5 rounded-xl bg-[#D16014] hover:bg-[#b8510f] font-extrabold text-white text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" /> Enviar Comanda
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}