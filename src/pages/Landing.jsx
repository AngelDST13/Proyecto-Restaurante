import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useAutoLogout } from '../hooks/useAutoLogout';
import { 
  Utensils, Calendar, MapPin, Clock, Phone, 
  Flame, ChevronRight, ChevronLeft, Award, ShieldCheck, Sparkles,
  AlertTriangle, Ghost, Snowflake, PartyPopper
} from 'lucide-react';
import caciqueIcon from '../assets/img/Cacique.svg';

export default function Landing() {
  const navigate = useNavigate();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationType, setReservationType] = useState('General');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [activeSedeMap, setActiveSedeMap] = useState('ESCAZÚ');

  const { showWarning, resetTimer } = useAutoLogout();

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

  const getTemporada = () => {
    const now = new Date();
    const month = now.getMonth() + 1;

    if (month === 12 || month === 1) return 'navidad';

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
    'ESCAZÚ': {
      nombre: 'SEDE ESCAZÚ • CENTRO CULINARIO',
      provincia: 'SAN JOSÉ',
      direccion: '100m Oeste de Multiplaza Escazú, San José',
      telefono: '+506 2200-8888',
      whatsapp: '50622008888',
      horario: 'Lunes a Domingo: 11:30 AM - 11:00 PM',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.982361833501!2d-84.15243892419793!3d9.935402974136453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa00344d51bb413%3A0xb3ff7f68c3ef9efd!2sMultiplaza%20Escaz%C3%BA!5e0!3m2!1ses!2scr!4v1710000000000!5m2!1ses!2scr'
    },
    'SANTA ANA': {
      nombre: 'SEDE SANTA ANA • PLAZA REAL',
      provincia: 'SAN JOSÉ',
      direccion: 'Plaza Real Santa Ana, Contiguo a la Ruta 27',
      telefono: '+506 2200-8889',
      whatsapp: '50622008889',
      horario: 'Lunes a Domingo: 11:00 AM - 10:00 PM',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.948212345!2d-84.18021!3d9.93123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa004123456789%3A0x123456789!2sSanta%20Ana%20Town%20Center!5e0!3m2!1ses!2scr!4v1710000000000!5m2!1ses!2scr'
    },
    'CARTAGO': {
      nombre: 'SEDE CARTAGO • PASO ANCHO',
      provincia: 'CARTAGO',
      direccion: 'Paso Ancho de Cartago, 200m Sur de la Basílica',
      telefono: '+506 2500-1122',
      whatsapp: '50625001122',
      horario: 'Lunes a Domingo: 11:30 AM - 10:30 PM',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.500000000!2d-83.916667!3d9.866667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0dfffffffffff%3A0x0!2sCartago%20Bas%C3%ADlica!5e0!3m2!1ses!2scr!4v1710000000000!5m2!1ses!2scr'
    },
    'HEREDIA': {
      nombre: 'SEDE HEREDIA • VÍA CENTRAL',
      provincia: 'HEREDIA',
      direccion: 'Paseo de las Flores, Heredia Centro',
      telefono: '+506 2260-3344',
      whatsapp: '50622603344',
      horario: 'Lunes a Domingo: 11:30 AM - 11:00 PM',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.100000000!2d-84.116667!3d10.000000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0faaaaaaaaaaa%3A0x0!2sPaseo%20de%20las%20Flores!5e0!3m2!1ses!2scr!4v1710000000000!5m2!1ses!2scr'
    }
  };

  const selectedSedeObj = sedesInfo[activeSedeMap] || sedesInfo['ESCAZÚ'];

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
      
      <Navbar onOpenReservation={() => setIsReservationOpen(true)} />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

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

        <button 
          type="button"
          onClick={prevSlide}
          className="absolute left-4 z-20 p-3 rounded-full bg-black/40 hover:bg-[#D16014] text-white backdrop-blur-md transition-all hidden sm:block cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button 
          type="button"
          onClick={nextSlide}
          className="absolute right-4 z-20 p-3 rounded-full bg-black/40 hover:bg-[#D16014] text-white backdrop-blur-md transition-all hidden sm:block cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
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

          <div className="relative flex flex-col items-center justify-center p-8 text-center">
            <div className="relative group flex items-center justify-center">
              <div className="absolute inset-0 bg-[#D16014]/20 rounded-full blur-3xl transform group-hover:scale-125 transition-transform duration-500"></div>
              <img 
                src={caciqueIcon} 
                alt="Isotipo El Cacique" 
                className="w-72 h-72 sm:w-96 sm:h-96 object-contain relative z-10 filter drop-shadow-[0_0_35px_rgba(209,96,20,0.7)] group-hover:scale-105 transition-transform duration-500" 
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

      {/* 4. UBICACIONES Y GOOGLE MAPS */}
      <section id="ubicaciones" className="py-24 px-6 bg-[#001812]/60 border-t border-[#659B5E]/20 scroll-mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black text-[#659B5E] uppercase tracking-widest">PRESENCIA NACIONAL</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase">Nuestras Chicharroneras</h2>
              <p className="text-xs text-gray-400">Seleccione su sede provincial para revisar ubicación, teléfono y horarios de atención en vivo.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.keys(sedesInfo).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSedeMap(key)}
                  className={`p-4 rounded-2xl border text-xs font-black tracking-wider transition-all cursor-pointer text-left ${
                    activeSedeMap === key
                      ? 'bg-[#D16014] border-[#D16014] text-white shadow-lg'
                      : 'bg-[#0A090C] border-[#F8FFE5]/15 text-gray-400 hover:text-white hover:border-[#659B5E]'
                  }`}
                >
                  <MapPin className="w-4 h-4 inline-block mr-2 text-white" />
                  <span>{key}</span>
                </button>
              ))}
            </div>

            <div className="p-6 bg-[#001812] border border-[#659B5E]/30 rounded-2xl space-y-3 font-mono text-xs shadow-xl">
              <h4 className="font-sans font-black text-base text-white">{selectedSedeObj.nombre}</h4>
              <p className="text-gray-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#659B5E] shrink-0" />
                <span>{selectedSedeObj.direccion}</span>
              </p>
              <p className="text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D16014] shrink-0" />
                <span>{selectedSedeObj.telefono}</span>
              </p>
              <p className="text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{selectedSedeObj.horario}</span>
              </p>
            </div>
          </div>

          <div className="bg-[#0A090C] border border-[#659B5E]/30 rounded-3xl h-96 overflow-hidden relative shadow-2xl">
            <iframe
              title={`Google Map ${selectedSedeObj.nombre}`}
              src={selectedSedeObj.mapUrl}
              className="w-full h-full border-0 filter grayscale contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              loading="lazy"
              allowFullScreen=""
            ></iframe>
          </div>

        </div>
      </section>

      {/* 5. EVENTOS Y CELEBRACIONES */}
      <section id="eventos" className="py-24 px-6 bg-[#001812] border-t border-[#659B5E]/30 scroll-mt-24">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-black text-[#D16014] uppercase tracking-widest">TEMPORADAS Y FESTIVIDADES</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase">Especialidades &amp; Eventos de Temporada</h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto">
              Sedes seleccionadas ofrecerán menús temáticos y experiencias culinarias únicas durante las principales celebraciones del año.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* HALLOWEEN */}
            <div className="bg-[#0A090C] border border-purple-500/40 rounded-3xl p-6 space-y-4 hover:border-purple-400 transition-all flex flex-col justify-between shadow-2xl group">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full bg-purple-900/60 text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-500/30">
                    OCTUBRE 31
                  </span>
                  <Ghost className="w-6 h-6 text-purple-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors">
                  Noche Criolla de Agüizotes
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Chifrijos embrujados con salsa de chile picante artesanal, coctelería temática de mora salvaje y música en vivo.
                </p>
                <div className="pt-2 text-[11px] font-mono text-[#659B5E] font-bold">
                  📍 SUCURSALES: ESCAZÚ &amp; SANTA ANA
                </div>
              </div>
              <button
                type="button"
                onClick={() => reserve('Eventos')}
                className="w-full py-3 rounded-xl bg-purple-950/60 border border-purple-500/50 hover:bg-purple-800 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>AGENDAR AGÜIZOTES</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* DICIEMBRE */}
            <div className="bg-[#0A090C] border border-amber-500/40 rounded-3xl p-6 space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between shadow-2xl group">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full bg-amber-900/60 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                    DICIEMBRE &amp; ENE
                  </span>
                  <Snowflake className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                  Banquete Navideño de Paila
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Pierna de cerdo ahumada a la leña con miel de leña de café, tamales criollos tradicionales y rompope artesanal.
                </p>
                <div className="pt-2 text-[11px] font-mono text-[#659B5E] font-bold">
                  📍 SUCURSALES: TODAS LAS SEDES (4)
                </div>
              </div>
              <button
                type="button"
                onClick={() => reserve('Eventos')}
                className="w-full py-3 rounded-xl bg-amber-950/60 border border-amber-500/50 hover:bg-amber-600 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>RESERVAR FIN DE AÑO</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* SEMANA SANTA */}
            <div className="bg-[#0A090C] border border-[#659B5E]/40 rounded-3xl p-6 space-y-4 hover:border-[#659B5E] transition-all flex flex-col justify-between shadow-2xl group">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full bg-[#001812] text-[#659B5E] text-[10px] font-black uppercase tracking-wider border border-[#659B5E]/30">
                    MARZO / ABRIL
                  </span>
                  <PartyPopper className="w-6 h-6 text-[#659B5E]" />
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-[#659B5E] transition-colors">
                  Feria Mar y Paila
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Ceviches costarricenses de corvina, sopas de mariscos a la leña, empanadas de chinchirrria y postres de chiverre.
                </p>
                <div className="pt-2 text-[11px] font-mono text-[#659B5E] font-bold">
                  📍 SUCURSALES: CARTAGO &amp; HEREDIA
                </div>
              </div>
              <button
                type="button"
                onClick={() => reserve('Eventos')}
                className="w-full py-3 rounded-xl bg-[#001812] border border-[#659B5E]/50 hover:bg-[#659B5E] text-xs font-bold text-[#F8FFE5] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>RESERVAR MESA</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 6. ESPECIALIDADES DE TEMPORADA (DINÁMICO POR FECHA) */}
      <section id="temporada" className="py-24 px-6 border-t border-[#659B5E]/20 scroll-mt-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-10 relative z-10">

          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5" /> MENÚ DE TEMPORADA
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase">Especialidades de Temporada</h2>
          </div>

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
            <div className="space-y-8 animate-fade-in">
              <div className="p-8 rounded-3xl bg-gradient-to-r from-[#001812] via-[#0A090C] to-[#001812] border border-[#659B5E]/30 text-center space-y-4 max-w-3xl mx-auto shadow-2xl">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#D16014]/20 border border-[#D16014]/50 flex items-center justify-center animate-bounce">
                  <Flame className="w-8 h-8 text-[#D16014]" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">Especialidades de Temporada Próximamente</h3>
                <p className="text-xs text-gray-300 leading-relaxed max-w-lg mx-auto">
                  Nuestras especialidades exclusivas se activan en fechas festivas como <strong className="text-amber-400">Navidad &amp; Fin de Año</strong> y <strong className="text-[#659B5E]">Semana Santa</strong>. Mientras tanto, disfrute de nuestros platillos estrella de paila en el menú general.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <article className="p-6 rounded-2xl bg-[#001812] border border-amber-400/30 space-y-3 hover:border-amber-400 hover:-translate-y-1 transition-all group">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">PRÓXIMA TEMPORADA</span>
                    <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-[10px] font-bold">DICIEMBRE</span>
                  </div>
                  <h4 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">Banquete Navideño &amp; Tamales Criollos</h4>
                  <p className="text-xs text-gray-400">Pierna de cerdo ahumada a la leña con miel de café, tamales de la abuela y rompope artesanal.</p>
                  <button type="button" onClick={() => navigate('/menu')} className="inline-flex items-center gap-2 pt-2 text-xs font-black text-amber-400 hover:text-white transition-colors cursor-pointer">
                    <Calendar className="w-4 h-4" /> PRE-ORDENAR CON ANTICIPACIÓN <ChevronRight className="w-4 h-4" />
                  </button>
                </article>
                <article className="p-6 rounded-2xl bg-[#001812] border border-[#659B5E]/30 space-y-3 hover:border-[#659B5E] hover:-translate-y-1 transition-all group">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[10px] font-black text-[#659B5E] uppercase tracking-widest">TEMPORADA SANTA</span>
                    <span className="px-3 py-1 rounded-full bg-[#659B5E]/10 text-[#659B5E] text-[10px] font-bold">MARZO / ABRIL</span>
                  </div>
                  <h4 className="text-base font-black text-white group-hover:text-[#659B5E] transition-colors">Feria Mar &amp; Paila</h4>
                  <p className="text-xs text-gray-400">Ceviches de corvina del Pacífico, sopa de mariscos a la leña y fresco artesanal de chan.</p>
                  <button type="button" onClick={() => navigate('/menu')} className="inline-flex items-center gap-2 pt-2 text-xs font-black text-[#659B5E] hover:text-white transition-colors cursor-pointer">
                    <Utensils className="w-4 h-4" /> EXPLORAR MENÚ PERMANENTE <ChevronRight className="w-4 h-4" />
                  </button>
                </article>
              </div>
            </div>
          )}
        </div>

      </section>

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
