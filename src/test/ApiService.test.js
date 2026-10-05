import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  API_BASE_URL,
  ApiError,
  N8N_WEBHOOK_MASTER,
  PENDING_RESERVATIONS_KEY,
  api,
  createReservation,
  fetchMenu,
  getPendingReservations,
  httpRequest,
  notifyWebhook,
  withFallback
} from '../services/api';

/**
 * Cliente HTTP centralizado: peticiones con timeout, errores tipados y
 * respaldos con datos simulados cuando el servidor no responde.
 */

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => body
});

const offline = () => vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

describe('httpRequest', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('serializa el cuerpo JSON y devuelve la respuesta', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 1 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(httpRequest('/recurso', { method: 'POST', body: { a: 1 } })).resolves.toEqual({ id: 1 });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/recurso');
    expect(options.method).toBe('POST');
    expect(options.body).toBe('{"a":1}');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it('omite Content-Type en GET y devuelve null ante 204', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(httpRequest('/vacio')).resolves.toBeNull();
    expect(fetchMock.mock.calls[0][1].headers['Content-Type']).toBeUndefined();
    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
  });

  it('lanza ApiError con el estado HTTP cuando la respuesta no es ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, { ok: false, status: 503 })));

    const error = await httpRequest('/caido').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(503);
    expect(error.message).toContain('503');
  });

  it('envuelve los errores de red en ApiError', async () => {
    vi.stubGlobal('fetch', offline());

    const error = await httpRequest('/red').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBeNull();
    expect(error.message).toBe('Failed to fetch');
    expect(error.cause).toBeInstanceOf(TypeError);
  });

  it('usa un mensaje generico si el error de red no trae mensaje', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue({}));
    await expect(httpRequest('/red')).rejects.toThrow('Error de red');
  });

  it('aborta la peticion al agotar el tiempo de espera', async () => {
    vi.stubGlobal('fetch', vi.fn((url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    })));

    await expect(httpRequest('/lento', { timeoutMs: 10 })).rejects.toThrow('Tiempo de espera agotado (10 ms)');
  });
});

describe('withFallback y notifyWebhook', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('devuelve datos reales cuando la peticion funciona', async () => {
    await expect(withFallback(async () => 'real', 'respaldo')).resolves.toEqual({ data: 'real', offline: false, error: null });
  });

  it('usa el respaldo estatico o calculado cuando la peticion falla', async () => {
    const failure = new Error('caido');
    await expect(withFallback(() => Promise.reject(failure), 'respaldo')).resolves.toEqual({ data: 'respaldo', offline: true, error: failure });

    const fallback = vi.fn(() => 'calculado');
    const result = await withFallback(() => Promise.reject(failure), fallback);
    expect(result.data).toBe('calculado');
    expect(fallback).toHaveBeenCalledWith(failure);
  });

  it('notifyWebhook envia el evento a n8n y nunca lanza', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(notifyWebhook('PRUEBA', { x: 1 })).resolves.toEqual({ ok: true });
    expect(fetchMock.mock.calls[0][0]).toBe(N8N_WEBHOOK_MASTER);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ modulo: 'PRUEBA', evento: 'PRUEBA', x: 1 });

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', offline());
    await expect(notifyWebhook('PRUEBA')).resolves.toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('createReservation', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  const reserva = { nombre: 'Ana Pérez', telefono: '88881234', sede: 'Escazú', fecha: '2026-10-15', hora: '19:00', personas: 4 };

  it('registra la reserva en la API cuando el servidor responde', async () => {
    const fetchMock = vi.fn().mockImplementation((url, options) =>
      Promise.resolve(jsonResponse(url.endsWith('/reservaciones') ? { id: 42, ...JSON.parse(options.body) } : {})));
    vi.stubGlobal('fetch', fetchMock);

    const result = await createReservation(reserva);

    expect(result.offline).toBe(false);
    expect(result.data).toMatchObject({ id: 42, nombre: 'Ana Pérez', estado: 'confirmada' });
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/reservaciones`, expect.objectContaining({ method: 'POST' }));
    expect(fetchMock).toHaveBeenCalledWith(N8N_WEBHOOK_MASTER, expect.objectContaining({ method: 'POST' }));
    expect(getPendingReservations()).toEqual([]);
  });

  it('sin servidor guarda la reserva en la cola local y responde offline', async () => {
    vi.stubGlobal('fetch', offline());
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await createReservation(reserva);

    expect(result.offline).toBe(true);
    expect(result.error).toBeInstanceOf(ApiError);
    expect(result.data.id).toMatch(/^LOCAL-/);
    expect(result.data.estado).toBe('pendiente_sincronizacion');
    expect(getPendingReservations()).toHaveLength(1);
    expect(getPendingReservations()[0]).toMatchObject({ nombre: 'Ana Pérez' });

    await createReservation({ ...reserva, nombre: 'Luis' });
    expect(getPendingReservations()).toHaveLength(2);
    warn.mockRestore();
  });

  it('tolera una cola local corrupta o almacenamiento no disponible', async () => {
    localStorage.setItem(PENDING_RESERVATIONS_KEY, '{no-json');
    expect(getPendingReservations()).toEqual([]);
    localStorage.setItem(PENDING_RESERVATIONS_KEY, '{"a":1}');
    expect(getPendingReservations()).toEqual([]);

    vi.stubGlobal('fetch', offline());
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    const result = await createReservation(reserva);
    expect(result.offline).toBe(true);
    expect(result.data.estado).toBe('pendiente_sincronizacion');
    setItem.mockRestore();
    warn.mockRestore();
  });
});

describe('fetchMenu', () => {
  afterEach(() => vi.unstubAllGlobals());
  const local = [{ id: 1, nombre: 'Local', precio: 1000 }];

  it('normaliza el catalogo remoto valido', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([{ id: 9, nombre: 'Remoto', precio: '2500' }])));
    const result = await fetchMenu(local);
    expect(result.offline).toBe(false);
    expect(result.data).toEqual([{ id: 9, nombre: 'Remoto', precio: 2500 }]);
  });

  it.each([
    ['vacio', []],
    ['no es arreglo', { items: [] }],
    ['items invalidos', [{ id: 1, nombre: 'Sin precio', precio: 'abc' }]],
    ['sin id', [{ nombre: 'X', precio: 1 }]]
  ])('usa el catalogo local si el remoto esta %s', async (_label, body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(body)));
    const result = await fetchMenu(local);
    expect(result.offline).toBe(true);
    expect(result.data).toBe(local);
  });

  it('usa el catalogo local si la API no responde', async () => {
    vi.stubGlobal('fetch', offline());
    await expect(fetchMenu()).resolves.toMatchObject({ data: [], offline: true });
  });
});

describe('api heredada', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('loginUser exige contraseña y valida que el usuario exista', async () => {
    await expect(api.loginUser('a@b.com', '')).rejects.toThrow('La contraseña es requerida');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([])));
    await expect(api.loginUser('nadie@b.com', 'x')).rejects.toThrow('Usuario no encontrado');
  });

  it('loginUser codifica el correo y notifica el inicio de sesion', async () => {
    const fetchMock = vi.fn().mockImplementation((url) =>
      Promise.resolve(jsonResponse(url.includes('/usuarios') ? [{ email: 'a+b@c.com', rol: 'admin' }] : {})));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.loginUser('a+b@c.com', 'clave')).resolves.toEqual({ email: 'a+b@c.com', rol: 'admin' });
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE_URL}/usuarios?email=a%2Bb%40c.com`);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).modulo).toBe('LOGIN_SUCCESS');
  });

  it('sendOrderToN8n devuelve la respuesta de n8n o el respaldo local', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 'ok' })));
    await expect(api.sendOrderToN8n({ mesa: 3 })).resolves.toEqual({ status: 'ok' });

    vi.stubGlobal('fetch', offline());
    await expect(api.sendOrderToN8n({ mesa: 3 })).resolves.toEqual({
      status: 'fallback_offline',
      message: 'Comanda procesada localmente'
    });
  });

  it('expone los servicios nuevos en el objeto api', () => {
    expect(api.createReservation).toBe(createReservation);
    expect(api.fetchMenu).toBe(fetchMenu);
  });
});
