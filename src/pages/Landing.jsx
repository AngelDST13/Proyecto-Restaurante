import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeatherByLocation } from '../services/weatherService';
import { 
  Utensils, Calendar, ChevronRight, ChevronLeft, Flame, Share2, 
  Award, ShieldCheck, Clock, MapPin, Phone, CloudSun, HeartHandshake, Sparkles
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [activeSedeKey, setActiveSedeKey] = useState('escazu');
  const [sedeWeather, setSedeWeather] = useState(null);

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

  useEffect(() => {
    getWeatherByLocation(activeSedeKey).then(res => setSedeWeather(res));
  }, [activeSedeKey]);

  const heroSlides = [
    {
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947',
      tag: 'Tradición & Fuego Culinario',
      title: 'Chicharronera El Cacique',
      sub: 'Chicharrones crujientes de la purita paila, ceviches arreglados y cortes a la leña.'
    },
    {
      url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
      tag: 'Especialidad de la Casa',
      title: 'Sabor Criollo a la Leña',
      sub: 'Tortillas palmeadas al momento y recetas tradicionales criollas.'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="bg-[#0A090C] text-[#F8FFE5] overflow-x-hidden font-sans">
      
      {/* 1. HERO SLIDER */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img src={slide.url} alt={slide.title} className="w-full h-full object-cover filter brightness-[0.35] contrast-105" />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0A090C] via-[#0A090C]/50 to-transparent"></div>

        <button onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))} className="absolute left-4 z-20 p-3 rounded-full bg-[#00241B]/70 border border-[#F8FFE5]/15 text-[#F8FFE5]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)} className="absolute right-4 z-20 p-3 rounded-full bg-[#00241B]/70 border border-[#F8FFE5]/15 text-[#F8FFE5]">
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-6 mt-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00241B]/90 border border-[#659B5E]/50 text-[#659B5E] text-xs font-bold uppercase tracking-widest">
            <Flame className="w-4 h-4 text-[#D16014]" />
            <span>{heroSlides[currentSlide].tag}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F8FFE5] tracking-tight leading-none uppercase">
            {heroSlides[currentSlide].title}
          </h1>

          <p className="text-base sm:text-lg text-[#F8FFE5]/80 max-w-2xl mx-auto">
            {heroSlides[currentSlide].sub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/menu')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#D16014] text-white font-bold text-sm shadow-xl hover:bg-[#b8510f] transition-all flex items-center justify-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              <span>Ver Menú Digital</span>
            </button>

            <button
              onClick={() => navigate('/menu')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00241B] border border-[#F8FFE5]/20 text-[#F8FFE5] font-bold text-sm hover:border-[#659B5E] transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#659B5E]" />
              <span>Agendar Reserva</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. CINTILLO DISTINTIVO */}
      <div className="bg-[#00241B] border-y border-[#659B5E]/30 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-[#659B5E] uppercase tracking-wider text-center md:text-left">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D16014]" />
            <span>Chicharronera El Cacique • Galardón Culinario Nacional 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#659B5E]" />
            <span>Ingredientes 100% Frescos de Productores Locales</span>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN SOBRE NOSOTROS */}
      <section id="nosotros" className="py-20 px-6 max-w-7xl mx-auto border-b border-[#F8FFE5]/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-[#D16014] uppercase tracking-widest flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" /> Nuestra Historia
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FFE5]">
              Sobre Chicharronera El Cacique
            </h2>
            <p className="text-xs text-[#F8FFE5]/70 leading-relaxed">
              Fundada en el corazón de Costa Rica, Chicharronera El Cacique nació del compromiso por preservar las recetas criollas de paila de nuestras familias abuelas. Lo que inició como una pequeña paila campesina a la orilla del camino se convirtió en un referente culinario nacional.
            </p>
          </div>
          <div className="h-80 rounded-2xl overflow-hidden border border-[#F8FFE5]/15 shadow-2xl">
            <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1" alt="Sobre Nosotros" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* 4. PLATILLOS MÁS FAMOSOS */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#659B5E] uppercase tracking-widest flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D16014]" /> Los Favoritos del Pueblo
          </span>
          <h2 className="text-3xl font-extrabold text-[#F8FFE5]">Nuestros 3 Platillos Más Famosos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#00241B]/40 border border-[#F8FFE5]/10 rounded-2xl overflow-hidden p-5 space-y-3">
            <img src="https://images.unsplash.com/photo-1544025162-d76694265947" alt="Chifrijo" className="h-44 w-full object-cover rounded-xl" />
            <h3 className="font-bold text-base text-[#F8FFE5]">1. Chifrijo Especial de Paila</h3>
            <p className="text-xs text-[#F8FFE5]/70">Chicharrón de concha y carne, frijoles tiernos criollos, arroz fresco y aguacate Hass.</p>
          </div>

          <div className="bg-[#00241B]/40 border border-[#F8FFE5]/10 rounded-2xl overflow-hidden p-5 space-y-3">
            <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1" alt="Vigorón" className="h-44 w-full object-cover rounded-xl" />
            <h3 className="font-bold text-base text-[#F8FFE5]">2. Vigorón Criollo (1kg)</h3>
            <p className="text-xs text-[#F8FFE5]/70">Cama de yuca cocida al vapor, repollo arreglado y chicharrones recién salidos de la paila.</p>
          </div>

          <div className="bg-[#00241B]/40 border border-[#F8FFE5]/10 rounded-2xl overflow-hidden p-5 space-y-3">
            <img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b" alt="Costilla" className="h-44 w-full object-cover rounded-xl" />
            <h3 className="font-bold text-base text-[#F8FFE5]">3. Costilla de Cerdo a la Leña</h3>
            <p className="text-xs text-[#F8FFE5]/70">Corte ahumado con leña de café, acompañado de tortillas hechas a mano y chimichurri.</p>
          </div>
        </div>
      </section>

      {/* 5. MAPA Y CLIMA API */}
      <section className="py-16 px-6 bg-[#050507] border-y border-[#F8FFE5]/10 space-y-8">
        <div className="max-w-7xl mx-auto space-y-4 text-center">
          <span className="text-xs font-bold text-[#659B5E] uppercase tracking-widest">Ubicación &amp; Clima</span>
          <h2 className="text-3xl font-extrabold text-[#F8FFE5]">Sedes El Cacique</h2>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {Object.keys(sedesMap).map((key) => (
              <button
                key={key}
                onClick={() => setActiveSedeKey(key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeSedeKey === key ? 'bg-[#D16014] text-white' : 'bg-[#00241B] text-[#F8FFE5]/70'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{sedesMap[key].nombre.split('•')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-1 space-y-4 bg-[#00241B]/60 p-6 rounded-2xl border border-[#F8FFE5]/10">
            <h3 className="font-bold text-lg text-[#F8FFE5] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#D16014]" />
              {sedesMap[activeSedeKey].nombre}
            </h3>
            <div className="bg-[#0A090C]/60 border border-[#659B5E]/30 p-3.5 rounded-xl flex items-center gap-3">
              <CloudSun className="w-6 h-6 text-[#16A34A]" />
              <div className="text-xs">
                <span className="block font-bold text-[#F8FFE5]">
                  Clima: {sedeWeather ? `${sedeWeather.temp}°C` : 'Cargando...'}
                </span>
                <span className="text-[10px] text-[#659B5E]">Viento: {sedeWeather?.windspeed || 0} km/h</span>
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

          <div className="lg:col-span-2 h-[350px] w-full rounded-2xl overflow-hidden border border-[#F8FFE5]/15">
            <iframe
              title="Google Maps El Cacique"
              src={sedesMap[activeSedeKey].mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className="bg-[#050507] border-t border-[#F8FFE5]/10 py-12 px-6 text-center space-y-6">
        <h3 className="text-xl font-extrabold text-[#F8FFE5] tracking-widest uppercase">
          #ChicharroneraElCacique
        </h3>
        <p className="text-xs text-[#F8FFE5]/60">Síguenos y comparte tus fotografías en nuestras instalaciones</p>
        <div className="flex justify-center gap-4">
          <a href="#" aria-label="Compartir" className="p-3 rounded-full bg-[#00241B] text-[#F8FFE5] hover:text-[#D16014] border border-[#F8FFE5]/10 transition-colors">
            <Share2 className="w-5 h-5" />
          </a>
        </div>
      </section>

    </div>
  );
}