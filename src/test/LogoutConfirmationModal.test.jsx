import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import WaiterDashboard from '../pages/WaiterDashboard';
import CashierDashboard from '../pages/CashierDashboard';
import { AccessibilityProvider } from '../context/AccessibilityContext';

const { logoutMock, cashierLogout, useAuthMock } = vi.hoisted(() => ({
  logoutMock: vi.fn(),
  cashierLogout: vi.fn(),
  useAuthMock: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('../services/n8nService', () => ({
  subscribeToLiveEvents: () => () => {},
  triggerN8nAutomation: vi.fn(async () => ({ respuesta: 'ok' })),
}));

describe('Modal de confirmacion de cierre de sesion', () => {
  beforeEach(() => {
    logoutMock.mockClear();
    cashierLogout.mockClear();
    useAuthMock.mockReturnValue({ user: { nombre: 'Mesero QA', rol: 'mesero' }, logout: logoutMock });
    localStorage.clear();
  });

  it('no renderiza nada cuando esta cerrado', () => {
    const { container } = render(
      <LogoutConfirmModal isOpen={false} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('muestra la pregunta de confirmacion y ejecuta el cierre solo al confirmar', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(<LogoutConfirmModal isOpen onCancel={onCancel} onConfirm={onConfirm} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('¿Está seguro que desea cerrar la sesión activa?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Sí, Cerrar' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('cancela al presionar Escape o al pulsar el fondo', () => {
    const onCancel = vi.fn();
    const { container } = render(
      <LogoutConfirmModal isOpen onCancel={onCancel} onConfirm={vi.fn()} />,
    );

    // Escape se escucha a nivel de documento: funciona sin foco dentro del modal.
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(container.firstChild);
    expect(onCancel).toHaveBeenCalledTimes(2);

    // Otras teclas no deben cerrar el dialogo.
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('expone el patron ARIA de dialogo modal y enfoca la opcion segura', () => {
    render(<LogoutConfirmModal isOpen onCancel={vi.fn()} onConfirm={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'logout-modal-title');
    expect(dialog).toHaveAccessibleName('¿Está seguro que desea cerrar la sesión activa?');
    // El foco inicial cae en Cancelar para que Enter no cierre la sesion.
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('el panel Mesero pide confirmacion antes de cerrar la sesion', () => {
    render(
      <AccessibilityProvider>
        <MemoryRouter>
          <WaiterDashboard />
        </MemoryRouter>
      </AccessibilityProvider>,
    );

    expect(logoutMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTitle('Cerrar Sesión'));
    expect(logoutMock).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(logoutMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Cerrar Sesión'));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, Cerrar' }));
    expect(logoutMock).toHaveBeenCalledOnce();
  });

  it('el panel Cajero pide confirmacion antes de cerrar la sesion', () => {
    useAuthMock.mockReturnValue({
      user: { nombre: 'Cajero QA', rol: 'cajero', sede: 'escazu' },
      logout: cashierLogout,
    });

    render(
      <AccessibilityProvider>
        <MemoryRouter>
          <CashierDashboard />
        </MemoryRouter>
      </AccessibilityProvider>,
    );

    const logoutButton = screen.getByRole('button', { name: /Cerrar sesión/i });
    fireEvent.click(logoutButton);
    expect(cashierLogout).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('¿Está seguro que desea cerrar la sesión activa?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sí, Cerrar' }));
    expect(cashierLogout).toHaveBeenCalledOnce();
  });
});