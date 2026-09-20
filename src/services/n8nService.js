// Canal de comunicación en vivo entre pestañas (Cocina <-> Mesero <-> Admin)
const eventChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('gourmetsync_live_events') 
  : null;

const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/cacique-master-webhook';

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

  // 2. Intento de envío al servidor local n8n
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, mode: 'n8n_online', data };
    }
  } catch (error) {
    console.warn('Servidor n8n fuera de línea o sin respuesta CORS. Se utilizó fallback local en vivo.', error.message);
  }

  return { success: true, mode: 'local_broadcast', data: eventData };
}

export function subscribeToLiveEvents(callback) {
  if (!eventChannel) return () => {};
  
  const handler = (event) => callback(event.data);
  eventChannel.addEventListener('message', handler);
  
  return () => eventChannel.removeEventListener('message', handler);
}