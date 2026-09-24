import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import Toast from '../components/Toast';
import { 
  Utensils, Calendar, MapPin, Clock, Phone, 
  Flame, ChevronRight, ChevronLeft, Award, ShieldCheck, Sparkles, AlertCircle 
} from 'lucide-react';
import logoBlanco from '../assets/img/LogoB.svg';

export default function Landing() {
  const navigate = useNavigate();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationType, setReservationType] = useState('General');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [mapError, setMapError] = useState(false);
  const [activeSedeMap, setActiveSedeMap] = useState('ESCAZÚ');

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
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  const reserve = (type = 'General') => {
    setReservationType(type);
    setIsReservationOpen(true);
  };

  const sedesInfo = {
    'ESCAZÚ': {
      nombre: 'SEDE ESCAZÚ • CENTRO CULINARIO',
      provincia: 'SAN JOSÉ',
      direccion: '100m Oeste de Multiplaza Escazú, San José',
      telefono: '+506 2200-8888',
      horario: 'Lunes a Domingo: 11:30 AM - 11:00 PM',
      mapUrl: 'https://maps.google.com/maps?q=Multiplaza%20Escazu&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    'SANTA ANA': {
      nombre: 'SEDE SANTA ANA • PLAZA REAL',
      provincia: 'SAN JOSÉ',
      direccion: 'Plaza Real Santa Ana, Contiguo a la Ruta 27',
      telefono: '+506 2200-8889',
      horario: 'Lunes a Domingo: 11:00 AM - 10:00 PM',
      mapUrl: 'https://maps.google.com/maps?q=Santa%20Ana%20Town%20Center&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    'CARTAGO': {
      nombre: 'SEDE CARTAGO • PASO ANCHO',
      provincia: 'CARTAGO',
      direccion: 'Paso Ancho de Cartago, 200m Sur de la Basílica',
      telefono: '+506 2500-1122',
      horario: 'Lunes a Domingo: 11:30 AM - 10:30 PM',
      mapUrl: 'https://maps.google.com/maps?q=Cartago%20Costa%20Rica&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    'HEREDIA': {
      nombre: 'SEDE HEREDIA • VÍA CENTRAL',
      provincia: 'HEREDIA',
      direccion: 'Paseo de las Flores, Heredia Centro',
      telefono: '+506 2260-3344',
      horario: 'Lunes a Domingo: 11:30 AM - 11:00 PM',
      mapUrl: 'https://maps.google.com/maps?q=Heredia%20Costa%20Rica&t=&z=15&ie=UTF8&iwloc=&output=embed'
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
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] font-sans selection:bg-[#D16014] selection:text-white">
      
      {/* NOTIFICACIÓN TOAST */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* 1. HERO SECTION CON CARRUSEL ANIMADO */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
        
        {/* SLIDER DE FONDO CON FADE */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={img} 
                alt="Chicharrón de Paila El Cacique" 
                className="w-full h-full object-cover object-center scale-105 filter brightness-50 contrast-125"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A090C] via-[#0A090C]/60 to-[#0A090C]/30"></div>
        </div>

        {/* CONTROLES DE CARRUSEL */}
        <button 
          type="button"
          onClick={prevSlide}
          aria-label="Slide anterior"
          className="absolute left-4 z-20 p-3 rounded-full bg-black/40 hover:bg-[#D16014] text-white backdrop-blur-md transition-colors hidden sm:block cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button 
          type="button"
          onClick={nextSlide}
          aria-label="Slide siguiente"
          className="absolute right-4 z-20 p-3 rounded-full bg-black/40 hover:bg-[#D16014] text-white backdrop-blur-md transition-colors hidden sm:block cursor-pointer"
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

        {/* CONTENIDO HERO */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#001812]/80 border border-[#659B5E]/50 text-[#659B5E] text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-2xl">
            <Flame className="w-4 h-4 text-[#D16014]" />
            <span>CHICHARRONERA GOURMET • COSTA RICA</span>
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
              className="px-8 py-4 rounded-2xl bg-[#D16014] hover:bg-[#b8510f] text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#D16014]/20 flex items-center gap-3 cursor-pointer group"
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

      {/* 2. SECCIÓN NOSOTROS - LOGO BLANCO LIMPIO Y ESLOGAN IMPACTANTE */}
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

            {/* ESLOGAN / LEMA GASTRONÓMICO DESTACADO */}
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

          {/* MUESTRA PROTAGÓNICA DEL LOGO BLANCO */}
          <div className="relative flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="relative group flex items-center justify-center">
              <div className="absolute inset-0 bg-[#D16014]/25 rounded-full blur-3xl transform group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>
              <img 
                src={logoBlanco} 
                alt="Logo El Cacique" 
                className="w-72 h-72 sm:w-96 sm:h-96 object-contain relative z-10 filter drop-shadow-[0_0_40px_rgba(209,96,20,0.7)] group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
          </div>

        </div>
      </section>

      {/* 3. LOS 3 PLATILLOS PRINCIPALES CON FOTOGRAFÍAS */}
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

      {/* 4. PRESENCIA NACIONAL */}
      <section className="py-24 px-6 bg-[#001812]/60 border-t border-[#659B5E]/20">
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
                  onClick={() => {
                    setActiveSedeMap(key);
                    setMapError(false);
                  }}
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

          <div className="bg-[#0A090C] border border-[#659B5E]/30 rounded-3xl h-96 overflow-hidden relative shadow-2xl flex items-center justify-center">
            {mapError ? (
              <div className="p-8 text-center space-y-3 text-xs text-gray-400">
                <AlertCircle className="w-8 h-8 text-[#D16014] mx-auto animate-pulse" />
                <p className="font-bold text-white">Mapa en vivo no disponible temporalmente.</p>
                <p className="text-[11px] font-mono">{selectedSedeObj.direccion}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(selectedSedeObj.nombre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-[#659B5E] text-white font-bold rounded-xl text-xs hover:bg-[#52824c]"
                >
                  ABRIR EN GOOGLE MAPS
                </a>
              </div>
            ) : (
              <iframe
                title={`Mapa ${selectedSedeObj.nombre}`}
                src={selectedSedeObj.mapUrl}
                className="w-full h-full border-0 filter grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                loading="lazy"
                onError={() => setMapError(true)}
              ></iframe>
            )}
          </div>

        </div>
      </section>

      {/* 5. EVENTOS Y CELEBRACIONES */}
      <section id="eventos" className="py-24 px-6 text-center space-y-6 max-w-4xl mx-auto scroll-mt-24">
        <span className="text-xs font-black text-[#D16014] uppercase tracking-widest">RESERVACIONES</span>
        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase">Eventos y Celebraciones</h2>
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
          Celebre sus cumpleaños, reuniones de empresa o banquetes familiares en nuestras instalaciones. Reserve con anticipación para garantizar su espacio.
        </p>
        <button
          onClick={() => reserve('Eventos')}
          className="px-8 py-4 rounded-2xl bg-[#659B5E] hover:bg-[#52824c] text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer"
        >
          SOLICITAR RESERVA EN VIVO
        </button>
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
