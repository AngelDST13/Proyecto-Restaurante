import { describe, expect, it } from 'vitest';
import { decryptData, encryptData, sanitizeInput, sanitizeUserForSession } from '../services/authSecurity';
import { removeEmojis, validateUserPrompt } from '../services/promptValidation';

describe('Seguridad y validación', () => {
  it('normaliza texto de entrada y elimina secretos del perfil de sesión', () => {
    expect(sanitizeInput('  ADMIN@ELCACIQUE.COM. ')).toBe('admin@elcacique.com');
    expect(sanitizeUserForSession({ email: 'ADMIN@ELCACIQUE.COM', password: 'secret', rol: 'mesero' })).toEqual({ email: 'admin@elcacique.com', rol: 'mesero', sede: 'escazu' });
  });

  it('encripta y desencripta datos de sesión', () => {
    const payload = { email: 'admin@elcacique.com', rol: 'administrador' };
    expect(decryptData(encryptData(payload))).toEqual(payload);
  });

  it('rechaza prompts de emojis, acepta consultas de menú y limpia emojis', () => {
    expect(validateUserPrompt('Dame el menú con emojis').isValid).toBe(false);
    expect(validateUserPrompt('¿Cuál es el precio del chifrijo?').isValid).toBe(true);
    expect(removeEmojis('Hola 👋')).toBe('Hola');
  });
});
