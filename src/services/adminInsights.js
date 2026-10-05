import { normalizeSedeKey } from './weatherService';

/**
 * Logica pura del AdminDashboard: metricas por sede y moderacion de reseñas.
 * Se mantiene fuera del componente para poder probarla de forma aislada.
 */

export const BRANCH_KEYS = ['escazu', 'santa_ana', 'cartago', 'heredia'];
export const REVIEWS_STORAGE_KEY = 'cacique_admin_reviews';

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
