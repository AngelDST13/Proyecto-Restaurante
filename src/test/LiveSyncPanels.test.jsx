import { act, fireEvent, render, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { TalkBackProvider } from '../context/TalkBackContext';
import ReservationModal from '../components/ReservationModal';
import AdminDashboard from '../pages/AdminDashboard';
import WaiterDashboard from '../pages/WaiterDashboard';
import KitchenDashboard from '../pages/KitchenDashboard';
import CashierDashboard from '../pages/CashierDashboard';
import {
  KITCHEN_ORDERS_KEY,
  RESERVATIONS_KEY,
  SYNC_EVENT,
  activeKitchenOrders,
  addKitchenOrder,
  addWebReservation,
  assignTable,
  createWaiterTables,
  localDateKey,
  readCollection,
  reservationsByTable,
  subscribeCollection,
  updateKitchenOrder,
  writeCollection
} from '../services/liveSync';

/**
 * Sincronizacion en tiempo real: Landing -> Admin / Mesero y
 * Mesero -> Cocina -> Caja, sin recargar ninguna vista.
 */

const { authContext } = vi.hoisted(() => ({
  authContext: {
    user: { email: 'staff.escazu@elcacique.com', nombre: 'Staff QA', rol: 'mesero', sede: 'escazu' },
    logout: vi.fn(),
    inactivityToast: false,
    setInactivityToast: vi.fn()
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authContext,
  AuthProvider: ({ children }) => children
}));
vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: vi.fn(() => () => {})
}));

const withProviders = (element) => (
  <TalkBackProvider><AccessibilityProvider><MemoryRouter>{element}</MemoryRouter></AccessibilityProvider></TalkBackProvider>
);

const today = localDateKey();

beforeEach(() => {
  localStorage.clear();
});

describe('liveSync — almacenamiento compartido', () => {
  it('lee colecciones de forma tolerante y reutiliza la misma referencia', () => {
    expect(readCollection('inexistente')).toEqual([]);
    localStorage.setItem('x', '{no-json');
    expect(readCollection('x')).toEqual([]);
    localStorage.setItem('x', '{"a":1}');
    expect(readCollection('x')).toEqual([]);

    writeCollection('x', [{ id: 1 }]);
    const first = readCollection('x');
    expect(first).toEqual([{ id: 1 }]);
    expect(readCollection('x')).toBe(first);
  });

  it('notifica a los suscriptores de la misma pestaña y de otras pestañas', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeCollection(RESERVATIONS_KEY, callback);

    writeCollection(RESERVATIONS_KEY, []);
    writeCollection('otra_clave', []);
    window.dispatchEvent(new StorageEvent('storage', { key: RESERVATIONS_KEY }));
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'otra_clave' }));
    expect(callback).toHaveBeenCalledTimes(3);

    unsubscribe();
    writeCollection(RESERVATIONS_KEY, []);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('devuelve false y no emite eventos si el almacenamiento falla', () => {
    const listener = vi.fn();
    window.addEventListener(SYNC_EVENT, listener);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota'); });
    expect(writeCollection(RESERVATIONS_KEY, [])).toBe(false);
    expect(listener).not.toHaveBeenCalled();
    setItem.mockRestore();

    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Denied'); });
    expect(readCollection(RESERVATIONS_KEY)).toEqual([]);
    getItem.mockRestore();
    window.removeEventListener(SYNC_EVENT, listener);
  });

  it('usa la fecha local y no la fecha UTC', () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});

describe('liveSync — asignacion de mesas y reservas', () => {
  it('asigna la mesa libre mas pequeña con capacidad suficiente', () => {
    expect(assignTable({ sede: 'escazu', fecha: today, personas: 2 }, [])).toBe('6');
    expect(assignTable({ sede: 'escazu', fecha: today, personas: 5 }, [])).toBe('3');
    expect(assignTable({ sede: 'escazu', fecha: today, personas: 9 }, [])).toBe('');
  });

  it('omite mesas ya reservadas ese dia, salvo canceladas, y no mezcla sedes', () => {
    const existing = [
      { sede: 'escazu', fecha: today, mesa: '6', estado: 'Reservada' },
      { sede: 'escazu', fecha: today, mesa: '10', estado: 'Cancelada' },
      { sede: 'cartago', fecha: today, mesa: '10', estado: 'Reservada' }
    ];
    expect(assignTable({ sede: 'escazu', fecha: today, personas: 2 }, existing)).toBe('10');
  });

  it('registra la reserva web normalizando la sede y marcando su sincronizacion', () => {
    const reservation = addWebReservation({ nombre: 'Ana', telefono: '8888', sede: 'Santa Ana', fecha: today, hora: '19:00', personas: '4', offline: true });
    expect(reservation).toMatchObject({ cliente: 'Ana', sede: 'santa_ana', personas: 4, mesa: '1', origen: 'web', estado: 'Reservada', sincronizada: false });
    expect(readCollection(RESERVATIONS_KEY)).toHaveLength(1);
  });

  it('agrupa por mesa solo las reservas activas de hoy en la sede', () => {
    const reservations = [
      { id: 'a', sede: 'escazu', fecha: today, mesa: '1', estado: 'Reservada' },
      { id: 'b', sede: 'escazu', fecha: '2099-01-01', mesa: '3', estado: 'Reservada' },
      { id: 'c', sede: 'escazu', fecha: today, mesa: '', estado: 'Reservada' },
      { id: 'd', sede: 'escazu', fecha: today, mesa: '7', estado: 'Completada' },
      { id: 'e', sede: 'heredia', fecha: today, mesa: '9', estado: 'Reservada' }
    ];
    expect(Object.keys(reservationsByTable(reservations, 'escazu'))).toEqual(['1']);
  });

  it('crea copias independientes del plano de mesas', () => {
    const first = createWaiterTables();
    first.piso1[0].estado = 'Ocupada';
    expect(createWaiterTables().piso1[0].estado).toBe('Libre');
  });
});

describe('liveSync — comandas de cocina', () => {
  it('agrega, actualiza y filtra comandas activas por sede', () => {
    const order = addKitchenOrder({ mesa: 'Mesa 01', sede: 'escazu', items: [] });
    expect(order).toMatchObject({ estado: 'En Espera', minutosTranscurridos: 0 });
    expect(order.id).toMatch(/^ORD-/);
    addKitchenOrder({ mesa: 'Mesa 03', sede: 'heredia', items: [] });

    expect(activeKitchenOrders(readCollection(KITCHEN_ORDERS_KEY), 'escazu')).toHaveLength(1);
    expect(updateKitchenOrder(order.id, (current) => ({ ...current, estado: 'Listo' }))).toBe(true);
    expect(activeKitchenOrders(readCollection(KITCHEN_ORDERS_KEY), 'escazu')).toHaveLength(0);
    expect(updateKitchenOrder('NO-EXISTE', (current) => current)).toBe(false);
  });
});

describe('Integracion entre paneles', () => {
  it('una reserva de la Landing aparece en Admin y marca la mesa como Reservada en Mesero', async () => {
    const admin = render(withProviders(<AdminDashboard />));
    fireEvent.click(within(admin.container).getByRole('button', { name: /Mesas & Reservaciones/i }));
    const waiter = render(withProviders(<WaiterDashboard />));
    expect(within(waiter.container).getByRole('button', { name: /Mesa 06/i })).toHaveTextContent('Libre');

    const landing = render(<ReservationModal onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.change(within(landing.container).getByPlaceholderText(/Angel Salazar/i), { target: { value: 'Ana Pérez' } });
    fireEvent.change(within(landing.container).getByPlaceholderText(/8888-8888/i), { target: { value: '88881234' } });
    fireEvent.click(within(landing.container).getByRole('button', { name: /CONFIRMAR RESERVACIÓN/i }));

    // Admin: lista "Reservaciones activas" sin recargar.
    const activeList = within(admin.container).getByRole('region', { name: /Reservaciones activas/i });
    await waitFor(() => expect(within(activeList).getByText('Ana Pérez')).toBeInTheDocument());
    expect(within(activeList).getByText(/Mesa 06/)).toBeInTheDocument();
    expect(within(activeList).getByText(/Reserva web/)).toBeInTheDocument();

    // Mesero: la mesa asignada cambia a Reservada con el nombre del cliente.
    const table = within(waiter.container).getByRole('button', { name: /Mesa 06/i });
    expect(table).toHaveTextContent('Reservada');
    expect(table).toHaveTextContent('Ana Pérez');
    expect(table.className).toContain('border-purple-500/50');
  });

  it('una comanda del Mesero aparece en Cocina y actualiza los contadores de Caja', () => {
    const kitchen = render(withProviders(<KitchenDashboard />));
    const cashier = render(withProviders(<CashierDashboard />));
    expect(within(cashier.container).getByTestId('cashier-kitchen-orders')).toHaveTextContent('0');
    expect(within(kitchen.container).queryByText('Mesa 01')).not.toBeInTheDocument();

    const waiter = render(withProviders(<WaiterDashboard />));
    fireEvent.click(within(waiter.container).getByRole('button', { name: /Mesa 01/i }));
    const product = within(waiter.container).getByText('Chifrijo Especial de Paila').closest('div[class*="rounded-xl"]');
    fireEvent.click(within(product).getByTitle('Agregar a comanda'));
    fireEvent.click(within(product).getByTitle('Agregar a comanda'));
    fireEvent.click(within(waiter.container).getByRole('button', { name: /Despachar Comanda a Cocina/i }));

    expect(within(kitchen.container).getByText('Mesa 01')).toBeInTheDocument();
    expect(within(cashier.container).getByTestId('cashier-kitchen-orders')).toHaveTextContent('1');
    expect(within(cashier.container).getByTestId('cashier-kitchen-items')).toHaveTextContent('2');

    // Cocina marca la comanda como lista: el cambio se persiste para Caja.
    const order = within(kitchen.container).getByText('Mesa 01').closest('[class*="rounded-3xl"]');
    fireEvent.click(within(order).getByRole('button', { name: /Listo Servir/i }));
    expect(readCollection(KITCHEN_ORDERS_KEY)[0].estado).toBe('Listo');
    expect(within(cashier.container).getByTestId('cashier-kitchen-orders')).toHaveTextContent('0');
  });

  it('refleja cambios hechos en otra pestaña (evento storage)', () => {
    const cashier = render(withProviders(<CashierDashboard />));
    localStorage.setItem(KITCHEN_ORDERS_KEY, JSON.stringify([{ id: 'ORD-X', sede: 'escazu', estado: 'En Paila', items: [{ cantidad: 3, listo: false }] }]));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: KITCHEN_ORDERS_KEY }));
    });
    expect(within(cashier.container).getByTestId('cashier-kitchen-orders')).toHaveTextContent('1');
    expect(within(cashier.container).getByTestId('cashier-kitchen-items')).toHaveTextContent('3');
  });
});
