import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../pages/Login';

function SessionProbe() {
  const { user, login } = useAuth();
  return <div><span>{user ? `${user.nombre} (${user.rol})` : 'Sesión cerrada'}</span><button onClick={() => login({ email: 'admin@elcacique.com', nombre: 'Admin Test', rol: 'administrador', sede: 'escazu', password: 'no guardar' })}>Crear sesión admin</button></div>;
}

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
});
