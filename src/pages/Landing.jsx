import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Calendar, ChevronRight, ChevronLeft, Instagram, Flame, Share2 } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const heroSlides = [
    {
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947',
      tag: 'Tradición & Fuego Culinario',
      title: 'Chicharronera Gourmet & Cervecería',
      sub: 'Chicharrones crujientes de la purita paila, ceviches arreglados y cortes a la leña con la mejor vibra tica.'
    },
    {
      url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
      tag: 'Especialidad de la Casa',
      title: 'Sabor Criollo a la Leña',
      sub: 'Ingredientes seleccionados, tortillas palmeadas al momento y recetas tradicionales de nuestros abuelos.'
    },
    {
      url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b',
      tag: 'Maridaje & Coctelería',
      title: 'Cervezas Artesanales & Tragos de Autor',
      sub: 'La combinación perfecta para acompañar tu surtido de chicharrones con limón mesino fresco.'
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
    <div className="bg-[#0A090C] text-[#F8FFE5] overflow-x-hidden">
      {/* HERO SLIDER */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
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
              className="w-full h-full object-cover filter brightness-[0.38] contrast-105"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0A090C] via-[#0A090C]/40 to-transparent"></div>

        <button
          onClick={prevSlide}
          className="absolute left-4 z-20 p-2.5 rounded-full bg-[#00241B]/60 backdrop-blur-md border border-[#F8FFE5]/15 text-[#F8FFE5] hover:bg-[#D16014] transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 z-20 p-2.5 rounded-full bg-[#00241B]/60 backdrop-blur-md border border-[#F8FFE5]/15 text-[#F8FFE5] hover:bg-[#D16014] transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 mt-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00241B]/80 backdrop-blur-md border border-[#659B5E]/40 text-[#659B5E] text-xs font-bold uppercase tracking-widest">
            <Flame className="w-4 h-4 text-[#D16014] animate-bounce" />
            <span>{heroSlides[currentSlide].tag}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F8FFE5] tracking-tight leading-none uppercase">
            {heroSlides[currentSlide].title}
          </h1>

          <p className="text-base sm:text-lg text-[#F8FFE5]/80 max-w-2xl mx-auto leading-relaxed">
            {heroSlides[currentSlide].sub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/menu')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#D16014] text-[#F8FFE5] font-bold text-sm shadow-xl shadow-[#D16014]/30 hover:bg-[#b8510f] transition-all flex items-center justify-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              <span>Ver Menú Digital</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#00241B]/80 backdrop-blur-md border border-[#F8FFE5]/20 hover:border-[#659B5E] text-[#F8FFE5] font-bold text-sm transition-all flex items-center justify-center gap-2"
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

      {/* MARQUEE */}
      <div className="bg-[#00241B] border-y border-[#659B5E]/30 py-3 overflow-hidden">
        <div className="flex whitespace-nowrap space-x-8 text-xs font-bold tracking-widest text-[#659B5E] uppercase animate-pulse justify-center">
          <span>Escazú • Cartago • Santa Ana • Heredia — Chicharrones de Paila 100% Artesanales</span>
        </div>
      </div>

      {/* REDES SOCIALES */}
      <section className="bg-[#050507] border-t border-[#F8FFE5]/10 py-16 px-6 text-center space-y-8">
        <div>
          <h3 className="text-2xl font-extrabold text-[#F8FFE5] tracking-widest uppercase">
            #ChicharroneraGourmet
          </h3>
          <p className="text-xs text-[#F8FFE5]/60 mt-1">Comparte tus mejores momentos en nuestras mesas</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="p-2.5 rounded-full bg-[#00241B] text-[#F8FFE5] hover:text-[#D16014] border border-[#F8FFE5]/10">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="p-2.5 rounded-full bg-[#00241B] text-[#F8FFE5] hover:text-[#D16014] border border-[#F8FFE5]/10">
              <Share2 className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}