/**
 * Registro local de automatizaciones de n8n que no se pudieron entregar
 * (correos de reserva, comunicados, consultas al agente).
 *
 * Permite auditar y reintentar los envios cuando n8n vuelve a estar
 * disponible, sin bloquear nunca la experiencia del usuario.
 */

export const FAILED_AUTOMATIONS_KEY = 'cacique_n8n_failed_events';
const MAX_ENTRIES = 20;

export function getFailedAutomations(storage = localStorage) {
  try {
    const stored = JSON.parse(storage.getItem(FAILED_AUTOMATIONS_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

/** Guarda el fallo (los 20 mas recientes) y lo informa en consola. Nunca lanza. */
export function logFailedAutomation(modulo, motivo, storage = localStorage) {
  const entry = { modulo, motivo, fecha: new Date().toISOString() };
  console.warn(`n8n no disponible (${modulo}): ${motivo}`);
  try {
    storage.setItem(FAILED_AUTOMATIONS_KEY, JSON.stringify([...getFailedAutomations(storage), entry].slice(-MAX_ENTRIES)));
  } catch {
    // Sin almacenamiento el aviso en consola es el unico registro.
  }
  return entry;
}
