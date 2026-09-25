// Canal de comunicación en vivo entre pestañas
const eventChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('gourmetsync_live_events')
  : null;

// URL de producción de n8n
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/cacique-master-webhook';

export async function triggerN8nAutomation(modulo, payload) {
  const eventData = {
    modulo,
    fechaEnvio: new Date().toISOString(),
    id: `EVT-${Date.now()}`,
    ...payload
  };

  // 1. Notificar en vivo a otras pestañas
  if (eventChannel) {
    eventChannel.postMessage(eventData);
  }

  // 2. Enviar petición real a n8n
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    if (response.ok) {
      const data = await response.json();

      // Obtiene la respuesta generada por Gemini o el nodo correspondiente
      const textoRespuesta = data.respuesta || data.output || (data.data && data.data.respuesta);

      if (textoRespuesta) {
        return { success: true, mode: 'n8n_online', respuesta: textoRespuesta, data };
      }
    }
  } catch (error) {
    console.warn('n8n no devolvió respuesta, usando fallback local:', error.message);
  }

  // Fallback si n8n no está activo o responde vacío
  return {
    success: true,
    mode: 'local_fallback',
    respuesta: '¡Hola! Soy el asistente virtual de El Cacique. En este momento estoy actualizando el menú, pero puedes consultar nuestras especialidades en Escazú, Santa Ana, Cartago y Heredia.'
  };
}

export function subscribeToLiveEvents(callback) {
  if (!eventChannel) return () => {};
  const handler = (event) => callback(event.data);
  eventChannel.addEventListener('message', handler);
  return () => eventChannel.removeEventListener('message', handler);
}
