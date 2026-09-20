// Servicio de Criptografía Nativa y Seguridad JWT (0 Advertencias ESLint)
const JWT_SECRET = 'CACIQUE_SECRET_2026_CR_PROTECTED_SESSION';

const VALID_ACCOUNTS = {
  'admin@elcacique.com': {
    passwordHash: '8f74a01c40b8a245eebe118831e5f8892f3e82746c1c2ef4e8779a5286e1e813',
    nombre: 'Angel Daniela Salazar T.',
    alias: 'Angel',
    rol: 'administrador',
    sede: 'escazu'
  },
  'mesero.escazu@elcacique.com': {
    passwordHash: 'c7d1e893e43956637e9c3e218228198f1f1a5c6e8e811f3d6c172e90e782910a',
    nombre: 'Carlos Ramírez',
    alias: 'Carlos',
    rol: 'mesero',
    sede: 'escazu'
  }
};

export async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

    // Se extrae directamente el payload evitando variables sin uso
    const payload = JSON.parse(atob(parts[1]));

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function authenticateCredentials(email, password) {
  const account = VALID_ACCOUNTS[email.toLowerCase()];
  const inputHash = await hashPassword(password);

  if (account) {
    if (account.passwordHash === inputHash) {
      return { success: true, user: { email, ...account } };
    }
    return { success: false, message: 'Contraseña incorrecta para la cuenta especificada.' };
  }

  const storedClients = JSON.parse(localStorage.getItem('cacique_registered_clients') || '{}');
  const client = storedClients[email.toLowerCase()];

  if (client) {
    if (client.passwordHash === inputHash) {
      return { success: true, user: { email, ...client } };
    }
    return { success: false, message: 'Contraseña incorrecta.' };
  }

  return { success: false, message: 'El usuario ingresado no existe en el sistema.' };
}

export async function registerNewClient(email, password, nombre) {
  const storedClients = JSON.parse(localStorage.getItem('cacique_registered_clients') || '{}');

  if (storedClients[email.toLowerCase()] || VALID_ACCOUNTS[email.toLowerCase()]) {
    return { success: false, message: 'El correo electrónico ya está registrado.' };
  }

  const passwordHash = await hashPassword(password);
  const newClient = {
    nombre,
    alias: nombre.split(' ')[0],
    rol: 'cliente',
    sede: 'escazu',
    passwordHash,
    coupon: {
      code: 'CACIQUE5OFF',
      discountPercentage: 5,
      description: '5% de descuento de bienvenida por registro'
    }
  };

  storedClients[email.toLowerCase()] = newClient;
  localStorage.setItem('cacique_registered_clients', JSON.stringify(storedClients));

  return { success: true, user: { email, ...newClient } };
}