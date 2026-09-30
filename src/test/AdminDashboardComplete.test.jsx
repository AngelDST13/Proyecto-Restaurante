import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import AdminDashboard from '../pages/AdminDashboard';

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: vi.fn(() => () => {})
}));

const renderAdmin = () => render(
  <AccessibilityProvider><AuthProvider><MemoryRouter><AdminDashboard /></MemoryRouter></AuthProvider></AccessibilityProvider>
);
const open = label => fireEvent.click(screen.getByRole('button', { name: new RegExp(label, 'i') }));

describe('AdminDashboard: menú e invoices con interacciones del DOM real', () => {
  it('agrega platillos sin exclusiones, con una exclusión y con varias; alterna sedes', () => {
    renderAdmin();
    open('Gestión de Menú');
    fireEvent.change(screen.getByPlaceholderText('Nombre del platillo'), { target: { value: 'Platillo QA libre' } });
    fireEvent.change(screen.getByPlaceholderText('Precio en colones'), { target: { value: '3500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar platillo' }));
    expect(screen.getByText('Platillo QA libre')).toBeInTheDocument();

    const escazu = screen.getByLabelText(/No disponible en Sede Escazú/i);
    fireEvent.click(escazu);
    expect(escazu).toBeChecked();
    fireEvent.click(escazu);
    expect(escazu).not.toBeChecked();
    fireEvent.click(escazu);
    fireEvent.click(screen.getByLabelText(/No disponible en Sede Santa Ana/i));
    fireEvent.change(screen.getByPlaceholderText('Nombre del platillo'), { target: { value: 'Platillo QA excluido' } });
    fireEvent.change(screen.getByPlaceholderText('Precio en colones'), { target: { value: '4200' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar platillo' }));
    expect(screen.getByText('No disponible en: Sede Escazú, Sede Santa Ana')).toBeInTheDocument();
  });

  it('cubre categoría duplicada y válida, búsqueda y periodos de facturas', () => {
    renderAdmin();
    open('Gestión de Menú');
    const category = screen.getByPlaceholderText('Nueva categoría o sección');
    fireEvent.change(category, { target: { value: 'Bebidas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }));
    expect(screen.getByText('Esta categoría ya existe')).toBeInTheDocument();
    fireEvent.change(category, { target: { value: 'Especiales QA' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }));
    expect(screen.getByRole('option', { name: 'Especiales QA' })).toBeInTheDocument();

    open('Facturas & Finanzas');
    expect(screen.getAllByText(/FE-001/).length).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: 'Este mes' }));
    expect(screen.getAllByText(/FE-001/).length).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: 'Todas' }));
    fireEvent.change(screen.getByPlaceholderText(/Buscar cliente, identificación/i), { target: { value: 'Bryan' } });
    expect(screen.getByText('Bryan Gómez')).toBeInTheDocument();
    expect(screen.queryByText('Corporación El Sol S.A.')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Buscar cliente, identificación/i), { target: { value: 'no existe' } });
    expect(screen.getByText(/No hay facturas que coincidan/i)).toBeInTheDocument();
  });

  it('elimina platillos desde el botón accesible y conserva los restantes', () => {
    renderAdmin();
    open('Gestión de Menú');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Chifrijo Especial Cacique' }));
    expect(screen.queryByText('Chifrijo Especial Cacique')).not.toBeInTheDocument();
    expect(screen.getByText('Vigorón Criollo (1kg)')).toBeInTheDocument();
  });

  it('ejecuta fallback del logo y acciones de inventario, promociones, reseñas y caja', () => {
    renderAdmin();
    const logo = screen.getByAltText('El Cacique Logo');
    fireEvent.error(logo);
    expect(logo).toHaveAttribute('src', expect.stringContaining('Cacique.svg'));

    open('Gestión de Inventario');
    fireEvent.change(screen.getAllByRole('combobox').at(-1), { target: { value: 'optimo' } });
    expect(screen.getByText('Carne de Cerdo para Chicharrón')).toBeInTheDocument();
    expect(screen.queryByText('Yuca Fresca de Paila')).not.toBeInTheDocument();
    open('Cupones & Promos');
    fireEvent.click(screen.getByRole('button', { name: 'Crear Promoción' }));
    expect(screen.getByText(/Formulario de nueva promoción/i)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Sincronizar Campaña' })[0]);
    expect(screen.getByText(/Promoción CACIQUE10 sincronizada/i)).toBeInTheDocument();
    open('Reseñas & Clientes');
    fireEvent.click(screen.getByRole('button', { name: 'Revisar moderación' }));
    expect(screen.getByText(/No hay reseñas pendientes/i)).toBeInTheDocument();
    open('Arqueo de Caja & POS');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Cierre Diario de Caja' }));
    expect(screen.getByText(/Cierre de caja registrado exitosamente/i)).toBeInTheDocument();
  });
});
