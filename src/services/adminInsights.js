import { normalizeSedeKey } from './weatherService';

/**
 * Logica pura del AdminDashboard: metricas por sede y moderacion de reseñas.
 * Se mantiene fuera del componente para poder probarla de forma aislada.
 */

export const BRANCH_KEYS = ['escazu', 'santa_ana', 'cartago', 'heredia'];
export const REVIEWS_STORAGE_KEY = 'cacique_admin_reviews';

/* --------------------------------------------------------------------------
   Datos operativos de referencia por sede (compartidos por el AdminDashboard
   y el asistente de IA interno para que ambos reporten las mismas cifras).
   -------------------------------------------------------------------------- */

export const BRANCH_METRICS_BY_PERIOD = Object.freeze({
  dia: {
    escazu: { ventas: 785400, comandas: 189, clientes: 420, coccion: '15 min', completados: 165, pendientes: 18, cancelados: 6 },
    santa_ana: { ventas: 540200, comandas: 132, clientes: 310, coccion: '17 min', completados: 115, pendientes: 12, cancelados: 5 },
    cartago: { ventas: 610900, comandas: 145, clientes: 350, coccion: '16 min', completados: 130, pendientes: 11, cancelados: 4 },
    heredia: { ventas: 485250, comandas: 118, clientes: 280, coccion: '18 min', completados: 102, pendientes: 12, cancelados: 4 }
  },
  semana: {
    escazu: { ventas: 5497800, comandas: 1320, clientes: 2940, coccion: '14 min', completados: 1210, pendientes: 80, cancelados: 30 },
    santa_ana: { ventas: 3781400, comandas: 924, clientes: 2170, coccion: '16 min', completados: 850, pendientes: 50, cancelados: 24 },
    cartago: { ventas: 4276300, comandas: 1015, clientes: 2450, coccion: '15 min', completados: 940, pendientes: 55, cancelados: 20 },
    heredia: { ventas: 3396750, comandas: 826, clientes: 1960, coccion: '17 min', completados: 760, pendientes: 46, cancelados: 20 }
  },
  mes: {
    escazu: { ventas: 23562000, comandas: 5670, clientes: 12600, coccion: '15 min', completados: 5190, pendientes: 340, cancelados: 140 },
    santa_ana: { ventas: 16206000, comandas: 3960, clientes: 9300, coccion: '16 min', completados: 3640, pendientes: 220, cancelados: 100 },
    cartago: { ventas: 18327000, comandas: 4350, clientes: 10500, coccion: '15 min', completados: 4030, pendientes: 230, cancelados: 90 },
    heredia: { ventas: 14557500, comandas: 3540, clientes: 8400, coccion: '17 min', completados: 3260, pendientes: 200, cancelados: 80 }
  }
});

export const BRANCH_DETAILS = Object.freeze({
  escazu: { personal: 12, mesasLibres: 8, mesasTotal: 24 },
  santa_ana: { personal: 8, mesasLibres: 4, mesasTotal: 18 },
  cartago: { personal: 10, mesasLibres: 6, mesasTotal: 20 },
  heredia: { personal: 9, mesasLibres: 3, mesasTotal: 16 }
});

/**
 * Ocupacion de mesas de una sede: mesas ocupadas de base mas las reservas
 * activas en tiempo real, con tope en el total de mesas.
 */
export function computeOccupancy(sede, reservations = []) {
  const { mesasTotal, mesasLibres } = BRANCH_DETAILS[sede];
  const reserved = reservations.filter((item) => item.sede === sede && item.estado !== 'Cancelada').length;
  const occupied = Math.min(mesasTotal, mesasTotal - mesasLibres + reserved);
  return { occupied, total: mesasTotal, percent: Math.round((occupied / mesasTotal) * 100) };
}

const SUMMED_FIELDS = ['ventas', 'comandas', 'clientes', 'completados', 'pendientes', 'cancelados'];
const DETAIL_FIELDS = ['personal', 'mesasLibres', 'mesasTotal'];
const toMinutes = (value) => Number.parseInt(value, 10) || 0;

/**
 * Metricas de la sede elegida, o el consolidado de las cuatro sedes con
 * `sede === 'todas'`. El tiempo de entrega consolidado es el promedio
 * ponderado por comandas (una sede con mas pedidos pesa mas).
 */
export function aggregateBranchMetrics(periodMetrics, branchDetails, sede) {
  if (sede !== 'todas') return { ...periodMetrics[sede], ...branchDetails[sede] };

  const totals = Object.fromEntries([...SUMMED_FIELDS, ...DETAIL_FIELDS].map((field) => [field, 0]));
  let weightedMinutes = 0;

  for (const key of BRANCH_KEYS) {
    const metric = periodMetrics[key];
    SUMMED_FIELDS.forEach((field) => { totals[field] += metric[field]; });
    DETAIL_FIELDS.forEach((field) => { totals[field] += branchDetails[key][field]; });
    weightedMinutes += toMinutes(metric.coccion) * metric.comandas;
  }

  const coccion = totals.comandas ? Math.round(weightedMinutes / totals.comandas) : 0;
  return { ...totals, coccion: `${coccion} min` };
}

/* --------------------------------------------------------------------------
   Reseñas
   -------------------------------------------------------------------------- */

export const DEFAULT_REVIEWS = Object.freeze([
  { id: 1, cliente: 'María González', sede: 'Escazú', rating: 5, comentario: 'El chifrijo estuvo increíble y el servicio fue muy rápido.', verificada: true },
  { id: 2, cliente: 'Diego Vargas', sede: 'Santa Ana', rating: 4, comentario: 'Muy buen sabor. La terraza es excelente para compartir.', verificada: true },
  { id: 3, cliente: 'Sofía Ramírez', sede: 'Cartago', rating: 5, comentario: 'La atención del equipo y la calidad de la paila fueron excelentes.', verificada: true },
  { id: 4, cliente: 'Cuenta sin compras', sede: 'Escazú', rating: 1, comentario: 'Visiten mi página para descuentos en otro restaurante.', verificada: false },
  { id: 5, cliente: 'Usuario anónimo', sede: 'Heredia', rating: 1, comentario: 'Nunca he ido pero seguro es malo.', verificada: false }
]);

export function loadReviews(storage = localStorage) {
  try {
    const stored = JSON.parse(storage.getItem(REVIEWS_STORAGE_KEY) || 'null');
    return Array.isArray(stored) ? stored : [...DEFAULT_REVIEWS];
  } catch {
    return [...DEFAULT_REVIEWS];
  }
}

export function saveReviews(reviews, storage = localStorage) {
  try {
    storage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    return true;
  } catch {
    return false;
  }
}

/** Reseñas de la sede elegida (las reseñas guardan el nombre visible de la sede). */
export const filterReviewsBySede = (reviews, sede) =>
  sede === 'todas' ? reviews : reviews.filter((review) => normalizeSedeKey(review.sede) === sede);

/** Promedio con un decimal; las reseñas no verificadas no cuentan. Null si no hay. */
export function averageRating(reviews) {
  const verified = reviews.filter((review) => review.verificada !== false);
  if (verified.length === 0) return null;
  return Math.round((verified.reduce((total, review) => total + Number(review.rating || 0), 0) / verified.length) * 10) / 10;
}
