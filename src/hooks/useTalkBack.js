import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * TalkBack: motor del lector de pantalla por voz (Web Speech Synthesis API).
 *
 * Este modulo no contiene JSX ni estado global: expone un hook reutilizable
 * que el `TalkBackProvider` convierte en un unico contexto compartido por el
 * Navbar y el Panel de Accesibilidad.
 *
 * - Lee el contenido del elemento enfocado o sobrevolado (`onFocus`, `onMouseEnter`).
 * - Permite anunciar regiones `aria-live` mediante `announce()`.
 * - Expone Pausar, Reanudar, Detener y velocidad (0.8x, 1x, 1.2x).
 *
 * Todo el texto de salida esta libre de emojis: se normaliza cualquier caracter
 * no verbal antes de enviarlo al sintetizador.
 */

export const TALKBACK_RATES = [0.8, 1, 1.2];
export const DEFAULT_TALKBACK_LANG = 'es-ES';
const STORAGE_KEY = 'cacique_talkback_enabled';

// Elimina emojis, simbolos y marcas de formato del texto a leer.
// Se recorre por code points (no por regex) para evitar clases de caracteres
// ambiguas y cubrir correctamente los pares de banderas y emojis ZWJ.
const EMOJI_RANGES = [
  [0x1f000, 0x1faff],
  [0x2600, 0x27bf],
  [0x2b00, 0x2bff],
  [0x1f1e6, 0x1f1ff],
];
const SYMBOL_CODE_POINTS = new Set([0xfe0f, 0x200d, 0x20e3]);
// Puntuacion legible por el sintetizador; cualquier otro simbolo se descarta.
const ALLOWED_PUNCTUATION = '.,;:!¡¿?()[]"\'/\\|@#%&$+-=<>*_~`';

const isEmojiCodePoint = (codePoint) =>
  EMOJI_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end) ||
  SYMBOL_CODE_POINTS.has(codePoint);

export const sanitizeSpeechText = (text) => {
  if (text === null || text === undefined) return '';
  let result = '';
  for (const character of String(text)) {
    const codePoint = character.codePointAt(0);
    if (isEmojiCodePoint(codePoint)) {
      result += ' ';
    } else if (ALLOWED_PUNCTUATION.includes(character) || /\s/.test(character)) {
      result += character;
    } else if (/\p{L}|\p{N}/u.test(character)) {
      result += character;
    } else {
      result += ' ';
    }
  }
  return result.replace(/\s+/g, ' ').trim();
};

export const getSpeechSynthesis = () => {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis ?? null;
};

export const isSpeechSynthesisAvailable = () => getSpeechSynthesis() !== null;

export function useTalkBackEngine({ lang = DEFAULT_TALKBACK_LANG } = {}) {
  const [isEnabled, setIsEnabled] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [isSupported] = useState(isSpeechSynthesisAvailable);
  const lastAnnouncementRef = useRef('');

  const cancel = useCallback(() => {
    getSpeechSynthesis()?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const speak = useCallback(
    (text, options = {}) => {
      const synthesis = getSpeechSynthesis();
      const clean = sanitizeSpeechText(text);

      if (!synthesis || !clean) return false;

      const utterance = new window.SpeechSynthesisUtterance(clean);
      utterance.lang = options.lang ?? lang;
      utterance.rate = options.rate ?? rate;
      utterance.pitch = options.pitch ?? 1;

      lastAnnouncementRef.current = clean;
      synthesis.cancel();
      synthesis.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
      return true;
    },
    [lang, rate],
  );

  const pause = useCallback(() => {
    const synthesis = getSpeechSynthesis();
    if (!synthesis) return;
    synthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  }, []);

  const resume = useCallback(() => {
    const synthesis = getSpeechSynthesis();
    if (!synthesis) return;
    synthesis.resume();
    setIsPaused(false);
    setIsSpeaking(Boolean(lastAnnouncementRef.current));
  }, []);

  const stop = useCallback(() => {
    getSpeechSynthesis()?.cancel();
    lastAnnouncementRef.current = '';
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const announce = useCallback(
    (text, options) => {
      if (!isEnabled) return false;
      return speak(text, options);
    },
    [isEnabled, speak],
  );

  const changeRate = useCallback((nextRate) => {
    const safeRate = TALKBACK_RATES.includes(nextRate) ? nextRate : 1;
    setRate(safeRate);
    return safeRate;
  }, []);

  const toggleTalkBack = useCallback(() => {
    setIsEnabled((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Modo privado: la preferencia solo dura la sesion.
      }
      if (next) {
        // Fuerza la carga de voces disponibles en espanol.
        getSpeechSynthesis()?.getVoices?.();
      } else {
        getSpeechSynthesis()?.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
      }
      return next;
    });
  }, []);

  // Descripcion accesible del estado actual para lectores de pantalla.
  const statusLabel = useMemo(() => {
    if (!isSupported) return 'Lector de voz no disponible en este navegador';
    if (!isEnabled) return 'Lector de voz desactivado';
    if (isPaused) return 'Lector de voz pausado';
    if (isSpeaking) return 'Lector de voz leyendo';
    return 'Lector de voz activo';
  }, [isEnabled, isPaused, isSpeaking, isSupported]);

  // Notifica a las regiones aria-live del documento.
  useEffect(() => {
    if (!isEnabled || !lastAnnouncementRef.current) return;
    const liveRegion = document.getElementById('cacique-aria-live-region');
    if (liveRegion) liveRegion.textContent = lastAnnouncementRef.current;
  }, [isEnabled, isSpeaking]);

  // Limpieza: cancela la locucion al desmontar para no dejar audio huerfano.
  useEffect(() => () => getSpeechSynthesis()?.cancel(), []);

  return {
    isEnabled,
    isSupported,
    isSpeaking,
    isPaused,
    rate,
    lang,
    statusLabel,
    speak,
    announce,
    cancel,
    pause,
    resume,
    stop,
    changeRate,
    toggleTalkBack,
    setIsEnabled,
  };
}

export default useTalkBackEngine;