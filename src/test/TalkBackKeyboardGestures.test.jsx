import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TalkBackProvider } from '../context/TalkBackContext';
import {
  ACTIVATION_KEYS,
  DOUBLE_TAP_WINDOW_MS,
  isActivationKey,
} from '../hooks/useTalkBack';

/**
 * Lectura por teclado (Espacio / Enter) y gestos tactiles (toque simple y
 * doble toque) orquestados por useTalkBack.
 */

const lastUtterance = () => {
  const calls = window.speechSynthesis.speak.mock.calls;
  return calls[calls.length - 1][0];
};

const renderedTexts = () =>
  window.speechSynthesis.speak.mock.calls.map((call) => call[0].text);

function SpeakablePage() {
  return (
    <main>
      <h1>Chicharronera El Cacique</h1>
      <button type="button">Agregar Chicharron</button>
      <article data-menu-item>
        <h2>Chicharron Gourmet</h2>
        <p>Costilla cocida lentamente con).__onsense__.</p>
      </article>
      <span data-stock-alert>Stock critico de Papa</span>
      <span data-empty aria-hidden="true" />
    </main>
  );
}

const withTalkBack = (ui) => <TalkBackProvider>{ui}</TalkBackProvider>;

describe('TalkBack: teclado y gestos tactiles', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.speechSynthesis.speak.mockClear();
    window.speechSynthesis.cancel.mockClear();
  });

  it('expone las teclas de activacion', () => {
    expect(ACTIVATION_KEYS).toEqual([' ', 'Spacebar', 'Enter']);
    expect(isActivationKey(' ')).toBe(true);
    expect(isActivationKey('Enter')).toBe(true);
    expect(isActivationKey('a')).toBe(false);
    expect(DOUBLE_TAP_WINDOW_MS).toBeGreaterThan(0);
  });

  describe('Lectura por teclado', () => {
    beforeEach(() => {
      window.localStorage.setItem('cacique_talkback_enabled', 'true');
    });

    it('lee el elemento enfocado al presionar Espacio', () => {
      render(withTalkBack(<SpeakablePage />));

      const button = screen.getByRole('button', { name: 'Agregar Chicharron' });
      button.focus();
      window.speechSynthesis.speak.mockClear();

      fireEvent.keyDown(button, { key: ' ' });
      expect(lastUtterance().text).toBe('Agregar Chicharron');
    });

    it('lee el elemento enfocado al presionar Enter', () => {
      render(withTalkBack(<SpeakablePage />));

      const button = screen.getByRole('button', { name: 'Agregar Chicharron' });
      button.focus();
      window.speechSynthesis.speak.mockClear();

      fireEvent.keyDown(button, { key: 'Enter' });
      expect(lastUtterance().text).toBe('Agregar Chicharron');
    });

    it.each(ACTIVATION_KEYS)('reacciona a la tecla %j', (key) => {
      render(withTalkBack(<SpeakablePage />));

      const button = screen.getByRole('button', { name: 'Agregar Chicharron' });
      button.focus();
      window.speechSynthesis.speak.mockClear();

      fireEvent.keyDown(button, { key });
      expect(lastUtterance().text).toBe('Agregar Chicharron');
    });

    it('ignora otras teclas', () => {
      render(withTalkBack(<SpeakablePage />));

      const button = screen.getByRole('button', { name: 'Agregar Chicharron' });
      button.focus();
      window.speechSynthesis.speak.mockClear();

      fireEvent.keyDown(button, { key: 'a' });
      fireEvent.keyDown(button, { key: 'Tab' });
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('no lee cuando no hay elemento enfocado con etiqueta', () => {
      render(withTalkBack(<SpeakablePage />));
      document.body.focus();
      window.speechSynthesis.speak.mockClear();

      fireEvent.keyDown(document.body, { key: 'Enter' });
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('no lee por teclado si TalkBack esta desactivado', () => {
      window.localStorage.removeItem('cacique_talkback_enabled');
      render(withTalkBack(<SpeakablePage />));

      const button = screen.getByRole('button', { name: 'Agregar Chicharron' });
      button.focus();
      window.speechSynthesis.speak.mockClear();

      fireEvent.keyDown(button, { key: 'Enter' });
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('usa la velocidad configurada', () => {
      render(withTalkBack(<SpeakablePage />));

      const button = screen.getByRole('button', { name: 'Agregar Chicharron' });
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(lastUtterance().rate).toBe(1);
      expect(lastUtterance().lang).toBe('es-ES');
    });
  });

  describe('Gestos tactiles', () => {
    beforeEach(() => {
      window.localStorage.setItem('cacique_talkback_enabled', 'true');
    });

    it('lee el elemento con un toque simple', () => {
      render(withTalkBack(<SpeakablePage />));

      fireEvent.touchEnd(screen.getByRole('button', { name: 'Agregar Chicharron' }));
      expect(lastUtterance().text).toBe('Agregar Chicharron');
    });

    it('lee el bloque completo con doble toque consecutivo', () => {
      render(withTalkBack(<SpeakablePage />));

      const item = screen.getByRole('heading', { name: 'Chicharron Gourmet' });
      const block = item.closest('article');

      fireEvent.touchEnd(block);
      fireEvent.touchEnd(block);

      const texts = renderedTexts();
      expect(texts[texts.length - 1]).toContain('Chicharron Gourmet');
      expect(texts[texts.length - 1]).toContain('Costilla cocida lentamente');
    });

    it('reinicia el doble toque si cambia el elemento', () => {
      render(withTalkBack(<SpeakablePage />));

      fireEvent.touchEnd(screen.getByRole('button', { name: 'Agregar Chicharron' }));
      fireEvent.touchEnd(screen.getByText('Stock critico de Papa'));

      const texts = renderedTexts();
      expect(texts[texts.length - 1]).toBe('Stock critico de Papa');
    });

    it('reinicia el doble toque si expira la ventana de tiempo', async () => {
      vi.useFakeTimers();
      try {
        render(withTalkBack(<SpeakablePage />));

        const button = screen.getByRole('button', { name: 'Agregar Chicharron' });
        fireEvent.touchEnd(button);

        vi.advanceTimersByTime(DOUBLE_TAP_WINDOW_MS + 100);
        fireEvent.touchEnd(button);

        // Tras expirar la ventana se trata como un toque simple.
        const texts = renderedTexts();
        expect(texts[texts.length - 1]).toBe('Agregar Chicharron');
        expect(texts[texts.length - 1]).not.toContain('Agregar ChicharronAgregar Chicharron');
      } finally {
        vi.useRealTimers();
      }
    });

    it('cae a la etiqueta del elemento cuando el bloque no aporta mas texto', () => {
      render(withTalkBack(<SpeakablePage />));

      const button = screen.getByRole('button', { name: 'Agregar Chicharron' });
      fireEvent.touchEnd(button);
      fireEvent.touchEnd(button);

      expect(lastUtterance().text).toBe('Agregar Chicharron');
    });

    it('ignora toques sin etiqueta legible', () => {
      render(withTalkBack(<SpeakablePage />));
      window.speechSynthesis.speak.mockClear();

      fireEvent.touchEnd(document.querySelector('[data-empty]'));
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('no lee por gesto si TalkBack esta desactivado', () => {
      window.localStorage.removeItem('cacique_talkback_enabled');
      render(withTalkBack(<SpeakablePage />));
      window.speechSynthesis.speak.mockClear();

      fireEvent.touchEnd(screen.getByRole('button', { name: 'Agregar Chicharron' }));
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('deja de escuchar gestos al desmontar', () => {
      const { unmount } = render(withTalkBack(<SpeakablePage />));
      unmount();
      window.speechSynthesis.speak.mockClear();

      fireEvent.touchEnd(document.body);
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });
  });
});