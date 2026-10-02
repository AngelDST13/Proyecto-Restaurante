import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAutoLogout } from '../hooks/useAutoLogout';

const { logoutMock, authState } = vi.hoisted(() => ({
  logoutMock: vi.fn(),
  authState: { user: { rol: 'administrador' } }
}));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: authState.user, logout: logoutMock })
}));

function SessionTimer({ notify }) {
  const { showWarning, resetTimer } = useAutoLogout(notify);
  return <div><button onClick={resetTimer}>Reiniciar tiempo</button><span>{showWarning ? 'Advertencia visible' : 'Sin advertencia'}</span></div>;
}

describe('useAutoLogout', () => {
  it('no instala temporizadores cuando no hay usuario autenticado', () => {
    vi.useFakeTimers();
    authState.user = null;
    logoutMock.mockClear();
    render(<SessionTimer notify={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar tiempo' }));
    act(() => vi.advanceTimersByTime(300000));
    expect(screen.getByText('Sin advertencia')).toBeInTheDocument();
    expect(logoutMock).not.toHaveBeenCalled();
    authState.user = { rol: 'administrador' };
    vi.useRealTimers();
  });

  it('avisa, reinicia por actividad y cierra la sesión por inactividad', () => {
    vi.useFakeTimers();
    const notify = vi.fn();
    logoutMock.mockClear();
    render(<SessionTimer notify={notify} />);
    act(() => vi.advanceTimersByTime(150000));
    expect(screen.getByText('Advertencia visible')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar tiempo' }));
    expect(screen.getByText('Sin advertencia')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(180000));
    expect(logoutMock).toHaveBeenCalledOnce();
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('3 minutos'), 'info');
    vi.useRealTimers();
  });

  it('no reinicia el temporizador al interactuar dentro del diálogo de inactividad', () => {
    vi.useFakeTimers();
    render(<SessionTimer notify={vi.fn()} />);
    act(() => vi.advanceTimersByTime(149000));

    const dialog = document.createElement('div');
    dialog.setAttribute('data-inactivity-dialog', 'true');
    const dialogButton = document.createElement('button');
    dialog.append(dialogButton);
    document.body.append(dialog);
    fireEvent.click(dialogButton);
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByText('Advertencia visible')).toBeInTheDocument();
    dialog.remove();
    vi.useRealTimers();
  });
});
