import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider, COLOR_BLIND_MODES, useAccessibility } from '../context/AccessibilityContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { TalkBackProvider } from '../context/TalkBackContext';
import InactivityGuard from '../components/InactivityGuard';
import CaciqueLogo from '../components/CaciqueLogo';
import Navbar from '../components/Navbar';
import AdminDashboard from '../pages/AdminDashboard';
import Landing from '../pages/Landing';
import {
  ACTIVITY_EVENTS,
  STAFF_INACTIVITY_TIMEOUT_MS,
  STAFF_INACTIVITY_WARNING_MS
} from '../hooks/useAutoLogout';
import { INACTIVITY_REASON, LOGOUT_REASON_KEY } from '../services/sessionReasons';
import {
  DEFAULT_REVIEWS,
  REVIEWS_STORAGE_KEY,
  aggregateBranchMetrics,
  averageRating,
  filterReviewsBySede,
  loadReviews,
  saveReviews
} from '../services/adminInsights';

/**
 * Cierre por inactividad (15 min), isotipo segun tema, filtros por sede y
 * moderacion de reseñas en Admin, botones del Navbar y etiqueta de vision.
 */

const MINUTE = 60 * 1000;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.documentElement.className = '';
});

/* ------------------------------------------------------------------------ */

function SessionProbe() {
  const { user, login, inactivityToast } = useAuth();
  return (
    <div>
      <span data-testid="session">{user ? user.rol : 'sin sesión'}</span>
      <span data-testid="inactivity-toast">{String(inactivityToast)}</span>
      <button type="button" onClick={() => login({ email: 'mesero.escazu@elcacique.com', rol: 'mesero', sede: 'escazu' })}>Entrar</button>
    </div>
  );
}

describe('Cierre de sesión por inactividad (15 minutos)', () => {
  afterEach(() => vi.useRealTimers());

  it('usa 15 minutos, avisa 1 minuto antes y escucha las interacciones del usuario', () => {
    expect(STAFF_INACTIVITY_TIMEOUT_MS).toBe(15 * MINUTE);
    expect(STAFF_INACTIVITY_WARNING_MS).toBe(14 * MINUTE);
    expect(ACTIVITY_EVENTS).toEqual(expect.arrayContaining(['mousemove', 'keydown', 'touchstart', 'scroll']));
  });

  it('avisa a los 14 minutos, reinicia con actividad y cierra con motivo de inactividad', () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<AuthProvider><SessionProbe /><InactivityGuard /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByTestId('session')).toHaveTextContent('mesero');

    act(() => vi.advanceTimersByTime(14 * MINUTE));
    const warning = screen.getByRole('alertdialog', { name: '¿Sigue ahí?' });
    expect(warning.parentElement.parentElement).toBe(document.body);

    // Mantener la sesion reinicia el contador.
    fireEvent.click(within(warning).getByRole('button', { name: 'Mantener sesión activa' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    // touchstart y scroll tambien cuentan como actividad.
    act(() => vi.advanceTimersByTime(10 * MINUTE));
    act(() => window.dispatchEvent(new Event('touchstart')));
    act(() => vi.advanceTimersByTime(10 * MINUTE));
    act(() => window.dispatchEvent(new Event('scroll')));
    act(() => vi.advanceTimersByTime(10 * MINUTE));
    expect(screen.getByTestId('session')).toHaveTextContent('mesero');

    act(() => vi.advanceTimersByTime(5 * MINUTE + 1000));
    expect(screen.getByTestId('session')).toHaveTextContent('sin sesión');
    expect(screen.getByTestId('inactivity-toast')).toHaveTextContent('true');
    expect(sessionStorage.getItem(LOGOUT_REASON_KEY)).toBe(INACTIVITY_REASON);
    vi.restoreAllMocks();
  });

  it('el aviso sobrevive a la recarga hacia /login y se consume una sola vez', () => {
    sessionStorage.setItem(LOGOUT_REASON_KEY, INACTIVITY_REASON);
    const { unmount } = render(<AuthProvider><SessionProbe /></AuthProvider>);
    expect(screen.getByTestId('inactivity-toast')).toHaveTextContent('true');
    expect(sessionStorage.getItem(LOGOUT_REASON_KEY)).toBeNull();
    unmount();

    render(<AuthProvider><SessionProbe /></AuthProvider>);
    expect(screen.getByTestId('inactivity-toast')).toHaveTextContent('false');
  });

  it('un cierre manual no deja aviso de inactividad', () => {
    function ManualLogout() {
      const { logout } = useAuth();
      return <button type="button" onClick={() => logout()}>Salir</button>;
    }
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<AuthProvider><SessionProbe /><ManualLogout /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salir' }));
    expect(screen.getByTestId('inactivity-toast')).toHaveTextContent('false');
    expect(sessionStorage.getItem(LOGOUT_REASON_KEY)).toBeNull();
    vi.restoreAllMocks();
  });

  it('no muestra aviso sin sesión activa', () => {
    vi.useFakeTimers();
    render(<AuthProvider><InactivityGuard /></AuthProvider>);
    act(() => vi.advanceTimersByTime(20 * MINUTE));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------ */

function ThemeSwitch() {
  const { setTheme } = useAccessibility();
  return <button type="button" onClick={() => setTheme('light')}>Modo claro</button>;
}

describe('Isotipo según el tema', () => {
  it('usa Cacique.svg en oscuro y Caciquen.svg en claro', () => {
    render(<AccessibilityProvider><ThemeSwitch /><CaciqueLogo alt="Isotipo" /></AccessibilityProvider>);
    const logo = screen.getByAltText('Isotipo');
    expect(logo.getAttribute('src')).toMatch(/Cacique\.svg/);
    expect(logo).toHaveAttribute('data-variant', 'dark');

    fireEvent.click(screen.getByRole('button', { name: 'Modo claro' }));
    expect(logo.getAttribute('src')).toMatch(/Caciquen\.svg/);
    expect(logo).toHaveAttribute('data-variant', 'light');
    expect(logo).toHaveClass('cacique-logo');
  });

  it('fuera del proveedor usa la clase del documento', () => {
    document.documentElement.classList.add('theme-light');
    render(<CaciqueLogo alt="Isotipo" />);
    expect(screen.getByAltText('Isotipo').getAttribute('src')).toMatch(/Caciquen\.svg/);
  });

  it('si el vector falla usa el logotipo del mismo tono una sola vez', () => {
    const onError = vi.fn();
    document.documentElement.classList.add('theme-light');
    render(<CaciqueLogo alt="Isotipo" onError={onError} />);
    const logo = screen.getByAltText('Isotipo');

    fireEvent.error(logo);
    expect(logo.getAttribute('src')).toMatch(/LogoB\.svg/);
    expect(onError).toHaveBeenCalledTimes(1);
    fireEvent.error(logo);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('Navbar, Landing y Footer cambian al Cacique negro en Modo Claro', () => {
    localStorage.setItem('cacique_theme', 'light');
    render(
      <TalkBackProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <MemoryRouter><Navbar /><Landing /></MemoryRouter>
          </AuthProvider>
        </AccessibilityProvider>
      </TalkBackProvider>
    );
    const logos = document.querySelectorAll('img.cacique-logo');
    expect(logos.length).toBeGreaterThanOrEqual(2);
    logos.forEach((logo) => expect(logo.getAttribute('src')).toMatch(/Caciquen\.svg/));
  });
});

/* ------------------------------------------------------------------------ */

describe('Métricas del Admin por sede', () => {
  const period = {
    escazu: { ventas: 100, comandas: 10, clientes: 20, coccion: '10 min', completados: 8, pendientes: 1, cancelados: 1 },
    santa_ana: { ventas: 200, comandas: 30, clientes: 40, coccion: '20 min', completados: 25, pendientes: 4, cancelados: 1 },
    cartago: { ventas: 0, comandas: 0, clientes: 0, coccion: '0 min', completados: 0, pendientes: 0, cancelados: 0 },
    heredia: { ventas: 50, comandas: 10, clientes: 5, coccion: '30 min', completados: 9, pendientes: 1, cancelados: 0 }
  };
  const details = {
    escazu: { personal: 2, mesasLibres: 1, mesasTotal: 4 },
    santa_ana: { personal: 3, mesasLibres: 2, mesasTotal: 6 },
    cartago: { personal: 1, mesasLibres: 1, mesasTotal: 2 },
    heredia: { personal: 4, mesasLibres: 0, mesasTotal: 8 }
  };

  it('devuelve las métricas de la sede elegida', () => {
    expect(aggregateBranchMetrics(period, details, 'santa_ana')).toEqual({ ...period.santa_ana, ...details.santa_ana });
  });

  it('consolida las cuatro sedes con tiempo de entrega ponderado por comandas', () => {
    const total = aggregateBranchMetrics(period, details, 'todas');
    expect(total).toMatchObject({ ventas: 350, comandas: 50, clientes: 65, completados: 42, pendientes: 6, cancelados: 2, personal: 10, mesasLibres: 4, mesasTotal: 20 });
    // (10*10 + 20*30 + 30*10) / 50 = 20
    expect(total.coccion).toBe('20 min');
  });

  it('evita dividir entre cero sin comandas', () => {
    const empty = Object.fromEntries(Object.keys(period).map((key) => [key, { ...period.cartago }]));
    expect(aggregateBranchMetrics(empty, details, 'todas').coccion).toBe('0 min');
  });

  const renderAdmin = () => render(
    <AccessibilityProvider>
      <AuthProvider>
        <MemoryRouter><AdminDashboard /></MemoryRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );

  it('el selector de sede actualiza ventas, comandas, clientes y tiempo de entrega', () => {
    renderAdmin();
    const select = screen.getByLabelText('Sede del panel');
    const sales = () => document.body.textContent;

    // es-CR agrupa miles con espacio duro: se acepta cualquier separador.
    expect(sales()).toMatch(/785\D?400/);
    fireEvent.change(select, { target: { value: 'heredia' } });
    expect(sales()).toMatch(/485\D?250/);
    expect(sales()).toContain('18 min');
    fireEvent.change(select, { target: { value: 'todas' } });
    expect(sales()).toMatch(/2\D?421\D?750/);
    expect(sales()).toMatch(/584\b/);
    expect(sales()).toContain('16 min');
  });
});

/* ------------------------------------------------------------------------ */

describe('Moderación de reseñas', () => {
  it('promedia solo reseñas verificadas y filtra por sede', () => {
    expect(averageRating([])).toBeNull();
    expect(averageRating([{ rating: 5 }, { rating: 4 }, { rating: 1, verificada: false }])).toBe(4.5);
    expect(filterReviewsBySede(DEFAULT_REVIEWS, 'escazu').map((review) => review.id)).toEqual([1, 4]);
    expect(filterReviewsBySede(DEFAULT_REVIEWS, 'todas')).toHaveLength(DEFAULT_REVIEWS.length);
  });

  it('carga, guarda y tolera almacenamiento corrupto o bloqueado', () => {
    expect(loadReviews()).toEqual([...DEFAULT_REVIEWS]);
    expect(saveReviews([{ id: 9 }])).toBe(true);
    expect(loadReviews()).toEqual([{ id: 9 }]);
    localStorage.setItem(REVIEWS_STORAGE_KEY, '{oops');
    expect(loadReviews()).toEqual([...DEFAULT_REVIEWS]);
    const failing = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
    expect(loadReviews(failing)).toEqual([...DEFAULT_REVIEWS]);
    expect(saveReviews([], failing)).toBe(false);
  });

  const openReviews = () => {
    render(
      <AccessibilityProvider>
        <AuthProvider>
          <MemoryRouter><AdminDashboard /></MemoryRouter>
        </AuthProvider>
      </AccessibilityProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: /Reseñas & Clientes/i }));
  };

  it('el administrador elimina una reseña no verificada tras confirmar', () => {
    openReviews();
    const list = screen.getByRole('list', { name: 'Reseñas de clientes' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByTestId('reviews-average')).toHaveTextContent('5');

    const spam = within(list).getByRole('listitem', { name: 'Reseña de Cuenta sin compras' });
    expect(within(spam).getByText('No verificada')).toBeInTheDocument();

    // Cancelar no elimina.
    fireEvent.click(within(spam).getByRole('button', { name: 'Eliminar reseña de Cuenta sin compras' }));
    fireEvent.click(within(spam).getByRole('button', { name: 'Cancelar' }));
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);

    fireEvent.click(within(spam).getByRole('button', { name: 'Eliminar reseña de Cuenta sin compras' }));
    expect(within(spam).getByText('¿Eliminar esta reseña?')).toBeInTheDocument();
    fireEvent.click(within(spam).getByRole('button', { name: 'Sí, eliminar' }));

    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Reseña de Cuenta sin compras eliminada')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY)).some((review) => review.id === 4)).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Revisar moderación' }));
    expect(screen.getByText('No hay reseñas pendientes de moderación')).toBeInTheDocument();
  });

  it('muestra un estado vacío y un promedio sin datos cuando la sede no tiene reseñas', () => {
    saveReviews([]);
    openReviews();
    expect(screen.getByText('No hay reseñas para esta sede.')).toBeInTheDocument();
    expect(screen.getByTestId('reviews-average')).toHaveTextContent('—');
  });
});

/* ------------------------------------------------------------------------ */

describe('Navbar, panel de accesibilidad y sección Nosotros', () => {
  it('AGENDAR RESERVA e INICIAR SESIÓN tienen exactamente las mismas dimensiones', () => {
    render(
      <AccessibilityProvider>
        <AuthProvider>
          <MemoryRouter><Navbar /></MemoryRouter>
        </AuthProvider>
      </AccessibilityProvider>
    );
    const reserve = screen.getByTestId('navbar-reservar');
    const login = screen.getByTestId('navbar-login');
    const sizing = (element) => element.className.split(/\s+/).filter((token) => !/^(bg-|hover:bg-)/.test(token)).sort();

    for (const token of ['h-10', 'px-5', 'rounded-xl', 'text-xs', 'font-bold', 'items-center']) {
      expect(reserve, token).toHaveClass(token);
      expect(login, token).toHaveClass(token);
    }
    expect(sizing(reserve)).toEqual(sizing(login));
  });

  it('la opción sin filtro se llama "Visión por defecto"', () => {
    expect(COLOR_BLIND_MODES.find((mode) => mode.id === 'none').label).toBe('Visión por defecto');
    expect(COLOR_BLIND_MODES.some((mode) => mode.label === 'Visión normal')).toBe(false);
  });

  it('la sección Nosotros tiene un degradado suave en Modo Claro', () => {
    render(
      <TalkBackProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <MemoryRouter><Landing /></MemoryRouter>
          </AuthProvider>
        </AccessibilityProvider>
      </TalkBackProvider>
    );
    const nosotros = document.getElementById('nosotros');
    expect(nosotros).toHaveClass('bg-linear-to-b', 'light:from-[#E8DFD8]/40', 'to-transparent');
  });
});
