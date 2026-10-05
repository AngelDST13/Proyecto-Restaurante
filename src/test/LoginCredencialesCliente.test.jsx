import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';
import { TalkBackProvider } from '../context/TalkBackContext';
import Login from '../pages/Login';
import { TEST_ACCESS_CREDENTIALS } from '../services/authSecurity';

const renderLogin = () => render(
  <TalkBackProvider>
    <AccessibilityProvider>
      <AuthProvider>
        <MemoryRouter><Login /></MemoryRouter>
      </AuthProvider>
    </AccessibilityProvider>
  </TalkBackProvider>,
);

describe('Credenciales de prueba del modal de accesos rápidos', () => {
  beforeEach(() => localStorage.clear());

  const openQuickAccess = () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /Accesos Rápidos de Prueba/i }));
  };

  it('expone el patrón ARIA de diálogo modal', () => {
    openQuickAccess();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Accesos de prueba');
  });

  it('incluye la tarjeta completa del Cliente Registrado', () => {
    openQuickAccess();

    expect(screen.getByText('Cliente Registrado')).toBeInTheDocument();
    expect(screen.getByText('cliente.escazu@elcacique.com')).toBeInTheDocument();
  });

  it('autocompleta el formulario con la credencial del cliente', () => {
    openQuickAccess();

    const clientCard = screen.getByText('cliente.escazu@elcacique.com').closest('article');
    fireEvent.click(within(clientCard).getByRole('button', { name: 'Autocompletar' }));

    expect(screen.getByPlaceholderText(/admin@elcacique.com/i)).toHaveValue('cliente.escazu@elcacique.com');
    expect(screen.getByPlaceholderText('••••••••••••')).toHaveValue('Cliente2026!');
    // Al autocompletar se cierra el modal.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('nunca muestra la etiqueta combinada "Cajero / Mesero"', () => {
    openQuickAccess();

    expect(screen.queryByText(/Cajero\s*\/\s*Mesero/i)).not.toBeInTheDocument();
  });

  it('etiqueta cada sede con un único rol coherente', () => {
    const operationalRoles = ['Cajero', 'Cocina KDS', 'Mesero'];

    for (const sede of ['Escazú', 'Santa Ana', 'Cartago', 'Heredia']) {
      const roles = TEST_ACCESS_CREDENTIALS
        .filter(credential => credential.sede === sede)
        .map(credential => credential.rol);

      // Cada sede expone Cajero, Mesero y Cocina KDS. Escazú suma además el
      // Cliente Registrado, que no es un rol operativo del panel.
      const expected = sede === 'Escazú' ? [...operationalRoles, 'Cliente Registrado'] : operationalRoles;
      expect(roles.sort()).toEqual(expected.sort());
    }
  });
});
