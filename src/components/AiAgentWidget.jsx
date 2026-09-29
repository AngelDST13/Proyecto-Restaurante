import { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, Minus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { triggerN8nAutomation } from '../services/n8nService';
import { removeEmojis, validateUserPrompt } from '../services/promptValidation';

export default function AiAgentWidget() {
  const location = useLocation();
  const { user } = useAuth();
  const isInternalPanel = ['/admin', '/kitchen', '/waiter'].includes(location.pathname);
  const moduloIA = isInternalPanel ? 'AGENTE_IA_INTERNO' : 'AGENTE_IA_CONSULTA';
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '¡Hola! Soy el Asistente IA de El Cacique. ¿En qué puedo ayudarte? Puedo brindarte información del menú, horarios, sedes (Escazú, Santa Ana, Cartago, Heredia) o ayudarte con tu reserva.'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: isInternalPanel
          ? `Bienvenido ${user?.nombre || 'Colaborador'}. Asistente Operativo El Cacique activo. Por favor indique su consulta de comandas, inventario o reservas.`
          : 'Bienvenido a Chicharronera El Cacique. ¿En qué puedo asistirle hoy?\n\n1. Menú y precios\n2. Horarios y sedes\n3. Reservaciones'
      }
    ]);
  }, [location.pathname, user?.nombre]);

  useEffect(() => {
    const handleCartOpen = () => { setIsOpen(false); setIsMinimized(false); };
    window.addEventListener('cart-opened', handleCartOpen);
    return () => window.removeEventListener('cart-opened', handleCartOpen);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    const validation = validateUserPrompt(userText);
    if (!validation.isValid) {
      setMessages((prev) => [...prev, { sender: 'bot', text: validation.reason }]);
      return;
    }

    setLoading(true);

    try {
      const res = await triggerN8nAutomation(moduloIA, {
        mensaje: userText,
        usuario: user?.correo || user?.email || 'cliente_anonimo',
        rol: user?.rol || 'cliente',
        sede: user?.sede || 'General'
      });

      const reply = removeEmojis(res?.respuesta || '') || '¡Gracias por contactarnos! Puedes revisar nuestro Menú Digital o consultar sobre nuestras sedes.';
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'En este momento tenemos alta demanda. Consulta nuestro menú digital en la barra superior.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 font-sans">
      {(!isOpen || isMinimized) && (
        <button
          type="button"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="flex items-center gap-2 rounded-full border border-[#659B5E]/50 bg-[#0A090C] px-4 py-3 text-xs font-bold text-amber-400 shadow-xl transition-colors hover:bg-[#001812]"
          aria-label="Abrir asistente virtual"
        >
          <Bot className="h-4 w-4" />
          <span>{isInternalPanel ? 'IA Operativa Staff' : 'Asistente Virtual'}</span>
        </button>
      )}

      {isOpen && !isMinimized && (
        <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-[#001812] border-2 border-[#659B5E] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[460px] max-h-[82vh]">
          <div className="p-4 bg-[#0A090C] border-b border-[#659B5E]/30 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#D16014]/20 text-[#D16014]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  {isInternalPanel ? 'Cacique Bot Staff' : 'Cacique Bot IA'}
                </h3>
                <span className="text-[10px] text-[#659B5E] font-bold">En línea • El Cacique</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(true)} title="Minimizar" aria-label="Minimizar asistente" className="text-gray-400 hover:text-white p-1">
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => { setIsOpen(false); setIsMinimized(false); }} title="Cerrar" aria-label="Cerrar asistente" className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 text-xs sm:text-sm leading-relaxed">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] p-3 rounded-2xl whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-[#D16014] text-white rounded-br-none'
                      : 'bg-[#0A090C] border border-[#659B5E]/30 text-gray-200 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-[#0A090C] border border-[#659B5E]/30 text-xs text-amber-400 animate-pulse">
                  Procesando respuesta...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-[#0A090C] border-t border-[#659B5E]/30 flex gap-2">
            <input
              type="text"
              placeholder="Escribe tu consulta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-w-0 flex-1 px-3 py-2.5 rounded-xl bg-[#001812] border border-[#F8FFE5]/15 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D16014]"
            />
            <button type="submit" disabled={loading || !input.trim()} className="p-2.5 rounded-xl bg-[#659B5E] text-white font-bold cursor-pointer disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
