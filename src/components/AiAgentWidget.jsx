import { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, Minus, Sparkles, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { triggerN8nAutomation } from '../services/n8nService';
import { removeEmojis, validateUserPrompt } from '../services/promptValidation';

export default function AiAgentWidget() {
  const location = useLocation();
  const { user } = useAuth();
  const normalizedRole = String(user?.rol || '').toLowerCase().trim();
  const isStaffRole = ['admin', 'administrador', 'mesero', 'waiter', 'pos', 'cocina', 'kitchen', 'kds'].includes(normalizedRole);
  const isInternalPanel = ['/admin', '/kitchen', '/waiter'].includes(location.pathname);
  const isStaffContext = isStaffRole || isInternalPanel;
  const moduloIA = isStaffContext ? 'AGENTE_IA_INTERNO' : 'AGENTE_IA_CONSULTA';
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
        text: isStaffContext
          ? `Bienvenido ${user?.nombre || 'Colaborador'}. Asistente Operativo Staff activo. Indique su consulta de comandas, KDS, inventario o reservaciones.`
          : 'Bienvenido a Chicharronera El Cacique. ¿En qué puedo asistirle hoy?\n\n1. Menú y precios\n2. Horarios y sedes\n3. Reservaciones'
      }
    ]);
  }, [location.pathname, user?.nombre, isStaffContext]);

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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 font-sans">
      <style>{`
        @keyframes caciqueFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes caciqueGlow { 0%, 100% { box-shadow: 0 0 18px rgba(234, 88, 12, .25); } 50% { box-shadow: 0 0 30px rgba(249, 115, 22, .55); } }
        @keyframes caciqueEnter { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes caciqueSparkle { 0%, 100% { opacity: .55; transform: rotate(0deg); } 50% { opacity: 1; transform: rotate(18deg); } }
        .cacique-bot-float { animation: caciqueFloat 3.2s ease-in-out infinite, caciqueGlow 3.2s ease-in-out infinite; }
        .cacique-chat-enter { animation: caciqueEnter .24s ease-out both; }
        .cacique-sparkle { animation: caciqueSparkle 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .cacique-bot-float, .cacique-chat-enter, .cacique-sparkle, .cacique-bot-bounce { animation: none !important; } }
      `}</style>
      {(!isOpen || isMinimized) && (
        <div className="cacique-bot-float fixed bottom-5 right-5 z-40">
          <button
            type="button"
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="group relative flex items-center gap-2.5 rounded-full border border-amber-400/50 bg-amber-600 px-4 py-3 text-xs font-bold text-white shadow-[0_0_20px_rgba(217,119,6,0.5)] transition-all duration-300 hover:scale-105 hover:bg-amber-500 hover:shadow-[0_0_30px_rgba(217,119,6,0.8)] active:scale-95 sm:text-sm"
            aria-label="Abrir asistente virtual"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <Bot className="cacique-bot-bounce h-5 w-5 text-white animate-bounce transition-transform duration-300 group-hover:rotate-12" />
            <span className="text-xs font-extrabold tracking-wide drop-shadow-sm sm:text-sm">
              {isStaffContext ? 'IA Operativa Staff' : 'Asistente Virtual'}
            </span>
            <Sparkles className="cacique-sparkle h-3.5 w-3.5 text-amber-200" />
          </button>
        </div>
      )}

      {isOpen && !isMinimized && (
        <div className="cacique-chat-enter fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2.5rem)] sm:w-96 bg-zinc-950/98 backdrop-blur-2xl border border-amber-500/40 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[480px] max-h-[82vh]">
          <div className="p-4 bg-amber-600 border-b border-amber-500/30 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg border border-white/20 bg-black/20 text-white">
                {isStaffContext ? <ShieldCheck className="w-5 h-5 text-amber-200" /> : <Bot className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-extrabold leading-tight text-white flex items-center gap-1.5">
                  {isStaffContext ? 'Cacique Bot Staff (Interno)' : 'Cacique Bot IA'}
                </h3>
                <span className="mt-0.5 text-[10px] text-amber-100 font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En línea • {isStaffContext ? `Staff: ${user?.nombre || 'Operativo'}` : 'Atención al Cliente'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(true)} title="Minimizar" aria-label="Minimizar asistente" className="rounded-lg p-1 text-amber-100 transition-colors hover:bg-black/20 hover:text-white">
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => { setIsOpen(false); setIsMinimized(false); }} title="Cerrar" aria-label="Cerrar asistente" className="rounded-lg p-1 text-amber-100 transition-colors hover:bg-black/20 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 text-xs sm:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800 bg-zinc-950/90">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-wrap transition-all shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-amber-600 text-white rounded-br-none font-semibold'
                      : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-orange-500/40 bg-zinc-900 p-3 text-xs text-orange-400 shadow-sm animate-pulse">
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-400" />
                  <span>{isStaffContext ? 'Consultando datos del dashboard...' : 'Procesando consulta...'}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-[#0A090C] border-t border-[#659B5E]/30 flex gap-2">
            <input
              type="text"
              placeholder={isStaffContext ? 'Consulte sobre KDS, inventario o comandas...' : 'Escriba su consulta...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-w-0 flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button type="submit" disabled={loading || !input.trim()} className="flex items-center justify-center rounded-xl bg-amber-600 px-3.5 py-2.5 text-white shadow-md transition-all hover:bg-amber-500 disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
