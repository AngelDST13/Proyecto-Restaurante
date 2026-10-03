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

/** Selectores de los elementos que TalkBack lee automaticamente. */
export const SPOKEN_SELECTOR = [
  'button',
  'a[href]',
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="checkbox"]',
  '[role="switch"]',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'h1',
  'h2',
  'h3',
  '[data-menu-item]',
  '[data-table-status]',
  '[data-stock-alert]',
  '[data-spoken-label]',
].join(', ');

/**
 * Extrae el texto que debe leerse en voz alta de un elemento.
 * Prioriza el texto explicito, luego el contenido visible y por ultimo
 * el nombre accesible (aria-label / title).
 */
export const extractSpeechLabel = (element) => {
  if (!element) return '';
  const explicit = element.getAttribute?.('data-spoken-label');
  const ariaLabel = element.getAttribute?.('aria-label');
  const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();

  return sanitizeSpeechText(explicit || ariaLabel || text);
};

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
  const lastHoveredRef = useRef(null);

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
      // Se publica en la region aria-live de forma sincrona para que los lectores
      // de pantalla reciban el texto en la misma interaccion que lo dispara.
      if (isEnabled) {
        const liveRegion = document.getElementById('cacique-aria-live-region');
        if (liveRegion) liveRegion.textContent = clean;
      }
      synthesis.cancel();
      synthesis.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
      return true;
    },
    [isEnabled, lang, rate],
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

  /**
   * Lectura automatica: al enfocar o sobrevolar un elemento interactivo se
   * reproduce su etiqueta en voz alta. Se registra en fase de captura para
   *_run_ antes que los manejadores propios de cada componente.
   */
  useEffect(() => {
    if (!isEnabled) return undefined;

    const describe = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(SPOKEN_SELECTOR)) return;
      const label = extractSpeechLabel(target);
      if (!label) return;
      speak(label, { rate });
    };

    const onFocusIn = (event) => describe(event);
    const onPointerOver = (event) => {
      // Se evita repetir la lectura al mover el puntero dentro del mismo elemento.
      if (lastHoveredRef.current === event.target) return;
      lastHoveredRef.current = event.target;
      describe(event);
    };

    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('mouseover', onPointerOver, true);

    return () => {
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('mouseover', onPointerOver, true);
      lastHoveredRef.current = null;
    };
  }, [isEnabled, rate, speak]);

  /**
   * Desbloqueo de audio: algunos navegadores restringen `speechSynthesis`
   * hasta que el usuario interactua con la pagina. Un primer `speak()` vacio
   * durante una interaction real libera el canal de audio del motor nativo.
   */
  useEffect(() => {
    if (!isEnabled) return undefined;

    const unlock = () => {
      const synthesis = getSpeechSynthesis();
      if (!synthesis) return;

      try {
        const warmup = new window.SpeechSynthesisUtterance(' ');
        warmup.volume = 0;
        warmup.lang = lang;
        synthesis.speak(warmup);
        synthesis.cancel();
      } catch {
        // Algunos motores no aceptan la locucion de calentamiento: se ignora.
      }

      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    };

    document.addEventListener('pointerdown', unlock, true);
    document.addEventListener('keydown', unlock, true);

    return () => {
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    };
  }, [isEnabled, lang]);

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