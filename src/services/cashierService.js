import { sanitizePlainText } from './spreadsheetService';

const CASHIER_STORAGE_PREFIX = 'cacique_cashier_';
export const CASHIER_ORDERS_STORAGE_KEY = 'cacique_cashier_orders';
export const CASHIER_TABLE_COUNTS = { escazu: 24, santa_ana: 18, cartago: 20, heredia: 16 };
const PAYMENT_METHODS = new Set(['Efectivo', 'Tarjeta', 'SINPE Móvil']);

function notifyCashierOrderChange() {
  window.dispatchEvent(new Event('cacique-cashier-orders-updated'));
}

function notifyCashierStateChange() {
  window.dispatchEvent(new Event('cacique-cashier-state-updated'));
}

/** Metodos de pago admitidos en el arqueo de cierre de caja. */
export const CASHIER_PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'SINPE Móvil'];

const isValidSede = sede => typeof sede === 'string' && sede.trim().length > 0;

const parseState = (storage, storageKey) => {
  try {
    const parsed = JSON.parse(storage.getItem(storageKey) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Arqueo INICIAL: abre la caja de la sede con el monto de caja chica.
 *
 * Devuelve `{ success: false }` si la caja ya estaba abierta, de modo que el
 * arqueo inicial nunca se puede aplicar dos veces sobre el mismo turno.
 */
export function openCashierRegister({ sede, openingAmount }, storage = localStorage) {
  if (!isValidSede(sede)) return { success: false, message: 'Debe indicar la sede de la caja.' };
  // `''`, null y undefined se rechazan de forma explicita: `Number('')` es 0 y
  // aceptaria un campo numerico vacio como una caja chica de ₡0.
  if (openingAmount === '' || openingAmount === null || openingAmount === undefined) {
    return { success: false, message: 'El monto de caja chica inicial no es válido.' };
  }
  const amount = Number(openingAmount);
  if (!Number.isFinite(amount) || amount < 0) return { success: false, message: 'El monto de caja chica inicial no es válido.' };

  const storageKey = `${CASHIER_STORAGE_PREFIX}${sede}`;
  const currentState = parseState(storage, storageKey);
  if (currentState?.cashOpen) return { success: false, message: 'La caja de esta sede ya está abierta.' };

  const nextState = {
    ...(currentState || {}),
    cashOpen: true,
    openingAmount: amount,
    openedAt: new Date().toISOString(),
    closedAt: null,
    sales: Array.isArray(currentState?.sales) ? currentState.sales : [],
    processedOrderIds: Array.isArray(currentState?.processedOrderIds) ? currentState.processedOrderIds : []
  };

  try {
    storage.setItem(storageKey, JSON.stringify(nextState));
    if (storage === localStorage) notifyCashierStateChange();
    return { success: true, state: nextState };
  } catch {
    return { success: false, message: 'No se pudo registrar la apertura de caja.' };
  }
}

/**
 * Arqueo FINAL: cierra la caja y devuelve el resumen de ventas por metodo de
 * pago mas el efectivo esperado (caja chica inicial + ventas en efectivo).
 *
 * No borra el historial: conserva `sales` y el arqueo anterior para que el
 * historial de cierres siga siendo auditable, y reinicia `processedOrderIds`
 * para que el siguiente turno pueda liquidar las mismas comandas.
 */
export function closeCashierRegister({ sede, declaredCash }, storage = localStorage) {
  if (!isValidSede(sede)) return { success: false, message: 'Debe indicar la sede de la caja.' };

  const storageKey = `${CASHIER_STORAGE_PREFIX}${sede}`;
  const currentState = parseState(storage, storageKey);
  if (!currentState?.cashOpen) return { success: false, message: 'La caja de esta sede ya está cerrada.' };

  const sales = Array.isArray(currentState.sales) ? currentState.sales : [];
  const byPaymentMethod = CASHIER_PAYMENT_METHODS.reduce((summary, method) => {
    summary[method] = sales
      .filter(sale => sale.pago === method)
      .reduce((total, sale) => total + Number(sale.total || 0), 0);
    return summary;
  }, {});

  const openingAmount = Number(currentState.openingAmount || 0);
  const expectedCash = openingAmount + byPaymentMethod['Efectivo'];
  const parsedDeclared = declaredCash === undefined || declaredCash === null || declaredCash === ''
    ? expectedCash
    : Number(declaredCash);
  const difference = Number.isFinite(parsedDeclared) ? Number((parsedDeclared - expectedCash).toFixed(2)) : 0;

  const summary = {
    sede,
    openingAmount,
    expectedCash,
    declaredCash: Number.isFinite(parsedDeclared) ? parsedDeclared : expectedCash,
    difference,
    byPaymentMethod,
    totalSales: sales.reduce((total, sale) => total + Number(sale.total || 0), 0),
    salesCount: sales.length,
    closedAt: new Date().toISOString()
  };

  const nextState = {
    ...currentState,
    cashOpen: false,
    closedAt: summary.closedAt,
    lastClosingSummary: summary,
    processedOrderIds: []
  };

  try {
    storage.setItem(storageKey, JSON.stringify(nextState));
    if (storage === localStorage) notifyCashierStateChange();
    return { success: true, summary, state: nextState };
  } catch {
    return { success: false, message: 'No se pudo registrar el cierre de caja.' };
  }
}

export function getCashierState(sede, storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(`${CASHIER_STORAGE_PREFIX}${sede}`) || 'null');
  } catch {
    return null;
  }
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
    if (storage === localStorage) notifyCashierStateChange();
    return { success: true, sale };
  } catch {
    return { success: false, message: 'No se pudo guardar el cobro en la caja.' };
  }
}