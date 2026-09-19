import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, Utensils, ShieldCheck, Award, Clock, MapPin, 
  Calendar, ChevronLeft, ChevronRight, Sparkles, Phone, ArrowRight 
} from 'lucide-react';
import { getWeatherByLocation } from '../services/weatherService';
import logoNegro from '../assets/img/LogoN.svg';

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedSede, setSelectedSede] = useState('escazu');

  const slides = [
    {
      titulo: 'SABOR CRIOLLO A LA LEÑA',
      subtitulo: 'Chicharroneras en paila tradicional, tortillas palmeadas al momento y cortes a la leña de café.',
      tag: 'ESPECIALIDAD DE LA CASA',
      bgImg: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1600'
    },
    {
      titulo: 'TRADICIÓN & FUEGO CULINARIO',
      subtitulo: 'Chicharrones crujientes de la purita paila, ceviches arreglados y cervezas heladas.',
      tag: 'RECETAS ANCESTRALES',
      bgImg: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1600'
    }
  ];

  useEffect(() => {
    getWeatherByLocation(selectedSede).then(res => setWeatherData(res));
  }, [selectedSede]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="bg-[#0A090C] text-[#F8FFE5] min-h-screen font-sans selection:bg-[#D16014] selection:text-white">
      
      {/* 1. HERO SLIDER */}
      <section className="relative h-[85vh] min-h-[550px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
          style={{ backgroundImage: `url(${slides[currentSlide].bgImg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A090C] via-[#0A090C]/70 to-[#0A090C]/40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-6 pt-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D16014]/20 border border-[#D16014]/50 text-[#D16014] text-xs font-black tracking-widest uppercase animate-pulse">
            <Flame className="w-4 h-4" /> {slides[currentSlide].tag}
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#F8FFE5] tracking-tight uppercase leading-none drop-shadow-2xl">
            {slides[currentSlide].titulo}
          </h1>

          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
            {slides[currentSlide].subtitulo}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link 
              to="/menu" 
              className="px-8 py-4 rounded-2xl bg-[#D16014] hover:bg-[#b8510f] text-white font-extrabold text-sm transition-all shadow-xl shadow-[#D16014]/30 flex items-center gap-2 hover:scale-105"
            >
              <Utensils className="w-5 h-5" /> Ver Menú Digital
            </Link>
            <a 
              href="#eventos" 
              className="px-8 py-4 rounded-2xl bg-[#00241B] hover:bg-[#00382b] text-[#F8FFE5] font-extrabold text-sm border border-[#659B5E]/40 transition-all flex items-center gap-2"
            >
              <Calendar className="w-5 h-5 text-[#659B5E]" /> Agendar Reserva
            </a>
          </div>
        </div>

        {/* CONTROLES DEL CAROUSEL */}
        <button 
          onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-6 z-20 p-3 rounded-full bg-[#0A090C]/60 hover:bg-[#D16014] text-white border border-white/10 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
          className="absolute right-6 z-20 p-3 rounded-full bg-[#0A090C]/60 hover:bg-[#D16014] text-white border border-white/10 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </section>

      {/* 2. SECCIÓN SOBRE NOSOTROS (CON EL LOGO EN GRAN TAMAÑO) */}
      <section id="nosotros" className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#0A090C] via-[#050507] to-[#0A090C]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-black text-[#659B5E] tracking-widest uppercase bg-[#659B5E]/10 px-4 py-1.5 rounded-full border border-[#659B5E]/30 inline-block">
              Nuestra Identidad Culinaria
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F8FFE5] tracking-tight">
              SOBRE NOSOTROS
            </h2>
            <div className="w-24 h-1 bg-[#D16014] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* TARJETA DEL LOGO EN GRAN TAMAÑO CON LUZ AMBIENTAL */}
            <div className="lg:col-span-5 relative group flex justify-center">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#D16014]/30 to-[#659B5E]/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              
              <div className="relative w-full max-w-md bg-[#001812]/90 border border-[#659B5E]/30 rounded-3xl p-10 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center space-y-6">
                
                {/* LOGO EN FORMATO GRANDE */}
                <div className="p-6 rounded-2xl bg-[#0A090C] border border-[#F8FFE5]/10 shadow-inner w-full flex items-center justify-center">
                  <img 
                    src={logoNegro} 
                    alt="Logo Oficial Chicharronera El Cacique" 
                    className="h-44 sm:h-52 w-auto object-contain filter drop-shadow-[0_10px_20px_rgba(209,96,20,0.3)] transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-[#F8FFE5]">Chicharronera El Cacique</h3>
                  <span className="text-xs text-[#659B5E] font-extrabold uppercase tracking-widest block mt-1">
                    Sello de Calidad Tradicional desde 1998
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full pt-4 border-t border-[#F8FFE5]/10 text-center text-xs">
                  <div>
                    <span className="block font-black text-[#D16014] text-lg">100%</span>
                    <span className="text-[10px] text-gray-400 font-bold">Criollo</span>
                  </div>
                  <div>
                    <span className="block font-black text-[#659B5E] text-lg">4</span>
                    <span className="text-[10px] text-gray-400 font-bold">Sedes</span>
                  </div>
                  <div>
                    <span className="block font-black text-amber-400 text-lg">Paila</span>
                    <span className="text-[10px] text-gray-400 font-bold">Artesanal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HISTORIA Y VALORES */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-black text-[#F8FFE5] leading-tight">
                  Más de dos décadas perfeccionando el arte del chicharron criollo y la paila artesanal.
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  En <strong className="text-[#F8FFE5]">Chicharronera El Cacique</strong> combinamos el sabor único del chicharrón de concha y carne dorados a fuego vivo con la eficiencia de un sistema de gestión digital en tiempo real.
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Nuestras recetas se elaboran diariamente utilizando sazones naturales, tortillas palmeadas a mano y cortes seleccionados de cerdo costarricense, garantizando frescura y sabor en cada comanda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#001812] border border-[#659B5E]/20 space-y-2">
                  <div className="flex items-center gap-2 text-[#D16014] font-bold text-sm">
                    <Award className="w-5 h-5" />
                    <span>Receta Ancestral</span>
                  </div>
                  <p className="text-xs text-gray-400">Cocción lenta en paila de hierro con leña seleccionada.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#001812] border border-[#659B5E]/20 space-y-2">
                  <div className="flex items-center gap-2 text-[#659B5E] font-bold text-sm">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Insumos Frescos</span>
                  </div>
                  <p className="text-xs text-gray-400">Verduras y carnes abastecidas diariamente por productores locales.</p>
                </div>
              </div>

              <div className="pt-4">
                <Link 
                  to="/menu" 
                  className="inline-flex items-center gap-2 text-xs font-black text-[#D16014] hover:text-white transition-colors uppercase tracking-wider group"
                >
                  Explorar nuestro menú completo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. SECCIÓN CLIMA & LOCALIZACIÓN DE SEDES */}
      <section className="py-16 px-6 bg-[#001812]/50 border-y border-[#659B5E]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-black text-[#D16014] uppercase tracking-wider">Ubicación &amp; Ambiente</span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#F8FFE5]">Consulta el clima de tu sede preferida</h3>
            
            <div className="space-y-3 pt-2">
              <label className="block text-xs text-gray-400 font-bold uppercase">Selecciona la Sede:</label>
              <select 
                value={selectedSede} 
                onChange={e => setSelectedSede(e.target.value)}
                className="w-full bg-[#0A090C] border border-[#659B5E]/40 rounded-xl px-4 py-2.5 text-xs text-[#F8FFE5] font-bold focus:outline-none"
              >
                <option value="escazu">Sede Escazú • Centro Culinario</option>
                <option value="santa_ana">Sede Santa Ana • Plaza Real</option>
                <option value="cartago">Sede Cartago • Paso Ancho</option>
                <option value="heredia">Sede Heredia • Vía Central</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A090C] border border-[#F8FFE5]/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">Temperatura Actual:</span>
                <span className="text-xl font-black text-[#659B5E]">{weatherData ? `${weatherData.temp}°C` : 'Cargando...'}</span>
              </div>
              <p className="text-[11px] text-gray-400">
                {weatherData && weatherData.temp > 22 
                  ? '☀️ Excelente clima para disfrutar en la Terraza.' 
                  : '🌤️ Recomendado disfrutar en el Salón Principal.'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-[#F8FFE5]/10 shadow-2xl h-80">
            <iframe 
              title="Mapa de Sede Escazu"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.012345!2d-84.14!3d9.93!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e30000000000%3A0x0!2sEscaz%C3%BA!5e0!3m2!1ses!2scr!4v1600000000000!5m2!1ses!2scr" 
              className="w-full h-full border-0 filter grayscale invert contrast-125 opacity-80"
              allowFullScreen="" 
              loading="lazy"
            />
          </div>

        </div>
      </section>

      {/* 4. EVENTOS ESPECIALES */}
      <section id="eventos" className="py-20 px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Reservaciones</span>
          <h2 className="text-3xl font-black text-[#F8FFE5]">EVENTOS Y CELEBRACIONES</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#001812] border border-[#659B5E]/30 space-y-3">
            <Sparkles className="w-6 h-6 text-[#D16014]" />
            <h3 className="font-extrabold text-lg text-[#F8FFE5]">Fiestas Empresariales</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Parrilladas ejecutivas y reservaciones de salón completo con menú personalizado.</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#001812] border border-[#659B5E]/30 space-y-3">
            <Utensils className="w-6 h-6 text-[#659B5E]" />
            <h3 className="font-extrabold text-lg text-[#F8FFE5]">Cumpleaños &amp; Familias</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Atención preferencial para grupos grandes con combos familiares y refrescos naturales.</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#001812] border border-[#659B5E]/30 space-y-3">
            <Phone className="w-6 h-6 text-amber-500" />
            <h3 className="font-extrabold text-lg text-[#F8FFE5]">Cotizaciones Express</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Contáctanos vía central telefónica al +506 2200-8888 o por nuestro WhatsApp Oficial.</p>
          </div>
        </div>
      </section>

    </div>
  );
}