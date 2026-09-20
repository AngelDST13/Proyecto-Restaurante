import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import Toast from '../components/Toast';
import logoBlanco from '../assets/img/LogoB.svg';
import {
  Utensils, Calendar, MapPin, Clock, Phone, Flame, ChevronRight,
  AlertCircle, Sparkles, Award, ShieldCheck,
} from 'lucide-react';

const dishes = [
  ['Chifrijo Especial Cacique', 'Pork belly crujiente, cubaces tiernos en su caldo, pico de gallo criollo, aguacate fresco y patacones tostados.', '₡6,800', 'Más vendido', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'],
  ['Vigorón Criollo de Paila (1 kg)', 'Chicharrones de carne y concha tostada sobre yuca suave al vapor y ensalada agria tradicional.', '₡14,500', 'Para compartir', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'],
  ['Costilla a la Leña Ahumada', 'Corte jugoso marinado en especias autóctonas, ahumado con leña de café y bañado en chimichurri de la casa.', '₡9,200', 'Recomendación del chef', 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80'],
];

const sedes = {
  ESCAZÚ: { nombre: 'SEDE ESCAZÚ • CENTRO CULINARIO', direccion: '100m Oeste de Multiplaza Escazú, San José', telefono: '+506 2200-8888', horario: 'Lunes a Domingo: 11:30 AM - 11:00 PM', mapUrl: 'https://maps.google.com/maps?q=Multiplaza%20Escazu&t=&z=15&ie=UTF8&iwloc=&output=embed' },
  'SANTA ANA': { nombre: 'SEDE SANTA ANA • PLAZA REAL', direccion: 'Plaza Real Santa Ana, contiguo a la Ruta 27', telefono: '+506 2200-8889', horario: 'Lunes a Domingo: 11:00 AM - 10:00 PM', mapUrl: 'https://maps.google.com/maps?q=Santa%20Ana%20Town%20Center&t=&z=15&ie=UTF8&iwloc=&output=embed' },
  CARTAGO: { nombre: 'SEDE CARTAGO • PASO ANCHO', direccion: 'Paso Ancho de Cartago, 200m Sur de la Basílica', telefono: '+506 2500-1122', horario: 'Lunes a Domingo: 11:30 AM - 10:30 PM', mapUrl: 'https://maps.google.com/maps?q=Cartago%20Costa%20Rica&t=&z=15&ie=UTF8&iwloc=&output=embed' },
  HEREDIA: { nombre: 'SEDE HEREDIA • VÍA CENTRAL', direccion: 'Paseo de las Flores, Heredia Centro', telefono: '+506 2260-3344', horario: 'Lunes a Domingo: 11:30 AM - 11:00 PM', mapUrl: 'https://maps.google.com/maps?q=Heredia%20Costa%20Rica&t=&z=15&ie=UTF8&iwloc=&output=embed' },
};

export default function Landing() {
  const navigate = useNavigate();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationType, setReservationType] = useState('General');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [activeSede, setActiveSede] = useState('ESCAZÚ');
  const [mapError, setMapError] = useState(false);
  const sede = sedes[activeSede];
  const reserve = (type = 'General') => { setReservationType(type); setIsReservationOpen(true); };

  return (
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] font-sans selection:bg-[#D16014] selection:text-white">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=85&w=1800" alt="Chicharrón de paila El Cacique" className="w-full h-full object-cover scale-105 brightness-50 contrast-125" /><div className="absolute inset-0 bg-gradient-to-t from-[#0A090C] via-[#0A090C]/70 to-[#0A090C]/40" /></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#001812]/80 border border-[#659B5E]/50 text-[#659B5E] text-xs font-black uppercase tracking-widest"><Flame className="w-4 h-4 text-[#D16014]" />Chicharronera Gourmet • Costa Rica</div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-none uppercase">Sabor Criollo <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D16014] via-amber-400 to-[#659B5E]">a la Leña y Paila</span></h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300">Tradición costarricense perfeccionada: chicharrones de concha tostada al momento, cortes ahumados a la leña de café y tortillas palmeadas a mano.</p>
          <div className="flex flex-wrap justify-center gap-4"><button onClick={() => navigate('/menu')} className="px-8 py-4 rounded-2xl bg-[#D16014] text-white font-black text-sm uppercase flex gap-3 cursor-pointer"><Utensils className="w-5 h-5" />Ver Menú Digital</button><button onClick={() => reserve()} className="px-8 py-4 rounded-2xl bg-[#001812]/80 border border-[#659B5E]/50 font-black text-sm uppercase flex gap-3 cursor-pointer"><Calendar className="w-5 h-5 text-[#659B5E]" />Agendar reserva</button></div>
        </div>
      </section>

      <section id="nosotros" className="py-24 px-6 bg-[#001812] border-y border-[#659B5E]/30 relative overflow-hidden scroll-mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#659B5E]/20 text-[#659B5E] border border-[#659B5E]/40 text-[10px] font-black uppercase tracking-widest"><Sparkles className="w-3.5 h-3.5" />Tradición y pasión culinaria</div><h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">Nuestra Historia &amp; <br /><span className="text-[#D16014]">Legado Gastronómico</span></h2><p className="text-xs sm:text-sm text-gray-300 leading-relaxed">Fundada con el compromiso de preservar el sabor autóctono del campo costarricense, <strong>Chicharronera El Cacique</strong> combina técnicas ancestrales de cocción en paila de hierro fundido con leña de café y una infraestructura moderna multisucursal.</p><div className="grid grid-cols-2 gap-4 pt-2"><div className="p-4 rounded-2xl bg-[#0A090C] border border-[#659B5E]/20 space-y-1"><Award className="w-6 h-6 text-[#D16014]" /><h4 className="font-extrabold text-sm text-white">Calidad 100% Criolla</h4><p className="text-[11px] text-gray-400">Ingredientes frescos de productores locales.</p></div><div className="p-4 rounded-2xl bg-[#0A090C] border border-[#659B5E]/20 space-y-1"><ShieldCheck className="w-6 h-6 text-[#659B5E]" /><h4 className="font-extrabold text-sm text-white">Sabor Garantizado</h4><p className="text-[11px] text-gray-400">Recetas tradicionales hechas con esmero.</p></div></div></div>
          <div className="relative flex items-center justify-center p-8 sm:p-12 bg-[#0A090C] border-2 border-[#D16014] rounded-3xl shadow-[0_0_50px_rgba(209,96,20,0.35)] overflow-hidden group"><div className="absolute inset-0 bg-gradient-to-tr from-[#D16014]/20 via-[#659B5E]/10 to-transparent" /><div className="relative z-10 text-center space-y-6 w-full flex flex-col items-center"><div className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl bg-[#001812] border-2 border-[#D16014] p-6 flex items-center justify-center shadow-[0_0_35px_rgba(209,96,20,0.5)] group-hover:scale-105 transition-transform duration-500"><img src={logoBlanco} alt="Logo El Cacique" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" /></div><div><h3 className="text-2xl sm:text-3xl font-black text-white">EL CACIQUE</h3><p className="text-xs font-mono text-[#D16014] uppercase tracking-widest mt-1 font-bold">Chicharronera Gourmet</p><p className="text-[11px] text-gray-400 mt-2">Propiedad Intelectual &amp; Solución Empresarial © 2026 BVA</p></div></div></div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto space-y-12"><div className="text-center space-y-3"><span className="text-xs font-black text-[#D16014] uppercase tracking-widest">Favoritos del menú</span><h2 className="text-3xl sm:text-5xl font-black text-white">Nuestra Especialidad Criolla</h2><div className="w-20 h-1 bg-[#659B5E] mx-auto rounded-full" /></div><div className="grid grid-cols-1 md:grid-cols-3 gap-8">{dishes.map(([name, description, price, tag, image]) => <article key={name} className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-5 space-y-4 shadow-2xl hover:border-[#D16014] transition-all group flex flex-col"><div className="h-48 sm:h-52 overflow-hidden rounded-2xl relative"><img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /><span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#D16014] text-white text-[10px] font-black uppercase">{tag}</span></div><div className="space-y-2 flex-1"><div className="flex justify-between gap-2"><h3 className="text-lg font-black text-white">{name}</h3><span className="font-mono text-base font-black text-[#659B5E] shrink-0">{price}</span></div><p className="text-xs text-gray-400">{description}</p></div><button onClick={() => navigate('/menu')} className="w-full py-3 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 text-xs font-bold flex justify-center gap-2 cursor-pointer">Ordenar en comanda <ChevronRight className="w-4 h-4 text-[#659B5E]" /></button></article>)}</div></section>

      <section className="py-24 px-6 bg-[#001812]/60 border-t border-[#659B5E]/20"><div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"><div className="space-y-5"><span className="text-xs font-black text-[#659B5E] uppercase tracking-widest">Presencia nacional</span><h2 className="text-3xl sm:text-4xl font-black text-white uppercase">Nuestras Chicharroneras</h2><div className="grid grid-cols-2 gap-3">{Object.keys(sedes).map(key => <button key={key} onClick={() => { setActiveSede(key); setMapError(false); }} className={`p-4 rounded-2xl border text-xs font-black text-left cursor-pointer ${activeSede === key ? 'bg-[#D16014] border-[#D16014] text-white' : 'bg-[#0A090C] border-[#F8FFE5]/15 text-gray-400'}`}><MapPin className="w-4 h-4 inline mr-2" />{key}</button>)}</div><div className="p-6 bg-[#001812] border border-[#659B5E]/30 rounded-2xl space-y-3 text-xs"><h4 className="font-black text-base text-white">{sede.nombre}</h4><p className="flex gap-2"><MapPin className="w-4 h-4 text-[#659B5E]" />{sede.direccion}</p><p className="flex gap-2"><Phone className="w-4 h-4 text-[#D16014]" />{sede.telefono}</p><p className="flex gap-2"><Clock className="w-4 h-4 text-amber-400" />{sede.horario}</p></div></div><div className="bg-[#0A090C] border border-[#659B5E]/30 rounded-3xl h-96 overflow-hidden">{mapError ? <div className="p-8 text-center"><AlertCircle className="w-8 h-8 text-[#D16014] mx-auto" /><p>Mapa no disponible temporalmente.</p></div> : <iframe title={`Mapa ${sede.nombre}`} src={sede.mapUrl} className="w-full h-full border-0" loading="lazy" onError={() => setMapError(true)} />}</div></div></section>
      <section id="eventos" className="py-24 px-6 text-center space-y-6 max-w-4xl mx-auto scroll-mt-24"><span className="text-xs font-black text-[#D16014] uppercase tracking-widest">Reservaciones</span><h2 className="text-3xl sm:text-5xl font-black text-white uppercase">Eventos y Celebraciones</h2><p className="text-sm text-gray-400">Celebre reuniones de empresa, banquetes familiares y ocasiones especiales en nuestras instalaciones.</p><button onClick={() => reserve('General')} className="px-8 py-4 rounded-2xl bg-[#659B5E] text-white font-black text-xs uppercase cursor-pointer">Solicitar reserva</button></section>
      {isReservationOpen && <ReservationModal isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} initialEventType={reservationType} onSuccess={message => setToast({ show: true, message, type: 'success' })} />}
    </div>
  );
}
