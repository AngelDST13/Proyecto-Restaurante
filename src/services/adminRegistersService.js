import { sanitizePlainText } from './spreadsheetService';
import { VALID_ACCOUNTS, formatSedeName } from './authSecurity';

const REGISTERS_STORAGE_KEY = 'cacique_admin_registers';

export const ADMIN_SEDES = ['escazu', 'santa_ana', 'cartago', 'heredia'];

const isValidSede = sede => ADMIN_SEDES.includes(sede);

const notifyRegistersChange = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('cacique-admin-registers-updated'));
};

/**
 * Cajas (cajeros) que ya existen por sede, derivadas de las cuentas validas.
 *
 * Es la semilla del panel administrativo: la administracion puede agregar cajas
 * nuevas en tiempo de ejecucion y todas conviven con las del catalogo base.
 */
export const SEED_REGISTERS = Object.entries(VALID_ACCOUNTS)
  .filter(([, account]) => account.rol === 'cajero')
  .map(([email, account]) => ({
    id: `seed-${account.sede}`,
    label: account.nombre,
    email,
    password: account.password,
    sede: account.sede,
    readOnly: true
  }));

function readStoredRegisters(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(REGISTERS_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Cajas del administrador: las del catalogo base mas las creadas en el panel. */
export function getAdminRegisters(storage = localStorage) {
  const created = readStoredRegisters(storage).filter(register => isValidSede(register?.sede));
  return [...SEED_REGISTERS, ...created];
}

/** Cajas de una sede concreta, en el orden en que fueron creadas. */
export function getAdminRegistersBySede(sede, storage = localStorage) {
  return getAdminRegisters(storage).filter(register => register.sede === sede);
}

export function getRegisterSummary(sede, storage = localStorage) {
  const registers = getAdminRegistersBySede(sede, storage);
  const uniqueEmails = new Set(registers.map(register => register.email.toLowerCase()));
  return { total: uniqueEmails.size, listado: registers };
}

/**
 * Crea dinamicamente una caja/cajero para una sede.
 *
 * Rechaza sedes desconocidas, correos mal formados, correos duplicados en la
 * misma sede y nombres vacios, de modo que el administrador no pueda generar
 * accesos ambiguos ni sobreescribir una caja existente.
 */
export function createAdminRegister({ label, email, password, sede }, storage = localStorage) {
  if (!isValidSede(sede)) return { success: false, message: 'Seleccione una sede válida (Escazú, Santa Ana, Cartago o Heredia).' };

  const cleanLabel = sanitizePlainText(label || '').trim();
  const cleanEmail = sanitizePlainText(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  if (!cleanLabel) return { success: false, message: 'Indique el nombre de la caja o del cajero.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { success: false, message: 'El correo de acceso no tiene un formato válido.' };
  if (cleanPassword.length < 8) return { success: false, message: 'La contraseña debe tener al menos 8 caracteres.' };

  const existing = getAdminRegisters(storage);
  const duplicated = existing.some(register => register.sede === sede && register.email.toLowerCase() === cleanEmail);
  if (duplicated) return { success: false, message: `Ya existe una caja con el correo ${cleanEmail} en ${formatSedeName(sede)}.` };

  const register = {
    id: `caja-${sede}-${Date.now()}`,
    label: cleanLabel,
    email: cleanEmail,
    password: cleanPassword,
    sede,
    readOnly: false
  };

  try {
    storage.setItem(REGISTERS_STORAGE_KEY, JSON.stringify([...readStoredRegisters(storage), register]));
    if (storage === localStorage) notifyRegistersChange();
    return { success: true, register };
  } catch {
    return { success: false, message: 'No se pudo guardar la caja en esta sede.' };
  }
}

/** Elimina una caja creada desde el panel. Las del catalogo base son de solo lectura. */
export function removeAdminRegister(registerId, storage = localStorage) {
  const stored = readStoredRegisters(storage);
  if (stored.some(register => register.id === registerId)) {
    try {
      storage.setItem(REGISTERS_STORAGE_KEY, JSON.stringify(stored.filter(register => register.id !== registerId)));
      if (storage === localStorage) notifyRegistersChange();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Tarjetas de credenciales de prueba agrupadas por rol.
 *
 * Cubre los cuatro roles operativos mas el Cliente Registrado, cada uno con su
 * correo y contraseña de demostración.
 *
 * `TEST_ACCESS_CREDENTIALS` ya expone `rol` como ETIQUETA legible ("Mesero",
 * "Cocina KDS"), no como clave interna, por lo que aqui solo se normaliza la
 * sede: no se vuelve a mapear el rol para no perder la etiqueta ya resuelta.
 */
export function getTestCredentialCards(credentials) {
  return credentials.map(credential => ({
    ...credential,
    sedeNombre: credential.sede === 'Todas las sedes' ? credential.sede : formatSedeName(credential.sede)
  }));
}
