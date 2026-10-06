import { renderToString } from 'react-dom/server';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CryptoJS from 'crypto-js';
import { MemoryRouter } from 'react-router-dom';
import { useSharedCollection } from '../hooks/useSharedCollection';
import { RESERVATION_REQUEST_EVENT, useReservationRequestHandler } from '../hooks/useReservationModal';
import { extractSpeechLabel, useTalkBackEngine } from '../hooks/useTalkBack';
import { AccessibilityProvider, useAccessibility } from '../context/AccessibilityContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { decryptData } from '../services/cryptoService';
import { writeCollection } from '../services/liveSync';
import { LOGOUT_REASON_KEY } from '../services/sessionReasons';
import ThemeToggleButton from '../components/ThemeToggleButton';
import ReservationModal from '../components/ReservationModal';

/**
 * Ramas de hooks y contextos: SSR del almacen compartido, lector de voz sin
 * motor disponible, ids invalidos y errores de almacenamiento de sesion.
 */

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useSharedCollection', () => {
  it('ofrece el mismo snapshot al renderizar en servidor', () => {
    writeCollection('ssr_demo', [{ id: 1 }, { id: 2 }]);
    function Count() {
      return <span>{useSharedCollection('ssr_demo').length}</span>;
    }
    expect(renderToString(<Count />)).toContain('2');
  });
});

describe('useReservationRequestHandler', () => {
  it('abre el modal como "General" si el evento no trae tipo', () => {
    const onOpen = vi.fn();
    renderHook(() => useReservationRequestHandler(onOpen));
    window.dispatchEvent(new CustomEvent(RESERVATION_REQUEST_EVENT));
    expect(onOpen).toHaveBeenCalledWith('General');
  });

  it('conserva la fecha elegida aunque cambie el callback de cierre', () => {
    const { rerender } = render(<ReservationModal onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2030-01-15' } });
    rerender(<ReservationModal onClose={() => {}} />);
    expect(screen.getByLabelText('Fecha')).toHaveValue('2030-01-15');
  });
});

describe('useTalkBackEngine', () => {
  const enable = () => {
    localStorage.setItem('cacique_talkback_enabled', 'true');
    const hook = renderHook(() => useTalkBackEngine());
    if (!hook.result.current.isEnabled) act(() => hook.result.current.setIsEnabled(true));
    return hook;
  };

  it('cancela y finaliza las locuciones (fin y error)', () => {
    const { result } = enable();
    act(() => { result.current.speak('Hola mundo'); });
    expect(result.current.isSpeaking).toBe(true);

    const utterance = window.speechSynthesis.speak.mock.calls.at(-1)[0];
    act(() => utterance.onend());
    expect(result.current.isSpeaking).toBe(false);

    act(() => { result.current.speak('Otra frase'); });
    act(() => window.speechSynthesis.speak.mock.calls.at(-1)[0].onerror());
    expect(result.current.isSpeaking).toBe(false);

    act(() => { result.current.speak('Tercera'); });
    act(() => result.current.cancel());
    expect(result.current.isSpeaking).toBe(false);
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it('usa la velocidad normal si se pide una no admitida', () => {
    const { result } = renderHook(() => useTalkBackEngine());
    let applied;
    act(() => { applied = result.current.changeRate(5); });
    expect(applied).toBe(1);
  });

  it('extrae etiquetas vacías de nodos sin texto', () => {
    expect(extractSpeechLabel(document)).toBe('');
  });

  it('ignora eventos sin elemento o sin etiqueta legible', () => {
    enable();
    window.speechSynthesis.speak.mockClear();
    const empty = document.createElement('button');
    document.body.appendChild(empty);

    act(() => {
      document.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      empty.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      empty.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      document.dispatchEvent(new Event('touchend', { bubbles: true }));
      empty.dispatchEvent(new Event('touchend', { bubbles: true }));
    });
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    empty.remove();
  });

  it('sin motor de voz: pausa, reanuda y desbloqueo no hacen nada', () => {
    const { result } = enable();
    const original = window.speechSynthesis;
    window.speechSynthesis = undefined;
    try {
      act(() => {
        result.current.pause();
        result.current.resume();
        document.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      });
      expect(result.current.isPaused).toBe(false);
    } finally {
      window.speechSynthesis = original;
    }
  });
});

describe('AccessibilityContext', () => {
  it('ignora modos de daltonismo desconocidos', () => {
    function Probe() {
      const { colorBlindMode, setColorBlindMode } = useAccessibility();
      return <button type="button" onClick={() => setColorBlindMode('neon')}>{colorBlindMode}</button>;
    }
    render(<AccessibilityProvider><Probe /></AccessibilityProvider>);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('none');
  });

  it('el conmutador de tema admite el tono de página además del de panel', () => {
    render(<AccessibilityProvider><ThemeToggleButton tone="page" /></AccessibilityProvider>);
    const toggle = screen.getByRole('button');
    expect(toggle.className).toContain('border-(--cacique-border)/40');
    expect(toggle.className).toContain('text-(--cacique-text)');
  });
});

describe('AuthContext', () => {
  function Probe() {
    const { user, loginWithCredentials, logout } = useAuth();
    return (
      <div>
        <span data-testid="user">{user?.email ?? 'nadie'}</span>
        <button type="button" onClick={() => loginWithCredentials('nadie@elcacique.com', 'incorrecta')}>Entrar mal</button>
        <button type="button" onClick={() => logout('inactividad')}>Expirar</button>
      </div>
    );
  }

  it('rechaza credenciales inválidas sin crear sesión', () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar mal' }));
    expect(screen.getByTestId('user')).toHaveTextContent('nadie');
  });

  it('tolera un sessionStorage bloqueado al leer y guardar el motivo de cierre', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const originalGet = Storage.prototype.getItem;
    const originalSet = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function getItem(key) {
      if (key === LOGOUT_REASON_KEY) throw new Error('SecurityError');
      return originalGet.call(this, key);
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function setItem(key, value) {
      if (key === LOGOUT_REASON_KEY) throw new Error('SecurityError');
      return originalSet.call(this, key, value);
    });

    render(<AuthProvider><Probe /></AuthProvider>);
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Expirar' }))).not.toThrow();
    // Sin almacenamiento el aviso no se persiste, pero la sesion se cierra igual.
    expect(screen.getByTestId('user')).toHaveTextContent('nadie');
  });

  it('considera inválida una sesión si el almacenamiento falla al leerla', () => {
    localStorage.setItem('gourmetsync_enc_user', 'x');
    localStorage.setItem('gourmetsync_sig', 'y');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('SecurityError'); });
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('user')).toHaveTextContent('nadie');
  });
});

describe('cryptoService — formatos heredados', () => {
  it('lee valores cifrados con la clave AES anterior', () => {
    const legacy = CryptoJS.AES.encrypt(JSON.stringify({ rol: 'mesero' }), 'GourmetSyncAESKey2026!#SecureStorage').toString();
    expect(decryptData(legacy)).toEqual({ rol: 'mesero' });
  });
});

describe('AppRouter — aviso de inactividad', () => {
  it('se puede cerrar el aviso tras un cierre por inactividad', async () => {
    const { default: AppRouter } = await import('../routes/AppRouter');
    sessionStorage.setItem(LOGOUT_REASON_KEY, 'inactividad');
    render(
      <AccessibilityProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}><AppRouter /></MemoryRouter>
        </AuthProvider>
      </AccessibilityProvider>
    );
    expect(screen.getByText('Su sesión se ha cerrado automáticamente por inactividad.')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar notificación' })[0]);
    expect(screen.queryByText('Su sesión se ha cerrado automáticamente por inactividad.')).not.toBeInTheDocument();
  });
});
