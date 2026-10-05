import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider, LIGHT_PALETTE } from '../context/AccessibilityContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import Navbar from '../components/Navbar';
import AdminDashboard from '../pages/AdminDashboard';
import CashierDashboard from '../pages/CashierDashboard';
import WaiterDashboard from '../pages/WaiterDashboard';
import KitchenDashboard from '../pages/KitchenDashboard';

const { useAuthMock, logoutMock } = vi.hoisted(() => ({ useAuthMock: vi.fn(), logoutMock: vi.fn() }));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(async () => ({ respuesta: 'ok' })),
  subscribeToLiveEvents: () => () => {},
}));

const renderWithProviders = (ui, path = '/') => render(
  <AccessibilityProvider>
    <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
  </AccessibilityProvider>,
);

describe('Conmutador de tema Claro / Oscuro', () => {
  beforeEach(() => {
    localStorage.clear();
    logoutMock.mockClear();
  });

  it('anuncia la acción y alterna entre los dos modos', () => {
    renderWithProviders(<ThemeToggleButton />);

    const toggle = screen.getByTestId('theme-toggle');
    // En modo oscuro ofrece pasar a claro yviceversa.
    expect(toggle).toHaveAccessibleName('Cambiar a Modo Claro');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);
    expect(screen.getByTestId('theme-toggle')).toHaveAccessibleName('Cambiar a Modo Oscuro');
    expect(screen.getByTestId('theme-toggle')).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(screen.getByTestId('theme-toggle')).toHaveAccessibleName('Cambiar a Modo Claro');
  });

  it('aplica la paleta clara artesanal al documento', () => {
    renderWithProviders(<ThemeToggleButton />);
    fireEvent.click(screen.getByTestId('theme-toggle'));

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(LIGHT_PALETTE.canvas).toBe('#F5EFE6');
    expect(LIGHT_PALETTE.text).toBe('#2C1A0E');
    expect(LIGHT_PALETTE.accent).toBe('#C86D12');
  });

  it.each([
    ['AdminDashboard', '/admin', <AdminDashboard key="admin" />],
    ['CashierDashboard', '/cashier', <CashierDashboard key="cashier" />],
    ['WaiterDashboard', '/waiter', <WaiterDashboard key="waiter" />],
    ['KitchenDashboard', '/kitchen', <KitchenDashboard key="kitchen" />],
  ])('%s expone el botón de tema en su encabezado superior', (_name, path, view) => {
    useAuthMock.mockReturnValue({ user: { nombre: 'Operador QA', rol: 'cajero', sede: 'escazu' }, logout: logoutMock });

    renderWithProviders(view, path);

    const toggle = screen.getByTestId('theme-toggle');
    expect(toggle).toBeInTheDocument();
    // Debe ser el control de tema del panel, no el del Navbar (que no se monta).
    expect(screen.getAllByTestId('theme-toggle')).toHaveLength(1);
  });
});

describe('Confirmación universal de cierre de sesión', () => {
  beforeEach(() => {
    localStorage.clear();
    logoutMock.mockClear();
  });

  const logoutQuestion = /¿Está seguro que desea cerrar la sesión activa\?/;

  it('el Landing con sesión activa exige confirmación antes de cerrar sesión', () => {
    useAuthMock.mockReturnValue({ user: { nombre: 'Mesero QA', rol: 'mesero', email: 'mesero@elcacique.com' }, logout: logoutMock });

    renderWithProviders(<Navbar />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Cerrar Sesión'));

    // El modal aparece y la sesión sigue viva.
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText(logoutQuestion)).toBeInTheDocument();
    expect(logoutMock).not.toHaveBeenCalled();

    // Cancelar no cierra la sesión.
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(logoutMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Confirmar sí la cierra.
    fireEvent.click(screen.getByTitle('Cerrar Sesión'));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, Cerrar' }));
    expect(logoutMock).toHaveBeenCalledOnce();
  });

  it('Escape cancela el modal universal sin cerrar la sesión', () => {
    useAuthMock.mockReturnValue({ user: { nombre: 'Admin QA', rol: 'administrador', email: 'admin@elcacique.com' }, logout: logoutMock });

    renderWithProviders(<Navbar />);

    fireEvent.click(screen.getByTitle('Cerrar Sesión'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(logoutMock).not.toHaveBeenCalled();
  });

  it('el panel Admin pide confirmación antes de cerrar la sesión', () => {
    useAuthMock.mockReturnValue({ user: { nombre: 'Admin QA', rol: 'administrador', sede: 'escazu' }, logout: logoutMock });

    renderWithProviders(<AdminDashboard />, '/admin');

    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/i }));

    expect(screen.getByText(logoutQuestion)).toBeInTheDocument();
    expect(logoutMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Sí, Cerrar' }));
    expect(logoutMock).toHaveBeenCalledOnce();
  });
});
