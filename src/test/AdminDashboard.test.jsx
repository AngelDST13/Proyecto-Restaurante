import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';
import AdminDashboard from '../pages/AdminDashboard';

const renderAdmin = () => render(
  <AccessibilityProvider>
    <AuthProvider>
      <MemoryRouter><AdminDashboard /></MemoryRouter>
    </AuthProvider>
  </AccessibilityProvider>
);

describe('AdminDashboard', () => {
  it('navega al menú y al módulo de facturas', () => {
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: /Gestión de Menú/i }));
    expect(screen.getByText(/Gestión dinámica del menú/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Facturas & Finanzas/i }));
    expect(screen.getByRole('heading', { name: /Facturas & Finanzas/i })).toBeInTheDocument();
  });

  it('crea categorías y platillos con restricciones de sede', () => {
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: /Gestión de Menú/i }));
    fireEvent.change(screen.getByPlaceholderText(/Nueva categoría/i), { target: { value: 'Bebidas de la Casa' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear categoría/i }));
    expect(screen.getAllByRole('option', { name: 'Bebidas de la Casa' })).toHaveLength(2);

    fireEvent.change(screen.getByPlaceholderText(/Nombre del platillo/i), { target: { value: 'Chicharrón de prueba' } });
    fireEvent.change(screen.getByPlaceholderText(/Precio en colones/i), { target: { value: '6800' } });
    fireEvent.click(screen.getByLabelText(/No disponible en Sede Cartago/i));
    fireEvent.click(screen.getByRole('button', { name: /Guardar platillo/i }));
    expect(screen.getByText('Chicharrón de prueba')).toBeInTheDocument();
    expect(screen.getByText(/No disponible en: Sede Cartago/i)).toBeInTheDocument();
  });

  it('filtra facturas de clientes por período y nombre', () => {
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: /Facturas & Finanzas/i }));
    fireEvent.click(screen.getByRole('button', { name: /Este mes/i }));
    fireEvent.change(screen.getByPlaceholderText(/Buscar cliente/i), { target: { value: 'Corporación' } });
    expect(screen.getByText('Corporación El Sol S.A.')).toBeInTheDocument();
    expect(screen.queryByText('Bryan Gómez')).not.toBeInTheDocument();
  });

  it('copia accesos desde la consola y reporta fallos del portapapeles', async () => {
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    try {
      renderAdmin();
      fireEvent.click(screen.getByText('Accesos de prueba por sucursal'));
      fireEvent.click(screen.getAllByRole('button', { name: 'Copiar credenciales' })[0]);
      expect(writeText).toHaveBeenCalledWith('admin@elcacique.com\nAdminCacique2026!');
      expect(await screen.findByText('Credenciales copiadas al portapapeles')).toBeInTheDocument();

      writeText.mockRejectedValueOnce(new Error('clipboard unavailable'));
      fireEvent.click(screen.getAllByRole('button', { name: 'Copiar credenciales' })[1]);
      expect(await screen.findByText('No se pudieron copiar las credenciales en este navegador')).toBeInTheDocument();
    } finally {
      if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
      else delete navigator.clipboard;
    }
  });
});
