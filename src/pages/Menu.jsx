import { useState } from 'react';
import Toast from '../components/Toast';
import { Search, Flame, ShoppingBag, Plus, Minus, Trash2, MessageCircle, AlertCircle, Truck, Baby } from 'lucide-react';

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // CATÁLOGO CULINARIO EXTENDIDO
  const fullMenu = [
    // PAILA Y CHICHARRONES
    { id: 1, nombre: 'Chifrijo Especial de Paila', cat: 'paila', precio: 6800, desc: 'Chicharrón crujiente de concha y carne, frijoles tiernos cubaces, pico de gallo y aguacate Hass.', badge: 'Más Vendido' },
    { id: 2, nombre: 'Vigorón Criollo Cacique (1kg)', cat: 'paila', precio: 14500, desc: 'Surtido de chicharrón con yuca al vapor, ensalada de repollo y chimichurri criollo.', badge: 'Familiar' },
    { id: 3, nombre: 'Chicharrones de Carne en Tira (500g)', cat: 'paila', precio: 8200, desc: 'Tiras jugosas fritas a la paila con leña de café, acompañadas de limones criollos.' },
    { id: 4, nombre: 'Yuca Frita con Chicharrón de Concha', cat: 'paila', precio: 5900, desc: 'Bastones crocantes de yuca con concha dorada al punto perfecto.' },

    // CORTES A LA LEÑA
    { id: 5, nombre: 'Costilla Cerdo a la Leña', cat: 'cortes', precio: 9200, desc: 'Costilla jugosa ahumada con leña de café, acompañada de plátanos maduros con queso.', badge: 'Recomendado' },
    { id: 6, nombre: 'Lomito de Cerdo Encebollado', cat: 'cortes', precio: 8900, desc: 'Corte magro a la parrilla con cebollitas caramelizadas y puré de yuca.' },
    { id: 7, nombre: 'Parrillada El Cacique (2 personas)', cat: 'cortes', precio: 17800, desc: 'Costilla, chicharrón, chorizo criollo, carne de res y elote frito.' },

    // MENÚ INFANTIL
    { id: 8, nombre: 'Combo Caciquito: Mini Chicharroncitos', cat: 'ninos', precio: 3800, desc: 'Porción infantil de chicharritos suaves sin concha, papitas fritas y juguito de caja.', badge: 'Infantil' },
    { id: 9, nombre: 'Deditos de Pollo Crispy', cat: 'ninos', precio: 3500, desc: 'Pechuguita empanizada con bastones de yuca y salsa rosa.' },

    // BOCAS Y CEVICHES
    { id: 10, nombre: 'Ceviche de Tilapia Arreglado', cat: 'bocas', precio: 5500, desc: 'Marinado en jugo de limón natural, chile dulce, cilantro, aguacate y galletas soda.', badge: 'Fresco' },
    { id: 11, nombre: 'Patacones Especiales con Carne', cat: 'bocas', precio: 4900, desc: 'Patacones dobles cubiertos de frijoles refritos y carne desmechada.' },
    { id: 12, nombre: 'Sopa de Pulpería con Costilla', cat: 'bocas', precio: 4200, desc: 'Sopa tradicional reconfortante con verduras de la zona.' },

    // BEBIDAS Y LICORES
    { id: 13, nombre: 'Refresco Natural de Cas (500ml)', cat: 'bebidas', precio: 1800, desc: 'Cas criollo recién licuado con hielo frappé.' },
    { id: 14, nombre: 'Agua de Sapo con Jengibre (500ml)', cat: 'bebidas', precio: 1900, desc: 'Tapa de dulce, limón criollo y jengibre fresco.' },
    { id: 15, nombre: 'Cerveza Imperial Helada (350ml)', cat: 'bebidas', precio: 2200, desc: 'Servida en vaso congelado de tarro.' },

    // POSTRES
    { id: 16, nombre: 'Flan de Coco Casero', cat: 'postres', precio: 2500, desc: 'Postre tradicional bañado en caramelo de caña dulce.' },
    { id: 17, nombre: 'Empanada Dulce de Plátano y Queso', cat: 'postres', precio: 2200, desc: 'Rellena de queso Turrialba con toque de canela.' }
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
    showToast(`${item.nombre} agregado a la selección`, 'info');
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

  const handleOpenNoticeModal = () => {
    if (cart.length === 0) return;
    setIsNoticeModalOpen(true);
  };

  const handleConfirmWhatsAppOrder = () => {
    const itemsText = cart.map(i => `• ${i.cantidad}x ${i.nombre} (₡${(i.precio * i.cantidad).toLocaleString()})`).join('%0A');
    const text = `¡Hola Chicharronera El Cacique! 👋%0A%0AMe gustaría coordinar la reserva de mesa y mi pedido con el siguiente detalle:%0A%0A${itemsText}%0A%0A*Subtotal:* ₡${subtotal.toLocaleString()}%0A*IVA (13%):* ₡${iva.toLocaleString()}%0A*Servicio (10%):* ₡${servicio.toLocaleString()}%0A*Total:* ₡${totalGeneral.toLocaleString()}%0A%0A¿Me ayudan a confirmar disponibilidad de mesa y día?🏼`;

    window.open(`https://wa.me/50622008888?text=${text}`, '_blank');
    setIsNoticeModalOpen(false);
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
        
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D16014]/20 border border-[#D16014]/50 text-[#D16014] text-xs font-black uppercase">
            <Flame className="w-4 h-4" /> Selección Digital
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-[#F8FFE5] tracking-tight">
            MENÚ DIGITAL EL CACIQUE
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            Elige tus platillos y bebidas preferidas para solicitar tu mesa y atención personalizada.
          </p>
        </div>

        <div className="space-y-4 bg-[#001812] p-6 rounded-3xl border border-[#659B5E]/30 shadow-xl">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por platillo, jugos o postres..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs font-bold uppercase tracking-wider pt-2">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'paila', label: 'Chicharrones & Paila' },
              { id: 'cortes', label: 'Cortes a la Leña' },
              { id: 'ninos', label: 'Menú Infantil', icon: <Baby className="w-4 h-4 text-amber-400" /> },
              { id: 'bocas', label: 'Bocas & Ceviches' },
              { id: 'bebidas', label: 'Bebidas' },
              { id: 'postres', label: 'Postres' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeCategory === cat.id ? 'bg-[#D16014] text-white shadow-lg' : 'bg-[#0A090C] text-gray-400 border border-[#F8FFE5]/10 hover:text-white'
                }`}
              >
                {cat.icon && <span className="shrink-0">{cat.icon}</span>}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

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
                  className="px-4 py-2 rounded-xl bg-[#659B5E] hover:bg-[#52824c] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="px-6 py-3.5 rounded-2xl bg-[#D16014] text-white font-extrabold text-xs flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Ver Pedido ({cart.reduce((a, b) => a + b.cantidad, 0)})</span>
              <span className="bg-white/20 px-2 py-1 rounded-lg">₡{totalGeneral.toLocaleString()}</span>
            </button>
          </div>
        )}

        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-md bg-[#001812] h-full p-6 space-y-6 flex flex-col justify-between border-l border-[#659B5E]/30 text-xs">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#F8FFE5]/10 pb-4">
                  <h3 className="font-extrabold text-base text-[#F8FFE5] flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#D16014]" /> Resumen de Selección
                  </h3>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white font-bold cursor-pointer">Cerrar</button>
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
                          <button onClick={() => handleQuantityChange(item.id, -1)} className="text-gray-400 hover:text-white cursor-pointer"><Minus className="w-3 h-3" /></button>
                          <span className="font-bold text-[#F8FFE5] px-1">{item.cantidad}</span>
                          <button onClick={() => handleQuantityChange(item.id, 1)} className="text-gray-400 hover:text-white cursor-pointer"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-400 hover:text-red-300 p-1 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#F8FFE5]/10">
                <div className="space-y-1.5 font-semibold text-gray-400">
                  <div className="flex justify-between"><span>Subtotal:</span><span>₡{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>IVA (13%):</span><span>₡{iva.toLocaleString()}</span></div>
                  <div className="flex justify-between text-base font-black text-[#F8FFE5] pt-2 border-t border-[#F8FFE5]/10">
                    <span>Total Estimado:</span>
                    <span className="text-[#D16014]">₡{totalGeneral.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleOpenNoticeModal}
                  className="w-full py-3.5 rounded-xl bg-[#659B5E] hover:bg-[#52824c] font-extrabold text-white text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" /> Solicitar Pedido por WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ADVERTENCIA / EXPLICACIÓN WHATSAPP & EXPRESS */}
        {isNoticeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
            <div className="w-full max-w-lg bg-[#001812] border border-[#659B5E]/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-xs text-[#F8FFE5] relative">
              <div className="space-y-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#659B5E]/20 border border-[#659B5E]/40 flex items-center justify-center mx-auto text-[#659B5E]">
                  <AlertCircle className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-black text-[#F8FFE5]">Procesamiento de Pedidos</h3>
                <p className="text-gray-300 leading-relaxed">
                  Para brindarte la atención personalizada que mereces, serás redirigido a nuestra línea de **WhatsApp Oficial**.
                </p>
              </div>

              <div className="space-y-3 bg-[#0A090C] p-4 rounded-2xl border border-[#F8FFE5]/10">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#659B5E] shrink-0 mt-0.5" />
                  <p className="text-gray-300 leading-relaxed">
                    Un asesor te asistirá de inmediato para coordinar el número de mesa, día y hora de tu visita a la sucursal.
                  </p>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-[#F8FFE5]/10">
                  <Truck className="w-5 h-5 text-[#D16014] shrink-0 mt-0.5" />
                  <p className="text-gray-300 leading-relaxed">
                    <strong className="text-[#D16014]">¡Aviso Importante!</strong> Próximamente habilitaremos el **Servicio Express a Domicilio** en todas nuestras sucursales.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 text-gray-400 hover:text-white font-bold cursor-pointer"
                >
                  Regresar
                </button>
                <button
                  onClick={handleConfirmWhatsAppOrder}
                  className="flex-1 py-3 rounded-xl bg-[#659B5E] hover:bg-[#52824c] text-white font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  Continuar a WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}