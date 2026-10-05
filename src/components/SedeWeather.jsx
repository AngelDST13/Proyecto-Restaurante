import { useEffect, useState } from 'react';
import { CloudSun, LoaderCircle, Wind, WifiOff } from 'lucide-react';
import { getWeatherByLocation } from '../services/weatherService';

/**
 * Clima en vivo de una sede (Open-Meteo). El padre debe montarlo con
 * `key={sede}` para que el estado de carga se reinicie al cambiar de sede.
 * Si la API no responde se muestran datos estimados con un aviso visible.
 */
export default function SedeWeather({ sede }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let active = true;
    getWeatherByLocation(sede).then((result) => {
      if (active) setWeather(result);
    });
    return () => {
      active = false;
    };
  }, [sede]);

  return (
    <div
      data-testid="sede-weather"
      role="status"
      aria-live="polite"
      className="flex min-h-14 items-center gap-3 rounded-xl border border-[#659B5E]/30 bg-[#0A090C] px-4 py-3 font-sans"
    >
      {!weather ? (
        <>
          <LoaderCircle className="h-5 w-5 shrink-0 animate-spin text-[#659B5E]" aria-hidden="true" />
          <span className="text-xs font-bold text-gray-300">Consultando clima en vivo...</span>
        </>
      ) : (
        <>
          <CloudSun className="h-6 w-6 shrink-0 text-amber-400" aria-hidden="true" />
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-black text-white">
              {weather.temp}°C · {weather.description}
            </p>
            <p className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold text-gray-400">
              <span className="inline-flex items-center gap-1">
                <Wind className="h-3.5 w-3.5" aria-hidden="true" /> Viento {weather.windspeed} km/h
              </span>
              {weather.offline ? (
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <WifiOff className="h-3.5 w-3.5" aria-hidden="true" /> Datos estimados (sin conexión)
                </span>
              ) : (
                <span>Open-Meteo · tiempo real</span>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
