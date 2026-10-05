import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import MenuDigital from '../pages/Menu';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { PENDING_RESERVATIONS_KEY } from '../services/api';

/**
 * Reservas y menu contra la API centralizada: confirmacion real, respaldo
 * local sin servidor y bloqueo de envios duplicados.
 */

const fillForm = () => {
  fireEvent.change(screen.getByPlaceholderText(/Angel Salazar/i), { target: { value: 'Ana Pérez' } });
  fireEvent.change(screen.getByPlaceholderText(/8888-8888/i), { target: { value: '88881234' } });
};

describe('ReservationModal + API', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('confirma la reserva cuando la API responde', async () => {
    const fetchMock = vi.fn().mockImplementation((url, options) => Promise.resolve({
      ok: true,
      status: 201,
      json: async () => (url.endsWith('/reservaciones') ? { id: 7, ...JSON.parse(options.body) } : {})
    }));
    vi.stubGlobal('fetch', fetchMock);
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(<ReservationModal onSuccess={onSuccess} onClose={onClose} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /CONFIRMAR RESERVACIÓN/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const [message, meta] = onSuccess.mock.calls[0];
    expect(message).toMatch(/^¡Reserva confirmada con éxito para Ana Pérez en Sede Escazú/);
    expect(meta).toMatchObject({ offline: false, reservation: { id: 7, nombre: 'Ana Pérez' } });
    expect(onClose).toHaveBeenCalled();
    expect(localStorage.getItem(PENDING_RESERVATIONS_KEY)).toBeNull();
  });

  it('sin servidor informa el modo offline y encola la reserva', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onSuccess = vi.fn();

    render(<ReservationModal onSuccess={onSuccess} onClose={vi.fn()} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /CONFIRMAR RESERVACIÓN/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const [message, meta] = onSuccess.mock.calls[0];
    expect(message).toContain('Servidor sin conexión: se sincronizará automáticamente.');
    expect(meta.offline).toBe(true);
    expect(JSON.parse(localStorage.getItem(PENDING_RESERVATIONS_KEY))).toHaveLength(1);
    vi.restoreAllMocks();
  });

  it('muestra el estado de envio y bloquea envios duplicados', async () => {
    let resolveReservation;
    const fetchMock = vi.fn().mockImplementation((url) => (url.endsWith('/reservaciones')
      ? new Promise((resolve) => { resolveReservation = resolve; })
      : Promise.resolve({ ok: true, status: 200, json: async () => ({}) })));
    vi.stubGlobal('fetch', fetchMock);
    const onSuccess = vi.fn();

    render(<ReservationModal onSuccess={onSuccess} onClose={vi.fn()} />);
    fillForm();
    const submit = screen.getByRole('button', { name: /CONFIRMAR RESERVACIÓN/i });
    fireEvent.click(submit);
    fireEvent.submit(submit.closest('form'));

    expect(await screen.findByText('ENVIANDO RESERVACIÓN...')).toBeInTheDocument();
    expect(submit).toBeDisabled();
    expect(submit).toHaveAttribute('aria-busy', 'true');

    resolveReservation({ ok: true, status: 201, json: async () => ({ id: 1 }) });
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith('/reservaciones'))).toHaveLength(1);
  });
});

describe('Menu digital + API', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  const renderMenu = () => render(
    <AuthProvider>
      <AccessibilityProvider>
        <MemoryRouter>
          <MenuDigital />
        </MemoryRouter>
      </AccessibilityProvider>
    </AuthProvider>
  );

  it('usa el catalogo remoto cuando la API responde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ id: 501, nombre: 'Olla de Carne Remota', cat: 'paila', precio: 7300, desc: 'Desde json-server.' }]
    }));

    renderMenu();

    expect(await screen.findByText('Olla de Carne Remota')).toBeInTheDocument();
    expect(screen.queryByText('Chifrijo Especial de Paila')).not.toBeInTheDocument();
  });

  it('sin servidor conserva el catalogo local y avisa una sola vez por sesion', async () => {
    const { unmount } = renderMenu();

    expect(screen.getByText('Chifrijo Especial de Paila')).toBeInTheDocument();
    expect(await screen.findByText('Servidor del menú no disponible: mostrando el catálogo local.')).toBeInTheDocument();
    unmount();

    renderMenu();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByText('Servidor del menú no disponible: mostrando el catálogo local.')).not.toBeInTheDocument();
  });

  it('muestra el aviso aunque sessionStorage no este disponible', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'cacique_menu_offline_notice') throw new Error('SecurityError');
      return null;
    });

    renderMenu();

    expect(await screen.findByText('Servidor del menú no disponible: mostrando el catálogo local.')).toBeInTheDocument();
    getItem.mockRestore();
  });
});
