import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Calendar, MapPin, ChevronRight, ChevronLeft, Instagram, Facebook, Flame } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  // 1. Hero Carousel de imágenes de fondo (Estilo Añejo)
  const heroSlides = [
    {
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947', // Chicharrón / Corte crujiente
      tag: 'Tradición & Fuego Culinario',
      title: 'Chicharronera Gourmet & Cervecería',
      sub: 'Chicharrones crujientes de la purita paila, ceviches arreglados y cortes a la leña con la mejor vibra tica.'
    },
    {
      url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', // Parrilla / Leña
      tag: 'Especialidad de la Casa',
      title: 'Sabor Criollo a la Leña',
      sub: 'Ingredientes seleccionados, tortillas palmeadas al momento y recetas tradicionales de nuestros abuelos.'
    },
    {
      url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b', // Cervezas & Ambiente
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
      
      {/* SECCIÓN HERO: CARRUSEL FULL-BLEED (Inspirado en Añejo) */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Slides de Fondo con Transición */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            } transition-transform duration-[7000ms]`}
          >
            <img
              src={slide.url}
              alt={slide.title}
              className="w-full h-full object-cover filter brightness-[0.38] contrast-105"
            />
          </div>
        ))}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A090C] via-[#0A090C]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D16014]/15 via-transparent to-transparent"></div>

        {/* Flechas de Navegación del Slider */}
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

        {/* Contenido Centralizado Overlay */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 mt-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00241B]/80 backdrop-blur-md border border-[#659B5E]/40 text-[#659B5E] text-xs font-bold uppercase tracking-widest">
            <Flame className="w-4 h-4 text-[#D16014] animate-bounce" />
            <span>{heroSlides[currentSlide].tag}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F8FFE5] tracking-tight leading-none uppercase">
            {heroSlides[currentSlide].title.split('&')[0]}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D16014] to-[#ffb690]">
              &amp; {heroSlides[currentSlide].title.split('&')[1] || 'Cervecería'}
            </span>
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

        {/* Indicadores de Puntos */}
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

      {/* MARQUEE BENNER DE LOCALIDADES / SEDES */}
      <div className="bg-[#00241B] border-y border-[#659B5E]/30 py-3 overflow-hidden">
        <div className="flex whitespace-nowrap space-x-8 text-xs font-bold tracking-widest text-[#659B5E] uppercase animate-pulse justify-center">
          <span>Escazú • Cartago • Santa Ana • Heredia</span>
          <span>•</span>
          <span>Chicharrones de Paila 100% Artesanales</span>
          <span>•</span>
          <span>Abierto de Lunes a Domingo</span>
        </div>
      </div>

      {/* BLOQUE SÓLIDO INTERMEDIO CON CARD SUPERPUESTA (Estilo Añejo) */}
      <section className="py-24 px-6 bg-[#0F0E11] relative">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl min-h-[450px] flex items-center justify-center">
            {/* Imagen de fondo fija */}
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
              alt="Ambiente Chicharronera"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]"
            />

            {/* Tarjeta Centrada Recortada Sólida (Signature Añejo Style) */}
            <div className="relative z-10 max-w-lg mx-auto bg-[#00241B]/95 border border-[#F8FFE5]/20 p-8 sm:p-10 rounded-2xl text-center shadow-2xl backdrop-blur-md">
              <span className="text-[#659B5E] text-xs font-bold uppercase tracking-widest block mb-2">
                Nuestra Promesa
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FFE5] mb-3">
                Bienvenidos a la Experiencia Tradicional
              </h2>
              <p className="text-xs sm:text-sm text-[#F8FFE5]/80 leading-relaxed mb-6">
                Chicharrones crujientes, yuca suaveita, pico de gallo bien sazonado y las mejores tortillas palmeadas. Ven a disfrutar con tu familia o compas.
              </p>
              <button
                onClick={() => navigate('/menu')}
                className="px-6 py-3 rounded-xl bg-[#D16014] text-[#F8FFE5] font-bold text-xs uppercase tracking-wider hover:bg-[#b8510f] transition-all shadow-lg"
              >
                Unirse a Lista de Espera
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PLATILLOS DESTACADOS (LAYOUT SÓLIDO LIMPIO) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[#659B5E] text-xs font-bold uppercase tracking-widest block mb-2">
            De la Paila a la Mesa
          </span>
          <h2 className="text-3xl font-extrabold text-[#F8FFE5]">Especialidades de la Casa</h2>
          <p className="text-xs text-[#F8FFE5]/70 mt-2">
            Porciones generosas preparadas al instante con los mejores cortes de cerdo seleccionados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-[#00241B]/50 border border-[#F8FFE5]/10 rounded-2xl overflow-hidden hover:border-[#D16014]/50 transition-all group">
            <div className="h-56 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947"
                alt="Chifrijo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-[#D16014] text-[#F8FFE5] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                Favorito Tico
              </span>
            </div>
            <div className="p-6 space-y-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-base text-[#F8FFE5]">Chifrijo Especial</h3>
                <span className="text-[#D16014] font-bold text-base">₡6,800</span>
              </div>
              <p className="text-xs text-[#F8FFE5]/70 leading-relaxed">
                Frijoles tiernos, arroz blanco, chicharrón crujiente de carne, pico de gallo, aguacate fresco y totopos caseros.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#00241B]/50 border border-[#F8FFE5]/10 rounded-2xl overflow-hidden hover:border-[#D16014]/50 transition-all group">
            <div className="h-56 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1"
                alt="Surtido"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-[#659B5E] text-[#F8FFE5] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                Para Compartir
              </span>
            </div>
            <div className="p-6 space-y-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-base text-[#F8FFE5]">Vigorón de la Paila (1kg)</h3>
                <span className="text-[#D16014] font-bold text-base">₡14,500</span>
              </div>
              <p className="text-xs text-[#F8FFE5]/70 leading-relaxed">
                Combinación de chicharrón de concha y de carne, yuca al vapor, ensalada de col agridulce y limones mesinos.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#00241B]/50 border border-[#F8FFE5]/10 rounded-2xl overflow-hidden hover:border-[#D16014]/50 transition-all group">
            <div className="h-56 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1514933651103-005eec06c04b"
                alt="Costillas"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 space-y-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-base text-[#F8FFE5]">Costilla de Cerdo a la Leña</h3>
                <span className="text-[#D16014] font-bold text-base">₡9,200</span>
              </div>
              <p className="text-xs text-[#F8FFE5]/70 leading-relaxed">
                Costilla ahumada con madera de cafeto, bañada en salsa BBQ casera de maracuyá y acompañada de papas gajo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN "YO SOY SOCIAL" / CARRUSEL DE REDES (Copiado del Footer de Añejo) */}
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
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Galería Horizontal de Imágenes Sociales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-6xl mx-auto">
          <img className="h-44 w-full object-cover rounded-xl border border-[#F8FFE5]/10" src="https://images.unsplash.com/photo-1544025162-d76694265947" alt="Social 1" />
          <img className="h-44 w-full object-cover rounded-xl border border-[#F8FFE5]/10" src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1" alt="Social 2" />
          <img className="h-44 w-full object-cover rounded-xl border border-[#F8FFE5]/10" src="https://images.unsplash.com/photo-1514933651103-005eec06c04b" alt="Social 3" />
          <img className="h-44 w-full object-cover rounded-xl border border-[#F8FFE5]/10" src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5" alt="Social 4" />
        </div>
      </section>

    </div>
  );
}