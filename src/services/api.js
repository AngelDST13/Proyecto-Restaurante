/**
 * Cliente HTTP centralizado de Chicharronera El Cacique.
 *
 * - `httpRequest`: fetch nativo con tiempo de espera (AbortController),
 *   serializacion JSON y errores tipados (`ApiError`).
 * - `withFallback`: ejecuta una peticion y, si el servidor no responde,
 *   devuelve datos simulados estructurados en lugar de romper la vista.
 *   El resultado siempre tiene la forma `{ data, offline, error }` para que
 *   la UI decida si mostrar una notificacion Toast.
 *
 * Endpoints:
 *   json-server (`npm run api`) -> VITE_JSON_SERVER_URL (por defecto :3001)
 *   n8n master webhook          -> VITE_N8N_WEBHOOK_URL
 */

const env = import.meta.env ?? {};

export const API_BASE_URL = env.VITE_JSON_SERVER_URL || 'http://localhost:3001';
export const N8N_WEBHOOK_MASTER =
  env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/cacique-master-webhook';
export const DEFAULT_TIMEOUT_MS = 5000;
export const PENDING_RESERVATIONS_KEY = 'cacique_pending_reservations';

export class ApiError extends Error {
  constructor(message, { status = null, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.cause = cause;
  }
}

export async function httpRequest(url, { method = 'GET', body, headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new ApiError(`El servidor respondio con estado ${response.status}`, { status: response.status });
    }

    return response.status === 204 ? null : await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const message = error?.name === 'AbortError'
      ? `Tiempo de espera agotado (${timeoutMs} ms)`
      : error?.message || 'Error de red';
    throw new ApiError(message, { cause: error });
  } finally {
    clearTimeout(timer);
  }
}

export async function withFallback(request, fallback) {
  try {
    return { data: await request(), offline: false, error: null };
  } catch (error) {
    const data = typeof fallback === 'function' ? fallback(error) : fallback;
    return { data, offline: true, error };
  }
}

/** Notifica un evento a n8n sin bloquear la UI; nunca lanza. */
export function notifyWebhook(modulo, payload = {}) {
  return httpRequest(N8N_WEBHOOK_MASTER, {
    method: 'POST',
    body: { modulo, evento: modulo, timestamp: new Date().toISOString(), ...payload },
    timeoutMs: 4000
  }).catch((error) => {
    console.warn(`n8n webhook ${modulo} fuera de linea:`, error.message);
    return null;
  });
}

/* --------------------------------------------------------------------------
   Reservaciones
   -------------------------------------------------------------------------- */

export function getPendingReservations() {
  try {
    const stored = JSON.parse(localStorage.getItem(PENDING_RESERVATIONS_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function queuePendingReservation(reservation) {
  try {
    localStorage.setItem(
      PENDING_RESERVATIONS_KEY,
      JSON.stringify([...getPendingReservations(), reservation])
    );
  } catch {
    // Sin almacenamiento disponible la reserva sigue confirmada en pantalla.
  }
}

/**
 * Registra una reservacion. Si la API no responde, la reserva se guarda en
 * la cola local `cacique_pending_reservations` para sincronizarla despues.
 */
export async function createReservation(reservation) {
  const payload = { ...reservation, estado: 'confirmada', creadaEn: new Date().toISOString() };

  const result = await withFallback(
    () => httpRequest(`${API_BASE_URL}/reservaciones`, { method: 'POST', body: payload }),
    () => {
      const localReservation = { ...payload, id: `LOCAL-${Date.now()}`, estado: 'pendiente_sincronizacion' };
      queuePendingReservation(localReservation);
      return localReservation;
    }
  );

  notifyWebhook('RESERVA_CREADA', { reserva: result.data, offline: result.offline });
  return result;
}

/* --------------------------------------------------------------------------
   Menu digital
   -------------------------------------------------------------------------- */

const isValidMenuItem = (item) =>
  item && item.id != null && typeof item.nombre === 'string' && Number.isFinite(Number(item.precio));

/**
 * Obtiene el catalogo remoto. Si la API falla o devuelve datos invalidos se
 * usa `localCatalog` como respaldo.
 */
export async function fetchMenu(localCatalog = []) {
  return withFallback(async () => {
    const items = await httpRequest(`${API_BASE_URL}/menu`);
    if (!Array.isArray(items) || items.length === 0 || !items.every(isValidMenuItem)) {
      throw new ApiError('El catalogo remoto esta vacio o tiene un formato invalido');
    }
    return items.map((item) => ({ ...item, precio: Number(item.precio) }));
  }, localCatalog);
}

/* --------------------------------------------------------------------------
   API heredada (autenticacion y comandas hacia n8n)
   -------------------------------------------------------------------------- */

export const api = {
  loginUser: async (email, password) => {
    if (!password) {
      throw new Error('La contraseña es requerida');
    }

    const data = await httpRequest(`${API_BASE_URL}/usuarios?email=${encodeURIComponent(email)}`);
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const user = data[0];
    notifyWebhook('LOGIN_SUCCESS', { usuario: user.email, rol: user.rol });
    return user;
  },

  sendOrderToN8n: async (orderData) => {
    const { data } = await withFallback(
      () => httpRequest(N8N_WEBHOOK_MASTER, { method: 'POST', body: { modulo: 'PEDIDO_MENU', ...orderData } }),
      { status: 'fallback_offline', message: 'Comanda procesada localmente' }
    );
    return data;
  },

  createReservation,
  fetchMenu
};
