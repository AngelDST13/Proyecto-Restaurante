import knowledge from '../data/caciqueKnowledge.json';
import { BRANCH_KEYS, BRANCH_METRICS_BY_PERIOD, computeOccupancy } from './adminInsights';
import { loadClients } from './clientsService';
import { KITCHEN_ORDERS_KEY, RESERVATIONS_KEY, activeKitchenOrders, localDateKey, readCollection } from './liveSync';

/**
 * Cerebro local del "Cacique Bot IA".
 *
 * - Modo publico: guardrails estrictos (solo menu, horarios, sedes,
 *   reservaciones y eventos) y respuestas basadas en la misma informacion que
 *   muestra el sitio. Nunca expone datos internos.
 * - Modo administrador: analitica en tiempo real sobre los datos del sistema
 *   (clientes, reservas, comandas, caja e inventario). Se responde en local,
 *   sin enviar datos internos a servicios externos.
 */

const SEDE_NAMES = { escazu: 'Escazú', santa_ana: 'Santa Ana', cartago: 'Cartago', heredia: 'Heredia' };

/** Minusculas y sin tildes, para comparar palabras clave (siempre recibe texto). */
export const normalizeText = (text) => text
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

/** Sedes mencionadas en el texto (claves internas). */
export function detectSedes(text) {
  const clean = normalizeText(text);
  return BRANCH_KEYS.filter((key) => clean.includes(normalizeText(SEDE_NAMES[key])));
}

const formatCRC = (amount) => `₡${Math.round(amount).toLocaleString('es-CR')}`;

/* --------------------------------------------------------------------------
   Modo publico
   -------------------------------------------------------------------------- */

// Intentos de obtener informacion interna o de manipular al asistente.
const PRIVATE_PATTERNS = [
  /contrasen|password|credencial|token|smtp|api ?key/,
  /\b(admin|administrador|planilla|salario|empleados?)\b/,
  /\b(ventas|ingresos|ganancias|arqueo|caja chica)\b/,
  /datos (personales|privados|de (los )?clientes)|base de datos|lista de clientes|cedula|correo de/,
  /ignora|ignore|instrucciones (previas|anteriores)|system prompt|\bprompt\b|jailbreak|actua como/
];

export const PUBLIC_TOPICS = {
  saludo: /\b(hola|buen[oa]s|saludos|gracias|ayuda)\b/,
  menu: /menu|platillo|plato|precio|cuesta|chifrijo|vigoron|chicharron|costilla|ceviche|bebida|postre|comida|carta/,
  horario: /horario|hora|abren|cierran|abierto/,
  sede: /sede|sucursal|ubicacion|direccion|donde|telefono|contacto|whatsapp/,
  reserva: /reserv|mesa|agendar|cumpleanos|grupo/,
  evento: /evento|temporada|navidad|semana santa|aguizote|halloween|celebracion|fiesta/
};

export const PUBLIC_REFUSALS = {
  privado: 'Por seguridad no puedo compartir información interna, credenciales ni datos personales. Con gusto le ayudo con el menú, los horarios, nuestras sedes, reservaciones o eventos.',
  fuera_de_contexto: 'Soy el asistente de Chicharronera El Cacique y solo puedo ayudarle con el menú, los horarios, nuestras sedes, reservaciones y eventos. ¿Sobre cuál de estos temas le gustaría consultar?'
};

/** Guardrails del modo publico. */
export function classifyPublicQuery(text) {
  const clean = normalizeText(text);
  if (PRIVATE_PATTERNS.some((pattern) => pattern.test(clean))) {
    return { allowed: false, reason: 'privado', topics: [] };
  }
  const topics = Object.keys(PUBLIC_TOPICS).filter((topic) => PUBLIC_TOPICS[topic].test(clean));
  // Un nombre de sede filtra la respuesta; por si solo equivale a preguntar por la sede.
  if (topics.length === 0 && detectSedes(text).length) topics.push('sede');
  if (topics.length === 0) return { allowed: false, reason: 'fuera_de_contexto', topics };
  return { allowed: true, reason: null, topics };
}

const describeSede = (sede) => `• ${sede.nombre}: ${sede.direccion}. ${sede.horario}. Tel. ${sede.contacto}.`;

const PUBLIC_ANSWERS = {
  saludo: () => 'Bienvenido a Chicharronera El Cacique. Puedo ayudarle con el menú, horarios, sedes, reservaciones y eventos.',
  menu: () => `Platillos destacados:\n${knowledge.menu_destacado.map((item) => `• ${item.platillo}: ${formatCRC(item.precio)}`).join('\n')}\nVea el menú completo en la sección "Menú".`,
  horario: (sedes) => `Horarios de atención:\n${sedes.map((sede) => `• ${sede.nombre}: ${sede.horario}`).join('\n')}`,
  sede: (sedes) => `Nuestras sedes:\n${sedes.map(describeSede).join('\n')}`,
  reserva: () => `Puede reservar con el botón "Agendar Reserva" del sitio (mesas, cumpleaños y eventos) o por WhatsApp al ${knowledge.whatsapp}.`,
  evento: () => `Eventos de temporada:\n${knowledge.eventos.map((evento) => `• ${evento.nombre} (${evento.fecha}) en ${evento.sedes}`).join('\n')}`
};

/**
 * Contexto publico vigente (sedes, menu destacado, eventos) que se envia a n8n
 * para que el agente responda con los mismos datos del sitio. No incluye
 * informacion interna.
 */
export const PUBLIC_CONTEXT = Object.freeze({
  sedes: knowledge.sedes,
  menu_destacado: knowledge.menu_destacado,
  eventos: knowledge.eventos,
  whatsapp: knowledge.whatsapp
});

/** Respuesta local para consultas publicas permitidas (respaldo sin n8n). */
export function answerPublicQuery(text) {
  const { allowed, reason, topics } = classifyPublicQuery(text);
  if (!allowed) return PUBLIC_REFUSALS[reason];

  const mentioned = detectSedes(text);
  const sedes = mentioned.length
    ? knowledge.sedes.filter((sede) => mentioned.includes(sede.clave))
    : knowledge.sedes;
  // El saludo solo se responde cuando no hay otra consulta concreta.
  const answerTopics = topics.length > 1 ? topics.filter((topic) => topic !== 'saludo') : topics;
  return answerTopics.map((topic) => PUBLIC_ANSWERS[topic](sedes)).join('\n\n');
}

/* --------------------------------------------------------------------------
   Modo administrador: analitica en tiempo real
   -------------------------------------------------------------------------- */

function readJson(storage, key, fallback) {
  try {
    const value = JSON.parse(storage.getItem(key) || 'null');
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

const isToday = (isoDate, today) => typeof isoDate === 'string' && localDateKey(new Date(isoDate)) === today;

/** Foto actual del sistema por sede, leida de los mismos almacenes que usan los paneles. */
export function buildAdminSnapshot(storage = localStorage) {
  const today = localDateKey();
  const reservations = readCollection(RESERVATIONS_KEY);
  const kitchenOrders = readCollection(KITCHEN_ORDERS_KEY);
  const clients = loadClients(storage);
  const inventory = readJson(storage, 'cacique_admin_inventory', []);

  const sedes = Object.fromEntries(BRANCH_KEYS.map((sede) => {
    const cashier = readJson(storage, `cacique_cashier_${sede}`, {});
    const salesToday = (Array.isArray(cashier.sales) ? cashier.sales : []).filter((sale) => isToday(sale.fecha, today));
    const active = activeKitchenOrders(kitchenOrders, sede);
    const estimates = active.map((order) => Number(order.tiempoEstimadoPersonalizado)).filter(Number.isFinite);
    return [sede, {
      nombre: SEDE_NAMES[sede],
      clientes: clients.filter((client) => client.sede === sede).length,
      ocupacion: computeOccupancy(sede, reservations),
      reservasHoy: reservations.filter((item) => item.sede === sede && item.fecha === today && item.estado !== 'Cancelada').length,
      ventasCaja: salesToday.reduce((total, sale) => total + Number(sale.total), 0),
      cobrosCaja: salesToday.length,
      referenciaDia: BRANCH_METRICS_BY_PERIOD.dia[sede],
      comandasActivas: active.length,
      tiempoPromedio: estimates.length ? Math.round(estimates.reduce((sum, value) => sum + value, 0) / estimates.length) : null,
      insumosCriticos: (Array.isArray(inventory) ? inventory : [])
        .filter((item) => item.sede === sede && Number(item.stock) <= Number(item.minLimit))
    }];
  }));

  return { fecha: today, totalClientes: clients.length, sedes };
}

/** Recomendaciones operativas automaticas sobre demanda y reabastecimiento. */
export function buildRecommendations(snapshot, sedeKeys = BRANCH_KEYS) {
  const recommendations = [];
  for (const key of sedeKeys) {
    const sede = snapshot.sedes[key];
    sede.insumosCriticos.forEach((item) => {
      recommendations.push(`Reabastecer ${item.nombre} en ${sede.nombre}: ${item.stock} ${item.unidad} (mínimo ${item.minLimit}).`);
    });
    if (sede.ocupacion.percent >= 85) {
      recommendations.push(`Ocupación alta en ${sede.nombre} (${sede.ocupacion.percent}%): reforzar personal de salón y habilitar lista de espera.`);
    } else if (sede.ocupacion.percent <= 50) {
      recommendations.push(`Ocupación baja en ${sede.nombre} (${sede.ocupacion.percent}%): activar una promoción para atraer demanda.`);
    }
    if (sede.comandasActivas >= 5) {
      recommendations.push(`Cocina con alta carga en ${sede.nombre} (${sede.comandasActivas} comandas activas): priorizar despacho y apoyar la línea de paila.`);
    }
    if (sede.tiempoPromedio !== null && sede.tiempoPromedio > 20) {
      recommendations.push(`Tiempo de entrega sobre el objetivo en ${sede.nombre} (${sede.tiempoPromedio} min frente a < 20 min).`);
    }
  }
  return recommendations;
}

export const ADMIN_INTENTS = {
  clientes: /cliente/,
  ocupacion: /ocupacion|ocupad|mesas?\b/,
  ventas: /venta|ingreso|factur|cobro|caja/,
  comandas: /comanda|cocina|pedido|tiempo|entrega|demora/,
  recomendaciones: /recomend|sugerencia|reabastec|insumo|inventario|stock|demanda|abastec/
};

const ADMIN_ANSWERS = {
  clientes: (snapshot, keys) => {
    const lines = keys.map((key) => `• ${snapshot.sedes[key].nombre}: ${snapshot.sedes[key].clientes}`);
    const total = keys.reduce((sum, key) => sum + snapshot.sedes[key].clientes, 0);
    return `Clientes registrados: ${keys.length === BRANCH_KEYS.length ? snapshot.totalClientes : total}\n${lines.join('\n')}`;
  },
  ocupacion: (snapshot, keys) => `Ocupación de mesas en tiempo real:\n${keys.map((key) => {
    const { nombre, ocupacion, reservasHoy } = snapshot.sedes[key];
    return `• ${nombre}: ${ocupacion.percent}% (${ocupacion.occupied}/${ocupacion.total} mesas, ${reservasHoy} reservas hoy)`;
  }).join('\n')}`,
  ventas: (snapshot, keys) => `Ventas del día:\n${keys.map((key) => {
    const { nombre, ventasCaja, cobrosCaja, referenciaDia } = snapshot.sedes[key];
    return `• ${nombre}: ${formatCRC(ventasCaja)} cobrados en caja (${cobrosCaja} cobros) · referencia del día ${formatCRC(referenciaDia.ventas)} en ${referenciaDia.comandas} comandas`;
  }).join('\n')}`,
  comandas: (snapshot, keys) => `Comandas activas y tiempos de entrega:\n${keys.map((key) => {
    const { nombre, comandasActivas, tiempoPromedio, referenciaDia } = snapshot.sedes[key];
    const tiempo = tiempoPromedio === null ? `referencia ${referenciaDia.coccion}` : `${tiempoPromedio} min estimados`;
    return `• ${nombre}: ${comandasActivas} en cocina · ${tiempo}`;
  }).join('\n')}`,
  recomendaciones: (snapshot, keys) => {
    const recommendations = buildRecommendations(snapshot, keys);
    return recommendations.length
      ? `Recomendaciones operativas:\n${recommendations.map((item) => `• ${item}`).join('\n')}`
      : 'Operación estable: sin alertas de demanda ni de inventario.';
  }
};

/** Responde consultas internas del administrador con datos en tiempo real. */
export function answerAdminQuery(text, snapshot = buildAdminSnapshot()) {
  const clean = normalizeText(text);
  const mentioned = detectSedes(text);
  const keys = mentioned.length ? mentioned : BRANCH_KEYS;
  const intents = Object.keys(ADMIN_INTENTS).filter((intent) => ADMIN_INTENTS[intent].test(clean));
  // Sin una metrica concreta se entrega el resumen completo.
  const selected = intents.length ? intents : Object.keys(ADMIN_ANSWERS);
  return selected.map((intent) => ADMIN_ANSWERS[intent](snapshot, keys)).join('\n\n');
}
