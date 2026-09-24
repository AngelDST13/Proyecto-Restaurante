import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivateRoute from '../src/routes/PrivateRoute';
import AdminRoute from '../src/routes/AdminRoute';
import { AuthProvider } from '../src/context/AuthContext';

describe('Pruebas de Rutas Protegidas y Seguridad', () => {
  it('Redirige a usuarios no autenticados en PrivateRoute', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <PrivateRoute>
            <div>Panel de Control Secreto</div>
          </PrivateRoute>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.queryByText('Panel de Control Secreto')).toBeNull();
  });

  it('Bloquea acceso no autorizado en AdminRoute', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <AdminRoute>
            <div>Area Exclusiva Administrador</div>
          </AdminRoute>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.queryByText('Area Exclusiva Administrador')).toBeNull();
  });
});