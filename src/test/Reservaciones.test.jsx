import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';
import AdminDashboard from '../pages/AdminDashboard';

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: vi.fn(() => () => {})
}));

describe('Gestión de mesas y reservaciones', () => {
  beforeEach(() => {
    localStorage.removeItem('cacique_admin_reservations');
    localStorage.removeItem('cacique_admin_inventory');
  });

  it('crea, confirma, edita y cancela una reservación con mesa asignada', () => {
    render(<AccessibilityProvider><AuthProvider><MemoryRouter><AdminDashboard /></MemoryRouter></AuthProvider></AccessibilityProvider>);
    fireEvent.click(screen.getByRole('button', { name: /Mesas & Reservaciones/i }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Sede del panel' }), { target: { value: 'todas' } });

    fireEvent.change(screen.getByLabelText('Nombre del Cliente'), { target: { value: 'Reserva QA' } });
    fireEvent.change(screen.getByLabelText('Cantidad de Personas'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-15' } });
    fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '19:30' } });
    fireEvent.change(screen.getByLabelText('Sede de reserva'), { target: { value: 'cartago' } });
    fireEvent.change(screen.getByLabelText('Mesa asignada'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear reserva' }));

    expect(screen.getByText('Reserva QA').closest('article')).toHaveTextContent('4 personas');
    expect(screen.getByText('Reserva QA').closest('article')).toHaveTextContent('Cartago');
    expect(screen.getByText('Reserva QA').closest('article')).toHaveTextContent('Mesa 04');
    expect(JSON.parse(localStorage.getItem('cacique_admin_reservations'))).toEqual(expect.arrayContaining([expect.objectContaining({ cliente: 'Reserva QA', mesa: '4', estado: 'Reservada' })]));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(screen.getByText('Confirmada')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Editar reserva de Reserva QA' }));
    fireEvent.change(screen.getByLabelText('Cantidad de Personas'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios de reserva' }));
    expect(screen.getByText('Reserva QA').closest('article')).toHaveTextContent('5 personas');

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByText('No hay reservaciones activas para esta sede.')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('cacique_admin_reservations'))).toEqual([]);
  });
});
