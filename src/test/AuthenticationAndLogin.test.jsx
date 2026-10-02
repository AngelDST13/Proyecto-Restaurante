import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import { encryptData } from '../services/authSecurity';

function SessionProbe() {
  const { user, login } = useAuth();
  return <div><span>{user ? `${user.nombre} (${user.rol})` : 'Sesión cerrada'}</span><button onClick={() => login({ email: 'admin@elcacique.com', nombre: 'Admin Test', rol: 'administrador', sede: 'escazu', password: 'no guardar' })}>Crear sesión admin</button></div>;
}

function ClientSessionProbe() {
  const { user, login, inactivityToast } = useAuth();
  return <div><span>{user ? 'Cliente autenticado' : 'Sesión cerrada'}</span><span>{inactivityToast ? 'Aviso de inactividad' : ''}</span><button onClick={() => login({ email: 'cliente.qa@example.com', rol: 'cliente' })}>Crear sesión cliente</button></div>;
}

afterEach(() => vi.useRealTimers());

describe('Autenticación y login', () => {
  it('permite escribir correo y contraseña en el formulario', () => {
    render(<AuthProvider><MemoryRouter><Login /></MemoryRouter></AuthProvider>);
    const email = screen.getByPlaceholderText(/admin@elcacique.com/i);
    const password = screen.getByPlaceholderText('••••••••••••');
    fireEvent.change(email, { target: { value: 'admin@elcacique.com' } });
    fireEvent.change(password, { target: { value: 'sample-password' } });
    expect(email).toHaveValue('admin@elcacique.com');
    expect(password).toHaveValue('sample-password');
  });

  it('persiste la sesión y conserva el rol sin guardar la contraseña', () => {
    localStorage.clear();
    const view = render(<AuthProvider><SessionProbe /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: /Crear sesión admin/i }));
    expect(screen.getByText('Admin Test (administrador)')).toBeInTheDocument();
    expect(localStorage.getItem('gourmetsync_enc_user')).toBeTruthy();
    expect(localStorage.getItem('gourmetsync_enc_user')).not.toContain('no guardar');
    view.unmount();
    render(<AuthProvider><SessionProbe /></AuthProvider>);
    expect(screen.getByText('Admin Test (administrador)')).toBeInTheDocument();
  });

  it('rechaza una firma de sesión manipulada y limpia datos heredados sensibles', () => {
    const userData = { email: 'cajero.escazu@elcacique.com', rol: 'cajero', sede: 'escazu' };
    localStorage.setItem('gourmetsync_enc_user', encryptData(userData));
    localStorage.setItem('gourmetsync_sig', 'firma-alterada');
    localStorage.setItem('cacique_jwt_token', 'token-antiguo');
    localStorage.setItem('gourmetsync_user', JSON.stringify(userData));

    render(<AuthProvider><SessionProbe /></AuthProvider>);

    expect(screen.getByText('Sesión cerrada')).toBeInTheDocument();
    expect(localStorage.getItem('gourmetsync_enc_user')).toBeNull();
    expect(localStorage.getItem('gourmetsync_sig')).toBeNull();
    expect(localStorage.getItem('cacique_jwt_token')).toBeNull();
    expect(localStorage.getItem('gourmetsync_user')).toBeNull();
  });

  it('cierra una sesión activa cuando el evento storage detecta una firma alterada', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<AuthProvider><SessionProbe /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: /Crear sesión admin/i }));
    localStorage.setItem('gourmetsync_sig', 'firma-cambiada-durante-la-sesion');

    act(() => window.dispatchEvent(new Event('storage')));

    expect(screen.getByText('Sesión cerrada')).toBeInTheDocument();
    expect(localStorage.getItem('gourmetsync_enc_user')).toBeNull();
    expect(localStorage.getItem('gourmetsync_sig')).toBeNull();
    consoleError.mockRestore();
  });

  it('reinicia y expira la sesión de cliente tras tres minutos de inactividad', () => {
    vi.useFakeTimers();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<AuthProvider><ClientSessionProbe /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Crear sesión cliente' }));
    expect(screen.getByText('Cliente autenticado')).toBeInTheDocument();

    act(() => window.dispatchEvent(new Event('mousemove')));
    act(() => vi.advanceTimersByTime(180000));

    expect(screen.getByText('Aviso de inactividad')).toBeInTheDocument();
    expect(screen.getByText('Sesión cerrada')).toBeInTheDocument();
    expect(localStorage.getItem('gourmetsync_enc_user')).toBeNull();
    consoleError.mockRestore();
  });
});
