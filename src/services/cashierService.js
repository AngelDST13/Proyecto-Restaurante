import { sanitizePlainText } from './spreadsheetService';

const CASHIER_STORAGE_PREFIX = 'cacique_cashier_';
export const CASHIER_ORDERS_STORAGE_KEY = 'cacique_cashier_orders';
const PAYMENT_METHODS = new Set(['Efectivo', 'Tarjeta', 'SINPE Móvil']);

function notifyCashierOrderChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('cacique-cashier-orders-updated'));
}

export function getCashierOrders(sede, storage = localStorage) {
  try {
    const orders = JSON.parse(storage.getItem(CASHIER_ORDERS_STORAGE_KEY) || '[]');
    return Array.isArray(orders) ? orders.filter(order => order.sede === sede && order.status === 'pending') : [];
  } catch {
    return [];
  }
}

export function enqueueCashierOrder(order, storage = localStorage) {
  if (!order?.sede || !order.tableId || !Number.isFinite(Number(order.total)) || Number(order.total) <= 0) {
    return { success: false, message: 'La cuenta no contiene una sede, mesa o total válido.' };
  }

  try {
    const currentOrders = JSON.parse(storage.getItem(CASHIER_ORDERS_STORAGE_KEY) || '[]');
    const orders = Array.isArray(currentOrders) ? currentOrders : [];
    const existingOrder = orders.find(item => item.sede === order.sede && item.tableId === order.tableId && item.status === 'pending');
    if (existingOrder) return { success: true, order: existingOrder, duplicate: true };

    const queuedOrder = {
      ...order,
      id: crypto.randomUUID(),
      cliente: sanitizePlainText(order.cliente),
      mesa: sanitizePlainText(order.mesa),
      items: (Array.isArray(order.items) ? order.items : []).map(item => ({
        nombre: sanitizePlainText(item.nombre),
        cantidad: Number(item.cantidad),
        precio: Number(item.precio)
      })),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    storage.setItem(CASHIER_ORDERS_STORAGE_KEY, JSON.stringify([...orders, queuedOrder]));
    if (storage === localStorage) notifyCashierOrderChange();
    return { success: true, order: queuedOrder };
  } catch {
    return { success: false, message: 'No se pudo enviar la cuenta a caja.' };
  }
}

export function removeCashierOrder(orderId, storage = localStorage) {
  try {
    const orders = JSON.parse(storage.getItem(CASHIER_ORDERS_STORAGE_KEY) || '[]');
    storage.setItem(CASHIER_ORDERS_STORAGE_KEY, JSON.stringify((Array.isArray(orders) ? orders : []).filter(order => order.id !== orderId)));
    if (storage === localStorage) notifyCashierOrderChange();
    return true;
  } catch {
    return false;
  }
}

export function recordCashierSale({ sede, cliente, cedula, descripcion, subtotal, iva, total, pago, fecha, orderId }, storage = localStorage) {
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
  if (orderId && cashierState.processedOrderIds?.includes(orderId)) {
    return { success: true, sale: cashierState.sales?.find(sale => sale.orderId === orderId), duplicate: true };
  }

  const sale = {
    id: crypto.randomUUID(),
    cliente: sanitizePlainText(cliente),
    cedula: sanitizePlainText(cedula),
    descripcion: sanitizePlainText(descripcion),
    subtotal: Number(subtotal),
    iva: Number(iva),
    total: Number(total),
    pago,
    orderId,
    fecha
  };
  const nextState = {
    ...cashierState,
    sales: [sale, ...(Array.isArray(cashierState.sales) ? cashierState.sales : [])],
    processedOrderIds: orderId ? [...(cashierState.processedOrderIds || []), orderId] : cashierState.processedOrderIds || []
  };

  try {
    storage.setItem(storageKey, JSON.stringify(nextState));
    return { success: true, sale };
  } catch {
    return { success: false, message: 'No se pudo guardar el cobro en la caja.' };
  }
}