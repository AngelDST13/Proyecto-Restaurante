import { useState } from 'react';
import { MessageSquare, Phone, Calendar, MapPin, X, Send } from 'lucide-react';

export default function ReservationModal({ isOpen, onClose, onShowToast }) {
  const [method, setMethod] = useState('web'); // 'web' | 'whatsapp' | 'phone'
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    sede: 'escazu',
    personas: '2',
    fecha: new Date().toISOString().split('T')[0],
    hora: '19:00',
    notas: ''
  });

  if (!isOpen) return null;

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const phone = '50622008888';
    const text = encodeURIComponent(
      `¡Hola Chicharronera El Cacique! Deseo reservar una mesa con los siguientes datos:\n` +
      `• Nombre: ${formData.nombre}\n` +
      `• Sede: ${formData.sede.toUpperCase()}\n` +
      `• Personas: ${formData.personas}\n` +
      `• Fecha: ${formData.fecha}\n` +
      `• Hora: ${formData.hora}\n` +
      `• Notas: ${formData.notas || 'Ninguna'}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    onShowToast('Redirigiendo a WhatsApp API...', 'info');
    onClose();
  };

  const handleWebSubmit = (e) => {
    e.preventDefault();
    onShowToast(`¡Reserva web confirmada para ${formData.nombre} el ${formData.fecha}!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A090C] border border-[#F8FFE5]/15 rounded-2xl max-w-lg w-full p-6 text-[#F8FFE5] space-y-6 shadow-2xl relative">
        
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-lg text-[#F8FFE5]/40 hover:text-[#F8FFE5]">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-extrabold tracking-tight text-[#F8FFE5]">Reserva tu Mesa • El Cacique</h3>
          <p className="text-xs text-[#F8FFE5]/60">Selecciona tu método preferido para agendar tu visita:</p>
        </div>

        {/* SELECTOR DE MÉTODOS */}
        <div className="grid grid-cols-3 gap-2 bg-[#001812] p-1.5 rounded-xl border border-[#F8FFE5]/10 text-xs font-bold">
          <button
            onClick={() => setMethod('web')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              method === 'web' ? 'bg-[#D16014] text-white shadow-md' : 'text-[#F8FFE5]/60 hover:text-[#F8FFE5]'
            }`}
          >
            <Calendar className="w-4 h-4" /> En Línea
          </button>

          <button
            onClick={() => setMethod('whatsapp')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              method === 'whatsapp' ? 'bg-emerald-600 text-white shadow-md' : 'text-[#F8FFE5]/60 hover:text-[#F8FFE5]'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </button>

          <button
            onClick={() => setMethod('phone')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              method === 'phone' ? 'bg-amber-600 text-white shadow-md' : 'text-[#F8FFE5]/60 hover:text-[#F8FFE5]'
            }`}
          >
            <Phone className="w-4 h-4" /> Teléfono
          </button>
        </div>

        {/* MÉTODO 1: EN LÍNEA */}
        {method === 'web' && (
          <form onSubmit={handleWebSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Tu Nombre"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-[#00241B]/60 border border-[#F8FFE5]/15 rounded-xl px-3 py-2 text-[#F8FFE5]"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Teléfono</label>
                <input
                  type="tel"
                  required
                  placeholder="8888-8888"
                  value={formData.telefono}
                  onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full bg-[#00241B]/60 border border-[#F8FFE5]/15 rounded-xl px-3 py-2 text-[#F8FFE5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Sede El Cacique</label>
                <select
                  value={formData.sede}
                  onChange={e => setFormData({ ...formData, sede: e.target.value })}
                  className="w-full bg-[#00241B]/60 border border-[#F8FFE5]/15 rounded-xl px-3 py-2 text-[#F8FFE5]"
                >
                  <option value="escazu">Sede Escazú</option>
                  <option value="santa_ana">Sede Santa Ana</option>
                  <option value="cartago">Sede Cartago</option>
                  <option value="heredia">Sede Heredia</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Cantidad Personas</label>
                <select
                  value={formData.personas}
                  onChange={e => setFormData({ ...formData, personas: e.target.value })}
                  className="w-full bg-[#00241B]/60 border border-[#F8FFE5]/15 rounded-xl px-3 py-2 text-[#F8FFE5]"
                >
                  <option value="2">2 Personas</option>
                  <option value="4">4 Personas</option>
                  <option value="6">6 Personas</option>
                  <option value="8">8+ Personas (Mesa Grupal)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Fecha Disponible</label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full bg-[#00241B]/60 border border-[#F8FFE5]/15 rounded-xl px-3 py-2 text-[#F8FFE5]"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Hora</label>
                <input
                  type="time"
                  required
                  value={formData.hora}
                  onChange={e => setFormData({ ...formData, hora: e.target.value })}
                  className="w-full bg-[#00241B]/60 border border-[#F8FFE5]/15 rounded-xl px-3 py-2 text-[#F8FFE5]"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-[#D16014] text-white font-bold rounded-xl hover:bg-[#b8510f]">
              Confirmar Reserva Web
            </button>
          </form>
        )}

        {/* MÉTODO 2: WHATSAPP */}
        {method === 'whatsapp' && (
          <form onSubmit={handleWhatsAppSubmit} className="space-y-4 text-xs">
            <p className="text-[#F8FFE5]/70">Ingresa tus datos y te redirigiremos a WhatsApp con tu mensaje listo:</p>
            <input
              type="text"
              required
              placeholder="Tu Nombre"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full bg-[#00241B]/60 border border-[#F8FFE5]/15 rounded-xl px-3 py-2 text-[#F8FFE5]"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.sede}
                onChange={e => setFormData({ ...formData, sede: e.target.value })}
                className="w-full bg-[#00241B]/60 border border-[#F8FFE5]/15 rounded-xl px-3 py-2 text-[#F8FFE5]"
              >
                <option value="escazu">Escazú</option>
                <option value="santa_ana">Santa Ana</option>
                <option value="cartago">Cartago</option>
                <option value="heredia">Heredia</option>
              </select>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full bg-[#00241B]/60 border border-[#F8FFE5]/15 rounded-xl px-3 py-2 text-[#F8FFE5]"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700">
              <Send className="w-4 h-4" /> Enviar Reserva por WhatsApp
            </button>
          </form>
        )}

        {/* MÉTODO 3: TELÉFONO */}
        {method === 'phone' && (
          <div className="space-y-4 text-xs text-center py-4 bg-[#001812]/80 p-6 rounded-2xl border border-[#F8FFE5]/10">
            <Phone className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="font-bold text-sm text-[#F8FFE5]">Central Telefónica Directa</h4>
            <p className="text-[#F8FFE5]/70">Llama a nuestro centro de reservaciones (Lun - Dom: 11:00 AM - 10:00 PM):</p>
            <a href="tel:+50622008888" className="inline-block px-6 py-3 bg-amber-600 text-white font-bold rounded-xl text-sm hover:bg-amber-700">
              Llamar Ahora: +506 2200-8888
            </a>
          </div>
        )}

      </div>
    </div>
  );
}