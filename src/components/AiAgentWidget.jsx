import { startTransition, useEffect, useRef, useState } from 'react';
import { BarChart3, Bot, X, Send, Sparkles, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { triggerN8nAutomation } from '../services/n8nService';
import { removeEmojis, validateUserPrompt } from '../services/promptValidation';
import { PUBLIC_CONTEXT, PUBLIC_REFUSALS, answerAdminQuery, answerPublicQuery, classifyPublicQuery } from '../services/caciqueAssistant';

const ADMIN_ROLES = ['admin', 'administrador'];
const STAFF_ROLES = ['mesero', 'waiter', 'pos', 'cocina', 'kitchen', 'kds'];
const INTERNAL_PANELS = ['/kitchen', '/waiter', '/cashier'];

const STAFF_FALLBACK = 'El asistente operativo no está disponible en este momento. Consulte el panel directamente; el evento quedó registrado.';

/**
 * Configuracion por modo:
 * - admin: analitica interna en tiempo real (local, sin enviar datos fuera).
 * - staff: asistente operativo de meseros y cocina (n8n).
 * - public: atencion al cliente con guardrails (n8n con respaldo local).
 */
const MODES = {
  admin: {
    title: 'Cacique Bot Analítica (Admin)',
    srLabel: 'IA Analítica Administrativa',
    placeholder: 'Pregunte por clientes, ocupación, ventas o insumos...',
    status: (user) => `Datos en tiempo real • ${user?.nombre || 'Administración'}`,
    welcome: (user) => `Bienvenido ${user?.nombre || 'Administrador'}. Analítica interna en tiempo real: consulte clientes registrados, ocupación de mesas, ventas del día, comandas activas o recomendaciones operativas.`,
    suggestions: ['Clientes por sede', 'Ocupación de mesas', 'Ventas del día', 'Recomendaciones']
  },
  staff: {
    title: 'Cacique Bot Staff (Interno)',
    srLabel: 'IA Operativa Staff',
    placeholder: 'Consulte sobre KDS, inventario o comandas...',
    status: (user) => `Staff: ${user?.nombre || 'Operativo'}`,
    welcome: (user) => `Bienvenido ${user?.nombre || 'Colaborador'}. Asistente Operativo Staff activo. Indique su consulta de comandas, KDS, inventario o reservaciones.`,
    suggestions: []
  },
  public: {
    title: 'Cacique Bot IA',
    srLabel: 'Asistente Virtual',
    placeholder: 'Escriba su consulta...',
    status: () => 'Atención al Cliente',
    welcome: () => 'Bienvenido a Chicharronera El Cacique. ¿En qué puedo asistirle hoy?\n\n1. Menú y precios\n2. Horarios y sedes\n3. Reservaciones',
    suggestions: ['Menú y precios', 'Horarios', 'Sedes', 'Reservar mesa']
  }
};

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500';

export default function AiAgentWidget() {
  const location = useLocation();
  const { user } = useAuth();
  const normalizedRole = String(user?.rol || '').toLowerCase().trim();
  const mode = ADMIN_ROLES.includes(normalizedRole) || location.pathname === '/admin'
    ? 'admin'
    : STAFF_ROLES.includes(normalizedRole) || INTERNAL_PANELS.includes(location.pathname) ? 'staff' : 'public';
  const config = MODES[mode];
  // La esquina inferior derecha queda reservada para el Dock de Accesibilidad.
  // Columna izquierda, de abajo hacia arriba:
  //   WhatsApp `bottom-6 left-4` -> launcher IA `bottom-24 left-4` -> chat `bottom-44 left-4`.
  const positionClasses = 'bottom-24 left-4';
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => [{ sender: 'bot', text: config.welcome(user) }]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const launcherRef = useRef(null);

  /**
   * Cierre por clic fuera del chat. El launcher se excluye: si no, el
   * `mousedown` cerraria el chat y el `click` del mismo boton lo reabriria.
   */
  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (containerRef.current.contains(event.target) || launcherRef.current.contains(event.target)) return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  /** Escape tambien cierra la ventana del asistente. */
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    startTransition(() => setMessages([{ sender: 'bot', text: MODES[mode].welcome(user) }]));
  }, [location.pathname, user, mode]);

  useEffect(() => {
    const handleCartOpen = () => setIsOpen(false);
    window.addEventListener('cart-opened', handleCartOpen);
    return () => window.removeEventListener('cart-opened', handleCartOpen);
  }, []);

  const addBotMessage = (text) => setMessages((prev) => [...prev, { sender: 'bot', text }]);

  const sendMessage = async (rawText) => {
    const userText = rawText.trim();
    if (!userText || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    const validation = validateUserPrompt(userText);
    if (!validation.isValid) {
      addBotMessage(validation.reason);
      return;
    }

    // Analitica interna: se responde en local con los datos en tiempo real.
    if (mode === 'admin') {
      addBotMessage(answerAdminQuery(userText));
      return;
    }

    // Guardrails publicos: lo privado o fuera de contexto no sale del navegador.
    if (mode === 'public') {
      const guard = classifyPublicQuery(userText);
      if (!guard.allowed) {
        addBotMessage(PUBLIC_REFUSALS[guard.reason]);
        return;
      }
    }

    setLoading(true);
    // triggerN8nAutomation nunca lanza: ante fallas devuelve success false.
    const res = await triggerN8nAutomation(mode === 'staff' ? 'AGENTE_IA_INTERNO' : 'AGENTE_IA_CONSULTA', {
      mensaje: userText,
      usuario: user?.correo || user?.email || 'cliente_anonimo',
      rol: user?.rol || 'cliente',
      sede: user?.sede || 'General',
      // Datos publicos vigentes para que el agente de n8n no use informacion desactualizada.
      ...(mode === 'public' ? { contexto: PUBLIC_CONTEXT } : {})
    });
    const remoteReply = res.success ? removeEmojis(res.respuesta) : '';
    addBotMessage(remoteReply || (mode === 'public' ? answerPublicQuery(userText) : STAFF_FALLBACK));
    setLoading(false);
  };

  const handleSend = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const HeaderIcon = mode === 'admin' ? BarChart3 : mode === 'staff' ? ShieldCheck : Bot;

  return (
    <div className="cacique-keep-colors font-sans">
      <style>{`
        @keyframes caciqueFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes caciqueGlow { 0%, 100% { box-shadow: 0 0 18px rgba(234, 88, 12, .25); } 50% { box-shadow: 0 0 30px rgba(249, 115, 22, .55); } }
        @keyframes caciqueEnter { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .cacique-bot-float { animation: caciqueFloat 3.2s ease-in-out infinite, caciqueGlow 3.2s ease-in-out infinite; }
        .cacique-chat-enter { animation: caciqueEnter .24s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .cacique-bot-float, .cacique-chat-enter, .cacique-bot-bounce { animation: none !important; } }
      `}</style>
      <div className={`cacique-bot-float cacique-bot-bounce fixed ${positionClasses} z-50 flex items-center justify-center`}>
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          aria-controls="cacique-chat-panel"
          aria-label={isOpen ? 'Cerrar asistente virtual' : 'Abrir asistente virtual'}
          className={`group relative flex w-14 h-14 items-center justify-center rounded-full shadow-lg bg-amber-600 text-white transition-all duration-300 hover:scale-105 hover:bg-amber-500 active:scale-95 light:bg-[#7A3E0A] light:hover:bg-[#5C2E07] light:hover:shadow-[0_8px_25px_rgba(200,109,18,0.35)] ${focusRing} focus-visible:ring-offset-2`}
        >
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" aria-hidden="true" />
          {isOpen
            ? <X className="h-6 w-6 text-white" aria-hidden="true" />
            : <Bot className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />}
          <span className="sr-only">{config.srLabel}</span>
        </button>
      </div>

      {isOpen && (
        <div
          ref={containerRef}
          data-testid="cacique-chat-window"
          className="cacique-chat-enter fixed bottom-44 left-4 z-50 flex max-h-[80vh] w-[90vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-amber-500/40 bg-zinc-950/98 text-zinc-100 shadow-2xl backdrop-blur-2xl sm:max-w-md light:border-[#4A3525]/20 light:bg-[#F5EFE6] light:text-[#2C1A0E] light:shadow-[0_18px_40px_-12px_rgba(44,26,14,0.35)]"
        >
          <div id="cacique-chat-panel" className="pointer-events-auto flex h-120 max-h-[min(80vh,calc(100dvh-12rem))] min-h-0 flex-col">
            <div className="p-4 bg-amber-600 border-b border-amber-500/30 flex justify-between items-center shadow-md light:bg-[#7A3E0A] light:border-[#4A3525]/20">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg border border-white/20 bg-black/20 text-white">
                  <HeaderIcon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold leading-tight text-white flex items-center gap-1.5">{config.title}</h3>
                  <span className="mt-0.5 text-[10px] text-amber-100 font-semibold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En línea • {config.status(user)}
                  </span>
                </div>
              </div>
              {/* Unico control del encabezado: cerrar (X). Escape o un clic
                  fuera del panel tambien lo cierran. */}
              <button type="button" onClick={() => setIsOpen(false)} title="Cerrar" aria-label="Cerrar asistente" className={`rounded-lg p-1 text-amber-100 transition-colors hover:bg-black/20 hover:text-white active:scale-95 ${focusRing}`}>
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 text-xs sm:text-sm leading-relaxed bg-zinc-950/90 light:bg-[#F5EFE6]" aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-wrap transition-all shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-amber-600 text-white rounded-br-none font-semibold light:bg-[#7A3E0A]'
                        : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-bl-none light:bg-white light:text-[#2C1A0E] light:border-[#4A3525]/15'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-orange-500/40 bg-zinc-900 p-3 text-xs text-orange-400 shadow-sm animate-pulse light:bg-white light:text-[#7A3E0A] light:border-[#7A3E0A]/30">
                    <Sparkles className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    <span>{mode === 'staff' ? 'Consultando datos del dashboard...' : 'Procesando consulta...'}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {config.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-zinc-800 bg-zinc-950/90 px-3 pt-2.5 light:bg-[#EFE6DA] light:border-[#4A3525]/15" role="group" aria-label="Consultas sugeridas">
                {config.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    disabled={loading}
                    className={`rounded-full border border-amber-500/40 px-2.5 py-1 text-[11px] font-bold text-amber-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-500/10 active:scale-95 disabled:opacity-40 light:border-[#7A3E0A]/40 light:text-[#7A3E0A] light:hover:bg-white light:hover:shadow-[0_8px_25px_rgba(200,109,18,0.25)] ${focusRing}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSend} className="p-3 bg-[#0A090C] border-t border-[#659B5E]/30 flex gap-2 light:bg-[#EFE6DA] light:border-[#4A3525]/15">
              <input
                type="text"
                aria-label="Mensaje para el asistente"
                placeholder={config.placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-w-0 flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors light:bg-white light:text-[#2C1A0E] light:border-[#4A3525]/30 light:placeholder-[#5C4636]"
              />
              <button type="submit" aria-label="Enviar mensaje" disabled={loading || !input.trim()} className={`flex items-center justify-center rounded-xl bg-amber-600 px-3.5 py-2.5 text-white shadow-md transition-all hover:bg-amber-500 active:scale-95 disabled:opacity-40 light:bg-[#7A3E0A] light:hover:bg-[#5C2E07] ${focusRing}`}>
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
