import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import Toast from '../components/Toast';
import {
  Utensils, Calendar, MapPin, Clock, Phone, Flame,
  ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationType, setReservationType] = useState('General');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [mapError, setMapError] = useState(false);
  const [activeSedeMap, setActiveSedeMap] = useState('escazu');

  const sedesInfo = {
    escazu: { nombre: 'Sede Escazú • Centro Culinario', direccion: '100m Oeste de Multiplaza Escazú, San José', telefono: '+506 2200-8888', horario: 'Lunes a Domingo: 11:30 AM - 11:00 PM', mapUrl: 'https://maps.google.com/maps?q=Multiplaza%20Escazu&t=&z=15&ie=UTF8&iwloc=&output=embed' },
    santa_ana: { nombre: 'Sede Santa Ana • Plaza Real', direccion: 'Plaza Real Santa Ana, Contiguo a la Ruta 27', telefono: '+506 2200-8889', horario: 'Lunes a Domingo: 11:00 AM - 10:00 PM', mapUrl: 'https://maps.google.com/maps?q=Santa%20Ana%20Town%20Center&t=&z=15&ie=UTF8&iwloc=&output=embed' },
    cartago: { nombre: 'Sede Cartago • Paso Ancho', direccion: 'Paso Ancho de Cartago, 200m Sur de la Basílica', telefono: '+506 2500-1122', horario: 'Lunes a Domingo: 11:30 AM - 10:30 PM', mapUrl: 'https://maps.google.com/maps?q=Cartago%20Costa%20Rica&t=&z=15&ie=UTF8&iwloc=&output=embed' },
    heredia: { nombre: 'Sede Heredia • Vía Central', direccion: 'Paseo de las Flores, Heredia Centro', telefono: '+506 2260-3344', horario: 'Lunes a Domingo: 11:30 AM - 11:00 PM', mapUrl: 'https://maps.google.com/maps?q=Heredia%20Costa%20Rica&t=&z=15&ie=UTF8&iwloc=&output=embed' }
  };
  const selectedSede = sedesInfo[activeSedeMap];

  const openReservation = (eventType = 'General') => {
    setReservationType(eventType);
    setIsReservationOpen(true);
  };

  const dishes = [
    ['Chifrijo Especial Cacique', 'Pork belly crujiente, cubaces tiernos, pico de gallo criollo y aguacate.', '₡6,800', 'Más Vendido'],
    ['Vigorón Criollo de Paila (1 kg)', 'Chicharrones mixtos sobre yuca al vapor, repollo agrio y patacones.', '₡14,500', 'Para Compartir'],
    ['Costilla a la Leña Ahumada', 'Corte jugoso marinado en especias autóctonas y chimichurri tico.', '₡9,200', 'Recomendación del Chef']
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dishes.map(([nombre, desc, precio, tag]) => <div key={nombre} className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl hover:border-[#D16014] transition-all group flex flex-col justify-between"><div className="space-y-3"><div className="flex justify-between items-start gap-2"><span className="px-3 py-1 rounded-full bg-[#D16014]/20 text-[#D16014] border border-[#D16014]/40 text-[10px] font-black uppercase">{tag}</span><span className="font-mono text-xl font-black text-[#659B5E]">{precio}</span></div><h3 className="text-xl font-black text-white group-hover:text-[#D16014]">{nombre}</h3><p className="text-xs text-gray-400 leading-relaxed">{desc}</p></div><button onClick={() => navigate('/menu')} className="w-full py-3 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 hover:border-[#659B5E] text-xs font-bold text-gray-200 flex items-center justify-center gap-2 cursor-pointer"><span>Ordenar en Comanda</span><ChevronRight className="w-4 h-4 text-[#659B5E]" /></button></div>)}
        </div>
      </section>

      <section id="nosotros" className="py-20 px-6 bg-[#001812]/50 border-y border-[#659B5E]/20"><div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"><div className="space-y-6"><span className="text-xs font-black text-[#659B5E] uppercase tracking-widest">Presencia Nacional</span><h2 className="text-3xl sm:text-4xl font-black text-white">Nuestras Chicharroneras</h2><p className="text-xs text-gray-400">Seleccione su sede para revisar ubicación, teléfono y horarios de atención.</p><div className="grid grid-cols-2 gap-3">{Object.keys(sedesInfo).map(key => <button key={key} onClick={() => { setActiveSedeMap(key); setMapError(false); }} className={`p-3.5 rounded-2xl border text-xs font-bold text-left cursor-pointer ${activeSedeMap === key ? 'bg-[#D16014] border-[#D16014] text-white' : 'bg-[#0A090C] border-[#F8FFE5]/15 text-gray-400 hover:border-[#659B5E]'}`}><MapPin className="w-4 h-4 inline-block mr-2" />{key.replace('_', ' ')}</button>)}</div><div className="p-6 bg-[#001812] border border-[#659B5E]/30 rounded-2xl space-y-3 font-mono text-xs"><h4 className="font-sans font-black text-base text-white">{selectedSede.nombre}</h4><p className="text-gray-300 flex gap-2"><MapPin className="w-4 h-4 text-[#659B5E]" />{selectedSede.direccion}</p><p className="text-gray-300 flex gap-2"><Phone className="w-4 h-4 text-[#D16014]" />{selectedSede.telefono}</p><p className="text-gray-300 flex gap-2"><Clock className="w-4 h-4 text-amber-400" />{selectedSede.horario}</p></div></div><div className="bg-[#0A090C] border border-[#659B5E]/30 rounded-3xl h-96 overflow-hidden relative shadow-2xl flex items-center justify-center">{mapError ? <div className="p-8 text-center space-y-3 text-xs text-gray-400"><AlertCircle className="w-8 h-8 text-[#D16014] mx-auto" /><p className="font-bold text-white">Vista previa no disponible.</p><a href={`https://maps.google.com/?q=${encodeURIComponent(selectedSede.nombre)}`} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-[#659B5E] text-white font-bold rounded-xl">Abrir en Google Maps</a></div> : <iframe title={`Mapa ${selectedSede.nombre}`} src={selectedSede.mapUrl} className="w-full h-full border-0 opacity-90" loading="lazy" onError={() => setMapError(true)} />}</div></div></section>

      <section className="py-20 px-6 max-w-7xl mx-auto space-y-10"><div className="text-center space-y-2"><span className="text-xs font-black text-amber-500 uppercase tracking-widest">Reservaciones</span><h2 className="text-3xl font-black text-[#F8FFE5]">EVENTOS Y CELEBRACIONES</h2></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[['Fiestas Empresariales', 'Parrilladas ejecutivas y salón completo.', 'Empresarial', Sparkles], ['Cumpleaños & Familias', 'Atención preferencial para grupos grandes.', 'Cumpleaños', Utensils], ['Cotizaciones Express', 'Solicita una cotización inmediata.', 'Express', Phone]].map(([title, description, type, Icon]) => <div key={title} className="p-6 rounded-3xl bg-[#001812] border border-[#659B5E]/30 space-y-4"><Icon className="w-6 h-6 text-[#D16014]" /><h3 className="font-extrabold text-lg text-[#F8FFE5]">{title}</h3><p className="text-xs text-gray-400">{description}</p><button onClick={() => openReservation(type)} className="w-full py-2.5 rounded-xl bg-[#D16014] text-white font-extrabold text-xs cursor-pointer">Reservar</button></div>)}</div></section>

      {isReservationOpen && <ReservationModal isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} initialEventType={reservationType} onSuccess={message => setToast({ show: true, message, type: 'success' })} />}
    </div>
  );
}
