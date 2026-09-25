// Canal de comunicación local entre pestañas
const eventChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('gourmetsync_live_events')
  : null;

const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/cacique-master-webhook';

export async function triggerN8nAutomation(modulo, payload) {
  const eventData = {
    modulo: modulo || 'AGENTE_IA_CONSULTA',
    fechaEnvio: new Date().toISOString(),
    id: `EVT-${Date.now()}`,
    ...payload
  };

  if (eventChannel) {
    eventChannel.postMessage(eventData);
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    if (response.ok) {
      const data = await response.json();

      // Capturar la respuesta devuelta por Gemini
      const replyText = data.respuesta || data.output || (data.data && data.data.respuesta);

      if (replyText) {
        return { success: true, mode: 'n8n_online', respuesta: replyText, data };
      }
    }
  } catch (error) {
    console.warn('Servidor n8n fuera de línea:', error.message);
  }

  return {
    success: false,
    respuesta: 'En este momento el servidor de IA está reiniciando. Por favor intenta de nuevo en unos segundos.'
  };
}

export function subscribeToLiveEvents(callback) {
  if (!eventChannel) return () => {};
  const handler = (event) => callback(event.data);
  eventChannel.addEventListener('message', handler);
  return () => eventChannel.removeEventListener('message', handler);
}
