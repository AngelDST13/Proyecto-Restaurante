const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/cacique-master-webhook';

export async function triggerN8nAutomation(modulo, payload) {
  const requestBody = {
    modulo: modulo || 'AGENTE_IA_CONSULTA',
    mensaje: payload?.mensaje || payload?.userMessage || '',
    fechaEnvio: new Date().toISOString(),
    id: `EVT-${Date.now()}`,
    ...payload
  };

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const data = await response.json();
      const replyText = data.respuesta || data.output || (data.data && data.data.respuesta);
      if (replyText) {
        return { success: true, respuesta: replyText, data };
      }
    }
  } catch (error) {
    console.warn('n8n fuera de línea o sin responder:', error.message);
  }

  return {
    success: false,
    respuesta: 'En este momento no se pudo establecer conexión con el flujo de n8n. Verifique que el workflow esté en estado Published.'
  };
}

// Función requerida por WaiterDashboard.jsx para la escucha de eventos en vivo
export function subscribeToLiveEvents(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (event) => {
    if (callback && typeof callback === 'function') {
      callback(event.detail);
    }
  };

  window.addEventListener('cacique-live-event', handleCustomEvent);

  // Retornar función de desuscripción para el cleanup de useEffect
  return () => {
    window.removeEventListener('cacique-live-event', handleCustomEvent);
  };
}