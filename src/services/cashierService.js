import { sanitizePlainText } from './spreadsheetService';

const CASHIER_STORAGE_PREFIX = 'cacique_cashier_';
const PAYMENT_METHODS = new Set(['Efectivo', 'Tarjeta', 'SINPE Móvil']);

export function recordCashierSale({ sede, cliente, cedula, descripcion, subtotal, iva, total, pago, fecha }, storage = localStorage) {
  if (!sede || !PAYMENT_METHODS.has(pago)) return { success: false, message: 'Sede o método de pago no válido.' };
  if (![subtotal, iva, total].every(amount => Number.isFinite(Number(amount)) && Number(amount) >= 0) || Number(total) <= 0) {
    return { success: false, message: 'Los montos de la venta no son válidos.' };
  }

  const storageKey = `${CASHIER_STORAGE_PREFIX}${sede}`;
  let cashierState;
  try {
    cashierState = JSON.parse(storage.getItem(storageKey) || 'null');
  } catch {
    return { success: false, message: 'No se pudo leer el estado de la caja.' };
  }
  if (!cashierState?.cashOpen) return { success: false, message: 'La caja de esta sede está cerrada.' };

  const sale = {
    id: crypto.randomUUID(),
    cliente: sanitizePlainText(cliente),
    cedula: sanitizePlainText(cedula),
    descripcion: sanitizePlainText(descripcion),
    subtotal: Number(subtotal),
    iva: Number(iva),
    total: Number(total),
    pago,
    fecha
  };
  const nextState = { ...cashierState, sales: [sale, ...(Array.isArray(cashierState.sales) ? cashierState.sales : [])] };

  try {
    storage.setItem(storageKey, JSON.stringify(nextState));
    return { success: true, sale };
  } catch {
    return { success: false, message: 'No se pudo guardar el cobro en la caja.' };
  }
}