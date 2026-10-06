import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { TalkBackProvider } from '../context/TalkBackContext';
import KitchenDashboard from '../pages/KitchenDashboard';
import CashierDashboard from '../pages/CashierDashboard';
import MenuDigital from '../pages/Menu';
import Landing from '../pages/Landing';
import { KITCHEN_ORDERS_KEY } from '../services/liveSync';
import { CASHIER_ORDERS_STORAGE_KEY } from '../services/cashierService';

/**
 * Flujos de los paneles: KDS (platillos, notas, retrasos), Caja (arqueo,
 * cuentas, facturas), Menu (carrito) y Landing (carrusel, reservas).
 */

const { authContext } = vi.hoisted(() => ({
  authContext: { user: null, logout: vi.fn(), inactivityToast: false, setInactivityToast: vi.fn() }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authContext,
  AuthProvider: ({ children }) => children
}));
vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: () => () => {}
}));

const withProviders = (element) => (
  <TalkBackProvider><AccessibilityProvider><MemoryRouter>{element}</MemoryRouter></AccessibilityProvider></TalkBackProvider>
);

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  authContext.user = null;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/* ------------------------------------------------------------------------ */

describe('KitchenDashboard', () => {
  const kitchenOrder = (overrides = {}) => ({
    id: 'ORD-LIVE',
    mesa: 'Mesa 09',
    piso: 'Piso 2 (Terraza)',
    personas: 4,
    mesero: 'Mesero QA',
    sede: 'escazu',
    estado: 'En Espera',
    minutosTranscurridos: 0,
    items: [{ id: 1, cantidad: 2, nombre: 'Yuca Frita', notas: '', listo: false }],
    ...overrides
  });

  it('marca platillos como listos con un botón accesible', () => {
    authContext.user = { nombre: 'Chef', rol: 'cocina', sede: 'escazu' };
    render(withProviders(<KitchenDashboard />));
    const item = screen.getByRole('button', { name: '2x Chifrijo Especial de Paila: pendiente' });
    expect(item).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(item);
    expect(screen.getByRole('button', { name: '2x Chifrijo Especial de Paila: listo' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('notas rápidas sobre un platillo sin nota previa y cancelar el modal', () => {
    authContext.user = { nombre: 'Chef', rol: 'cocina', sede: 'escazu' };
    localStorage.setItem(KITCHEN_ORDERS_KEY, JSON.stringify([kitchenOrder()]));
    render(withProviders(<KitchenDashboard />));

    const order = screen.getByText('Mesa 09').closest('[class*="rounded-3xl"]');
    fireEvent.click(within(order).getByTitle('Añadir/Editar Nota del Platillo'));
    const textarea = screen.getByPlaceholderText(/Sin cebolla picada/);
    expect(textarea).toHaveValue('');
    const tags = within(textarea.closest('form')).getAllByRole('button').filter((button) => button.type === 'button' && !/Cancelar/.test(button.textContent));
    fireEvent.click(tags[0]);
    expect(textarea.value).not.toBe('');
    fireEvent.click(tags[1]);
    expect(textarea.value).toContain(', ');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByPlaceholderText(/Sin cebolla picada/)).not.toBeInTheDocument();
  });

  it('calcula el tiempo por comensales, marca retrasos y sincroniza', () => {
    authContext.user = { nombre: 'Chef', rol: 'cocina', sede: 'escazu' };
    localStorage.setItem(KITCHEN_ORDERS_KEY, JSON.stringify([kitchenOrder({ minutosTranscurridos: 99 })]));
    render(withProviders(<KitchenDashboard />));

    const order = screen.getByText('Mesa 09').closest('[class*="rounded-3xl"]');
    // 4 comensales -> 10 + 4 * 2.5 = 20 min estimados; 99 min transcurridos = retraso.
    expect(order.className).toContain('border-red-500/60');

    fireEvent.click(screen.getByTitle('Sincronizar Comandas'));
    expect(screen.getByText('Comandas de cocina sincronizadas en tiempo real')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }));
    expect(screen.queryByText('Comandas de cocina sincronizadas en tiempo real')).not.toBeInTheDocument();
  });

  it('muestra un estado vacío si la sede no tiene comandas', () => {
    authContext.user = { nombre: 'Chef', rol: 'cocina', sede: 'limon' };
    render(withProviders(<KitchenDashboard />));
    expect(screen.queryByText('Mesa 02')).not.toBeInTheDocument();
    expect(document.body.textContent).toMatch(/No hay comandas/i);
  });
});

/* ------------------------------------------------------------------------ */

describe('CashierDashboard', () => {
  const seedCash = (state) => localStorage.setItem('cacique_cashier_escazu', JSON.stringify({ cashOpen: true, openingAmount: 10000, sales: [], processedOrderIds: [], ...state }));
  const seedOrders = (orders) => localStorage.setItem(CASHIER_ORDERS_STORAGE_KEY, JSON.stringify(orders.map((order) => ({
    sede: 'escazu', status: 'pending', items: [], cliente: 'Cliente QA', subtotal: 885, iva: 115, total: 1000, ...order
  }))));

  it('usa Escazú si el cajero no tiene sede y el mapa por defecto para sedes desconocidas', () => {
    authContext.user = { nombre: 'Caja', rol: 'cajero' };
    const { unmount } = render(withProviders(<CashierDashboard />));
    expect(screen.getByText(/Sede activa · Escazú/)).toBeInTheDocument();
    unmount();

    authContext.user = { nombre: 'Caja', rol: 'cajero', sede: 'limon' };
    render(withProviders(<CashierDashboard />));
    expect(screen.getAllByRole('button', { name: /Disponible/ })).toHaveLength(24);
  });

  it('calcula efectivo esperado con movimientos de entrada/salida y gastos en efectivo', () => {
    authContext.user = { nombre: 'Caja', rol: 'cajero', sede: 'escazu' };
    const sale = (pago, total) => ({ id: `${pago}-${total}`, cliente: 'QA', descripcion: 'Venta', pago, total, fecha: '2026-10-05T12:00:00.000Z' });
    seedCash({
      sales: [sale('Efectivo', 500), sale('Tarjeta', 700), sale('SINPE Móvil', 300)],
      movements: [{ tipo: 'Entrada', monto: 2000 }, { tipo: 'Salida', monto: 500 }],
      expenses: [{ costo: 1000, pagadoEfectivo: true }, { costo: 9999, pagadoEfectivo: false }]
    });
    localStorage.setItem(KITCHEN_ORDERS_KEY, JSON.stringify([{ id: 'K', sede: 'escazu', estado: 'En Paila', items: [{ listo: false }, { cantidad: 2, listo: false }] }]));
    render(withProviders(<CashierDashboard />));

    // 10000 + 500 + 2000 - 500 - 1000
    expect(screen.getByText('Efectivo esperado').parentElement).toHaveTextContent(/11\D?000/);
    expect(screen.getByTestId('cashier-kitchen-items')).toHaveTextContent('2');
  });

  it('informa si la caja se cerró en otra pestaña y permite cancelar el cierre', () => {
    authContext.user = { nombre: 'Caja', rol: 'cajero', sede: 'escazu' };
    seedCash({});
    render(withProviders(<CashierDashboard />));

    fireEvent.click(screen.getByRole('button', { name: /Cerrar Caja \/ Arqueo Final/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('button', { name: 'Confirmar cierre' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cerrar Caja \/ Arqueo Final/ }));
    seedCash({ cashOpen: false });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cierre' }));
    expect(screen.getByText('La caja de esta sede ya está cerrada.')).toBeInTheDocument();
  });

  it('etiqueta mesas sin nombre, cuentas en consumo y exige método de pago válido', () => {
    authContext.user = { nombre: 'Caja', rol: 'cajero', sede: 'escazu' };
    seedCash({});
    seedOrders([
      { id: 'o1', tableId: 3, mesa: '', estado: 'consumo' },
      { id: 'o2', tableId: 4, mesa: 'Mesa 04', pago: 'Efectivo' }
    ]);
    render(withProviders(<CashierDashboard />));

    const seat = screen.getByRole('button', { name: /Mesa 03: Pidiendo Cuenta/ });
    expect(seat).toHaveTextContent('En Consumo');
    fireEvent.click(seat);
    fireEvent.click(screen.getByRole('button', { name: 'Emitir Factura Electrónica' }));
    expect(screen.getByText('Seleccione un método de pago válido.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Mesa 04: Pidiendo Cuenta/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Emitir Factura Electrónica' }));
    expect(screen.getByRole('article', { name: 'Factura electrónica de demostración' })).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------ */

describe('Menu digital — carrito', () => {
  const renderMenu = () => render(withProviders(<MenuDigital />));

  it('recupera un carrito guardado dañado o con formato incorrecto', () => {
    localStorage.setItem('elcacique_cart', '{roto');
    const { unmount } = renderMenu();
    expect(screen.queryByRole('button', { name: 'Ver pedido actual' })).not.toBeInTheDocument();
    unmount();
    localStorage.setItem('elcacique_cart', '{"no":"lista"}');
    renderMenu();
    expect(screen.queryByRole('button', { name: 'Ver pedido actual' })).not.toBeInTheDocument();
  });

  it('ajusta cantidades, quita platillos y no solicita pedidos vacíos', () => {
    renderMenu();
    const addButtons = screen.getAllByRole('button', { name: /Agregar/ });
    fireEvent.click(addButtons[0]);
    fireEvent.click(addButtons[1]);
    fireEvent.click(addButtons[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Ver pedido actual' }));
    const [first, second] = JSON.parse(localStorage.getItem('elcacique_cart'));
    expect(first.cantidad).toBe(2);
    expect(second.cantidad).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: `Disminuir ${first.nombre}` }));
    fireEvent.click(screen.getByRole('button', { name: `Disminuir ${second.nombre}` }));
    expect(JSON.parse(localStorage.getItem('elcacique_cart'))).toEqual([expect.objectContaining({ id: first.id, cantidad: 1 })]);

    fireEvent.click(screen.getByRole('button', { name: `Quitar ${first.nombre} del pedido` }));
    expect(JSON.parse(localStorage.getItem('elcacique_cart'))).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: /Solicitar Pedido por WhatsApp/ }));
    expect(screen.queryByText('Continuar a WhatsApp')).not.toBeInTheDocument();
  });

  it('cierra la notificación y no actualiza el catálogo tras desmontar', async () => {
    let resolveFetch;
    vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => { resolveFetch = resolve; })));
    const { unmount } = renderMenu();
    unmount();
    await act(async () => resolveFetch({ ok: true, status: 200, json: async () => [{ id: 1, nombre: 'Tarde', precio: 1 }] }));
    vi.unstubAllGlobals();

    renderMenu();
    fireEvent.click(screen.getAllByRole('button', { name: /Agregar/ })[0]);
    const close = await screen.findAllByRole('button', { name: 'Cerrar notificación' });
    fireEvent.click(close[0]);
    await waitFor(() => expect(screen.queryAllByRole('button', { name: 'Cerrar notificación' }).length).toBeLessThan(close.length));
  });
});

/* ------------------------------------------------------------------------ */

describe('Landing', () => {
  it('avanza el carrusel automáticamente cada 5 segundos', () => {
    vi.useFakeTimers();
    render(withProviders(<Landing />));
    const slides = () => [...document.querySelectorAll('#inicio img')].map((img) => img.parentElement.className.includes('opacity-100'));
    expect(slides()).toEqual([true, false, false]);
    act(() => vi.advanceTimersByTime(5000));
    expect(slides()).toEqual([false, true, false]);
  });

  it('muestra el aviso de reserva confirmada y permite cerrarlo', async () => {
    render(withProviders(<Landing />));
    fireEvent.click(screen.getAllByRole('button', { name: /AGENDAR RESERVA/i })[0]);
    fireEvent.change(screen.getByPlaceholderText(/Angel Salazar/i), { target: { value: 'Ana Pérez' } });
    fireEvent.change(screen.getByPlaceholderText(/8888-8888/i), { target: { value: '88881234' } });
    fireEvent.click(screen.getByRole('button', { name: /CONFIRMAR RESERVACIÓN/i }));
    const notice = await screen.findByText(/Reserva registrada para Ana Pérez/);
    fireEvent.click(within(notice.parentElement).getByRole('button', { name: 'Cerrar notificación' }));
    expect(screen.queryByText(/Reserva registrada para Ana Pérez/)).not.toBeInTheDocument();
  });
});
