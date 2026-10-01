import CryptoJS from 'crypto-js';

// Se cifra con AES. El prefijo permite leer valores XOR antiguos durante la migración.
const SECRET_KEY = 'Cacique:LocalStorage:AES:2026:RotateOnBackend';
const LEGACY_KEY = 'CACIQUE_SECURE_TOKEN_2026_PROD';
const LEGACY_AUTH_AES_KEY = 'GourmetSyncAESKey2026!#SecureStorage';

/**
 * Cifra un objeto o cadena de texto
 */
export const encryptData = (data) => {
  try {
    if (data == null) return null;
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    return `aes2:${CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString()}`;
  } catch {
    return null;
  }
};

/**
 * Descifra una cadena cifrada previa
 */
export const decryptData = (cipherText) => {
  try {
    if (!cipherText) return null;
    if (cipherText.startsWith('aes2:')) {
      const bytes = CryptoJS.AES.decrypt(cipherText.slice(5), SECRET_KEY);
      const clearText = bytes.toString(CryptoJS.enc.Utf8);
      return clearText ? JSON.parse(clearText) : null;
    }
    try {
      const legacyAesClearText = CryptoJS.AES.decrypt(cipherText, LEGACY_AUTH_AES_KEY).toString(CryptoJS.enc.Utf8);
      if (legacyAesClearText) return JSON.parse(legacyAesClearText);
    } catch {
      // Continúa con XOR cuando el contenido heredado no es un cifrado AES válido.
    }
    const raw = atob(cipherText);
    const legacyText = Array.from(raw, (char, index) => String.fromCharCode(char.charCodeAt(0) ^ LEGACY_KEY.charCodeAt(index % LEGACY_KEY.length))).join('');
    return JSON.parse(legacyText);
  } catch {
    return null;
  }
};
