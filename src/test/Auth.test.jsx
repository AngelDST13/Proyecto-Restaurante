import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';

describe('Suite de Pruebas de Autenticación', () => {
  it('Renderiza los campos del formulario de inicio de sesión correctamente', () => {
    render(
      <AuthProvider>
        <AccessibilityProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </AccessibilityProvider>
      </AuthProvider>
    );

    expect(screen.getByPlaceholderText(/admin@elcacique.com/i)).toBeDefined();
  });
});