import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

// Red deshabilitada por defecto: ninguna prueba debe salir a internet
// (Open-Meteo, json-server, n8n). Se simula un servidor caido, de modo que
// se ejercitan los respaldos; cada prueba puede usar vi.stubGlobal('fetch').
globalThis.fetch = () => Promise.reject(new TypeError('Failed to fetch (red deshabilitada en pruebas)'));

// jsdom does not implement browser scrolling; components may call this in effects.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom no implementa la Web Speech Synthesis API. Se instala un doble de
// prueba para poder verificar speak / pause / resume / cancel sin audio real.
class SpeechSynthesisUtteranceMock {
  constructor(text) {
    this.text = text;
    this.lang = '';
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.onend = null;
    this.onerror = null;
  }

  addEventListener() {}
  removeEventListener() {}
}

if (typeof window !== 'undefined') {
  window.SpeechSynthesisUtterance = SpeechSynthesisUtteranceMock;

  const createSynthesisDouble = () => ({
    speaking: false,
    paused: false,
    pending: false,
    speak: vi.fn(function speak(utterance) {
      this.speaking = true;
      this.paused = false;
      this.pending = false;
      utterance.onstart?.({ utterance });
    }),
    cancel: vi.fn(function cancel() {
      this.speaking = false;
      this.paused = false;
      this.pending = false;
    }),
    pause: vi.fn(function pause() {
      if (!this.speaking) return;
      this.paused = true;
    }),
    resume: vi.fn(function resume() {
      this.paused = false;
    }),
    getVoices: vi.fn(() => [
      { name: 'Monica', lang: 'es-ES', default: true, localService: true, voiceURI: 'monica' },
      { name: 'Diego', lang: 'es-MX', default: false, localService: true, voiceURI: 'diego' },
    ]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    writable: true,
    value: createSynthesisDouble(),
  });
}

afterEach(() => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.speak?.mockClear?.();
    window.speechSynthesis.cancel?.mockClear?.();
    window.speechSynthesis.pause?.mockClear?.();
    window.speechSynthesis.resume?.mockClear?.();
    window.speechSynthesis.getVoices?.mockClear?.();
  }
});
