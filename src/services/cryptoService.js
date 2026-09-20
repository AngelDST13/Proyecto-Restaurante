// Servicio de Cifrado y Seguridad de Datos para El Cacique
const SECRET_KEY = 'CACIQUE_SECURE_TOKEN_2026_PROD';

/**
 * Cifra un objeto o cadena de texto
 */
export const encryptData = (data) => {
  try {
    if (!data) return null;
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    let result = '';
    for (let i = 0; i < jsonString.length; i++) {
      result += String.fromCharCode(jsonString.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return btoa(result);
  } catch (error) {
    console.error('Error al cifrar información:', error);
    return null;
  }
};

/**
 * Descifra una cadena cifrada previa
 */
export const decryptData = (cipherText) => {
  try {
    if (!cipherText) return null;
    const raw = atob(cipherText);
    let result = '';
    for (let i = 0; i < raw.length; i++) {
      result += String.fromCharCode(raw.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return JSON.parse(result);
  } catch (error) {
    console.error('Error al descifrar información:', error);
    return null;
  }
};