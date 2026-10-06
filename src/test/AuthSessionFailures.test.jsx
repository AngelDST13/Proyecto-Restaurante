import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';

/**
 * Si el cifrado de la sesion falla, AuthContext no debe crear una sesion a
 * medias: login y registro devuelven un error explicito.
 */

const encryption = vi.hoisted(() => ({ fail: false }));

vi.mock('../services/authSecurity', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, encryptData: (data) => (encryption.fail ? null : actual.encryptData(data)) };
});

function Probe() {
  const { user, login, registerClient } = useAuth();
  const show = (result) => {
    document.getElementById('result').textContent = result.success ? 'ok' : result.message;
  };
  return (
    <div>
      <span data-testid="user">{user?.email ?? 'nadie'}</span>
      <span id="result" data-testid="result" />
      <button type="button" onClick={() => show(login({ email: 'mesero@elcacique.com', rol: 'mesero' }))}>Login</button>
      <button type="button" onClick={() => show(registerClient('nuevo.cliente@correo.com', 'clave-segura-1', 'Cliente Nuevo'))}>Registro</button>
      <button type="button" onClick={() => show(registerClient('admin@elcacique.com', 'clave-segura-1', 'Duplicado'))}>Registro duplicado</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  encryption.fail = false;
});

describe('AuthContext sin cifrado disponible', () => {
  it('no inicia sesión si no puede cifrarla', () => {
    encryption.fail = true;
    render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByTestId('result')).toHaveTextContent('No se pudo crear la sesión segura.');
    expect(screen.getByTestId('user')).toHaveTextContent('nadie');
  });

  it('el registro informa el fallo de la sesión segura', () => {
    encryption.fail = true;
    render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Registro' }));
    expect(screen.getByTestId('result')).toHaveTextContent('No se pudo crear la sesión segura.');
  });

  it('el registro rechaza un correo ya registrado antes de crear la sesión', () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Registro duplicado' }));
    expect(screen.getByTestId('result')).toHaveTextContent('El correo electrónico ya está registrado.');
    expect(screen.getByTestId('user')).toHaveTextContent('nadie');
  });
});
