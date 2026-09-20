import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import Toast from '../components/Toast';
import logoN from '../assets/img/LogoN.svg';
import {
  Utensils, Calendar, MapPin, Clock, Phone, Flame,
  ChevronRight, AlertCircle, Sparkles, Award, ShieldCheck,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationType, setReservationType] = useState('General');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [mapError, setMapError] = useState(false);
  const [activeSedeMap, setActiveSedeMap] = useState('ESCAZÚ');

  const sedesInfo = {
    'ESCAZÚ': { nombre: 'SEDE ESCAZÚ • CENTRO CULINARIO', provincia: 'SAN JOSÉ', direccion: '100m Oeste de Multiplaza Escazú, San José', telefono: '+506 2200-8888', horario: 'Lunes a Domingo: 11:30 AM - 11:00 PM', mapUrl: 'https://maps.google.com/maps?q=Multiplaza%20Escazu&t=&z=15&ie=UTF8&iwloc=&output=embed' },
    'SANTA ANA': { nombre: 'SEDE SANTA ANA • PLAZA REAL', provincia: 'SAN JOSÉ', direccion: 'Plaza Real Santa Ana, Contiguo a la Ruta 27', telefono: '+506 2200-8889', horario: 'Lunes a Domingo: 11:00 AM - 10:00 PM', mapUrl: 'https://maps.google.com/maps?q=Santa%20Ana%20Town%20Center&t=&z=15&ie=UTF8&iwloc=&output=embed' },
    CARTAGO: { nombre: 'SEDE CARTAGO • PASO ANCHO', provincia: 'CARTAGO', direccion: 'Paso Ancho de Cartago, 200m Sur de la Basílica', telefono: '+506 2500-1122', horario: 'Lunes a Domingo: 11:30 AM - 10:30 PM', mapUrl: 'https://maps.google.com/maps?q=Cartago%20Costa%20Rica&t=&z=15&ie=UTF8&iwloc=&output=embed' },
    HEREDIA: { nombre: 'SEDE HEREDIA • VÍA CENTRAL', provincia: 'HEREDIA', direccion: 'Paseo de las Flores, Heredia Centro', telefono: '+506 2260-3344', horario: 'Lunes a Domingo: 11:30 AM - 11:00 PM', mapUrl: 'https://maps.google.com/maps?q=Heredia%20Costa%20Rica&t=&z=15&ie=UTF8&iwloc=&output=embed' }
  };
  const selectedSede = sedesInfo[activeSedeMap];

  const openReservation = (eventType = 'General') => {
    setReservationType(eventType);
    setIsReservationOpen(true);
  };

  const dishes = [
    ['Chifrijo Especial Cacique', 'Pork belly crujiente, cubaces tiernos en su caldo, pico de gallo criollo, aguacate fresco y patacones tostados.', '₡6,800', 'MÁS VENDIDO', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'],
    ['Vigorón Criollo de Paila (1 kg)', 'Chicharrones de carne y concha tostada sobre yuca suave al vapor y ensalada agria tradicional.', '₡14,500', 'PARA COMPARTIR', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'],
    ['Costilla a la Leña Ahumada', 'Corte jugoso marinado en especias autóctonas, ahumado con leña de café y bañado en chimichurri de la casa.', '₡9,200', 'RECOMENDACIÓN DEL CHEF', 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80']
  ];

  return (
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] font-sans selection:bg-[#D16014] selection:text-white">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <section id="inicio" className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=85&w=1800" alt="Chicharrón de Paila El Cacique" className="w-full h-full object-cover object-center scale-105 brightness-50 contrast-125" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A090C] via-[#0A090C]/70 to-[#0A090C]/40" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#001812]/80 border border-[#659B5E]/50 text-[#659B5E] text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-2xl"><Flame className="w-4 h-4 text-[#D16014]" /><span>Chicharronera Gourmet • Costa Rica</span></div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none uppercase">Sabor Criollo <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D16014] via-amber-400 to-[#659B5E]">a la Leña y Paila</span></h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 font-medium leading-relaxed">Tradición costarricense perfeccionada: chicharrones de concha tostada al momento, cortes de carne ahumados a la leña de café y tortillas palmeadas a mano.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button onClick={() => navigate('/menu')} className="px-8 py-4 rounded-2xl bg-[#D16014] hover:bg-[#b8510f] text-white font-black text-sm uppercase tracking-wider shadow-xl flex items-center gap-3 cursor-pointer"><Utensils className="w-5 h-5" /> Ver Menú Digital</button>
            <button onClick={() => openReservation()} className="px-8 py-4 rounded-2xl bg-[#001812]/80 hover:bg-[#001812] border border-[#659B5E]/50 text-[#F8FFE5] font-black text-sm uppercase tracking-wider backdrop-blur-md flex items-center gap-3 cursor-pointer"><Calendar className="w-5 h-5 text-[#659B5E]" /> Agendar Reserva</button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3"><span className="text-xs font-black text-[#D16014] uppercase tracking-widest">Favoritos del Menú</span><h2 className="text-3xl sm:text-5xl font-black text-white">Nuestra Especialidad Criolla</h2><div className="w-20 h-1 bg-[#659B5E] mx-auto rounded-full" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dishes.map(([nombre, desc, precio, tag, imagen]) => <div key={nombre} className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-5 space-y-4 shadow-2xl hover:border-[#D16014] transition-all group flex flex-col justify-between overflow-hidden"><div className="h-48 sm:h-52 w-full overflow-hidden rounded-2xl relative"><img src={imagen} alt={nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-[#001812] via-transparent to-transparent opacity-80" /><span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#D16014] text-white text-[10px] font-black uppercase shadow-lg">{tag}</span></div><div className="space-y-2"><div className="flex justify-between items-center gap-2"><h3 className="text-lg font-black text-white group-hover:text-[#D16014]">{nombre}</h3><span className="font-mono text-base font-black text-[#659B5E] shrink-0">{precio}</span></div><p className="text-xs text-gray-400 leading-relaxed">{desc}</p></div><button onClick={() => navigate('/menu')} className="w-full py-3 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 hover:border-[#659B5E] text-xs font-bold text-gray-200 flex items-center justify-center gap-2 cursor-pointer"><span>Ordenar en Comanda</span><ChevronRight className="w-4 h-4 text-[#659B5E]" /></button></div>)}
        </div>
      </section>

      <section id="nosotros" className="py-24 px-6 bg-[#001812] border-y border-[#659B5E]/30 relative overflow-hidden"><div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"><div className="space-y-6"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#659B5E]/20 text-[#659B5E] border border-[#659B5E]/40 text-[10px] font-black uppercase tracking-widest"><Sparkles className="w-3.5 h-3.5" /> Tradición y pasión culinaria</div><h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">Nuestra Historia &amp; <br /><span className="text-[#D16014]">Legado Gastronómico</span></h2><p className="text-xs sm:text-sm text-gray-300 leading-relaxed">Fundada para preservar el sabor autóctono del campo costarricense, <strong>Chicharronera El Cacique</strong> combina técnicas ancestrales en paila de hierro con leña de café y una infraestructura moderna multisucursal.</p><div className="grid grid-cols-2 gap-4"><div className="p-4 rounded-2xl bg-[#0A090C] border border-[#659B5E]/20 space-y-1"><Award className="w-6 h-6 text-[#D16014]" /><h4 className="font-extrabold text-sm text-white">Calidad 100% Criolla</h4><p className="text-[11px] text-gray-400">Ingredientes frescos de productores locales.</p></div><div className="p-4 rounded-2xl bg-[#0A090C] border border-[#659B5E]/20 space-y-1"><ShieldCheck className="w-6 h-6 text-[#659B5E]" /><h4 className="font-extrabold text-sm text-white">Sabor Garantizado</h4><p className="text-[11px] text-gray-400">Recetas tradicionales hechas con esmero.</p></div></div></div><div className="relative flex items-center justify-center p-8 bg-[#0A090C] border-2 border-[#659B5E]/40 rounded-3xl shadow-2xl overflow-hidden group"><div className="absolute inset-0 bg-gradient-to-tr from-[#D16014]/20 via-transparent to-[#659B5E]/20" /><div className="relative z-10 text-center space-y-6"><div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-3xl bg-[#001812] border-2 border-[#D16014] p-6 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform"><img src={logoN} alt="Logo El Cacique" className="w-full h-full object-contain" /></div><div><h3 className="text-2xl font-black text-white">EL CACIQUE</h3><p className="text-xs font-mono text-[#D16014] uppercase tracking-widest mt-1">Chicharronera Gourmet</p><p className="text-[11px] text-gray-400 mt-2">Propiedad Intelectual &amp; Solución Empresarial © 2026 BVA</p></div></div></div></div></section>

      <section id="sedes" className="py-20 px-6 bg-[#001812]/60 border-t border-[#659B5E]/20"><div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"><div className="space-y-6"><span className="text-xs font-black text-[#659B5E] uppercase tracking-widest">Presencia Nacional</span><h2 className="text-3xl sm:text-4xl font-black text-white uppercase">Nuestras Chicharroneras</h2><p className="text-xs text-gray-400">Seleccione su sede provincial para revisar ubicación, teléfono y horarios.</p><div className="grid grid-cols-2 gap-3">{Object.keys(sedesInfo).map(key => <button key={key} onClick={() => { setActiveSedeMap(key); setMapError(false); }} className={`p-4 rounded-2xl border text-xs font-black tracking-wider text-left cursor-pointer ${activeSedeMap === key ? 'bg-[#D16014] border-[#D16014] text-white' : 'bg-[#0A090C] border-[#F8FFE5]/15 text-gray-400 hover:border-[#659B5E]'}`}><MapPin className="w-4 h-4 inline-block mr-2" />{key}</button>)}</div><div className="p-6 bg-[#001812] border border-[#659B5E]/30 rounded-2xl space-y-3 font-mono text-xs"><h4 className="font-sans font-black text-base text-white">{selectedSede.nombre}</h4><p className="text-gray-300 flex gap-2"><MapPin className="w-4 h-4 text-[#659B5E]" />{selectedSede.direccion}</p><p className="text-gray-300 flex gap-2"><Phone className="w-4 h-4 text-[#D16014]" />{selectedSede.telefono}</p><p className="text-gray-300 flex gap-2"><Clock className="w-4 h-4 text-amber-400" />{selectedSede.horario}</p></div></div><div className="bg-[#0A090C] border border-[#659B5E]/30 rounded-3xl h-96 overflow-hidden relative shadow-2xl flex items-center justify-center">{mapError ? <div className="p-8 text-center space-y-3 text-xs text-gray-400"><AlertCircle className="w-8 h-8 text-[#D16014] mx-auto" /><p className="font-bold text-white">Mapa en vivo no disponible temporalmente.</p><a href={`https://maps.google.com/?q=${encodeURIComponent(selectedSede.nombre)}`} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-[#659B5E] text-white font-bold rounded-xl">Abrir en Google Maps</a></div> : <iframe title={`Mapa ${selectedSede.nombre}`} src={selectedSede.mapUrl} className="w-full h-full border-0 opacity-90" loading="lazy" onError={() => setMapError(true)} />}</div></div></section>

      <section className="py-20 px-6 max-w-7xl mx-auto space-y-10"><div className="text-center space-y-2"><span className="text-xs font-black text-amber-500 uppercase tracking-widest">Reservaciones</span><h2 className="text-3xl font-black text-[#F8FFE5]">EVENTOS Y CELEBRACIONES</h2></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[['Fiestas Empresariales', 'Parrilladas ejecutivas y salón completo.', 'Empresarial', Sparkles], ['Cumpleaños & Familias', 'Atención preferencial para grupos grandes.', 'Cumpleaños', Utensils], ['Cotizaciones Express', 'Solicita una cotización inmediata.', 'Express', Phone]].map(([title, description, type, Icon]) => <div key={title} className="p-6 rounded-3xl bg-[#001812] border border-[#659B5E]/30 space-y-4"><Icon className="w-6 h-6 text-[#D16014]" /><h3 className="font-extrabold text-lg text-[#F8FFE5]">{title}</h3><p className="text-xs text-gray-400">{description}</p><button onClick={() => openReservation(type)} className="w-full py-2.5 rounded-xl bg-[#D16014] text-white font-extrabold text-xs cursor-pointer">Reservar</button></div>)}</div></section>

      {isReservationOpen && <ReservationModal isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} initialEventType={reservationType} onSuccess={message => setToast({ show: true, message, type: 'success' })} />}
    </div>
  );
}
