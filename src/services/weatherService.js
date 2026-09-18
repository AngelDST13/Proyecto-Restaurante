// Coordenadas fijas de las sedes de la Chicharronera en Costa Rica
const SEDES_COORDINATES = {
  escazu: { lat: 9.9304, lon: -84.1398, name: 'Escazú' },
  santa_ana: { lat: 9.9326, lon: -84.1826, name: 'Santa Ana' },
  cartago: { lat: 9.8638, lon: -83.9162, name: 'Cartago' },
  heredia: { lat: 9.9984, lon: -84.1169, name: 'Heredia' }
};

export const getWeatherByLocation = async (sedeKey = 'escazu') => {
  try {
    const coords = SEDES_COORDINATES[sedeKey] || SEDES_COORDINATES.escazu;
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`
    );
    const data = await response.json();
    
    return {
      location: coords.name,
      temp: Math.round(data.current_weather.temperature),
      windspeed: data.current_weather.windspeed,
      weathercode: data.current_weather.weathercode,
      isDay: data.current_weather.is_day === 1
    };
  } catch (error) {
    console.error('Error al consultar clima API:', error);
    return { location: 'Escazú', temp: 24, windspeed: 12, isDay: true };
  }
};