import { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, Minus, Sparkles } from 'lucide-react';
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
      <style>{`
        @keyframes caciqueFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes caciqueGlow { 0%, 100% { box-shadow: 0 0 18px rgba(245, 158, 11, .2); } 50% { box-shadow: 0 0 30px rgba(245, 158, 11, .42); } }
        @keyframes caciqueEnter { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes caciqueSparkle { 0%, 100% { opacity: .55; transform: rotate(0deg); } 50% { opacity: 1; transform: rotate(18deg); } }
        .cacique-bot-float { animation: caciqueFloat 3.2s ease-in-out infinite, caciqueGlow 3.2s ease-in-out infinite; }
        .cacique-chat-enter { animation: caciqueEnter .24s ease-out both; }
        .cacique-sparkle { animation: caciqueSparkle 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .cacique-bot-float, .cacique-chat-enter, .cacique-sparkle { animation: none; } }
      `}</style>
      {(!isOpen || isMinimized) && (
        <button
          type="button"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="cacique-bot-float group flex items-center gap-2.5 rounded-full border border-amber-500/50 bg-gradient-to-r from-zinc-950 via-[#0A090C] to-[#001812] px-4 py-3 text-xs font-bold text-amber-400 transition-all duration-300 hover:scale-105 hover:border-amber-400 hover:shadow-[0_0_32px_rgba(245,158,11,0.45)] sm:text-sm"
          aria-label="Abrir asistente virtual"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
          <Bot className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          <span>{isInternalPanel ? 'IA Operativa Staff' : 'Asistente Virtual'}</span>
          <Sparkles className="cacique-sparkle h-3.5 w-3.5 text-amber-300" />
        </button>
      )}

      {isOpen && !isMinimized && (
        <div className="cacique-chat-enter fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-zinc-950/95 backdrop-blur-2xl border border-amber-500/40 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[470px] max-h-[82vh]">
          <div className="p-4 bg-gradient-to-r from-zinc-900 via-[#0A090C] to-[#001812] border-b border-amber-500/30 flex justify-between items-center shadow-sm">
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
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-br-none font-medium shadow-md'
                      : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-zinc-900/90 p-3 text-xs text-amber-400 shadow-sm animate-pulse">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span>Procesando consulta...</span>
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
              className="min-w-0 flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button type="submit" disabled={loading || !input.trim()} className="flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-3.5 py-2.5 text-white shadow-md transition-all hover:from-amber-500 hover:to-amber-400 disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
