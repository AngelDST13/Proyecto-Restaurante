import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SedeWeather from '../components/SedeWeather';
import {
  SEDES_COORDINATES,
  describeWeatherCode,
  getWeatherByLocation,
  normalizeSedeKey
} from '../services/weatherService';

/**
 * Clima en tiempo real por sede (Open-Meteo) con respaldo estimado cuando la
 * API no responde.
 */

const openMeteo = (current_weather) => vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => ({ current_weather })
});

describe('weatherService', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['ESCAZÚ', 'escazu'],
    ['SANTA ANA', 'santa_ana'],
    ['santa_ana', 'santa_ana'],
    ['Cartago', 'cartago'],
    [' Heredia ', 'heredia'],
    ['Limón', 'escazu'],
    [undefined, 'escazu']
  ])('normaliza la sede %s a %s', (input, expected) => {
    expect(normalizeSedeKey(input)).toBe(expected);
  });

  it.each([
    [0, 'Despejado'],
    [2, 'Parcialmente nublado'],
    [3, 'Nublado'],
    [45, 'Neblina'],
    [61, 'Lluvia'],
    [81, 'Aguaceros'],
    [95, 'Tormenta'],
    [77, 'Variable']
  ])('describe el codigo WMO %i como %s', (code, text) => {
    expect(describeWeatherCode(code)).toBe(text);
  });

  it('consulta Open-Meteo con las coordenadas de la sede', async () => {
    const fetchMock = openMeteo({ temperature: 21.6, windspeed: 9, weathercode: 61, is_day: 0 });
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeatherByLocation('CARTAGO');

    const { lat, lon } = SEDES_COORDINATES.cartago;
    expect(fetchMock.mock.calls[0][0]).toContain(`latitude=${lat}&longitude=${lon}&current_weather=true`);
    expect(weather).toEqual({
      location: 'Cartago',
      temp: 22,
      windspeed: 9,
      weathercode: 61,
      isDay: false,
      description: 'Lluvia',
      offline: false
    });
  });

  it('devuelve datos estimados de la misma sede si la API falla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const weather = await getWeatherByLocation('HEREDIA');
    expect(weather).toMatchObject({ location: 'Heredia', temp: 22, offline: true, isDay: true });
  });

  it('trata una respuesta incompleta como fallo y usa el respaldo', async () => {
    vi.stubGlobal('fetch', openMeteo(undefined));
    await expect(getWeatherByLocation('santa_ana')).resolves.toMatchObject({ location: 'Santa Ana', offline: true });

    vi.stubGlobal('fetch', openMeteo({ temperature: 'n/a' }));
    await expect(getWeatherByLocation('cartago')).resolves.toMatchObject({ location: 'Cartago', temp: 19, offline: true });
  });
});

describe('SedeWeather', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('muestra un estado de carga y luego el clima en vivo', async () => {
    vi.stubGlobal('fetch', openMeteo({ temperature: 25.2, windspeed: 12, weathercode: 0, is_day: 1 }));
    render(<SedeWeather sede="ESCAZÚ" />);

    expect(screen.getByRole('status')).toHaveTextContent('Consultando clima en vivo...');
    expect(await screen.findByText('25°C · Despejado')).toBeInTheDocument();
    expect(screen.getByText('Open-Meteo · tiempo real')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('indica cuando los datos son estimados por falta de conexion', async () => {
    // fetch rechazado por defecto en setup.js
    render(<SedeWeather sede="CARTAGO" />);

    expect(await screen.findByText('19°C · Nublado')).toBeInTheDocument();
    expect(screen.getByText(/Datos estimados \(sin conexión\)/)).toBeInTheDocument();
  });

  it('no actualiza el estado si se desmonta antes de recibir el clima', async () => {
    let resolveFetch;
    vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => { resolveFetch = resolve; })));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(<SedeWeather sede="HEREDIA" />);
    unmount();
    resolveFetch({ ok: true, status: 200, json: async () => ({ current_weather: { temperature: 20, windspeed: 5, weathercode: 0, is_day: 1 } }) });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
