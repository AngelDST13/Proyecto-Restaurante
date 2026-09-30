import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Navbar from '../components/Navbar';
import ReservationModal from '../components/ReservationModal';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

function UserControls() {
  const { login } = useAuth();
  return <div>{['administrador', 'mesero', 'cocina', 'cliente'].map(role => <button key={role} onClick={() => login({ email: 'staff@example.com', nombre: 'Admin', rol: role, sede: 'escazu' })}>Simular {role}</button>)}</div>;
}
function RouteProbe() { return <output data-testid="nav-path">{useLocation().pathname}</output>; }

describe('Navbar y reservas', () => {
  it('muestra las opciones de sesión, navega por roles, y controla el menú móvil y tamaño de fuente', () => {
    render(<AuthProvider><AccessibilityProvider><MemoryRouter initialEntries={['/menu']}><UserControls /><Navbar /><RouteProbe /></MemoryRouter></AccessibilityProvider></AuthProvider>);
    expect(screen.getByRole('link', { name: /Iniciar Sesión/i })).toHaveAttribute('href', '/login');
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar tamaño de letra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Disminuir tamaño de letra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer tamaño de letra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Alternar menú de navegación' }));
    expect(screen.getAllByRole('link', { name: 'Menú' })[0]).toHaveAttribute('href', '/menu');
    fireEvent.click(screen.getByRole('button', { name: 'Simular administrador' }));
    expect(screen.getAllByRole('link', { name: 'Panel Admin' })[0]).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });

  it('elige el panel dinámico para cada rol soportado', () => {
    render(<AuthProvider><AccessibilityProvider><MemoryRouter><UserControls /><Navbar /></MemoryRouter></AccessibilityProvider></AuthProvider>);
    for (const [role, panel] of [['administrador', 'Panel Admin'], ['mesero', 'Panel Mesero POS'], ['cocina', 'Panel Cocina KDS']]) {
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
    render(<AuthProvider><AccessibilityProvider><MemoryRouter initialEntries={['/menu']}><Navbar onOpenReservation={onOpenReservation} /><RouteProbe /><div id="nosotros" /></MemoryRouter></AccessibilityProvider></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'AGENDAR RESERVA' }));
    expect(onOpenReservation).toHaveBeenCalledOnce();
    fireEvent.click(screen.getAllByRole('button', { name: 'Nosotros' })[0]);
    expect(screen.getByTestId('nav-path')).toHaveTextContent('/');
    fireEvent.click(screen.getByRole('button', { name: 'Inicio' }));
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it('valida y confirma una reserva, y cierra el modal con Escape', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    render(<ReservationModal onClose={onClose} onSuccess={onSuccess} initialEventType="cumpleaños" />);
    expect(screen.getByRole('heading', { name: /Agendar Mesa o Evento/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Aumentar personas/i }));
    fireEvent.change(screen.getByPlaceholderText(/Angel Salazar/i), { target: { value: 'Ana Pérez123' } });
    fireEvent.change(screen.getByPlaceholderText(/8888-8888/i), { target: { value: '+506 8888-1234abc' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Reservación/i }));
    expect(onSuccess).toHaveBeenCalledWith(expect.stringContaining('Ana Pérez'));
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
});
