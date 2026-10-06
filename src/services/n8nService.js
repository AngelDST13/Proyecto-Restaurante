import { N8N_WEBHOOK_MASTER, httpRequest } from './api';
import { logFailedAutomation } from './automationLog';

/** Tiempo maximo de espera de n8n: el chat o el envio nunca quedan colgados. */
export const N8N_TIMEOUT_MS = 8000;

export const N8N_UNAVAILABLE_MESSAGE =
  'En este momento no se pudo establecer conexión con el flujo de n8n. Verifique que el workflow esté en estado Published.';

/**
 * Dispara un flujo de n8n. Nunca lanza: ante fallas de red, tiempo agotado o
 * respuestas sin texto devuelve `{ success: false, offline: true }` y deja el
 * evento registrado (ver automationLog) para que la UI muestre un aviso sin
 * bloquear al usuario.
 */
export async function triggerN8nAutomation(modulo, payload) {
  const moduleName = modulo || 'AGENTE_IA_CONSULTA';
  const requestBody = {
    modulo: moduleName,
    mensaje: payload?.mensaje || payload?.userMessage || '',
    fechaEnvio: new Date().toISOString(),
    id: `EVT-${Date.now()}`,
    ...payload
  };

  let motivo;
  try {
    const data = await httpRequest(N8N_WEBHOOK_MASTER, { method: 'POST', body: requestBody, timeoutMs: N8N_TIMEOUT_MS });
    const replyText = data?.respuesta || data?.output || data?.data?.respuesta;
    if (replyText) {
      return { success: true, respuesta: replyText, data };
    }
    motivo = 'Respuesta sin contenido';
  } catch (error) {
    motivo = error.message;
  }

  logFailedAutomation(moduleName, motivo);
  return { success: false, offline: true, respuesta: N8N_UNAVAILABLE_MESSAGE };
}

// Función requerida por WaiterDashboard.jsx para la escucha de eventos en vivo
export function subscribeToLiveEvents(callback) {
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
