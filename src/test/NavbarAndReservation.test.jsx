import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Navbar from '../components/Navbar';
import ReservationModal from '../components/ReservationModal';
import { AccessibilityProvider, useAccessibility } from '../context/AccessibilityContext';
import { TalkBackProvider } from '../context/TalkBackContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

function UserControls() {
  const { login } = useAuth();
  return <div>{['administrador', 'mesero', 'cajero', 'cocina', 'cliente'].map(role => <button key={role} onClick={() => login({ email: 'staff@example.com', nombre: 'Admin', rol: role, sede: 'escazu' })}>Simular {role}</button>)}</div>;
}
function RouteProbe() { return <output data-testid="nav-path">{useLocation().pathname}</output>; }

/**
 * El escalado de texto vive en el Dock Flotante de Accesibilidad (pestaña
 * "Texto"), no en el Navbar.
 */
function TextScaleDock() {
  const { fontSizeLevel, increaseFontSize, decreaseFontSize, resetFontSize } = useAccessibility();
  return (
    <div data-testid="text-scale-dock">
      <span data-testid="dock-level">{fontSizeLevel}</span>
      <button type="button" onClick={increaseFontSize} disabled={fontSizeLevel >= 2}>
        Aumentar tamaño de letra
      </button>
      <button type="button" onClick={decreaseFontSize} disabled={fontSizeLevel <= -1}>
        Disminuir tamaño de letra
      </button>
      <button type="button" onClick={resetFontSize}>Restablecer tamaño de letra</button>
    </div>
  );
}

describe('Navbar y reservas', () => {
  it('muestra las opciones de sesión, navega por roles, y controla el menú móvil y tamaño de fuente', () => {
    render(<AuthProvider><TalkBackProvider><AccessibilityProvider><MemoryRouter initialEntries={['/menu']}><UserControls /><Navbar /><TextScaleDock /><RouteProbe /></MemoryRouter></AccessibilityProvider></TalkBackProvider></AuthProvider>);
    expect(screen.getByRole('link', { name: /Iniciar Sesión/i })).toHaveAttribute('href', '/login');
    const withinDock = () => within(screen.getByTestId('text-scale-dock'));
    const increase = () => withinDock().getByRole('button', { name: 'Aumentar tamaño de letra' });
    const decrease = () => withinDock().getByRole('button', { name: 'Disminuir tamaño de letra' });

    fireEvent.click(increase());
    fireEvent.click(increase());
    expect(document.documentElement.style.fontSize).toBe('120%');
    fireEvent.click(increase());
    expect(increase()).toBeDisabled();

    fireEvent.click(decrease());
    fireEvent.click(decrease());
    fireEvent.click(decrease());
    expect(document.documentElement.style.fontSize).toBe('90%');
    expect(decrease()).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer tamaño de letra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Alternar menú de navegación' }));
    expect(screen.getAllByRole('link', { name: 'Menú' })[0]).toHaveAttribute('href', '/menu');
    fireEvent.click(screen.getByRole('button', { name: 'Simular administrador' }));
    expect(screen.getAllByRole('link', { name: 'Panel Admin' })[0]).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });

  it('elige el panel dinámico para cada rol soportado', () => {
    render(<AuthProvider><TalkBackProvider><AccessibilityProvider><MemoryRouter><UserControls /><Navbar /></MemoryRouter></AccessibilityProvider></TalkBackProvider></AuthProvider>);
    for (const [role, panel] of [['administrador', 'Panel Admin'], ['mesero', 'Panel Mesero POS'], ['cajero', 'Panel Caja'], ['cocina', 'Panel Cocina KDS']]) {
      fireEvent.click(screen.getByRole('button', { name: `Simular ${role}` }));
      expect(screen.getByRole('link', { name: panel })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Simular cliente' }));
    expect(screen.queryByRole('link', { name: /Panel (Admin|Mesero|Cocina)/i })).not.toBeInTheDocument();
  });

  it('navega entre inicio y secciones, y abre reservas desde Navbar', () => {
    const onOpenReservation = vi.fn();
    Object.defineProperty(window, 'scrollTo', { configurable: true, value: vi.fn() });
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
    render(<AuthProvider><TalkBackProvider><AccessibilityProvider><MemoryRouter initialEntries={['/menu']}><Navbar onOpenReservation={onOpenReservation} /><RouteProbe /><div id="nosotros" /></MemoryRouter></AccessibilityProvider></TalkBackProvider></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'AGENDAR RESERVA' }));
    expect(onOpenReservation).toHaveBeenCalledOnce();
    fireEvent.click(screen.getAllByRole('button', { name: 'Nosotros' })[0]);
    expect(screen.getByTestId('nav-path')).toHaveTextContent('/');
    fireEvent.click(screen.getByRole('button', { name: 'Inicio' }));
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it('activa enlaces móviles, secciones, logo y reserva sin callback externo', () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
    render(<AuthProvider><TalkBackProvider><AccessibilityProvider><MemoryRouter initialEntries={['/']}><Navbar /><div id="nosotros" /><div id="eventos" /></MemoryRouter></AccessibilityProvider></TalkBackProvider></AuthProvider>);
    fireEvent.click(screen.getByRole('link', { name: 'Ir al inicio de El Cacique' }));
    fireEvent.click(screen.getByRole('button', { name: 'Alternar menú de navegación' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Nosotros' }).at(-1));
    expect(scrollIntoView).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Alternar menú de navegación' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Eventos' }).at(-1));
    fireEvent.click(screen.getByRole('button', { name: 'Alternar menú de navegación' }));
    fireEvent.click(screen.getByRole('button', { name: 'Agendar Reserva' }));
    expect(screen.queryByRole('navigation', { name: /mobile/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Alternar menú de navegación' }));
    fireEvent.click(screen.getAllByRole('link', { name: 'Menú' }).at(-1));
    expect(screen.getByRole('button', { name: 'Alternar menú de navegación' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('valida y confirma una reserva, y cierra el modal con Escape', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    render(<ReservationModal onClose={onClose} onSuccess={onSuccess} initialEventType="cumpleaños" />);
    expect(screen.getByRole('heading', { name: /Agendar Mesa o Evento/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Aumentar personas/i }));
    fireEvent.change(screen.getByPlaceholderText(/Angel Salazar/i), { target: { value: 'Ana Pérez123' } });
    fireEvent.change(screen.getByPlaceholderText(/8888-8888/i), { target: { value: '+506 8888-1234abc' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Reservación/i }));
    // Sin servidor (fetch rechazado en setup.js) la reserva queda en cola local.
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(
      expect.stringContaining('Ana Pérez'),
      expect.objectContaining({ offline: true }),
    ));
    expect(onClose).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('valida datos incompletos, limpia caracteres y respeta los límites de asistentes', () => {
    render(<ReservationModal />);
    fireEvent.click(screen.getByRole('button', { name: /CONFIRMAR RESERVACIÓN/i }));
    expect(screen.getByText(/Ingrese un nombre válido/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingrese un teléfono válido/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Angel Salazar/i), { target: { value: 'Ana123' } });
    expect(screen.getByPlaceholderText(/Angel Salazar/i)).toHaveValue('Ana');
    fireEvent.change(screen.getByPlaceholderText(/8888-8888/i), { target: { value: '12abc' } });
    expect(screen.getByPlaceholderText(/8888-8888/i)).toHaveValue('12');
    fireEvent.click(screen.getByRole('button', { name: 'Disminuir personas' }));
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disminuir personas' })).toBeDisabled();
  });

  it.each([
    ['evento empresarial', 'Evento Empresarial'],
    ['banquete familiar', 'Banquete Familiar'],
    ['', 'Mesa Regular']
  ])('mapea tipo de evento %s a %s', (initialEventType, expectedType) => {
    render(<ReservationModal initialEventType={initialEventType} />);
    expect(screen.getByLabelText('Tipo de Celebración')).toHaveValue(expectedType);
  });

  it('valida fecha faltante y permite confirmar con alert cuando no hay callbacks', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { rerender } = render(<ReservationModal onClose={undefined} onSuccess={undefined} />);
    fireEvent.change(screen.getByPlaceholderText(/Angel Salazar/i), { target: { value: 'Ana Pérez' } });
    fireEvent.change(screen.getByPlaceholderText(/8888-8888/i), { target: { value: '88881234' } });
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '' } });
    fireEvent.submit(screen.getByRole('button', { name: /CONFIRMAR RESERVACIÓN/i }).closest('form'));
    expect(screen.getByText('Seleccione una fecha.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-15' } });
    fireEvent.submit(screen.getByRole('button', { name: /CONFIRMAR RESERVACIÓN/i }).closest('form'));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Ana Pérez')));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByRole('heading', { name: /Agendar Mesa o Evento/i })).toBeInTheDocument();

    rerender(<ReservationModal isOpen={false} onClose={undefined} onSuccess={undefined} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    alertSpy.mockRestore();
  });
});


