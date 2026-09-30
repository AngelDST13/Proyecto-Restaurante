import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  authenticateCredentials,
  decryptData,
  encryptData,
  generateJWT,
  generateSessionSignature,
  registerNewClient,
  verifyJWT,
  verifySessionIntegrity
} from '../services/authSecurity';
import { subscribeToLiveEvents, triggerN8nAutomation } from '../services/n8nService';

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('authSecurity edge cases', () => {
  it('maneja claves vacías, datos corruptos y firmas de sesión alteradas', () => {
    expect(decryptData('')).toBeNull();
    expect(decryptData('not-an-encrypted-value')).toBeNull();
    expect(generateSessionSignature(null)).toBe('');
    expect(verifySessionIntegrity(null, 'signature')).toBe(false);
    const user = { email: 'qa@example.com', rol: 'mesero', sede: 'escazu' };
    expect(verifySessionIntegrity(user, generateSessionSignature(user))).toBe(true);
    expect(verifySessionIntegrity({ ...user, rol: 'administrador' }, generateSessionSignature(user))).toBe(false);
  });

  it('autentica cuentas y clientes registrados, y rechaza credenciales incorrectas', () => {
    expect(authenticateCredentials('ADMIN@ELCACIQUE.COM', 'AdminCacique2026!').success).toBe(true);
    expect(authenticateCredentials('admin@elcacique.com', 'incorrecta').success).toBe(false);
    expect(authenticateCredentials('missing@example.com', 'password').message).toMatch(/no existe/i);
    const registration = registerNewClient('nuevo@example.com', 'secret123', 'Nuevo Cliente');
    expect(registration.success).toBe(true);
    expect(authenticateCredentials('nuevo@example.com', 'secret123').success).toBe(true);
    expect(authenticateCredentials('nuevo@example.com', 'wrong').success).toBe(false);
    expect(registerNewClient('nuevo@example.com', 'another123', 'Otro Cliente').success).toBe(false);
  });

  it('genera JWT y rechaza tokens vacíos, alterados o expirados', () => {
    const token = generateJWT({ email: 'staff@example.com', rol: 'mesero', sede: 'escazu', nombre: 'QA' });
    expect(verifyJWT(token).role).toBe('mesero');
    expect(verifyJWT('')).toBeNull();
    expect(verifyJWT('malformed.token')).toBeNull();
    const expired = btoa(JSON.stringify({ exp: 1 })).replace(/=/g, '');
    expect(verifyJWT(`header.${expired}.signature`)).toBeNull();
  });
});

describe('n8nService network fallbacks and events', () => {
  it('returns responses from supported response shapes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ output: 'respuesta remota' }) }));
    expect((await triggerN8nAutomation('', { userMessage: 'hola' })).respuesta).toBe('respuesta remota');
    expect(JSON.parse(fetch.mock.calls[0][1].body).modulo).toBe('AGENTE_IA_CONSULTA');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { respuesta: 'respuesta anidada' } }) }));
    expect((await triggerN8nAutomation('RESERVA', {})).respuesta).toBe('respuesta anidada');
  });

  it('falls back for failed responses, empty payloads and network errors; unsubscribes events', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    expect((await triggerN8nAutomation('X', {})).success).toBe(false);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    expect((await triggerN8nAutomation('X', {})).success).toBe(false);
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect((await triggerN8nAutomation('X', {})).success).toBe(false);
    expect(warning).toHaveBeenCalled();
    warning.mockRestore();

    const callback = vi.fn();
    const unsubscribe = subscribeToLiveEvents(callback);
    window.dispatchEvent(new CustomEvent('cacique-live-event', { detail: { id: 'event-1' } }));
    expect(callback).toHaveBeenCalledWith({ id: 'event-1' });
    unsubscribe();
    window.dispatchEvent(new CustomEvent('cacique-live-event', { detail: { id: 'event-2' } }));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(subscribeToLiveEvents(null)).toBeTypeOf('function');
  });
});
