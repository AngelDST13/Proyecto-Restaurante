import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, MapPin, Sparkles, Send } from 'lucide-react';

export default function ReservationModal({ isOpen, onClose, initialEventType = 'General', onSuccess }) {
  const [sede, setSede] = useState('escazu');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('12:00');
  const [personas, setPersonas] = useState(2);
  const [tipoEvento, setTipoEvento] = useState(initialEventType);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fecha || !nombre || !telefono) return;

    onSuccess(`¡Reserva confirmada para ${nombre} el ${fecha} a las ${hora} en Sede ${sede.toUpperCase()}!`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateX: -15 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg bg-[#001812] border border-[#659B5E]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-xs text-[#F8FFE5]"
        >
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#D16014] uppercase tracking-wider bg-[#D16014]/10 px-3 py-1 rounded-full border border-[#D16014]/30">
              <Sparkles className="w-3 h-3" /> Sistema Culinario de Reservas
            </span>
            <h3 className="text-2xl font-black text-[#F8FFE5]">Agendar Mesa o Evento</h3>
            <p className="text-gray-400">Reserva tu espacio en salón o terraza con atención preferencial.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-bold text-gray-300">Sede Preferida</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#659B5E]" />
                  <select 
                    value={sede} 
                    onChange={e => setSede(e.target.value)}
                    className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-9 pr-3 py-2.5 text-[#F8FFE5] font-bold focus:outline-none focus:border-[#D16014]"
                  >
                    <option value="escazu">Sede Escazú</option>
                    <option value="santa_ana">Sede Santa Ana</option>
                    <option value="cartago">Sede Cartago</option>
                    <option value="heredia">Sede Heredia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-gray-300">Tipo de Celebración</label>
                <select 
                  value={tipoEvento} 
                  onChange={e => setTipoEvento(e.target.value)}
                  className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5 text-[#F8FFE5] font-bold focus:outline-none focus:border-[#D16014]"
                >
                  <option value="General">Mesa Regular</option>
                  <option value="Empresarial">Fiesta Empresarial</option>
                  <option value="Cumpleaños">Cumpleaños / Familiar</option>
                  <option value="Express">Cotización Express</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block mb-1 font-bold text-gray-300">Fecha</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-[#D16014]" />
                  <input 
                    type="date" 
                    value={fecha} 
                    onChange={e => setFecha(e.target.value)}
                    required
                    className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-9 pr-2 py-2.5 text-[#F8FFE5] font-bold focus:outline-none focus:border-[#D16014]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-gray-300">Hora</label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-3 text-[#D16014]" />
                  <input 
                    type="time" 
                    value={hora} 
                    onChange={e => setHora(e.target.value)}
                    required
                    className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-9 pr-2 py-2.5 text-[#F8FFE5] font-bold focus:outline-none focus:border-[#D16014]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-gray-300">Personas</label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3 top-3 text-amber-400" />
                  <input 
                    type="number" 
                    min="1" 
                    max="50" 
                    value={personas} 
                    onChange={e => setPersonas(e.target.value)}
                    required
                    className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-9 pr-2 py-2.5 text-[#F8FFE5] font-bold focus:outline-none focus:border-[#D16014]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-bold text-gray-300">Nombre de Titular</label>
                <input 
                  type="text" 
                  placeholder="ej: Angel Salazar"
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)}
                  required
                  className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-gray-300">Teléfono / WhatsApp</label>
                <input 
                  type="tel" 
                  placeholder="ej: +506 8888-8888"
                  value={telefono} 
                  onChange={e => setTelefono(e.target.value)}
                  required
                  className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-bold text-gray-300">Solicitudes Especiales (Opcional)</label>
              <textarea 
                rows="2"
                placeholder="Ej: Silla de bebé, ubicación en terraza, alergias..."
                value={notas}
                onChange={e => setNotas(e.target.value)}
                className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 rounded-xl bg-[#D16014] hover:bg-[#b8510f] font-extrabold text-white text-xs shadow-lg shadow-[#D16014]/30 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <Send className="w-4 h-4" /> Confirmar Reservación
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}