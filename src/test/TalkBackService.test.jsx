import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';
import AccessibilityPanel from '../components/AccessibilityPanel';
import Navbar from '../components/Navbar';
import { sanitizeSpeechText, TALKBACK_RATES, extractSpeechLabel, SPOKEN_SELECTOR } from '../hooks/useTalkBack';
import { TalkBackProvider, useTalkBack } from '../context/TalkBackContext';

/**
 * Pruebas del servicio de TalkBack (Web Speech Synthesis API): activacion,
 * lectura, pausa, reanudacion, detencion y velocidad.
 */

const lastUtterance = () => {
  const calls = window.speechSynthesis.speak.mock.calls;
  return calls[calls.length - 1][0];
};

function TalkBackProbe() {
  const { isEnabled, isPaused, isSpeaking, statusLabel, announce, changeRate, stop, rate } = useTalkBack();
  return (
    <div>
      <span data-testid="state">
        {String(isEnabled)}|{String(isPaused)}|{String(isSpeaking)}|{statusLabel}
      </span>
      <span data-testid="rate">{String(rate)}</span>
      <button type="button" onClick={() => changeRate(1.2)}>
        Acelerar
      </button>
      <button type="button" onClick={() => announce('Mesa cinco disponible')}>
        Anunciar
      </button>
      <button type="button" onClick={stop}>
        Detener
      </button>
    </div>
  );
}

function LanguageProbe() {
  const { announce } = useTalkBack();
  return (
    <button type="button" onClick={() => announce('Sede de Escazu', { lang: 'es-CR', rate: 1.2 })}>
      Anunciar CR
    </button>
  );
}

/** Envuelve cualquier arbol con el provider de TalkBack. */
const withTalkBack = (ui) => <TalkBackProvider>{ui}</TalkBackProvider>;

/** Renderiza el panel completo con los dos proveedores de accesibilidad. */
const renderPanel = () =>
  render(
    withTalkBack(
      <AccessibilityProvider>
        <AccessibilityPanel />
      </AccessibilityProvider>,
    ),
  );

/** Panel de accesibilidad sin Speech API, para el escenario no soportado. */
const renderPanelWithoutSpeech = () =>
  render(
    withTalkBack(
      <AccessibilityProvider>
        <AccessibilityPanel />
      </AccessibilityProvider>,
    ),
  );

describe('TalkBackService (Web Speech Synthesis)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.speechSynthesis.speak.mockClear();
    window.speechSynthesis.cancel.mockClear();
    window.speechSynthesis.pause.mockClear();
    window.speechSynthesis.resume.mockClear();
    window.speechSynthesis.getVoices.mockClear();
  });

  it('expone el doble de prueba con speak, pause, resume, cancel y voces es-ES', () => {
    expect(typeof window.speechSynthesis.speak).toBe('function');
    expect(typeof window.speechSynthesis.pause).toBe('function');
    expect(typeof window.speechSynthesis.resume).toBe('function');
    expect(typeof window.speechSynthesis.cancel).toBe('function');
    const voices = window.speechSynthesis.getVoices();
    expect(voices.some((voice) => voice.lang === 'es-ES')).toBe(true);
  });

  it('sanitiza el texto eliminando emojis y simbolos no verbales', () => {
    const fire = String.fromCodePoint(0x1f525);
    const check = String.fromCodePoint(0x2705);
    const flag = String.fromCodePoint(0x1f1e8, 0x1f1f1);
    const star = String.fromCodePoint(0x2b50);
    const arrow = String.fromCodePoint(0x2192);

    expect(sanitizeSpeechText(null)).toBe('');
    expect(sanitizeSpeechText(undefined)).toBe('');
    expect(sanitizeSpeechText('Mesa 5 lista')).toBe('Mesa 5 lista');
    expect(sanitizeSpeechText(`Pedido listo ${fire}`)).toBe('Pedido listo');
    expect(sanitizeSpeechText(`${check} Disponible`)).toBe('Disponible');
    expect(sanitizeSpeechText(`Sede ${flag} en espera`)).toBe('Sede en espera');
    expect(sanitizeSpeechText(`5 ${star}`)).toBe('5');
    expect(sanitizeSpeechText(`${arrow} Ver detalle`)).toBe('Ver detalle');
    expect(sanitizeSpeechText('')).toBe('');
  });

  it('arranca desactivado y se activa al leer la preferencia persistida', () => {
    const { unmount } = render(withTalkBack(<TalkBackProbe />));
    expect(screen.getByTestId('state')).toHaveTextContent('false|false|false|Lector de voz desactivado');
    expect(screen.getByTestId('rate')).toHaveTextContent('1');
    unmount();

    window.localStorage.setItem('cacique_talkback_enabled', 'true');

    render(withTalkBack(<TalkBackProbe />));
    expect(screen.getByTestId('state')).toHaveTextContent('true|false|false|Lector de voz activo');
  });

  it('no anuncia si el lector esta desactivado', () => {
    render(withTalkBack(<TalkBackProbe />));
    fireEvent.click(screen.getByRole('button', { name: 'Anunciar' }));
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('anuncia con voz es-ES y velocidad configurable', () => {
    window.localStorage.setItem('cacique_talkback_enabled', 'true');
    render(withTalkBack(<TalkBackProbe />));

    fireEvent.click(screen.getByRole('button', { name: 'Anunciar' }));
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);

    const utterance = lastUtterance();
    expect(utterance.text).toBe('Mesa cinco disponible');
    expect(utterance.lang).toBe('es-ES');
    expect(screen.getByTestId('state')).toHaveTextContent('true|false|true|Lector de voz leyendo');
  });

  it('expone controles de pausa, reanudacion, detencion y velocidad', () => {
    window.localStorage.setItem('cacique_talkback_enabled', 'true');
    renderPanel();

    expect(screen.queryByRole('button', { name: 'Desactivar TalkBack' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    expect(screen.getByTestId('dock-tab-voz')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desactivar TalkBack' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pausar lectura' }));
    expect(window.speechSynthesis.pause).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Pausar lectura' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Reanudar lectura' }));
    expect(window.speechSynthesis.resume).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Detener lectura' }));
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();

    for (const rate of TALKBACK_RATES) {
      const label = `Velocidad .* ${String(rate).replace('.', '\\.')}x`;
      const button = screen.getByRole('button', { name: new RegExp(label) });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    }

    fireEvent.click(screen.getByRole('button', { name: 'Leer resumen de la comanda' }));
    expect(lastUtterance().text).toBe('Resumen de la comanda actual.');
    expect(lastUtterance().rate).toBe(1.2);
  });

  it('desactiva el TalkBack desde el panel y cancela la locucion', () => {
    window.localStorage.setItem('cacique_talkback_enabled', 'true');
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    fireEvent.click(screen.getByRole('button', { name: 'Desactivar TalkBack' }));
    expect(window.localStorage.getItem('cacique_talkback_enabled')).toBe('false');
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    // Tras desactivar, el Dock muestra el interruptor de activacion y oculta
    // los controles de transporte.
    expect(screen.getByRole('button', { name: 'Activar TalkBack' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pausar lectura' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Detener lectura' })).not.toBeInTheDocument();
  });

  it('alterna el TalkBack desde el Dock flotante', () => {
    window.localStorage.setItem('cacique_talkback_enabled', 'true');
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    const toggle = screen.getByRole('button', { name: 'Desactivar TalkBack' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(toggle);
    expect(window.localStorage.getItem('cacique_talkback_enabled')).toBe('false');
  });

  it('funciona de forma segura cuando la Web Speech API no esta disponible', () => {
    const original = window.speechSynthesis;
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined });

    try {
      renderPanelWithoutSpeech();

      fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
      fireEvent.click(screen.getByRole('button', { name: /Activar TalkBack/ }));

      expect(screen.getByText(/no expone la Web Speech Synthesis API/i)).toBeInTheDocument();
      // Los controles siguen visibles, pero ninguna locución es posible.
      expect(screen.getByTestId('dock-tab-voz')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Leer resumen de la comanda' }));
      expect(screen.getByTestId('dock-tab-voz')).toBeInTheDocument();

      window.localStorage.removeItem('cacique_talkback_enabled');
      render(withTalkBack(<TalkBackProbe />));
      expect(screen.getByTestId('state')).toHaveTextContent(
        'false|false|false|Lector de voz no disponible',
      );
    } finally {
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
      window.localStorage.removeItem('cacique_talkback_enabled');
    }

    expect(typeof window.speechSynthesis.speak).toBe('function');
  });

  it('no intenta sintetizar cuando no hay texto legible', () => {
    window.localStorage.setItem('cacique_talkback_enabled', 'true');
    function EmptyProbe() {
      const { announce } = useTalkBack();
      return (
        <button type="button" onClick={() => announce(String.fromCodePoint(0x1f525))}>
          Solo emoji
        </button>
      );
    }
    render(withTalkBack(<EmptyProbe />));

    fireEvent.click(screen.getByRole('button', { name: 'Solo emoji' }));
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    expect(TALKBACK_RATES).toEqual([0.8, 1, 1.2]);
  });

  it('comparte una unica instancia del lector con toda la aplicacion', () => {
    render(
      withTalkBack(
        <AuthProvider>
          <AccessibilityProvider>
            <MemoryRouter>
              <Navbar />
            </MemoryRouter>
            <AccessibilityPanel />
          </AccessibilityProvider>
        </AuthProvider>,
      ),
    );

    // El interruptor del Dock activa el lector y el Navbar no lo duplica.
    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    fireEvent.click(screen.getByRole('button', { name: /Activar TalkBack/ }));
    expect(window.localStorage.getItem('cacique_talkback_enabled')).toBe('true');
    expect(screen.getByRole('button', { name: 'Desactivar TalkBack' })).toBeInTheDocument();

    // El Navbar limpio no expone controles de accesibilidad duplicados.
    expect(screen.queryByRole('button', { name: /Aumentar tamaño de letra/i })).not.toBeInTheDocument();
  });

  it('permite sobrescribir el idioma y la velocidad por anuncio', () => {
    window.localStorage.setItem('cacique_talkback_enabled', 'true');
    render(withTalkBack(<LanguageProbe />));

    fireEvent.click(screen.getByRole('button', { name: 'Anunciar CR' }));
    expect(lastUtterance().lang).toBe('es-CR');
    expect(lastUtterance().rate).toBe(1.2);
    expect(lastUtterance().pitch).toBe(1);
  });

  it('usa la velocidad seleccionada por el usuario en los anuncios', () => {
    window.localStorage.setItem('cacique_talkback_enabled', 'true');
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    fireEvent.click(screen.getByRole('button', { name: /Velocidad Lenta/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Leer resumen de la comanda' }));
    expect(lastUtterance().rate).toBe(0.8);
  });

  it('sigue funcionando cuando la preferencia no se puede leer', () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('almacenamiento bloqueado');
      },
    });

    const { unmount } = render(withTalkBack(<TalkBackProbe />));
    expect(screen.getByTestId('state')).toHaveTextContent('false|false|false|Lector de voz desactivado');
    unmount();

    Object.defineProperty(window, 'localStorage', descriptor);
    expect(window.localStorage.getItem('cacique_talkback_enabled')).toBeNull();
  });

  it('lanza un error claro si el hook se usa sin el provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TalkBackProbe />)).toThrow(/debe usarse dentro de un TalkBackProvider/);
    consoleError.mockRestore();
  });

  describe('Lectura automatica por foco y hover', () => {
    function SpeakablePage() {
      return (
        <div>
          <h1>Mesa cinco disponible</h1>
          <button type="button">Cerrar comanda</button>
          <a href="/menu">Ver menu</a>
          <button type="button" aria-label="Mesa 7 ocupada">
            <span data-menu-item>Chicharron gourmet</span>
          </button>
          <span data-stock-alert>Stock critico de Papa</span>
          <p>Parrafo sincescrito</p>
        </div>
      );
    }

    it('define el selector de elementos hablables', () => {
      for (const selector of ['button', 'a[href]', 'h1', 'h2', 'h3', '[data-menu-item]', '[data-stock-alert]']) {
        expect(SPOKEN_SELECTOR).toContain(selector);
      }
    });

    it('extrae la etiqueta priorizando data-spoken-label, aria-label y texto', () => {
      const withExplicit = document.createElement('button');
      withExplicit.setAttribute('data-spoken-label', 'Mesa tres ocupada');
      expect(extractSpeechLabel(withExplicit)).toBe('Mesa tres ocupada');

      const withAria = document.createElement('button');
      withAria.setAttribute('aria-label', 'Cerrar panel');
      withAria.textContent = 'X';
      expect(extractSpeechLabel(withAria)).toBe('Cerrar panel');

      const withText = document.createElement('button');
      withText.textContent = '  Agregar   plato  ';
      expect(extractSpeechLabel(withText)).toBe('Agregar plato');

      expect(extractSpeechLabel(null)).toBe('');
    });

    it('lee en voz alta el elemento enfocado', () => {
      window.localStorage.setItem('cacique_talkback_enabled', 'true');
      render(withTalkBack(<SpeakablePage />));

      // Un encabezado no es focusable: la lectura por foco se valida sobre un control.
      screen.getByRole('button', { name: 'Cerrar comanda' }).focus();
      expect(lastUtterance().text).toBe('Cerrar comanda');
    });

    it('lee en voz alta el elemento sobrevolado y evita repeticiones', () => {
      window.localStorage.setItem('cacique_talkback_enabled', 'true');
      render(withTalkBack(<SpeakablePage />));

      const button = screen.getByRole('button', { name: 'Cerrar comanda' });
      fireEvent.mouseOver(button);
      expect(lastUtterance().text).toBe('Cerrar comanda');

      const callsAfterFirst = window.speechSynthesis.speak.mock.calls.length;
      fireEvent.mouseOver(button);
      expect(window.speechSynthesis.speak.mock.calls.length).toBe(callsAfterFirst);
    });

    it('usa la etiqueta accesible para las tarjetas de menu y las alertas', () => {
      window.localStorage.setItem('cacique_talkback_enabled', 'true');
      render(withTalkBack(<SpeakablePage />));

      fireEvent.mouseOver(screen.getByRole('button', { name: 'Mesa 7 ocupada' }));
      expect(lastUtterance().text).toBe('Mesa 7 ocupada');

      fireEvent.mouseOver(screen.getByText('Stock critico de Papa'));
      expect(lastUtterance().text).toBe('Stock critico de Papa');
    });

    it('ignora elementos que no son hablables', () => {
      window.localStorage.setItem('cacique_talkback_enabled', 'true');
      render(withTalkBack(<SpeakablePage />));

      fireEvent.mouseOver(screen.getByText('Parrafo sincescrito'));
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('no lee nada mientras el TalkBack esta desactivado', () => {
      window.localStorage.removeItem('cacique_talkback_enabled');
      render(withTalkBack(<SpeakablePage />));

      fireEvent.mouseOver(screen.getByRole('button', { name: 'Cerrar comanda' }));
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('usa la velocidad seleccionada para la lectura automatica', () => {
      window.localStorage.setItem('cacique_talkback_enabled', 'true');
      render(withTalkBack(<SpeakablePage />));

      fireEvent.mouseOver(screen.getByRole('button', { name: 'Cerrar comanda' }));
      expect(lastUtterance().rate).toBe(1);
      expect(lastUtterance().lang).toBe('es-ES');
    });

    it('desbloquea el audio del navegador en la primera interaccion', () => {
      window.localStorage.setItem('cacique_talkback_enabled', 'true');
      render(withTalkBack(<SpeakablePage />));

      expect(window.speechSynthesis.pause).not.toHaveBeenCalled();
      fireEvent.pointerDown(document.body);

      // El desbloqueo inicializa el canal de audio sin emitir locucion alguna,
      // para no pisar la lectura real del usuario.
      expect(window.speechSynthesis.pause).toHaveBeenCalledTimes(1);
      expect(window.speechSynthesis.resume).toHaveBeenCalledTimes(1);
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();

      const pauseCalls = window.speechSynthesis.pause.mock.calls.length;
      fireEvent.pointerDown(document.body);
      expect(window.speechSynthesis.pause.mock.calls.length).toBe(pauseCalls);
    });

    it('tolera motores que rechazan la secuencia de desbloqueo', () => {
      window.localStorage.setItem('cacique_talkback_enabled', 'true');
      const originalPause = window.speechSynthesis.pause;
      window.speechSynthesis.pause.mockImplementationOnce(() => {
        throw new Error('audio bloqueado');
      });

      try {
        render(withTalkBack(<SpeakablePage />));
        expect(() => fireEvent.pointerDown(document.body)).not.toThrow();
      } finally {
        window.speechSynthesis.pause = originalPause;
      }
    });

    it('deja de escuchar al desactivarse y se limpia al desmontar', () => {
      window.localStorage.setItem('cacique_talkback_enabled', 'true');
      const { unmount } = render(withTalkBack(<SpeakablePage />));

      unmount();
      window.speechSynthesis.speak.mockClear();

      fireEvent.mouseOver(document.body);
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('publica el anuncio en la region aria-live del documento', () => {
      window.localStorage.setItem('cacique_talkback_enabled', 'true');
      render(
        withTalkBack(
          <>
            <div id="cacique-aria-live-region" aria-live="polite" />
            <SpeakablePage />
          </>,
        ),
      );

      fireEvent.mouseOver(screen.getByRole('button', { name: 'Cerrar comanda' }));
      expect(document.getElementById('cacique-aria-live-region')).toHaveTextContent('Cerrar comanda');
    });
  });
});



