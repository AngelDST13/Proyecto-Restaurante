import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, Clock, Users, MapPin, Send, 
  Plus, Minus, User, Phone, MessageSquare, Sparkles 
} from 'lucide-react';

export default function ReservationModal({ 
  isOpen = true, 
  onClose, 
  initialEventType = 'General', 
  onSuccess 
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  const mapInitialTipo = (type) => {
    if (!type) return 'Mesa Regular';
    const lower = type.toLowerCase();
    if (lower.includes('event')) return 'Evento Empresarial';
    if (lower.includes('cumple')) return 'Cumpleaños';
    if (lower.includes('familiar') || lower.includes('banquete')) return 'Banquete Familiar';
    return 'Mesa Regular';
  };

  const [formData, setFormData] = useState({
    sede: 'Escazú',
    tipo: mapInitialTipo(initialEventType),
    fecha: todayStr,
    hora: '12:00',
    personas: 2,
    nombre: '',
    telefono: '',
    solicitudes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handlePersonasChange = (delta) => {
    setFormData((prev) => ({
      ...prev,
      personas: Math.max(1, Math.min(30, prev.personas + delta))
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'nombre') {
      // Solo permite letras, acentos y espacios
      const cleanVal = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      setFormData((prev) => ({ ...prev, nombre: cleanVal }));
      if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: null }));
    } else if (name === 'telefono') {
      // Solo números, guiones y signos de teléfono
      const cleanVal = value.replace(/[^0-9\-+\s]/g, '');
      setFormData((prev) => ({ ...prev, telefono: cleanVal }));
      if (errors.telefono) setErrors((prev) => ({ ...prev, telefono: null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.nombre.trim() || formData.nombre.trim().length < 3) {
      newErrors.nombre = 'Ingrese un nombre válido (mínimo 3 letras).';
    }

    if (!formData.telefono.trim() || formData.telefono.replace(/\D/g, '').length < 8) {
      newErrors.telefono = 'Ingrese un teléfono válido (al menos 8 dígitos).';
    }

    if (!formData.fecha) {
      newErrors.fecha = 'Seleccione una fecha.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const confirmationMsg = `¡Reserva confirmada con éxito para ${formData.nombre} en Sede ${formData.sede} el ${formData.fecha} a las ${formData.hora}!`;

    if (onSuccess) {
      onSuccess(confirmationMsg);
    } else {
      alert(confirmationMsg);
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[#001812] border-2 border-[#D16014] rounded-3xl p-6 sm:p-8 text-[#F8FFE5] shadow-[0_0_50px_rgba(209,96,20,0.35)] overflow-y-auto max-h-[90vh]"
        >
          {/* BOTÓN CERRAR */}
          <button 
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-5 right-5 p-2 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 text-gray-400 hover:text-white hover:bg-[#D16014] hover:border-[#D16014] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ENCABEZADO */}
          <div className="space-y-2 mb-6 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D16014]/20 border border-[#D16014]/40 text-[#D16014] text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#D16014]" />
              <span>SISTEMA CULINARIO DE RESERVAS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Agendar Mesa o Evento</h2>
            <p className="text-xs text-gray-300">Reserva tu espacio en salón o terraza con atención gastronómica preferencial.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* SEDE Y TIPO DE CELEBRACIÓN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Sede Preferida</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-[#659B5E]" />
                  <select
                    name="sede"
                    value={formData.sede}
                    onChange={handleChange}
                    className="w-full bg-[#0A090C] border border-[#659B5E]/40 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-[#D16014] cursor-pointer"
                  >
                    <option value="Escazú">Sede Escazú • Centro Culinario</option>
                    <option value="Santa Ana">Sede Santa Ana • Plaza Real</option>
                    <option value="Cartago">Sede Cartago • Paso Ancho</option>
                    <option value="Heredia">Sede Heredia • Vía Central</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Tipo de Celebración</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full bg-[#0A090C] border border-[#659B5E]/40 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#D16014] cursor-pointer"
                >
                  <option value="Mesa Regular">Mesa Regular (Almuerzo / Cena)</option>
                  <option value="Cumpleaños">Celebración de Cumpleaños</option>
                  <option value="Evento Empresarial">Evento Empresarial</option>
                  <option value="Banquete Familiar">Banquete Familiar</option>
                </select>
              </div>
            </div>

            {/* FECHA, HORA Y CONTROLADOR DE PERSONAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* FECHA CON STYLE DE CALENDARIO Y RESTRICCIÓN MÍNIMA */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Fecha</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-[#D16014]" />
                  <input
                    type="date"
                    name="fecha"
                    min={todayStr}
                    value={formData.fecha}
                    onChange={handleChange}
                    className="w-full bg-[#0A090C] border border-[#659B5E]/40 rounded-xl py-3 pl-10 pr-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#D16014] [color-scheme:dark] cursor-pointer"
                  />
                </div>
                {errors.fecha && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.fecha}</p>}
              </div>

              {/* HORA */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Hora</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#D16014]" />
                  <input
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    className="w-full bg-[#0A090C] border border-[#659B5E]/40 rounded-xl py-3 pl-10 pr-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#D16014] [color-scheme:dark] cursor-pointer"
                  />
                </div>
              </div>

              {/* INCREMENTO Y DECREMENTO DE PERSONAS (IMPOSIBLE NEGATIVOS) */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Personas</label>
                <div className="flex items-center justify-between bg-[#0A090C] border border-[#659B5E]/40 rounded-xl p-1.5 h-[42px]">
                  <button
                    type="button"
                    onClick={() => handlePersonasChange(-1)}
                    disabled={formData.personas <= 1}
                    aria-label="Disminuir personas"
                    className="w-8 h-8 rounded-lg bg-[#001812] border border-[#659B5E]/30 text-white flex items-center justify-center hover:bg-[#D16014] hover:border-[#D16014] disabled:opacity-40 disabled:hover:bg-[#001812] disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-base font-black text-white px-2 select-none flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    {formData.personas}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePersonasChange(1)}
                    aria-label="Aumentar personas"
                    className="w-8 h-8 rounded-lg bg-[#001812] border border-[#659B5E]/30 text-white flex items-center justify-center hover:bg-[#D16014] hover:border-[#D16014] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* NOMBRE Y TELÉFONO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Nombre de Titular</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="nombre"
                    placeholder="ej: Angel Salazar"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full bg-[#0A090C] border border-[#659B5E]/40 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-gray-500 focus:outline-none focus:border-[#D16014]"
                  />
                </div>
                {errors.nombre && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Teléfono / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="telefono"
                    placeholder="ej: 8888-8888"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full bg-[#0A090C] border border-[#659B5E]/40 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-gray-500 focus:outline-none focus:border-[#D16014]"
                  />
                </div>
                {errors.telefono && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.telefono}</p>}
              </div>
            </div>

            {/* SOLICITUDES ESPECIALES */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Solicitudes Especiales (Opcional)</label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <textarea
                  name="solicitudes"
                  rows="2"
                  placeholder="Ej: Silla de bebé, ubicación en terraza, alergias..."
                  value={formData.solicitudes}
                  onChange={handleChange}
                  className="w-full bg-[#0A090C] border border-[#659B5E]/40 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-gray-500 focus:outline-none focus:border-[#D16014] resize-none"
                ></textarea>
              </div>
            </div>

            {/* BOTÓN SUBMIT */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-[#D16014] hover:bg-[#b8510f] text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#D16014]/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Send className="w-4 h-4" />
              <span>CONFIRMAR RESERVACIÓN</span>
            </button>

          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}