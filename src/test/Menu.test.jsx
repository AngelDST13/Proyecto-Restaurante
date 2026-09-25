import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MenuDigital from "../pages/Menu";
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';

describe('Suite de Pruebas del Menú Digital', () => {
  it('Carga el título principal del menú digital sin errores', () => {
    render(
      <AuthProvider>
        <AccessibilityProvider>
          <MemoryRouter>
            <MenuDigital />
          </MemoryRouter>
        </AccessibilityProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/MENÚ DIGITAL EL CACIQUE/i)).toBeDefined();
  });
});