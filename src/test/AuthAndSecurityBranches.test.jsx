import { afterEach, describe, expect, it } from 'vitest';
import {
  formatSedeName, sanitizeInput, sanitizeUserForSession, decryptData,
  encryptData, authenticateCredentials, verifyJWT, verifySessionIntegrity,
  generateSessionSignature
} from '../services/authSecurity';
import { removeEmojis, validateUserPrompt } from '../services/promptValidation';

afterEach(() => localStorage.clear());

describe('Ramas de sanitización, autenticación y validación de prompts', () => {
  it('normaliza entradas vacías, nulas, indefinidas y caracteres especiales', () => {
    expect(sanitizeInput()).toBe('');
    expect(sanitizeInput(null)).toBe('null');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput('  QA.User@Example.COM...  ')).toBe('qa.user@example.com');
    expect(formatSedeName()).toBe('Escazú');
    expect(formatSedeName('SANTA_ANA')).toBe('Santa Ana');
    expect(formatSedeName('unknown')).toBe('Escazú');
  });

  it('limpia datos sensibles y cubre desencriptación válida, vacía y malformada', () => {
    expect(sanitizeUserForSession(null)).toBeNull();
    const safe = sanitizeUserForSession({ email: ' QA@EXAMPLE.COM ', sede: '', password: 'secret', contrasena: 'x', secret: 'y' });
    expect(safe).toMatchObject({ email: 'qa@example.com', sede: 'escazu' });
    expect(safe).not.toHaveProperty('password');
    expect(safe).not.toHaveProperty('contrasena');
    expect(safe).not.toHaveProperty('secret');
    expect(decryptData(null)).toBeNull();
    expect(decryptData('malformado')).toBeNull();
    const encrypted = encryptData({ ok: true });
    expect(decryptData(encrypted)).toEqual({ ok: true });
  });

  it('distingue prompts vacíos, solicitudes de emojis y texto permitido', () => {
    expect(validateUserPrompt(null).isValid).toBe(false);
    expect(validateUserPrompt(undefined).reason).toMatch(/vacía/i);
    expect(validateUserPrompt('').isValid).toBe(false);
    expect(validateUserPrompt('Quiero emojis en el menú').isValid).toBe(false);
    expect(validateUserPrompt('¿Cuál es el menú de Cartago?').isValid).toBe(true);
    expect(removeEmojis(null)).toBe('');
    expect(removeEmojis('  Chifrijo 🔥 🇨🇷  ')).toBe('Chifrijo');
  });

  it('verifica firmas y retorna los caminos de error de credenciales y JWT', () => {
    const user = { email: 'qa@example.com', rol: 'mesero', sede: 'escazu' };
    const signature = generateSessionSignature(user);
    expect(verifySessionIntegrity(user, signature)).toBe(true);
    expect(verifySessionIntegrity(user, '')).toBe(false);
    expect(verifySessionIntegrity(null, signature)).toBe(false);
    expect(authenticateCredentials('', '')).toMatchObject({ success: false });
    expect(verifyJWT(undefined)).toBeNull();
    expect(verifyJWT('not.a.jwt.with.extra.parts')).toBeNull();
  });
});
