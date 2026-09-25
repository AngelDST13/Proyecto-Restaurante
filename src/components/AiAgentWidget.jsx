import { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { triggerN8nAutomation } from '../services/n8nService';

export default function AiAgentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '¡Hola! Soy el Asistente IA de El Cacique 🤠. ¿En qué puedo ayudarte? Puedo brindarte información del menú, horarios, sedes (Escazú, Santa Ana, Cartago, Heredia) o ayudarte con tu reserva.'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await triggerN8nAutomation('AGENTE_IA_CONSULTA', {
        mensaje: userText
      });

      const reply = res?.respuesta || '¡Gracias por contactarnos! Puedes revisar nuestro Menú Digital o consultar sobre nuestras sedes.';
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
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-[#D16014] hover:bg-[#b8510f] text-white shadow-[0_0_25px_rgba(209,96,20,0.6)] transition-all transform hover:scale-110 flex items-center gap-2 font-black text-xs cursor-pointer"
        >
          <Bot className="w-6 h-6 animate-bounce" />
          <span className="hidden sm:inline uppercase tracking-wider">Asistente IA</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 bg-[#001812] border-2 border-[#659B5E] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-120">
          <div className="p-4 bg-[#0A090C] border-b border-[#659B5E]/30 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#D16014]/20 text-[#D16014]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  Cacique Bot IA <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <span className="text-[10px] text-[#659B5E] font-bold">En línea • El Cacique</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
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
          </div>

          <form onSubmit={handleSend} className="p-3 bg-[#0A090C] border-t border-[#659B5E]/30 flex gap-2">
            <input
              type="text"
              placeholder="Escribe tu consulta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl bg-[#001812] border border-[#F8FFE5]/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D16014]"
            />
            <button type="submit" disabled={loading} className="p-2.5 rounded-xl bg-[#659B5E] text-white font-bold cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}