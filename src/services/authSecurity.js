import CryptoJS from 'crypto-js';

const JWT_SECRET = 'CACIQUE_SECRET_2026_CR_PROTECTED_SESSION';
const ENCRYPTION_KEY = 'GourmetSyncAESKey2026!#SecureStorage';
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
  'cocina.escazu@elcacique.com': {
    password: 'Cocina2026!',
    nombre: 'Cocina Escazú',
    alias: 'Cocina Escazú',
    rol: 'cocina',
    sede: 'escazu'
  },
  'cocina.santaana@elcacique.com': {
    password: 'Cocina2026!',
    nombre: 'Cocina Santa Ana',
    alias: 'Cocina Santa Ana',
    rol: 'cocina',
    sede: 'santa_ana'
  },
  'cocina.cartago@elcacique.com': {
    password: 'Cocina2026!',
    nombre: 'Cocina Cartago',
    alias: 'Cocina Cartago',
    rol: 'cocina',
    sede: 'cartago'
  },
  'cocina.heredia@elcacique.com': {
    password: 'Cocina2026!',
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
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  } catch {
    return null;
  }
}

export function decryptData(cipherText) {
  try {
    if (!cipherText) return null;
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText ? JSON.parse(decryptedText) : null;
  } catch {
    return null;
  }
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

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`).replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJWT(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
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
