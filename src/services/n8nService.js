// Canal de comunicación en vivo entre pestañas (Cocina <-> Mesero <-> Admin)
const eventChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('gourmetsync_live_events') 
  : null;

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/cacique-master-webhook';

export async function triggerN8nAutomation(modulo, payload) {
  const eventData = {
    modulo,
    fechaEnvio: new Date().toISOString(),
    id: `EVT-${Date.now()}`,
    ...payload
  };

  // 1. Transmisión local en vivo a las demás pestañas del navegador
  if (eventChannel) {
    eventChannel.postMessage(eventData);
  }

  // 2. Intento de envío al servidor local/remoto de n8n
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, mode: 'n8n_online', data, respuesta: data.respuesta || data.output };
    }
  } catch (error) {
    console.warn('Servidor n8n fuera de línea o sin respuesta CORS. Se utilizó fallback local en vivo.', error.message);
  }

  // Fallback inteligente para respuestas del Agente de IA cuando n8n no responde localmente
  let fallbackReply = null;
  if (modulo === 'AGENTE_IA_CONSULTA') {
    fallbackReply = '¡Hola! En El Cacique ofrecemos los mejores chicharrones de paila y cortes a la leña. Atendemos en Escazú, Santa Ana, Cartago y Heredia de 11:30 AM a 11:00 PM.';
  }

  return { success: true, mode: 'local_broadcast', data: eventData, respuesta: fallbackReply };
}

export function subscribeToLiveEvents(callback) {
  if (!eventChannel) return () => {};
  
  const handler = (event) => callback(event.data);
  eventChannel.addEventListener('message', handler);
  
  return () => eventChannel.removeEventListener('message', handler);
}