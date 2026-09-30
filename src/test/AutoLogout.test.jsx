import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAutoLogout } from '../hooks/useAutoLogout';

const { logoutMock } = vi.hoisted(() => ({ logoutMock: vi.fn() }));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { rol: 'administrador' }, logout: logoutMock })
}));

function SessionTimer({ notify }) {
  const { showWarning, resetTimer } = useAutoLogout(notify);
  return <div><button onClick={resetTimer}>Reiniciar tiempo</button><span>{showWarning ? 'Advertencia visible' : 'Sin advertencia'}</span></div>;
}

describe('useAutoLogout', () => {
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
});
