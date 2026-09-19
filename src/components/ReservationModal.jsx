import { useState } from 'react';
import { MessageSquare, Phone, Calendar, PartyPopper, X, Send } from 'lucide-react';

export default function ReservationModal({ isOpen, onClose, onShowToast }) {
  const [method, setMethod] = useState('web');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    sede: 'escazu',
    personas: '2',
    fecha: new Date().toISOString().split('T')[0],
    hora: '19:00',
    tipoEvento: 'Cumpleaños',
    notas: ''
  });

  if (!isOpen) return null;

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const phone = '50622008888';
    const isEvento = method === 'eventos';
    const text = encodeURIComponent(
      `¡Hola Chicharronera El Cacique! Deseo solicitar un ${isEvento ? 'EVENTO ESPECIAL' : 'RESERVA'}:\n` +
      `• Nombre: ${formData.nombre}\n` +
      `• Teléfono: ${formData.telefono}\n` +
      `• Sede: ${formData.sede.toUpperCase()}\n` +
      `• Personas: ${formData.personas}\n` +
      `• Fecha: ${formData.fecha}\n` +
      `• Hora: ${formData.hora}\n` +
      (isEvento ? `• Tipo de Evento: ${formData.tipoEvento}\n` : '') +
      `• Notas: ${formData.notas || 'Ninguna'}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    onShowToast('Redirigiendo a WhatsApp API...', 'info');
    onClose();
  };

  const handleWebSubmit = (e) => {
    e.preventDefault();
    onShowToast(`¡Solicitud enviada para ${formData.nombre} el ${formData.fecha}!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A090C] border border-[#F8FFE5]/15 rounded-2xl max-w-lg w-full p-6 text-[#F8FFE5] space-y-6 shadow-2xl relative">
        
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-lg text-[#F8FFE5]/40 hover:text-[#F8FFE5]">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-extrabold tracking-tight text-[#F8FFE5]">Reservas &amp; Eventos • El Cacique</h3>
          <p className="text-xs text-[#F8FFE5]/60">Selecciona el canal para agendar tu mesa o celebración:</p>
        </div>

        <div className="grid grid-cols-4 gap-1.5 bg-[#001812] p-1.5 rounded-xl border border-[#F8FFE5]/10 text-[11px] font-bold">
          <button
            onClick={() => setMethod('web')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              method === 'web' ? 'bg-[#D16014] text-white' : 'text-[#F8FFE5]/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> En Línea
          </button>

          <button
            onClick={() => setMethod('whatsapp')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              method === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-[#F8FFE5]/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </button>

          <button
            onClick={() => setMethod('eventos')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              method === 'eventos' ? 'bg-purple-600 text-white' : 'text-[#F8FFE5]/60'
            }`}
          >
            <PartyPopper className="w-3.5 h-3.5" /> Eventos
          </button>

          <button
            onClick={() => setMethod('phone')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              method === 'phone' ? 'bg-amber-600 text-white' : 'text-[#F8FFE5]/60'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> Celular
          </button>
        </div>

        {(method === 'web' || method === 'eventos') && (
          <form onSubmit={method === 'eventos' ? handleWhatsAppSubmit : handleWebSubmit} className="space-y-3 text-xs">
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
                <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Teléfono Móvil</label>
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

              {method === 'eventos' ? (
                <div>
                  <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Tipo de Evento</label>
                  <select
                    value={formData.tipoEvento}
                    onChange={e => setFormData({ ...formData, tipoEvento: e.target.value })}
                    className="w-full bg-[#00241B]/60 border border-[#F8FFE5]/15 rounded-xl px-3 py-2 text-[#F8FFE5]"
                  >
                    <option value="Cumpleaños">Cumpleaños</option>
                    <option value="Evento Corporativo">Evento Corporativo</option>
                    <option value="Reunión Familiar">Reunión Familiar</option>
                  </select>
                </div>
              ) : (
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
                    <option value="8">8+ Personas</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Fecha</label>
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
              {method === 'eventos' ? 'Finalizar Cotización en WhatsApp' : 'Confirmar Reserva Web'}
            </button>
          </form>
        )}

        {method === 'whatsapp' && (
          <form onSubmit={handleWhatsAppSubmit} className="space-y-3 text-xs">
            <input
              type="text"
              required
              placeholder="Tu Nombre"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full bg-[#00241B]/60 border border-[#F8FFE5]/15 rounded-xl px-3 py-2 text-[#F8FFE5]"
            />
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700">
              <Send className="w-4 h-4" /> Finalizar en WhatsApp API
            </button>
          </form>
        )}

        {method === 'phone' && (
          <div className="space-y-3 text-xs text-center py-4 bg-[#001812]/80 p-6 rounded-2xl border border-[#F8FFE5]/10">
            <Phone className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="font-bold text-sm text-[#F8FFE5]">Central de Llamadas Directas</h4>
            <a href="tel:+50622008888" className="inline-block px-6 py-3 bg-amber-600 text-white font-bold rounded-xl text-sm">
              Llamar al Celular: +506 2200-8888
            </a>
          </div>
        )}

      </div>
    </div>
  );
}