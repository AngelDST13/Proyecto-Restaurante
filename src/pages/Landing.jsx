import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useAutoLogout } from '../hooks/useAutoLogout';
import { 
  Utensils, Calendar, MapPin, Clock, Phone, 
  Flame, ChevronRight, ChevronLeft, Award, ShieldCheck, Sparkles,
  AlertTriangle
} from 'lucide-react';
import logoNegro from '../assets/img/LogoN.svg';

export default function Landing() {
  const navigate = useNavigate();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationType, setReservationType] = useState('General');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [, setMapError] = useState(false);
  const [activeSedeMap, setActiveSedeMap] = useState('ESCAZÚ');

  // CONTROL DE AUTO-LOGOUT SEGURO
  const { showWarning, resetTimer } = useAutoLogout();

  // CARRUSEL INTERACTIVO HERO CON ANIMACIÓN
  const heroImages = [
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1600&q=80'
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  const reserve = (type = 'General') => {
    setReservationType(type);
    setIsReservationOpen(true);
  };

  // Lógica de temporada alta
  const getTemporada = () => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12

    // Diciembre o Enero → Temporada Navideña/Fin de Año
    if (month === 12 || month === 1) return 'navidad';

    // Semana Santa: Domingo de Ramos al Domingo de Pascua
    // Algoritmo de Gauss para calcular el Domingo de Pascua
    const year = now.getFullYear();
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const easterMonth = Math.floor((h + l - 7 * m + 114) / 31);
    const easterDay = ((h + l - 7 * m + 114) % 31) + 1;
    const easterSunday = new Date(year, easterMonth - 1, easterDay);
    const palmSunday = new Date(easterSunday);
    palmSunday.setDate(palmSunday.getDate() - 7);
    const easterMondayEnd = new Date(easterSunday);
    easterMondayEnd.setDate(easterMondayEnd.getDate() + 1);

    if (now >= palmSunday && now <= easterMondayEnd) return 'semana-santa';

    return null;
  };

  const temporada = getTemporada();

  const sedesInfo = {
    'SAN JOSÉ': {
      nombre: 'SEDE SAN JOSÉ • CENTRO',
      provincia: 'SAN JOSÉ',
      direccion: 'Av. Central, San José Centro, Costa Rica',
      telefono: '+506 2220-0001',
      whatsapp: '50622200001',
      horario: 'Lunes a Domingo: 11:00 AM - 11:00 PM',
      lat: 9.9281,
      lng: -84.0907,
      zoom: 16
    },
    'ESCAZÚ': {
      nombre: 'SEDE ESCAZÚ • CENTRO CULINARIO',
      provincia: 'SAN JOSÉ',
      direccion: '100m Oeste de Multiplaza Escazú, San José',
      telefono: '+506 2200-8888',
      whatsapp: '50622008888',
      horario: 'Lunes a Domingo: 11:30 AM - 11:00 PM',
      lat: 9.9159,
      lng: -84.1423,
      zoom: 16
    },
    'GUADALUPE': {
      nombre: 'SEDE GUADALUPE • COSTADO NORTE',
      provincia: 'SAN JOSÉ',
      direccion: 'Guadalupe, San José, 200m Norte del Parque',
      telefono: '+506 2240-5566',
      whatsapp: '50622405566',
      horario: 'Lunes a Domingo: 11:30 AM - 10:30 PM',
      lat: 9.9414,
      lng: -84.0644,
      zoom: 16
    }
  };

  const selectedSedeObj = sedesInfo[activeSedeMap] || sedesInfo['ESCAZÚ'];

  const getOsmUrl = (sede) => {
    const { lat, lng } = sede;
    const bbox = 0.01;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - bbox}%2C${lat - bbox}%2C${lng + bbox}%2C${lat + bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  const platillosPrincipales = [
    {
      nombre: 'Chifrijo Especial Cacique',
      desc: 'Pork belly crujiente, cubaces tiernos en su caldo, pico de gallo criollo, aguacate fresco y patacones tostados.',
      precio: '₡6,800',
      tag: 'MÁS VENDIDO',
      imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
    },
    {
      nombre: 'Vigorón Criollo de Paila (1 kg)',
      desc: 'Chicharrones de carne y concha tostada al momento sobre yuca suave al vapor y ensalada agria tradicional.',
      precio: '₡14,500',
      tag: 'PARA COMPARTIR',
      imagen: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'
    },
    {
      nombre: 'Costilla a la Leña Ahumada',
      desc: 'Corte jugoso marinado en especias autóctonas, ahumado con leña de café y bañado en chimichurri de la casa.',
      precio: '₡9,200',
      tag: 'RECOMENDACIÓN DEL CHEF',
      imagen: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] font-sans selection:bg-[#D16014] selection:text-white overflow-x-hidden">
      
      {/* NAVBAR CON EVENTO DE RESERVA */}
      <Navbar onOpenReservation={() => setIsReservationOpen(true)} />

      {/* NOTIFICACIÓN TOAST */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* ADVERTENCIA DE INACTIVIDAD SEGURO SIN NÚMEROS DE CONTEO */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#001812] border-2 border-[#D16014] p-6 sm:p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-[#D16014] mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-white">¿Sigue ahí?</h3>
            <p className="text-xs text-gray-300">
              Su sesión está a punto de caducar por inactividad. Haga clic en el botón para mantener su sesión activa.
            </p>
            <button
              type="button"
              onClick={resetTimer}
              className="w-full py-3 bg-[#D16014] hover:bg-[#b8510f] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              MANTENER SESIÓN ACTIVA
            </button>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
        
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            >
              <img 
                src={img} 
                alt="Gastronomía El Cacique" 
                className="w-full h-full object-cover object-center filter brightness-50 contrast-125"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A090C] via-[#0A090C]/60 to-[#0A090C]/30"></div>
        </div>

        {/* CONTROLES LATERALES */}
        <button 
          type="button"
          onClick={prevSlide}
          aria-label="Slide anterior"
          className="absolute left-4 z-20 p-3 rounded-full bg-black/40 hover:bg-[#D16014] text-white backdrop-blur-md transition-all hidden sm:block cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button 
          type="button"
          onClick={nextSlide}
          aria-label="Slide siguiente"
          className="absolute right-4 z-20 p-3 rounded-full bg-black/40 hover:bg-[#D16014] text-white backdrop-blur-md transition-all hidden sm:block cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* INDICADORES DEL SLIDER */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ir al slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-[#D16014]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            ></button>
          ))}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          
          {/* TAGLINE MEJORADO */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#001812]/80 border border-[#659B5E]/50 text-[#659B5E] text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-2xl">
            <Flame className="w-4 h-4 text-[#D16014]" />
            <span>TRADICIÓN AUTÉNTICA • 100% COSTARRICENSE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none uppercase">
            SABOR CRIOLLO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D16014] via-amber-400 to-[#659B5E]">
              A LA LEÑA Y PAILA
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 font-medium leading-relaxed">
            Tradición costarricense perfeccionada: chicharrones de concha tostada al momento, cortes de carne ahumados a la leña de café y tortillas palmeadas a mano.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/menu')}
              className="px-8 py-4 rounded-2xl bg-[#D16014] hover:bg-[#b8510f] text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl flex items-center gap-3 cursor-pointer group"
            >
              <Utensils className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>VER MENÚ DIGITAL</span>
            </button>

            <button
              onClick={() => reserve('General')}
              className="px-8 py-4 rounded-2xl bg-[#001812]/80 hover:bg-[#001812] border border-[#659B5E]/50 text-[#F8FFE5] font-black text-sm uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-3 cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-[#659B5E]" />
              <span>AGENDAR RESERVA</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. NOSOTROS */}
      <section id="nosotros" className="py-24 px-6 bg-[#001812] border-y border-[#659B5E]/30 relative overflow-hidden scroll-mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#659B5E]/20 text-[#659B5E] border border-[#659B5E]/40 text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> TRADICIÓN Y PASIÓN CULINARIA
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              Nuestra Historia &amp; <br />
              <span className="text-[#D16014]">Legado Gastronómico</span>
            </h2>

            <p className="text-base sm:text-lg font-black text-amber-400 italic leading-snug border-l-4 border-[#D16014] pl-4">
              "Donde el fuego de la paila despierta la verdadera tradición costarricense."
            </p>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
              Fundada con el compromiso de preservar el sabor autóctono del campo costarricense, <strong>Chicharronera El Cacique</strong> combina técnicas ancestrales de cocción en paila de hierro fundido con leña de café y una infraestructura moderna multisucursal.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#0A090C] border border-[#659B5E]/20 space-y-1">
                <Award className="w-6 h-6 text-[#D16014]" />
                <h4 className="font-extrabold text-sm text-white">Calidad 100% Criolla</h4>
                <p className="text-[11px] text-gray-400">Ingredientes frescos de productores locales.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A090C] border border-[#659B5E]/20 space-y-1">
                <ShieldCheck className="w-6 h-6 text-[#659B5E]" />
                <h4 className="font-extrabold text-sm text-white">Sabor Garantizado</h4>
                <p className="text-[11px] text-gray-400">Recetas tradicionales hechas con esmero.</p>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center p-8 sm:p-12 bg-[#F8FFE5] border-4 border-[#D16014] rounded-3xl shadow-[0_0_50px_rgba(209,96,20,0.4)] text-center group">
            <div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <img 
                src={logoNegro} 
                alt="Logo El Cacique" 
                className="w-full h-full object-contain filter drop-shadow-xl" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATILLOS PRINCIPALES */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-black text-[#D16014] uppercase tracking-widest">FAVORITOS DEL MENÚ</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">Nuestra Especialidad Criolla</h2>
          <div className="w-20 h-1 bg-[#659B5E] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {platillosPrincipales.map((item, idx) => (
            <div key={idx} className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-5 space-y-4 shadow-2xl hover:border-[#D16014] transition-all group flex flex-col justify-between overflow-hidden">
              <div className="h-48 sm:h-52 w-full overflow-hidden rounded-2xl relative">
                <img 
                  src={item.imagen} 
                  alt={item.nombre} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001812] via-transparent to-transparent opacity-80"></div>
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#D16014] text-white text-[10px] font-black uppercase shadow-lg">
                  {item.tag}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-white group-hover:text-[#D16014] transition-colors">{item.nombre}</h3>
                  <span className="font-mono text-base font-black text-[#659B5E] shrink-0">{item.precio}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>

              <button
                onClick={() => navigate('/menu')}
                className="w-full py-3 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 hover:border-[#659B5E] text-xs font-bold text-gray-200 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2"
              >
                <span>ORDENAR EN COMANDA</span>
                <ChevronRight className="w-4 h-4 text-[#659B5E]" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. UBICACIONES Y RESERVAS */}
      <section id="ubicaciones" className="py-24 px-6 bg-[#001812]/80 border-t border-[#659B5E]/30 scroll-mt-24 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#659B5E]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D16014]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">

          {/* Encabezado */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#659B5E]/20 border border-[#659B5E]/40 text-[#659B5E] text-[10px] font-black uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5" /> NUESTRAS SEDES
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase">Ubicaciones &amp; Contacto</h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
              Tres sedes estratégicas en la Gran Área Metropolitana. Seleccione una para ver su mapa en vivo, dirección exacta y contacto directo.
            </p>
          </div>

          {/* Pestañas de sede */}
          <div className="flex flex-wrap justify-center gap-3">
            {Object.keys(sedesInfo).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => { setActiveSedeMap(key); setMapError(false); }}
                className={`px-5 py-2.5 rounded-full border text-xs font-black tracking-widest transition-all cursor-pointer ${
                  activeSedeMap === key
                    ? 'bg-[#D16014] border-[#D16014] text-white shadow-[0_0_20px_rgba(209,96,20,0.4)]'
                    : 'bg-[#0A090C] border-[#F8FFE5]/15 text-gray-400 hover:text-white hover:border-[#659B5E]'
                }`}
              >
                <MapPin className="w-3 h-3 inline-block mr-1.5" />
                {key}
              </button>
            ))}
          </div>

          {/* Contenido de la sede seleccionada */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

            {/* Mapa OpenStreetMap */}
            <div className="bg-[#0A090C] border border-[#659B5E]/30 rounded-3xl overflow-hidden shadow-2xl relative" style={{minHeight: '400px'}}>
              <iframe
                key={activeSedeMap}
                title={`Mapa ${selectedSedeObj.nombre}`}
                src={getOsmUrl(selectedSedeObj)}
                className="w-full h-full border-0"
                style={{minHeight: '400px'}}
                loading="lazy"
                onError={() => setMapError(true)}
                allowFullScreen
              ></iframe>
              {/* Badge de sede sobre el mapa */}
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-[#001812]/90 border border-[#659B5E]/50 backdrop-blur-md">
                <span className="text-[10px] font-black text-[#659B5E] uppercase tracking-widest">{activeSedeMap}</span>
              </div>
              {/* Link externo */}
              <a
                href={`https://www.openstreetmap.org/?mlat=${selectedSedeObj.lat}&mlon=${selectedSedeObj.lng}#map=17/${selectedSedeObj.lat}/${selectedSedeObj.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-[#001812]/90 border border-[#659B5E]/40 text-[10px] font-bold text-gray-300 hover:text-white hover:border-[#659B5E] transition-all backdrop-blur-md"
              >
                VER EN MAPA COMPLETO ↗
              </a>
            </div>

            {/* Info de contacto */}
            <div className="space-y-4 flex flex-col justify-between">

              {/* Card info principal */}
              <div className="p-6 bg-[#0A090C] border border-[#659B5E]/30 rounded-3xl space-y-5 shadow-xl">
                <div>
                  <span className="text-[10px] font-black text-[#659B5E] uppercase tracking-widest">{selectedSedeObj.provincia}</span>
                  <h3 className="text-lg font-black text-white mt-1">{selectedSedeObj.nombre}</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#001812] border border-[#659B5E]/20">
                    <MapPin className="w-4 h-4 text-[#659B5E] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-[#659B5E] uppercase tracking-wider mb-0.5">Dirección</p>
                      <p className="text-xs text-gray-300">{selectedSedeObj.direccion}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#001812] border border-[#D16014]/20">
                    <Phone className="w-4 h-4 text-[#D16014] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-[#D16014] uppercase tracking-wider mb-0.5">Teléfono</p>
                      <a href={`tel:${selectedSedeObj.telefono.replace(/\s/g,'')}`} className="text-xs text-gray-300 hover:text-white transition-colors">{selectedSedeObj.telefono}</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#001812] border border-amber-400/20">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-0.5">Horario de Atención</p>
                      <p className="text-xs text-gray-300">{selectedSedeObj.horario}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción rápida */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${selectedSedeObj.whatsapp}?text=${encodeURIComponent('Hola, deseo hacer una reserva en la sede ' + activeSedeMap)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => reserve('General')}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#D16014] hover:bg-[#b8510f] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Reservar
                </button>
              </div>

              {/* Info general de contacto */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#659B5E]/10 to-[#D16014]/10 border border-[#659B5E]/20 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">LÍNEA GENERAL</p>
                <a href="tel:+50622008888" className="text-base font-black text-white hover:text-[#659B5E] transition-colors">+506 2200-8888</a>
                <p className="text-[10px] text-gray-500 mt-1">reservas@elcacique.cr</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EVENTOS Y CELEBRACIONES */}
      <section id="eventos" className="py-24 px-6 bg-[#001812]/90 border-t border-[#659B5E]/30 scroll-mt-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D16014]/5 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D16014]/20 border border-[#D16014]/40 text-[#D16014] text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> EXPERIENCIAS EXCLUSIVAS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase">Eventos &amp; Celebraciones</h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Espacios privados adaptados para reuniones corporativas, fiestas infantiles, bodas criollas y banquetes familiares con atención personalizada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Award className="w-8 h-8 text-[#D16014]" />,
                tipo: 'Eventos Corporativos',
                desc: 'Salones privados con capacidad hasta 80 personas, menú ejecutivo y servicio de catering personalizado para su empresa.',
                color: 'border-[#D16014]/40 hover:border-[#D16014]',
                badge: 'EMPRESAS'
              },
              {
                icon: <Sparkles className="w-8 h-8 text-amber-400" />,
                tipo: 'Cumpleaños y Aniversarios',
                desc: 'Decoración temática, torta artesanal incluida y menú especial de celebración para que su día sea memorable.',
                color: 'border-amber-400/40 hover:border-amber-400',
                badge: 'CELEBRACIONES'
              },
              {
                icon: <Flame className="w-8 h-8 text-[#659B5E]" />,
                tipo: 'Banquetes Criollos',
                desc: 'Buffet de chicharrones y platillos típicos cocinados al momento en nuestra paila de hierro fundido para grupos grandes.',
                color: 'border-[#659B5E]/40 hover:border-[#659B5E]',
                badge: 'TRADICIÓN'
              }
            ].map((ev, i) => (
              <div key={i} className={`p-7 rounded-3xl bg-[#0A090C] border ${ev.color} transition-all group space-y-4 flex flex-col`}>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{ev.badge}</span>
                <div>{ev.icon}</div>
                <h3 className="text-lg font-black text-white group-hover:text-[#D16014] transition-colors">{ev.tipo}</h3>
                <p className="text-xs text-gray-400 leading-relaxed flex-1">{ev.desc}</p>
                <button
                  type="button"
                  onClick={() => reserve('Eventos')}
                  className="w-full py-3 rounded-xl bg-[#001812] border border-[#659B5E]/30 hover:bg-[#D16014] hover:border-[#D16014] text-xs font-black text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" /> CONSULTAR DISPONIBILIDAD
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ESPECIALIDADES DE TEMPORADA */}
      <section id="temporada" className="py-24 px-6 border-t border-[#659B5E]/20 scroll-mt-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#659B5E]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D16014]/5 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto space-y-10 relative z-10">

          {/* Encabezado */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5" /> MENÚ DE TEMPORADA
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase">Especialidades de Temporada</h2>
          </div>

          {/* Contenido dinámico por temporada */}
          {temporada === 'navidad' && (
            <div className="space-y-8">
              <p className="text-center text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto">
                🎄 En esta temporada navideña y de fin de año, le presentamos platillos exclusivos inspirados en la tradición criolla festiva.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    nombre: 'Tamales de la Abuela',
                    desc: 'Masa de maíz rellena con cerdo adobado, arroz con zanahoria, chile dulce y aceituna. Envuelto en hoja de plátano y cocido a vapor al estilo tradicional.',
                    precio: '₡1,800 c/u',
                    tag: '🎄 NAVIDAD',
                    img: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=600&q=80'
                  },
                  {
                    nombre: 'Chicharrón de Fin de Año',
                    desc: 'Corte festivo extra crujiente con salsa agridulce de tamarindo y guarnición de patacones con natilla y chimichurri especial.',
                    precio: '₡8,500',
                    tag: '🥂 FIN DE AÑO',
                    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
                  },
                  {
                    nombre: 'Rompope Criollo del Cacique',
                    desc: 'Bebida festiva artesanal con aguardiente de caña envejecido, huevo criollo, leche de coco, canela y nuez moscada. Preparada en casa.',
                    precio: '₡2,200',
                    tag: '🎉 EXCLUSIVO',
                    img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80'
                  }
                ].map((item, i) => (
                  <div key={i} className="bg-[#001812] border border-amber-400/30 rounded-3xl overflow-hidden shadow-2xl group hover:border-amber-400 transition-all flex flex-col">
                    <div className="h-44 overflow-hidden relative">
                      <img src={item.img} alt={item.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#001812] via-transparent to-transparent"></div>
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-400 text-[#001812] text-[10px] font-black">{item.tag}</span>
                    </div>
                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-base text-white">{item.nombre}</h3>
                        <span className="font-mono text-sm font-black text-amber-400 shrink-0 ml-2">{item.precio}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed flex-1">{item.desc}</p>
                      <button
                        type="button"
                        onClick={() => navigate('/menu')}
                        className="w-full py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400 hover:text-[#001812] text-xs font-black text-amber-400 transition-all cursor-pointer"
                      >
                        VER EN MENÚ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {temporada === 'semana-santa' && (
            <div className="space-y-8">
              <p className="text-center text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto">
                ✝️ Durante Semana Santa, honramos la tradición costarricense con platillos especiales sin carne roja y bebidas artesanales de temporada.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    nombre: 'Ceviche de Camarones Criollo',
                    desc: 'Camarones frescos del Pacífico en limón ácido, culantro coyote, ají criollo y tomate. Acompañado de patacones tostados y tortillas palmeadas.',
                    precio: '₡7,200',
                    tag: '✝️ SEMANA SANTA',
                    img: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?auto=format&fit=crop&w=600&q=80'
                  },
                  {
                    nombre: 'Vigorón de Tilapia a la Plancha',
                    desc: 'Filete de tilapia fresca dorada sobre yuca suave al vapor, ensalada agria de col morada con naranja agria y miel de achiote.',
                    precio: '₡8,800',
                    tag: '🐟 ESPECIAL',
                    img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80'
                  },
                  {
                    nombre: 'Fresco de Chan con Linaza',
                    desc: 'Bebida tradicional costarricense de Semana Santa: agua de chan con semillas de linaza, jugo de limón, azúcar de tapa y hojas de hierbabuena fresca.',
                    precio: '₡1,500',
                    tag: '🌿 ARTESANAL',
                    img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
                  }
                ].map((item, i) => (
                  <div key={i} className="bg-[#001812] border border-[#659B5E]/40 rounded-3xl overflow-hidden shadow-2xl group hover:border-[#659B5E] transition-all flex flex-col">
                    <div className="h-44 overflow-hidden relative">
                      <img src={item.img} alt={item.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#001812] via-transparent to-transparent"></div>
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#659B5E] text-white text-[10px] font-black">{item.tag}</span>
                    </div>
                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-base text-white">{item.nombre}</h3>
                        <span className="font-mono text-sm font-black text-[#659B5E] shrink-0 ml-2">{item.precio}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed flex-1">{item.desc}</p>
                      <button
                        type="button"
                        onClick={() => navigate('/menu')}
                        className="w-full py-2.5 rounded-xl bg-[#659B5E]/10 border border-[#659B5E]/30 hover:bg-[#659B5E] text-xs font-black text-[#659B5E] hover:text-white transition-all cursor-pointer"
                      >
                        VER EN MENÚ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!temporada && (
            <div className="text-center py-16 space-y-5">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#001812] border border-[#659B5E]/30 flex items-center justify-center">
                <Utensils className="w-8 h-8 text-[#659B5E]/50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-gray-400">Sin especialidades de temporada por el momento</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Nuestras especialidades de temporada están disponibles en <strong className="text-gray-400">Diciembre &amp; Enero</strong> (temporada festiva) y durante <strong className="text-gray-400">Semana Santa</strong>. Vuelva en esas fechas para descubrir nuestros platillos exclusivos.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <span className="px-4 py-2 rounded-full bg-[#001812] border border-amber-400/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">🎄 Diciembre – Enero</span>
                <span className="px-4 py-2 rounded-full bg-[#001812] border border-[#659B5E]/30 text-[#659B5E] text-[10px] font-black uppercase tracking-wider">✝️ Semana Santa</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#001812] border border-[#659B5E]/40 hover:border-[#659B5E] text-xs font-black text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-[#659B5E]" /> VER MENÚ COMPLETO
              </button>
            </div>
          )}
        </div>

      </section>

      {/* MODAL DE RESERVA */}
      {isReservationOpen && (
        <ReservationModal
          isOpen={isReservationOpen}
          onClose={() => setIsReservationOpen(false)}
          initialEventType={reservationType}
          onSuccess={(message) => setToast({ show: true, message, type: 'success' })}
        />
      )}

    </div>
  );
}
