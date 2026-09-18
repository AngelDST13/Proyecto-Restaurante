import React, { useState, useEffect } from 'react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('/');
  const [user, setUser] = useState({ email: 'admin@gourmetsync.com', rol: 'administrador' });
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([
    { nombre: 'Tomahawk Dry-Aged 45D', precio: 125.00, nota: 'Término Medio' },
    { nombre: 'Carpaccio de Vieiras & Caviar', precio: 38.00, nota: 'Sin sésamo' }
  ]);
  const [activeTable, setActiveTable] = useState(12);
  const [adminTab, setAdminTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Matriz de mesas en tiempo real
  const [tableState, setTableState] = useState([
    { n: 1, status: 'free' }, { n: 2, status: 'occupied' }, { n: 3, status: 'free' },
    { n: 4, status: 'paid' }, { n: 5, status: 'occupied' }, { n: 6, status: 'free' },
    { n: 7, status: 'occupied' }, { n: 8, status: 'paid' }, { n: 9, status: 'free' },
    { n: 10, status: 'free' }, { n: 11, status: 'occupied' }, { n: 12, status: 'occupied' },
    { n: 13, status: 'free' }, { n: 14, status: 'paid' }, { n: 15, status: 'occupied' },
    { n: 16, status: 'free' }, { n: 17, status: 'free' }, { n: 18, status: 'occupied' }
  ]);

  // Simulación de cambios de ocupación de mesa
  useEffect(() => {
    const interval = setInterval(() => {
      setTableState(prev => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        const cycle = { free: 'occupied', occupied: 'paid', paid: 'free' };
        next[idx] = { ...next[idx], status: cycle[next[idx].status] };
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    let rol = 'cliente';
    if (email.includes('admin')) rol = 'administrador';
    else if (email.includes('mesero')) rol = 'mesero';

    setUser({ email, rol });
    setCurrentRoute(rol === 'administrador' ? '/admin' : '/menu');
  };

  const addItemToCart = (nombre, precio) => {
    setCartItems(prev => [...prev, { nombre, precio, nota: 'Estándar' }]);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.precio, 0);
  const iva = subtotal * 0.13;
  const servicio = subtotal * 0.10;
  const total = subtotal + iva + servicio;

  const dishes = [
    { id: 1, name: 'Tartar de Atún Rojo Bluefin', cat: 'entradas', price: 32.00, stock: 'En Stock', desc: 'Lomo balear marinado con aceite de sésamo y aguacate hass.', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb' },
    { id: 2, name: 'Ribeye Black Angus Prime 400g', cat: 'cortes', price: 68.00, stock: 'Maduración 30D', desc: 'Papas trufadas y reducción de vino tinto Malbec.', img: 'https://images.unsplash.com/photo-1558030006-450675393462' },
    { id: 3, name: 'Langosta Caribeña al Gratén', cat: 'mariscos', price: 84.00, stock: 'Pesca Sostenible', desc: 'Glaseada con bechamel de eneldo y queso suizo Gruyère.', img: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47' },
    { id: 4, name: 'Risotto Nero con Calamares', cat: 'mariscos', price: 36.00, stock: 'Especialidad', desc: 'Arroz Acquerello con tinta natural de sepia y azafrán.', img: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9' },
    { id: 5, name: 'Soufflé de Avellana del Piamonte', cat: 'postres', price: 20.00, stock: 'Al Minuto', desc: 'Servido tibio con helado artesanal de vainilla Bourbon.', img: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c' },
    { id: 6, name: 'Barolo DOCG Pio Cesare 2018', cat: 'vinos', price: 145.00, stock: 'Cava DOCG', desc: 'Nebbiolo 100%. Notas de violetas y cerezas maduras.', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3' }
  ];

  const filteredDishes = dishes.filter(dish => {
    const matchesCat = selectedCategory === 'all' || dish.cat === selectedCategory;
    const matchesQuery = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] font-sans relative selection:bg-[#D16014] selection:text-[#F8FFE5]">
      
      {/* Dynamic Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#D16014]/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-[#00241B]/90 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-[#659B5E]/10 rounded-full blur-3xl"></div>
      </div>

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-[#F8FFE5]/10 bg-[#0A090C]/90 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-8">
          <button onClick={() => setCurrentRoute('/')} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D16014] flex items-center justify-center font-bold text-lg text-[#F8FFE5] shadow-lg shadow-[#D16014]/30">
              G
            </div>
            <div className="text-left">
              <span className="text-xl font-bold tracking-tight text-[#F8FFE5]">GourmetSync</span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#00241B] text-[#659B5E] border border-[#659B5E]/40">v3.2</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <button onClick={() => setCurrentRoute('/')} className={`px-3.5 py-1.5 rounded-lg transition-all ${currentRoute === '/' ? 'bg-[#D16014] text-[#F8FFE5]' : 'text-[#F8FFE5]/70 hover:bg-[#00241B]'}`}>Inicio</button>
            <button onClick={() => setCurrentRoute('/menu')} className={`px-3.5 py-1.5 rounded-lg transition-all ${currentRoute === '/menu' ? 'bg-[#D16014] text-[#F8FFE5]' : 'text-[#F8FFE5]/70 hover:bg-[#00241B]'}`}>Menú & Pedidos</button>
            <button onClick={() => setCurrentRoute('/admin')} className={`px-3.5 py-1.5 rounded-lg transition-all ${currentRoute === '/admin' ? 'bg-[#D16014] text-[#F8FFE5]' : 'text-[#F8FFE5]/70 hover:bg-[#00241B]'}`}>Dashboard Admin</button>
            <button onClick={() => setCurrentRoute('/login')} className={`px-3.5 py-1.5 rounded-lg transition-all ${currentRoute === '/login' ? 'bg-[#D16014] text-[#F8FFE5]' : 'text-[#F8FFE5]/70 hover:bg-[#00241B]'}`}>Acceso Unificado</button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setCartOpen(!cartOpen)} className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#00241B] border border-[#659B5E]/40 text-[#F8FFE5] text-xs font-semibold">
            <span>Comanda</span>
            <span className="w-5 h-5 rounded-full bg-[#D16014] text-[#F8FFE5] text-[11px] font-bold flex items-center justify-center">{cartItems.length}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#F8FFE5]/15">
              <div className="bg-[#00241B] px-2.5 py-1 rounded-lg border border-[#F8FFE5]/10 text-xs text-left">
                <span className="block font-bold text-[#F8FFE5] capitalize">{user.rol}</span>
                <span className="block text-[10px] text-[#F8FFE5]/60">{user.email}</span>
              </div>
              <button onClick={() => setCurrentRoute('/login')} className="px-3 py-1.5 rounded-lg bg-[#00241B] border border-[#F8FFE5]/10 text-xs font-bold text-[#F8FFE5] hover:bg-[#D16014]">Acceso</button>
            </div>
          ) : (
            <button onClick={() => setCurrentRoute('/login')} className="px-4 py-1.5 rounded-lg bg-[#D16014] font-bold text-xs">Iniciar Sesión</button>
          )}
        </div>
      </header>

      {/* DRAWER COMANDA */}
      <aside className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-[#00241B]/95 backdrop-blur-2xl border-l border-[#F8FFE5]/15 z-[90] transform ${cartOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 p-6 flex flex-col justify-between shadow-2xl`}>
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-[#F8FFE5]/15">
            <h3 className="font-bold text-[#F8FFE5] text-base">Comanda de Salón · Mesa #{activeTable}</h3>
            <button onClick={() => setCartOpen(false)} className="text-[#F8FFE5]/70 text-lg font-bold">✕</button>
          </div>
          <div className="mt-4 space-y-3 text-xs max-h-96 overflow-y-auto">
            {cartItems.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#0A090C]/80 border border-[#F8FFE5]/10 flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#F8FFE5]">{item.nombre}</div>
                  <div className="text-[#D16014] font-semibold">${item.precio.toFixed(2)} · {item.nota}</div>
                </div>
                <span className="text-[#659B5E] font-bold bg-[#00241B] px-2 py-1 rounded border border-[#659B5E]/30">x1</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#F8FFE5]/15 pt-4 space-y-3 text-xs">
          <div className="space-y-1.5 text-[#F8FFE5]/80">
            <div className="flex justify-between"><span>Subtotal</span> <span className="font-semibold text-[#F8FFE5]">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>IVA Gastronómico (13%)</span> <span className="font-semibold text-[#F8FFE5]">${iva.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Servicio Salón (10%)</span> <span className="font-semibold text-[#659B5E]">${servicio.toFixed(2)}</span></div>
            <div className="flex justify-between text-base font-bold text-[#F8FFE5] border-t border-[#F8FFE5]/15 pt-2">
              <span>Total Comanda</span>
              <span className="text-[#D16014]">${total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={() => { alert('¡Comanda despachada a N8N en tiempo real!'); setCartOpen(false); }} className="w-full py-3 rounded-xl bg-[#D16014] font-bold text-xs text-[#F8FFE5] shadow-lg shadow-[#D16014]/30">
            Despachar a Cocina (N8N)
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL POR RUTAS */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto relative z-10">

        {/* RUTA 1: LANDING */}
        {currentRoute === '/' && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00241B] border border-[#659B5E]/40 text-[#659B5E] text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#659B5E] animate-ping"></span>
                  <span>Sincronización Gastronómica en Vivo v3.2</span>
                </div>
                <h1 className="text-4xl sm:text-6xl font-extrabold text-[#F8FFE5] leading-tight">
                  Gastronomía de Alta <span className="text-[#D16014]">Precisión & Sincronía</span>
                </h1>
                <p className="text-base text-[#F8FFE5]/80 max-w-xl leading-relaxed">
                  Plataforma integral de orquestación culinaria. Diseñada para unir la acústica sensorial del comensal con el ritmo milimétrico de la línea de expedición en tiempo real.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button onClick={() => setCurrentRoute('/menu')} className="px-7 py-3.5 rounded-xl bg-[#D16014] text-[#F8FFE5] font-bold text-xs shadow-lg shadow-[#D16014]/30">Explorar Menú Digital</button>
                  <button onClick={() => setCurrentRoute('/login')} className="px-7 py-3.5 rounded-xl bg-[#00241B] border border-[#659B5E]/40 font-bold text-xs">Acceso al Sistema</button>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#F8FFE5]/15 max-w-lg">
                  <div>
                    <div className="text-3xl font-bold text-[#D16014]">4.9 ★</div>
                    <div className="text-xs text-[#F8FFE5]/60 mt-1">Calificación Crítica</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#F8FFE5]">+120k</div>
                    <div className="text-xs text-[#F8FFE5]/60 mt-1">Comensales Anuales</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#659B5E]">3 ★</div>
                    <div className="text-xs text-[#F8FFE5]/60 mt-1">Inspiración Michelin</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-[#00241B]/60 backdrop-blur-xl border border-[#F8FFE5]/12 p-4 shadow-2xl">
                  <div className="relative h-72 rounded-xl overflow-hidden">
                    <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1558030006-450675393462" alt="Tomahawk" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A090C] via-transparent to-transparent"></div>
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0A090C]/90 text-[#D16014] text-xs font-bold border border-[#D16014]/40">Platillo Firma</span>
                    <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-[#00241B]/90 backdrop-blur-md border border-[#F8FFE5]/15 flex justify-between items-center">
                      <div>
                        <h2 className="text-sm font-bold text-[#F8FFE5]">Tomahawk Dry-Aged 45D</h2>
                        <p className="text-[11px] text-[#F8FFE5]/70">Corte noble con sal volcánica</p>
                      </div>
                      <span className="text-lg font-bold text-[#D16014]">$125.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN EXPERIENCIAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-2">
                <h3 className="font-bold text-sm text-[#F8FFE5]">Salón Privado & Chef's Table</h3>
                <p className="text-xs text-[#F8FFE5]/70">Exclusividad para 12 comensales con visión directa a expedición.</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-2">
                <h3 className="font-bold text-sm text-[#F8FFE5]">Cava Subterránea & Sommelier</h3>
                <p className="text-xs text-[#F8FFE5]/70">Más de 850 etiquetas con monitoreo barométrico constante.</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-2">
                <h3 className="font-bold text-sm text-[#F8FFE5]">Logística Gourmet</h3>
                <p className="text-xs text-[#F8FFE5]/70">Empaque térmico al vacío con atmósfera de nitrógeno.</p>
              </div>
            </div>
          </div>
        )}

        {/* RUTA 2: LOGIN UNIFICADO */}
        {currentRoute === '/login' && (
          <div className="max-w-md mx-auto py-12">
            <div className="p-8 rounded-2xl bg-[#00241B]/60 backdrop-blur-2xl border border-[#F8FFE5]/15 space-y-6 shadow-2xl">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#F8FFE5]">Acceso Unificado</h2>
                <p className="text-xs text-[#F8FFE5]/70 mt-1">Detección automática de rol por db.json</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0A090C]/80 border border-[#659B5E]/30 space-y-1.5 text-xs">
                <span className="text-[#659B5E] font-bold">Probar credenciales:</span>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button onClick={() => document.getElementById('login-email').value = 'admin@gourmetsync.com'} className="p-1 bg-[#00241B] rounded border border-[#F8FFE5]/10 hover:bg-[#D16014]">Admin</button>
                  <button onClick={() => document.getElementById('login-email').value = 'mesero@gourmetsync.com'} className="p-1 bg-[#00241B] rounded border border-[#F8FFE5]/10 hover:bg-[#D16014]">Mesero</button>
                  <button onClick={() => document.getElementById('login-email').value = 'cliente@gourmetsync.com'} className="p-1 bg-[#00241B] rounded border border-[#F8FFE5]/10 hover:bg-[#D16014]">Cliente</button>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Correo Electrónico</label>
                  <input id="login-email" type="email" defaultValue="admin@gourmetsync.com" required className="w-full bg-[#001812]/40 border border-[#F8FFE5]/12 rounded-xl px-4 py-2.5 text-[#F8FFE5]" />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Contraseña</label>
                  <input type="password" defaultValue="••••••••••••" required className="w-full bg-[#001812]/40 border border-[#F8FFE5]/12 rounded-xl px-4 py-2.5 text-[#F8FFE5]" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-[#D16014] font-bold text-[#F8FFE5] text-xs shadow-lg shadow-[#D16014]/30">
                  Iniciar Sesión & Redirigir
                </button>
              </form>
            </div>
          </div>
        )}

        {/* RUTA 3: MENÚ INTERACTIVO & MATRIZ DE MESAS */}
        {currentRoute === '/menu' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/15">
              <div>
                <h2 className="text-xl font-bold text-[#F8FFE5]">Menú Digital & Terminal de Comandas</h2>
                <p className="text-xs text-[#F8FFE5]/70">Mesa activa asignada: #{activeTable}</p>
              </div>

              <div className="flex gap-2">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar platillos..." className="bg-[#001812]/40 border border-[#F8FFE5]/12 rounded-xl px-3 py-1.5 text-xs text-[#F8FFE5]" />
                <button onClick={() => setCartOpen(true)} className="px-4 py-2 rounded-xl bg-[#D16014] text-xs font-bold text-[#F8FFE5]">Ver Comanda ({cartItems.length})</button>
              </div>
            </div>

            {/* MATRIZ DE MESAS EN TIEMPO REAL */}
            <div className="p-5 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-3">
              <h3 className="font-bold text-xs text-[#F8FFE5]">Matriz de Salón en Vivo (18 Mesas)</h3>
              <div className="grid grid-cols-6 lg:grid-cols-9 gap-2">
                {tableState.map(t => (
                  <button key={t.n} onClick={() => setActiveTable(t.n)} className={`p-2 rounded-xl text-center text-xs font-bold border transition-all ${t.n === activeTable ? 'border-[#D16014] bg-[#D16014]/30' : t.status === 'occupied' ? 'bg-[#D16014]/15 border-[#D16014]/40' : t.status === 'paid' ? 'bg-[#659B5E]/15 border-[#659B5E]/40' : 'bg-[#00241B] border-[#F8FFE5]/10'}`}>
                    Mesa {String(t.n).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* FILTROS DE CATEGORÍA */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              {['all', 'entradas', 'cortes', 'mariscos', 'postres', 'vinos'].map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full font-bold capitalize transition-all ${selectedCategory === cat ? 'bg-[#D16014] text-[#F8FFE5]' : 'bg-[#00241B] text-[#F8FFE5]/70 hover:bg-[#00241B]/80'}`}>
                  {cat === 'all' ? 'Todos los Platillos' : cat}
                </button>
              ))}
            </div>

            {/* PLATILLOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredDishes.map(dish => (
                <div key={dish.id} className="p-4 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-3 hover:border-[#D16014]/50 transition-all">
                  <img className="h-40 w-full object-cover rounded-xl" src={dish.img} alt={dish.name} />
                  <div>
                    <h3 className="font-bold text-sm text-[#F8FFE5]">{dish.name}</h3>
                    <p className="text-xs text-[#F8FFE5]/70 line-clamp-2 mt-1">{dish.desc}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#F8FFE5]/10">
                    <span className="text-base font-bold text-[#D16014]">${dish.price.toFixed(2)}</span>
                    <button onClick={() => addItemToCart(dish.name, dish.price)} className="px-3 py-1.5 rounded-lg bg-[#D16014] text-xs font-bold text-[#F8FFE5] hover:bg-[#b8510f]">
                      + Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RUTA 4: DASHBOARD ADMINISTRATIVO COMPLETO */}
        {currentRoute === '/admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#F8FFE5]/15 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#F8FFE5]">Centro de Operaciones GourmetSync</h2>
                <p className="text-xs text-[#F8FFE5]/70">Control de salón, insumos, nómina y conectividad.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#659B5E]/20 text-[#659B5E] border border-[#659B5E]/40 text-xs font-bold">db.json Conectado</span>
            </div>

            {/* ADMIN TABS */}
            <div className="flex gap-2 border-b border-[#F8FFE5]/15 pb-2 text-xs">
              {['overview', 'inventory', 'payroll', 'users'].map(tab => (
                <button key={tab} onClick={() => setAdminTab(tab)} className={`px-4 py-2 rounded-xl font-bold capitalize ${adminTab === tab ? 'bg-[#D16014] text-[#F8FFE5]' : 'bg-[#00241B] text-[#F8FFE5]/70'}`}>
                  {tab === 'overview' ? 'Resumen General' : tab === 'inventory' ? 'Inventario (#659B5E)' : tab === 'payroll' ? 'Nómina' : 'Usuarios (db.json)'}
                </button>
              ))}
            </div>

            {/* TAB OVERVIEW */}
            {adminTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/10">
                    <span className="text-xs text-[#F8FFE5]/60">Ventas del Día</span>
                    <div className="text-2xl font-bold text-[#F8FFE5]">$4,850.00</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/10">
                    <span className="text-xs text-[#F8FFE5]/60">Mesas Activas</span>
                    <div className="text-2xl font-bold text-[#659B5E]">18 / 24</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/10">
                    <span className="text-xs text-[#F8FFE5]/60">Pedidos en Cocina</span>
                    <div className="text-2xl font-bold text-[#D16014]">7 en Pase</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/10">
                    <span className="text-xs text-[#F8FFE5]/60">Ticket Promedio</span>
                    <div className="text-2xl font-bold text-[#F8FFE5]">$89.40</div>
                  </div>
                </div>

                {/* GRÁFICO CSS DE FACTURACIÓN */}
                <div className="p-6 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-4">
                  <h3 className="font-bold text-sm text-[#F8FFE5]">Curva Horaria de Facturación (Hoy)</h3>
                  <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-[#F8FFE5]/15 px-4">
                    <div className="flex-1 bg-[#0A090C] hover:bg-[#659B5E] h-16 rounded-t transition-all"></div>
                    <div className="flex-1 bg-[#0A090C] hover:bg-[#659B5E] h-32 rounded-t transition-all"></div>
                    <div className="flex-1 bg-[#0A090C] hover:bg-[#659B5E] h-44 rounded-t transition-all"></div>
                    <div className="flex-1 bg-[#0A090C] hover:bg-[#659B5E] h-20 rounded-t transition-all"></div>
                    <div className="flex-1 bg-[#D16014] h-48 rounded-t shadow-lg shadow-[#D16014]/20 transition-all"></div>
                    <div className="flex-1 bg-[#D16014]/70 h-28 rounded-t transition-all"></div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB INVENTARIO */}
            {adminTab === 'inventory' && (
              <div className="p-5 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#F8FFE5]/15 text-[#F8FFE5]/60">
                      <th className="py-2">Insumo</th>
                      <th>Categoría</th>
                      <th>Stock Actual</th>
                      <th>Nivel (#659B5E)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8FFE5]/10">
                    <tr><td className="py-3 font-bold">Lomo Wagyu A5 Miyazaki</td><td>Cárnicos</td><td className="text-[#D16014]">3.2 kg</td><td><span className="px-2 py-0.5 rounded bg-[#D16014]/20 text-[#D16014]">Bajo Mínimo</span></td></tr>
                    <tr><td className="py-3 font-bold">Vieiras de Hokkaido</td><td>Mariscos</td><td className="text-[#659B5E]">14.5 kg</td><td><span className="px-2 py-0.5 rounded bg-[#659B5E]/20 text-[#659B5E]">Óptimo (#659B5E)</span></td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB NÓMINA */}
            {adminTab === 'payroll' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-2">
                  <div className="font-bold text-[#F8FFE5]">Chef Alejandro Gallardo</div>
                  <div className="text-[#D16014]">Chef Ejecutivo · $4,120.00</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-2">
                  <div className="font-bold text-[#F8FFE5]">Valeria Rossi</div>
                  <div className="text-[#659B5E]">Head Sommelier · $3,310.00</div>
                </div>
              </div>
            )}

            {/* TAB USUARIOS */}
            {adminTab === 'users' && (
              <div className="p-4 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-[#0A090C] rounded"><span>admin@gourmetsync.com</span><span className="text-[#D16014] font-bold">Administrador</span></div>
                <div className="flex justify-between p-2 bg-[#0A090C] rounded"><span>mesero@gourmetsync.com</span><span className="text-[#659B5E] font-bold">Mesero</span></div>
                <div className="flex justify-between p-2 bg-[#0A090C] rounded"><span>cliente@gourmetsync.com</span><span>Cliente</span></div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#F8FFE5]/10 bg-[#00241B]/70 py-8 px-6 text-xs text-[#F8FFE5]/70">
        <div className="max-w-7xl mx-auto flex justify-between">
          <span className="font-bold text-[#F8FFE5]">GourmetSync © 2026</span>
          <div className="flex gap-4">
            <button onClick={() => setCurrentRoute('/')} className="hover:text-[#D16014]">Inicio</button>
            <button onClick={() => setCurrentRoute('/menu')} className="hover:text-[#D16014]">Menú</button>
            <button onClick={() => setCurrentRoute('/admin')} className="hover:text-[#D16014]">Admin</button>
          </div>
        </div>
      </footer>
    </div>
  );
}