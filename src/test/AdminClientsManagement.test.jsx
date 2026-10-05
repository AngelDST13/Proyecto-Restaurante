import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import AdminDashboard from '../pages/AdminDashboard';
import {
  DEFAULT_CLIENTS,
  filterClients,
  getClientStatus,
  normalizeSearchTerm,
  FREQUENT_CLIENT_THRESHOLD,
} from '../services/clientsService';

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: vi.fn(() => () => {}),
}));

const renderAdmin = () => {
  localStorage.removeItem('cacique_admin_clients');
  return render(
    <AccessibilityProvider>
      <AuthProvider>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthProvider>
    </AccessibilityProvider>,
  );
};

const openClientsSection = () =>
  fireEvent.click(screen.getByRole('button', { name: /Gestión de Clientes/i }));

describe('AdminDashboard: Gestión de Clientes Registrados', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('expone el menu lateral de Gestión de Clientes', () => {
    renderAdmin();
    expect(screen.getByRole('button', { name: /Gestión de Clientes/i })).toBeInTheDocument();
  });

  it('renderiza la tabla con todas las columnas requeridas', () => {
    renderAdmin();
    openClientsSection();

    expect(screen.getByRole('heading', { name: 'Gestión de Clientes Registrados' })).toBeInTheDocument();
    ['Nombre Completo', 'Correo Electrónico', 'Teléfono / WhatsApp', 'Sede Preferida', 'Total de Reservas', 'Estado del Cliente'].forEach((header) => {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    });

    const rows = screen.getAllByTestId('client-row');
    expect(rows).toHaveLength(DEFAULT_CLIENTS.length);
    expect(screen.getByText('angel.salazar@correo.cr')).toBeInTheDocument();
    expect(screen.getByText('+506 8811-2233')).toBeInTheDocument();
    expect(screen.getByText('Escazú', { selector: 'td' })).toBeInTheDocument();
    expect(screen.getByText('Heredia', { selector: 'td' })).toBeInTheDocument();
  });

  it('filtra en tiempo real por nombre o correo', () => {
    renderAdmin();
    openClientsSection();

    fireEvent.change(screen.getByLabelText('Buscar cliente'), { target: { value: 'carlos' } });
    expect(screen.getAllByTestId('client-row')).toHaveLength(1);
    expect(screen.getByText('carlos.urenab@correo.cr')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar cliente'), { target: { value: 'correo.cr' } });
    expect(screen.getAllByTestId('client-row')).toHaveLength(DEFAULT_CLIENTS.length);

    fireEvent.change(screen.getByLabelText('Buscar cliente'), { target: { value: 'no-existe' } });
    expect(screen.queryAllByTestId('client-row')).toHaveLength(0);
    expect(screen.getByText(/No hay clientes que coincidan/i)).toBeInTheDocument();
  });

  it('filtra por sede seleccionada', () => {
    renderAdmin();
    openClientsSection();

    fireEvent.change(screen.getByLabelText('Filtrar clientes por sede'), { target: { value: 'cartago' } });
    const rows = screen.getAllByTestId('client-row');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveAttribute('data-client-email', 'carlos.urenab@correo.cr');

    fireEvent.change(screen.getByLabelText('Filtrar clientes por sede'), { target: { value: 'todas' } });
    expect(screen.getAllByTestId('client-row')).toHaveLength(DEFAULT_CLIENTS.length);
  });

  it('etiqueta el estado Activo / Frecuente segun el historial', () => {
    renderAdmin();
    openClientsSection();

    const frecuente = screen.getByText('Angel Daniela Salazar T.', { selector: 'td' }).closest('tr');
    expect(frecuente.textContent).toContain('Frecuente');

    const activo = screen.getByText('Sofía Jiménez Mora', { selector: 'td' }).closest('tr');
    expect(activo.textContent).toContain('Activo');
  });

  it('permite registrar una reserva y eliminar un cliente', () => {
    renderAdmin();
    openClientsSection();

    fireEvent.click(screen.getByRole('button', { name: /Registrar reserva de Sofía Jiménez Mora/i }));
    const sofia = screen.getByText('Sofía Jiménez Mora', { selector: 'td' }).closest('tr');
    expect(sofia.textContent).toContain('Frecuente');

    fireEvent.click(screen.getByRole('button', { name: /Eliminar cliente Sofía Jiménez Mora/i }));
    expect(screen.queryByText('Sofía Jiménez Mora', { selector: 'td' })).not.toBeInTheDocument();
    expect(screen.getAllByTestId('client-row')).toHaveLength(DEFAULT_CLIENTS.length - 1);
  });
});

describe('clientsService: reglas de filtrado y estado', () => {
  it('normaliza acentos para el buscador', () => {
    expect(normalizeSearchTerm('  Sofía  ')).toBe('sofia');
    expect(normalizeSearchTerm('ESCAZÚ')).toBe('escazu');
    expect(normalizeSearchTerm(null)).toBe('');
  });

  it('clasifica como Frecuente desde el umbral definido', () => {
    expect(getClientStatus(FREQUENT_CLIENT_THRESHOLD)).toBe('Frecuente');
    expect(getClientStatus(FREQUENT_CLIENT_THRESHOLD - 1)).toBe('Activo');
  });

  it('filtra combinando texto y sede, y descarta registros invalidos', () => {
    const sucios = [{ nombre: 'X' }, null, ...DEFAULT_CLIENTS];
    expect(filterClients(sucios, { search: 'x' })).toHaveLength(0);
    expect(filterClients(undefined, {})).toEqual([]);
    expect(filterClients(DEFAULT_CLIENTS, { sede: 'heredia' })).toHaveLength(1);
    expect(filterClients(DEFAULT_CLIENTS, { search: 'salazar', sede: 'escazu' })[0].estado).toBe('Frecuente');
  });
});