import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AdminRoute from '../routes/AdminRoute';
import PrivateRoute from '../routes/PrivateRoute';

function SessionTools() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  return <div><output data-testid="route-location">{location.pathname}</output><button onClick={() => login({ email: 'qa@example.com', nombre: 'QA', rol: 'mesero' })}>Mesero</button><button onClick={() => login({ email: 'qa@example.com', nombre: 'QA', rol: 'administrador' })}>Admin</button><button onClick={() => navigate('/admin')}>Ir Admin</button><button onClick={() => navigate('/private')}>Ir Private</button><button onClick={() => navigate('/open')}>Ir Open</button></div>;
}

function renderGuard(path = '/admin') {
  return render(<AuthProvider><MemoryRouter initialEntries={[path]}><SessionTools /><Routes>
    <Route path="/admin" element={<AdminRoute><span>Admin privado</span></AdminRoute>} />
    <Route path="/private" element={<PrivateRoute allowedRoles={['administrador']}><span>Ruta privada</span></PrivateRoute>} />
    <Route path="/open" element={<PrivateRoute><span>Ruta abierta al personal</span></PrivateRoute>} />
    <Route path="/login" element={<span>Login route</span>} />
    <Route path="/unauthorized" element={<span>No autorizado</span>} />
  </Routes></MemoryRouter></AuthProvider>);
}

describe('Guardas de rutas y roles', () => {
  it('redirige usuarios no autenticados e impide que un mesero entre como admin', () => {
    renderGuard('/admin');
    expect(screen.getByText('Login route')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mesero' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ir Admin' }));
    expect(screen.getByText('No autorizado')).toBeInTheDocument();
  });

  it('acepta admins, controla allowedRoles opcional y niega roles incompatibles', () => {
    renderGuard('/private');
    fireEvent.click(screen.getByRole('button', { name: 'Admin' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ir Private' }));
    expect(screen.getByText('Ruta privada')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mesero' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ir Private' }));
    expect(screen.getByText('No autorizado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ir Open' }));
    expect(screen.getByText('Ruta abierta al personal')).toBeInTheDocument();
  });
});
