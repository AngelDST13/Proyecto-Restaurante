import { normalizeSedeKey } from './weatherService';

/**
 * Sincronizacion en tiempo real entre Landing, Admin, Mesero, Cocina y Caja.
 *
 * Cada coleccion vive en localStorage (fuente unica de verdad) y cada
 * escritura emite `cacique:sync` para la pestaña actual; las demas pestañas
 * reciben el evento nativo `storage`. Los componentes se suscriben con el
 * hook `useSharedCollection`, de modo que una reserva o comanda creada en un
 * panel aparece de inmediato en los demas sin recargar.
 */

export const RESERVATIONS_KEY = 'cacique_admin_reservations';
export const KITCHEN_ORDERS_KEY = 'cacique_kitchen_orders';
export const SYNC_EVENT = 'cacique:sync';

const EMPTY = Object.freeze([]);
// Cache por clave: useSyncExternalStore exige devolver la misma referencia
// mientras el contenido no cambie.
const snapshotCache = new Map();

export function readCollection(key) {
  let raw;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return EMPTY;
  }

  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) return cached.value;

  let value = EMPTY;
  try {
    const parsed = JSON.parse(raw || '[]');
    if (Array.isArray(parsed)) value = parsed;
  } catch {
    value = EMPTY;
  }
  snapshotCache.set(key, { raw, value });
  return value;
}

export function writeCollection(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    return false;
  }
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key } }));
  return true;
}

export function subscribeCollection(key, callback) {
  const onSync = (event) => {
    if (event.detail?.key === key) callback();
  };
  const onStorage = (event) => {
    if (event.key === key || event.key === null) callback();
  };
  window.addEventListener(SYNC_EVENT, onSync);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(SYNC_EVENT, onSync);
    window.removeEventListener('storage', onStorage);
  };
}

/** Fecha local `AAAA-MM-DD` (toISOString usaria UTC y adelantaria el dia en Costa Rica). */
export function localDateKey(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/* --------------------------------------------------------------------------
   Plano de mesas compartido (Mesero) y asignacion automatica de reservas
   -------------------------------------------------------------------------- */

export const WAITER_FLOOR_LAYOUT = Object.freeze({
  piso1: [
    { id: 1, numero: 'Mesa 01', capacidad: 4, estado: 'Libre', tiempo: '0 min' },
    { id: 2, numero: 'Mesa 02', capacidad: 2, estado: 'Ocupada', total: 18500, tiempo: '25 min' },
    { id: 3, numero: 'Mesa 03', capacidad: 6, estado: 'Libre', tiempo: '0 min' },
    { id: 4, numero: 'Mesa 04', capacidad: 4, estado: 'Cuenta', total: 24000, tiempo: '42 min' },
    { id: 5, numero: 'Mesa 05', capacidad: 8, estado: 'Reservada', tiempo: 'En espera' },
    { id: 6, numero: 'Mesa 06', capacidad: 2, estado: 'Libre', tiempo: '0 min' }
  ],
  piso2: [
    { id: 7, numero: 'Mesa T1', capacidad: 4, estado: 'Libre', tiempo: '0 min' },
    { id: 8, numero: 'Mesa T2', capacidad: 4, estado: 'Ocupada', total: 32000, tiempo: '15 min' },
    { id: 9, numero: 'Mesa T3', capacidad: 6, estado: 'Libre', tiempo: '0 min' },
    { id: 10, numero: 'Mesa T4', capacidad: 2, estado: 'Libre', tiempo: '0 min' }
  ]
});

export const createWaiterTables = () => ({
  piso1: WAITER_FLOOR_LAYOUT.piso1.map((table) => ({ ...table })),
  piso2: WAITER_FLOOR_LAYOUT.piso2.map((table) => ({ ...table }))
});

const isActiveReservation = (reservation) => !['Cancelada', 'Completada'].includes(reservation.estado);

/**
 * Mesa libre mas pequeña con capacidad suficiente que no tenga otra reserva
 * activa el mismo dia en la misma sede. Devuelve '' si no hay mesa.
 */
export function assignTable({ sede, fecha, personas }, reservations = readCollection(RESERVATIONS_KEY)) {
  const taken = new Set(reservations
    .filter((item) => item.sede === sede && item.fecha === fecha && isActiveReservation(item))
    .map((item) => String(item.mesa)));

  const candidate = [...WAITER_FLOOR_LAYOUT.piso1, ...WAITER_FLOOR_LAYOUT.piso2]
    .filter((table) => table.estado === 'Libre' && table.capacidad >= personas && !taken.has(String(table.id)))
    .sort((a, b) => a.capacidad - b.capacidad || a.id - b.id)[0];

  return candidate ? String(candidate.id) : '';
}

/** Registra en el panel de Admin una reserva creada desde la Landing. */
export function addWebReservation({ nombre, telefono, sede, fecha, hora, personas, tipo, solicitudes, offline = false }) {
  const reservations = readCollection(RESERVATIONS_KEY);
  const sedeKey = normalizeSedeKey(sede);
  const guests = Number(personas) || 1;
  const reservation = {
    id: crypto.randomUUID(),
    cliente: nombre,
    telefono,
    personas: guests,
    fecha,
    hora,
    sede: sedeKey,
    mesa: assignTable({ sede: sedeKey, fecha, personas: guests }, reservations),
    tipo,
    solicitudes,
    estado: 'Reservada',
    origen: 'web',
    sincronizada: !offline,
    creadaEn: new Date().toISOString()
  };
  writeCollection(RESERVATIONS_KEY, [...reservations, reservation]);
  return reservation;
}

/**
 * Reservas activas de HOY por mesa para una sede: `{ [mesaId]: reserva }`.
 * El mesero solo ve como "Reservada" lo que ocurre en su turno.
 */
export function reservationsByTable(reservations, sede, fecha = localDateKey()) {
  return reservations
    .filter((item) => item.sede === sede && item.fecha === fecha && item.mesa && isActiveReservation(item))
    .reduce((map, item) => ({ ...map, [String(item.mesa)]: item }), {});
}

/* --------------------------------------------------------------------------
   Comandas de cocina (Mesero -> Cocina -> Caja)
   -------------------------------------------------------------------------- */

// Una comanda deja de contar como "en cocina" cuando esta lista para servir.
export const KITCHEN_DONE_STATES = Object.freeze(['Listo', 'Entregado']);

export function addKitchenOrder(order) {
  const nextOrder = {
    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
    estado: 'En Espera',
    minutosTranscurridos: 0,
    creadaEn: new Date().toISOString(),
    ...order
  };
  writeCollection(KITCHEN_ORDERS_KEY, [...readCollection(KITCHEN_ORDERS_KEY), nextOrder]);
  return nextOrder;
}

/** Aplica `updater` a la comanda indicada y persiste el cambio para todos los paneles. */
export function updateKitchenOrder(orderId, updater) {
  const orders = readCollection(KITCHEN_ORDERS_KEY);
  if (!orders.some((order) => order.id === orderId)) return false;
  return writeCollection(KITCHEN_ORDERS_KEY, orders.map((order) => (order.id === orderId ? updater(order) : order)));
}

export const activeKitchenOrders = (orders, sede) =>
  orders.filter((order) => order.sede === sede && !KITCHEN_DONE_STATES.includes(order.estado));
