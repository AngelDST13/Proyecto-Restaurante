// Palabras clave permitidas relacionadas con el restaurante.
export const EMISION_KEYWORDS = [
  'menu', 'menú', 'platillo', 'precio', 'chifrijo', 'vigoron', 'vigorón',
  'chicharron', 'chicharrón', 'costilla', 'ceviche', 'sede', 'escazu', 'escazú',
  'santa ana', 'cartago', 'heredia', 'horario', 'reserva', 'mesa', 'comanda',
  'kds', 'orden', 'bebida', 'postre', 'ubicacion', 'ubicación', 'contacto'
];

export function validateUserPrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return { isValid: false, reason: 'Consulta vacía.' };
  }

  const cleanPrompt = prompt.toLowerCase();

  if (cleanPrompt.includes('emoji') || cleanPrompt.includes('emoticon')) {
    return {
      isValid: false,
      reason: 'Por políticas de diseño corporativo, el asistente no utiliza emojis.'
    };
  }

  return { isValid: true };
}

export function removeEmojis(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}\uFE0E\uFE0F\u200D]/gu, '').trim();
}
