import CryptoJS from 'crypto-js';

const JWT_SECRET = 'CACIQUE_HMAC_SECRET_KEY_2026_CR_PROTECTED_SESSION';

// BASE DE CREDENCIALES VÁLIDAS CON HASH DE CONTRASEÑA
const VALID_ACCOUNTS = {
  'admin@elcacique.com': {
    passwordHash: CryptoJS.SHA256('AdminCacique2026!').toString(),
    nombre: 'Angel Daniela Salazar T.',
    alias: 'Angel',
    rol: 'administrador',
    sede: 'escazu'
  },
  'mesero.escazu@elcacique.com': {
    passwordHash: CryptoJS.SHA256('MeseroEscazu2026!').toString(),
    nombre: 'Carlos Ramírez',
    alias: 'Carlos',
    rol: 'mesero',
    sede: 'escazu'
  },
  'mesero.cartago@elcacique.com': {
    passwordHash: CryptoJS.SHA256('MeseroCartago2026!').toString(),
    nombre: 'Sofía Brenes',
    alias: 'Sofía',
    rol: 'mesero',
    sede: 'cartago'
  }
};

/**
 * Convierte un objeto a string Base64URL sin caracteres especiales
 */
const base64UrlEncode = (source) => {
  let encoded = CryptoJS.enc.Base64.stringify(source);
  return encoded.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
};

/**
 * Genera un token JWT real (Header.Payload.Signature)
 */
export const generateJWT = (userData) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: userData.email,
    name: userData.nombre || userData.alias,
    role: userData.rol,
    sede: userData.sede,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (userData.rol === 'cliente' ? 180 : 86400) // 3 min clientes / 24h personal
  };

  const encodedHeader = base64UrlEncode(CryptoJS.enc.Utf8.parse(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(CryptoJS.enc.Utf8.parse(JSON.stringify(payload)));

  const signature = CryptoJS.HmacSHA256(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
  const encodedSignature = base64UrlEncode(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};

/**
 * Valida la firma HMAC de un token JWT
 */
export const verifyJWT = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const expectedSignature = base64UrlEncode(
      CryptoJS.HmacSHA256(`${encodedHeader}.${encodedPayload}`, JWT_SECRET)
    );

    if (encodedSignature !== expectedSignature) {
      console.warn('Firma JWT inválida');
      return null;
    }

    const payload = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(encodedPayload)));
    
    // Verificar expiración
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.warn('Token JWT expirado');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error al verificar JWT:', error);
    return null;
  }
};

/**
 * Autentica un usuario contra el hash almacenado
 */
export const authenticateCredentials = (email, password) => {
  const account = VALID_ACCOUNTS[email.toLowerCase()];
  const inputHash = CryptoJS.SHA256(password).toString();

  if (account) {
    if (account.passwordHash === inputHash) {
      return { success: true, user: { email, ...account } };
    }
    return { success: false, message: 'Contraseña incorrecta para la cuenta especificada.' };
  }

  // Permite ingreso de clientes registrados previamente
  const storedClients = JSON.parse(localStorage.getItem('cacique_registered_clients') || '{}');
  if (storedClients[email.toLowerCase()]) {
    const client = storedClients[email.toLowerCase()];
    if (client.passwordHash === inputHash) {
      return { success: true, user: { email, ...client } };
    }
    return { success: false, message: 'Contraseña incorrecta.' };
  }

  return { success: false, message: 'El usuario ingresado no está registrado en el sistema.' };
};

/**
 * Registra un cliente nuevo y le emite su cupón de 5% de descuento
 */
export const registerNewClient = (email, password, nombre) => {
  const storedClients = JSON.parse(localStorage.getItem('cacique_registered_clients') || '{}');
  
  if (storedClients[email.toLowerCase()] || VALID_ACCOUNTS[email.toLowerCase()]) {
    return { success: false, message: 'El correo electrónico ya se encuentra registrado.' };
  }

  const newClient = {
    nombre,
    alias: nombre.split(' ')[0],
    rol: 'cliente',
    sede: 'escazu',
    passwordHash: CryptoJS.SHA256(password).toString(),
    coupon: {
      code: 'CACIQUE5OFF',
      discountPercentage: 5,
      description: '5% de descuento de bienvenida por registro',
      used: false
    }
  };

  storedClients[email.toLowerCase()] = newClient;
  localStorage.setItem('cacique_registered_clients', JSON.stringify(storedClients));

  return { success: true, user: { email, ...newClient } };
};