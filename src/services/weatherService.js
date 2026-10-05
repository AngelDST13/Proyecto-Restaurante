import { httpRequest, withFallback } from './api';

// Coordenadas fijas de las sedes de la Chicharronera en Costa Rica
export const SEDES_COORDINATES = {
  escazu: { lat: 9.9304, lon: -84.1398, name: 'Escazú' },
  santa_ana: { lat: 9.9326, lon: -84.1826, name: 'Santa Ana' },
  cartago: { lat: 9.8638, lon: -83.9162, name: 'Cartago' },
  heredia: { lat: 9.9984, lon: -84.1169, name: 'Heredia' }
};

// Clima tipico del Valle Central, usado cuando Open-Meteo no responde.
const FALLBACK_WEATHER = {
  escazu: { temp: 24, windspeed: 12, weathercode: 2 },
  santa_ana: { temp: 26, windspeed: 10, weathercode: 1 },
  cartago: { temp: 19, windspeed: 14, weathercode: 3 },
  heredia: { temp: 22, windspeed: 11, weathercode: 2 }
};

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

/** 'ESCAZÚ' | 'Santa Ana' | 'santa_ana' -> 'escazu' | 'santa_ana' */
export function normalizeSedeKey(sede = 'escazu') {
  const key = String(sede)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  return SEDES_COORDINATES[key] ? key : 'escazu';
}

/** Codigos WMO de Open-Meteo -> descripcion en espanol. */
export function describeWeatherCode(code) {
  if (code === 0) return 'Despejado';
  if (code <= 2) return 'Parcialmente nublado';
  if (code === 3) return 'Nublado';
  if (code === 45 || code === 48) return 'Neblina';
  if (code >= 51 && code <= 67) return 'Lluvia';
  if (code >= 80 && code <= 82) return 'Aguaceros';
  if (code >= 95) return 'Tormenta';
  return 'Variable';
}

/**
 * Clima actual de una sede. Nunca lanza: si la API falla devuelve datos
 * estimados con `offline: true` para que la vista lo indique.
 */
export const getWeatherByLocation = async (sede = 'escazu') => {
  const key = normalizeSedeKey(sede);
  const coords = SEDES_COORDINATES[key];

  const { data, offline } = await withFallback(
    async () => {
      const response = await httpRequest(
        `${OPEN_METEO_URL}?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`
      );
      const current = response?.current_weather;
      if (!current || !Number.isFinite(current.temperature)) {
        throw new Error('Respuesta de clima incompleta');
      }
      return {
        temp: Math.round(current.temperature),
        windspeed: current.windspeed,
        weathercode: current.weathercode,
        isDay: current.is_day === 1
      };
    },
    () => ({ ...FALLBACK_WEATHER[key], isDay: true })
  );

  return {
    location: coords.name,
    ...data,
    description: describeWeatherCode(data.weathercode),
    offline
  };
};
