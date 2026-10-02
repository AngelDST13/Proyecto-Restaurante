import CryptoJS from 'crypto-js';
import { encryptData as encryptStoredData, decryptData as decryptStoredData } from './cryptoService';

const JWT_SECRET = 'CACIQUE_SECRET_2026_CR_PROTECTED_SESSION';
const SESSION_SECRET = 'GourmetSyncSecretKey2026!';

export function sanitizeInput(input = '') {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/\.+$/, '');
}

export const VALID_ACCOUNTS = {
  'admin@elcacique.com': {
    password: 'AdminCacique2026!',
    nombre: 'Angel Daniela Salazar T.',
    alias: 'Angel',
    rol: 'administrador',
    sede: 'escazu'
  },
  'mesero.escazu@elcacique.com': {
    password: 'MeseroEscazu2026!',
    nombre: 'Carlos Ramírez',
    alias: 'Carlos',
    rol: 'mesero',
    sede: 'escazu'
  },
  'mesero.santaana@elcacique.com': {
    password: 'MeseroSantaAna2026!',
    nombre: 'Bryan Gómez',
    alias: 'Bryan',
    rol: 'mesero',
    sede: 'santa_ana'
  },
  'mesero.cartago@elcacique.com': {
    password: 'MeseroCartago2026!',
    nombre: 'Aiden Ruiz',
    alias: 'Aiden',
    rol: 'mesero',
    sede: 'cartago'
  },
  'mesero.heredia@elcacique.com': {
    password: 'MeseroHeredia2026!',
    nombre: 'Victor González',
    alias: 'Victor',
    rol: 'mesero',
    sede: 'heredia'
  },
  'cajero.escazu@elcacique.com': {
    password: 'CajaEscazu2026!',
    nombre: 'Cajero Escazú',
    alias: 'Caja Escazú',
    rol: 'cajero',
    sede: 'escazu'
  },
  'cajero.santaana@elcacique.com': {
    password: 'CajaSantaAna2026!',
    nombre: 'Cajero Santa Ana',
    alias: 'Caja Santa Ana',
    rol: 'cajero',
    sede: 'santa_ana'
  },
  'cajero.cartago@elcacique.com': {
    password: 'CajaCartago2026!',
    nombre: 'Cajero Cartago',
    alias: 'Caja Cartago',
    rol: 'cajero',
    sede: 'cartago'
  },
  'cajero.heredia@elcacique.com': {
    password: 'CajaHeredia2026!',
    nombre: 'Cajero Heredia',
    alias: 'Caja Heredia',
    rol: 'cajero',
    sede: 'heredia'
  },
  'cocina.escazu@elcacique.com': {
    password: 'CocinaEscazu2026!',
    nombre: 'Cocina Escazú',
    alias: 'Cocina Escazú',
    rol: 'cocina',
    sede: 'escazu'
  },
  'cocina.santaana@elcacique.com': {
    password: 'CocinaSantaAna2026!',
    nombre: 'Cocina Santa Ana',
    alias: 'Cocina Santa Ana',
    rol: 'cocina',
    sede: 'santa_ana'
  },
  'cocina.cartago@elcacique.com': {
    password: 'CocinaCartago2026!',
    nombre: 'Cocina Cartago',
    alias: 'Cocina Cartago',
    rol: 'cocina',
    sede: 'cartago'
  },
  'cocina.heredia@elcacique.com': {
    password: 'CocinaHeredia2026!',
    nombre: 'Cocina Heredia',
    alias: 'Cocina Heredia',
    rol: 'cocina',
    sede: 'heredia'
  }
};

export function formatSedeName(sedeKey = 'escazu') {
  const cleanSedeKey = sanitizeInput(sedeKey);
  const names = {
    escazu: 'Escazú',
    santa_ana: 'Santa Ana',
    cartago: 'Cartago',
    heredia: 'Heredia'
  };
  return names[cleanSedeKey] || 'Escazú';
}

export const TEST_ACCESS_CREDENTIALS = Object.entries(VALID_ACCOUNTS).map(([email, account]) => ({
  email,
  password: account.password,
  sede: account.rol === 'administrador' ? 'Todas las sedes' : formatSedeName(account.sede),
  rol: account.rol === 'administrador' ? 'Administrador' : account.rol === 'cocina' ? 'Cocina KDS' : account.rol === 'cajero' ? 'Cajero' : 'Cajero / Mesero'
}));

export function sanitizeUserForSession(userObj) {
  if (!userObj) return null;
  const safeUser = { ...userObj };
  delete safeUser.password;
  delete safeUser.contrasena;
  delete safeUser.secret;
  return {
    ...safeUser,
    email: sanitizeInput(safeUser.email),
    sede: sanitizeInput(safeUser.sede || 'escazu')
  };
}

export function encryptData(data) {
  return encryptStoredData(data);
}

export function decryptData(cipherText) {
  return decryptStoredData(cipherText);
}

export function generateSessionSignature(userObj) {
  if (!userObj) return '';
  const payload = `${userObj.email}|${userObj.rol}|${userObj.sede}|${SESSION_SECRET}`;
  return CryptoJS.HmacSHA256(payload, SESSION_SECRET).toString();
}

export function verifySessionIntegrity(userObj, signature) {
  if (!userObj || !signature) return false;
  return generateSessionSignature(userObj) === signature;
}

function encodeBase64Url(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '=');
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0)));
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

export function generateJWT(userData) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: userData.email,
    name: userData.nombre || userData.alias,
    role: userData.rol,
    sede: userData.sede,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (userData.rol === 'cliente' ? 180 : 86400)
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = CryptoJS.HmacSHA256(signingInput, JWT_SECRET).toString(CryptoJS.enc.Base64)
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${signingInput}.${signature}`;
}

export function verifyJWT(token) {
  try {
    if (typeof token !== 'string' || !token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(decodeBase64Url(parts[0]));
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null;
    const expectedSignature = CryptoJS.HmacSHA256(`${parts[0]}.${parts[1]}`, JWT_SECRET).toString(CryptoJS.enc.Base64)
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    if (!timingSafeEqual(parts[2], expectedSignature)) return null;

    const payload = JSON.parse(decodeBase64Url(parts[1]));
    if (!Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function authenticateCredentials(email, password) {
  const cleanEmail = sanitizeInput(email);
  const cleanPassword = (password || '').trim();
  const account = VALID_ACCOUNTS[cleanEmail];

  if (account) {
    if (account.password === cleanPassword) {
      return { success: true, user: sanitizeUserForSession({ email: cleanEmail, ...account }) };
    }
    return { success: false, message: 'Contraseña incorrecta para el usuario ingresado.' };
  }

  const storedClients = decryptData(localStorage.getItem('cacique_registered_clients')) || {};
  const client = storedClients[cleanEmail];

  if (client) {
    if (client.password === cleanPassword) {
      return { success: true, user: sanitizeUserForSession({ email: cleanEmail, ...client }) };
    }
    return { success: false, message: 'Contraseña incorrecta.' };
  }

  return { success: false, message: 'El usuario ingresado no existe en el sistema.' };
}

export function registerNewClient(email, password, nombre) {
  const cleanEmail = sanitizeInput(email);
  const storedClients = decryptData(localStorage.getItem('cacique_registered_clients')) || {};

  if (storedClients[cleanEmail] || VALID_ACCOUNTS[cleanEmail]) {
    return { success: false, message: 'El correo electrónico ya está registrado.' };
  }

  const newClient = {
    nombre,
    alias: nombre.split(' ')[0],
    rol: 'cliente',
    sede: 'escazu',
    password: password.trim(),
    coupon: {
      code: 'CACIQUE5OFF',
      discountPercentage: 5,
      description: '5% de descuento de bienvenida por registro'
    }
  };

  storedClients[cleanEmail] = newClient;
  localStorage.setItem('cacique_registered_clients', encryptData(storedClients));

  return { success: true, user: sanitizeUserForSession({ email: cleanEmail, ...newClient }) };
}
