/**
 * Catalogo de clientes registrados de "Chicharronera El Cacique".
 *
 * Los registros se persisten cifrados en `localStorage` bajo la clave
 * `cacique_admin_clients`, junto a una semilla de demostracion que permite
 * poblar el panel desde el primer arranque.
 */

import { decryptData } from './authSecurity';

export const CLIENTS_STORAGE_KEY = 'cacique_admin_clients';

export const CLIENT_BRANCHES = ['escazu', 'santa_ana', 'cartago', 'heredia'];

export const CLIENT_BRANCH_LABELS = {
  escazu: 'Escazú',
  santa_ana: 'Santa Ana',
  cartago: 'Cartago',
  heredia: 'Heredia',
};

/** Un cliente es "Frecuente" cuando alcanza al menos 3 reservas realizadas. */
export const FREQUENT_CLIENT_THRESHOLD = 3;

export const getClientStatus = (totalReservas) =>
  Number(totalReservas) >= FREQUENT_CLIENT_THRESHOLD ? 'Frecuente' : 'Activo';

export const DEFAULT_CLIENTS = [
  {
    id: 'cli-001',
    nombre: 'Angel Daniela Salazar T.',
    correo: 'angel.salazar@correo.cr',
    telefono: '+506 8811-2233',
    sede: 'escazu',
    totalReservas: 12,
  },
  {
    id: 'cli-002',
    nombre: 'Mariana Quesada Zamora',
    correo: 'mariana.qz@correo.cr',
    telefono: '+506 8745-9911',
    sede: 'santa_ana',
    totalReservas: 2,
  },
  {
    id: 'cli-003',
    nombre: 'Carlos Ureña Brenes',
    correo: 'carlos.urenab@correo.cr',
    telefono: '+506 8899-4455',
    sede: 'cartago',
    totalReservas: 5,
  },
  {
    id: 'cli-004',
    nombre: 'Sofía Jiménez Mora',
    correo: 'sofia.jm@correo.cr',
    telefono: '+506 8322-7788',
    sede: 'heredia',
    totalReservas: 2,
  },
];

const isValidClient = (client) =>
  client &&
  typeof client === 'object' &&
  typeof client.nombre === 'string' &&
  typeof client.correo === 'string' &&
  CLIENT_BRANCHES.includes(client.sede);

/** Normaliza acentos para que el buscador funcione sin sensibilidad a tildes. */
export const normalizeSearchTerm = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * Filtra el catalogo por texto libre (nombre o correo) y por sede.
 * Devuelve clones para que la tabla pueda editarlos sin mutar la fuente.
 */
export const filterClients = (clients, { search = '', sede = 'todas' } = {}) => {
  const term = normalizeSearchTerm(search);
  return (Array.isArray(clients) ? clients : [])
    .filter(isValidClient)
    .filter((client) => (sede === 'todas' ? true : client.sede === sede))
    .filter((client) => {
      if (!term) return true;
      return (
        normalizeSearchTerm(client.nombre).includes(term) ||
        normalizeSearchTerm(client.correo).includes(term)
      );
    })
    .map((client) => ({ ...client, estado: getClientStatus(client.totalReservas) }));
};

/**
 * Clientes registrados: la lista guardada (cifrada) o la semilla de
 * demostracion si aun no hay ninguna. Compartido por el AdminDashboard y el
 * asistente de IA interno.
 */
export function loadClients(storage = localStorage) {
  const savedClients = decryptData(storage.getItem(CLIENTS_STORAGE_KEY));
  return Array.isArray(savedClients) && savedClients.length ? savedClients : DEFAULT_CLIENTS;
}
