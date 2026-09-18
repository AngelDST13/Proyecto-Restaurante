import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeatherByLocation } from '../services/weatherService';
import { 
  Utensils, Calendar, ChevronRight, ChevronLeft, Flame, Share2, 
  Award, ShieldCheck, Clock, MapPin, Phone, Star, CloudSun 
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [activeSedeKey, setActiveSedeKey] = useState('escazu');
  const [sedeWeather, setSedeWeather] = useState(null);

  // COORDENADAS Y URLS DE EMBED GOOGLE MAPS PARA LAS SEDES DE EL CACIQUE
  const sedesMap = {
    escazu: {
      nombre: 'Sede Escazú • Centro Culinario',
      direccion: 'San José, Escazú Centro, Costa Rica',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.982390238495!2d-84.1420!3d9.9304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e3639a0937a7%3A0x8ad970d4f3e6e87d!2sEscaz%C3%BA%2C%20San%20Jos%C3%A9!5e0!3m2!1ses!2scr!4v1700000000000!5m2!1ses!2scr'
    },
    santa_ana: {
      nombre: 'Sede Santa Ana • Plaza Real',
      direccion: 'San José, Santa Ana, Costa Rica',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.9542103849!2d-84.1826!3d9.9326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e3020b6d5f7b%3A0x4386bf6beecf5fa8!2sSanta%20Ana%2C%20San%20Jos%C3%A9!5e0!3m2!1ses!2scr!4v1700000000000!5m2!1ses!2scr'
    },
    cartago: {
      nombre: 'Sede Cartago • Paso Ancho',
      direccion: 'Cartago Centro, Costa Rica',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.6842103849!2d-83.9162!3d9.8638!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e1815db4bfbd%3A0x9d11fa84c3043813!2sCartago!5e0!3m2!1ses!2scr!4v1700000000000!5m2!1ses!2scr'
    },
    heredia: {
      nombre: 'Sede Heredia • Vía Central',
      direccion: 'Heredia Centro, Costa Rica',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.2842103849!2d-84.1169!3d9.9984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e3b97b0937a7%3A0x6b9070d4f3e6e87d!2sHeredia!5e0!3m2!1ses!2scr!4v1700000000000!5m2!1ses!2scr'
    }
  };

  // Consultar clima en tiempo real según la sede seleccionada
  useEffect(() => {
    getWeatherByLocation(activeSedeKey).then(res => setSedeWeather(res));
  }, [activeSedeKey]);

  const heroSlides = [
    {
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947',
      tag: 'Tradición & Fuego Culinario',
      title: 'Chicharronera El Cacique',
      sub: 'Chicharrones crujientes de la purita paila, ceviches arreglados y cortes a la leña con el auténtico sabor costarricense.'
    },
    {
      url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
      tag: 'Especialidad de la Casa',
      title: 'Sabor Criollo a la Leña',
      sub: 'Ingredientes seleccionados, tortillas palmeadas al momento y recetas tradicionales criollas de nuestros abuelos.'
    },
    {
      url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b',
      tag: 'Maridaje & Coctelería',
      title: 'Cervezas Artesanales & Tragos de Autor',
      sub: 'La combinación perfecta para acompañar tu surtido de chicharrones con limón mesino fresco y pico de gallo.'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);

  return (
    <div className="bg-[#0A090C] text-[#F8FFE5] overflow-x-hidden font-sans">
      
      {/* 1. HERO SLIDER */}
      <section className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={slide.url}
              alt={slide.title}
              className="w-full h-full object-cover filter brightness-[0.35] contrast-105"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0A090C] via-[#0A090C]/50 to-transparent"></div>

        <button
          onClick={prevSlide}
          className="absolute left-4 z-20 p-3 rounded-full bg-[#00241B]/70 backdrop-blur-md border border-[#F8FFE5]/15 text-[#F8FFE5] hover:bg-[#D16014] transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 z-20 p-3 rounded-full bg-[#00241B]/70 backdrop-blur-md border border-[#F8FFE5]/15 text-[#F8FFE5] hover:bg-[#D16014] transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-6 mt-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00241B]/90 backdrop-blur-md border border-[#659B5E]/50 text-[#659B5E] text-xs font-bold uppercase tracking-widest shadow-lg">
            <Flame className="w-4 h-4 text-[#D16014]" />
            <span>{heroSlides[currentSlide].tag}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F8FFE5] tracking-tight leading-none uppercase drop-shadow-md">
            {heroSlides[currentSlide].title}
          </h1>

          <p className="text-base sm:text-lg text-[#F8FFE5]/80 max-w-2xl mx-auto leading-relaxed">
            {heroSlides[currentSlide].sub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/menu')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#D16014] text-white font-bold text-sm shadow-2xl shadow-[#D16014]/40 hover:bg-[#b8510f] transition-all flex items-center justify-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              <span>Ver Menú Digital (Público)</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00241B]/80 backdrop-blur-md border border-[#F8FFE5]/20 hover:border-[#659B5E] text-[#F8FFE5] font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#659B5E]" />
              <span>Reservar Mesa</span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-[#D16014]' : 'w-2 bg-[#F8FFE5]/30'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. CINTILLO DISTINTIVO */}
      <div className="bg-[#00241B] border-y border-[#659B5E]/30 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-[#659B5E] uppercase tracking-wider text-center md:text-left">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D16014]" />
            <span>Chicharronera El Cacique • Premio Culinario 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#659B5E]" />
            <span>Ingredientes 100% Nacionales & Preparación al Instante</span>
          </div>
        </div>
      </div>

      {/* 3. PROPUESTA DE VALOR */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[#D16014] uppercase tracking-widest">Nuestra Promesa</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FFE5]">La Experiencia Criolla El Cacique</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#00241B]/40 border border-[#F8FFE5]/10 p-8 rounded-2xl space-y-4 text-center hover:border-[#D16014]/50 transition-all">
            <div className="w-12 h-12 bg-[#D16014]/20 text-[#D16014] rounded-2xl flex items-center justify-center mx-auto">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F8FFE5]">Cocción Tradicional en Paila</h3>
            <p className="text-xs text-[#F8FFE5]/70 leading-relaxed">
              Mantener el secreto criollo con pailas de hierro fundido a fuego de leña que aseguran la textura crocante ideal.
            </p>
          </div>

          <div className="bg-[#00241B]/40 border border-[#F8FFE5]/10 p-8 rounded-2xl space-y-4 text-center hover:border-[#659B5E]/50 transition-all">
            <div className="w-12 h-12 bg-[#659B5E]/20 text-[#659B5E] rounded-2xl flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F8FFE5]">Atención & Comanda Digital</h3>
            <p className="text-xs text-[#F8FFE5]/70 leading-relaxed">
              Integración tecnológica en tiempo real que traslada tu pedido directo a cocina sin demoras ni errores.
            </p>
          </div>

          <div className="bg-[#00241B]/40 border border-[#F8FFE5]/10 p-8 rounded-2xl space-y-4 text-center hover:border-amber-500/50 transition-all">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F8FFE5]">Cobertura en 4 Sedes</h3>
            <p className="text-xs text-[#F8FFE5]/70 leading-relaxed">
              Encuéntranos en Escazú, Santa Ana, Cartago y Heredia manteniendo la misma sazón en cada rincón.
            </p>
          </div>
        </div>
      </section>

      {/* 4. MAPA DE GOOGLE MAPS + CLIMA EN TIEMPO REAL SEGÚN EL LOCAL SELECCIONADO */}
      <section className="py-16 px-6 bg-[#050507] border-y border-[#F8FFE5]/10 space-y-8">
        <div className="max-w-7xl mx-auto space-y-4 text-center">
          <span className="text-xs font-bold text-[#659B5E] uppercase tracking-widest">Ubicación Geográfica &amp; Clima</span>
          <h2 className="text-3xl font-extrabold text-[#F8FFE5]">Nuestras Sedes El Cacique</h2>
          <p className="text-xs text-[#F8FFE5]/60 max-w-xl mx-auto">
            Selecciona un local para ver su ubicación en tiempo real y las condiciones climáticas actuales de la zona:
          </p>

          {/* BOTONES SELECTORES DE SEDE */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {Object.keys(sedesMap).map((key) => (
              <button
                key={key}
                onClick={() => setActiveSedeKey(key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeSedeKey === key 
                    ? 'bg-[#D16014] text-white shadow-lg shadow-[#D16014]/30 scale-105' 
                    : 'bg-[#00241B] text-[#F8FFE5]/70 hover:bg-[#00241B]/80'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{sedesMap[key].nombre.split('•')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CONTENEDOR DE INFORMACIÓN DE SEDE + CLIMA API + IFRAME MAPS */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-1 space-y-4 bg-[#00241B]/60 p-6 rounded-2xl border border-[#F8FFE5]/10">
            <h3 className="font-bold text-lg text-[#F8FFE5] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#D16014]" />
              {sedesMap[activeSedeKey].nombre}
            </h3>
            <p className="text-xs text-[#F8FFE5]/70 leading-relaxed">
              {sedesMap[activeSedeKey].direccion}
            </p>

            {/* WIDGET DEL CLIMA API EN TIEMPO REAL */}
            <div className="bg-[#0A090C]/60 border border-[#659B5E]/30 p-3.5 rounded-xl flex items-center gap-3">
              <CloudSun className="w-6 h-6 text-[#16A34A] animate-pulse" />
              <div className="text-xs">
                <span className="block font-bold text-[#F8FFE5]">
                  Clima Actual: {sedeWeather ? `${sedeWeather.temp}°C` : 'Cargando...'}
                </span>
                <span className="text-[10px] text-[#659B5E]">
                  Viento: {sedeWeather?.windspeed || 0} km/h • {sedesMap[activeSedeKey].nombre.split('•')[0]}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#659B5E]">
                <Clock className="w-4 h-4" />
                <span>Lun - Dom: 11:30 AM - 11:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-[#D16014]">
                <Phone className="w-4 h-4" />
                <span>Central: +506 2200-8888</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 h-[380px] w-full rounded-2xl overflow-hidden border border-[#F8FFE5]/15 shadow-2xl">
            <iframe
              title="Google Maps El Cacique"
              src={sedesMap[activeSedeKey].mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIOS DE CLIENTES */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#D16014] uppercase tracking-widest">Experiencias</span>
          <h2 className="text-3xl font-extrabold text-[#F8FFE5]">Lo que dicen nuestros comensales</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-[#00241B]/30 border border-[#F8FFE5]/10 space-y-3">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-[#F8FFE5]/80 italic">
              "El mejor chifrijo de Escazú por mucho. El chicharrón es súper crujiente y la atención inmediata mediante la mesa digital."
            </p>
            <div className="font-bold text-[#F8FFE5]">— Carlos A.</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#00241B]/30 border border-[#F8FFE5]/10 space-y-3">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-[#F8FFE5]/80 italic">
              "Los chicharrones en paila tienen el toque criollo verdadero. Excelente ambiente familiar en la sede de Cartago."
            </p>
            <div className="font-bold text-[#F8FFE5]">— María José R.</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#00241B]/30 border border-[#F8FFE5]/10 space-y-3">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-[#F8FFE5]/80 italic">
              "La cerveza artesanal fría combinación perfecta con las yucas y la carne de cerdo a la leña. Volveré siempre."
            </p>
            <div className="font-bold text-[#F8FFE5]">— Esteban V.</div>
          </div>
        </div>
      </section>

      {/* 6. PIE DE PÁGINA Y REDES SOCIALES */}
      <section className="bg-[#050507] border-t border-[#F8FFE5]/10 py-12 px-6 text-center space-y-6">
        <h3 className="text-xl font-extrabold text-[#F8FFE5] tracking-widest uppercase">
          #ChicharroneraElCacique
        </h3>
        <p className="text-xs text-[#F8FFE5]/60">Síguenos y comparte tus fotografías en nuestras instalaciones</p>
        <div className="flex justify-center gap-4">
          <a href="#" aria-label="Instagram" className="p-3 rounded-full bg-[#00241B] text-[#F8FFE5] hover:text-[#D16014] border border-[#F8FFE5]/10 transition-colors">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="#" aria-label="Compartir" className="p-3 rounded-full bg-[#00241B] text-[#F8FFE5] hover:text-[#D16014] border border-[#F8FFE5]/10 transition-colors">
            <Share2 className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}