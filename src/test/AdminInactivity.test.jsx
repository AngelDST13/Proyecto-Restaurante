import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminDashboard from '../pages/AdminDashboard';
import { AccessibilityProvider } from '../context/AccessibilityContext';

const { logoutMock, adminUser } = vi.hoisted(() => ({
  logoutMock: vi.fn(),
  adminUser: { alias: 'Angel', nombre: 'Angel QA', rol: 'administrador' }
}));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: adminUser, logout: logoutMock })
}));

function CurrentPath() {
  return <output aria-label="Ruta actual">{useLocation().pathname}</output>;
}

describe('AdminDashboard inactivity warning', () => {
  afterEach(() => vi.useRealTimers());

  beforeEach(() => {
    vi.useFakeTimers();
    logoutMock.mockClear();
  });

  it('offers to keep the session active at nine minutes and logs out after ten', () => {
    render(<AccessibilityProvider><MemoryRouter><AdminDashboard /><CurrentPath /></MemoryRouter></AccessibilityProvider>);

    act(() => vi.advanceTimersByTime(9 * 60 * 1000));
    expect(screen.getByRole('dialog', { name: 'Aviso de Inactividad de Sesión' })).toBeInTheDocument();
    expect(screen.getByText(/expirará en 60 segundos/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mantener Sesión Activa' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(logoutMock).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(9 * 60 * 1000));
    expect(screen.getByRole('dialog', { name: 'Aviso de Inactividad de Sesión' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(61 * 1000));
    expect(logoutMock).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/login');
  });

  it('allows the administrator to close the session from the warning', () => {
    render(<AccessibilityProvider><MemoryRouter><AdminDashboard /><CurrentPath /></MemoryRouter></AccessibilityProvider>);
    act(() => vi.advanceTimersByTime(9 * 60 * 1000));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar Sesión Ahora' }));
    expect(logoutMock).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/login');
  });
});
