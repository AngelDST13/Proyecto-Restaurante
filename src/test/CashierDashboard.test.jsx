import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import AppRouter from '../routes/AppRouter';
import PublicRoute from '../routes/PublicRoute';
import Login from '../pages/Login';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { TalkBackProvider } from '../context/TalkBackContext';
import { CASHIER_ORDERS_STORAGE_KEY, enqueueCashierOrder, getCashierOrders, recordCashierSale, removeCashierOrder } from '../services/cashierService';

const { authContext } = vi.hoisted(() => ({
  authContext: {
    user: { email: 'cajero.escazu@elcacique.com', nombre: 'Cajero QA', rol: 'cajero', sede: 'escazu' },
    logout: vi.fn(),
    inactivityToast: false,
    setInactivityToast: vi.fn(),
    loginWithCredentials: vi.fn(),
    registerClient: vi.fn()
  }
}));

vi.mock('../context/AuthContext', () => ({ useAuth: () => authContext }));
vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: vi.fn(() => () => {})
}));

const cashierMocks = vi.hoisted(() => ({ failQueueSync: false }));
vi.mock('../services/cashierService', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    removeCashierOrder: (...args) => (cashierMocks.failQueueSync ? false : actual.removeCashierOrder(...args))
  };
});

function CurrentPath() {
  return <span data-testid="current-cashier-path">{useLocation().pathname}</span>;
}

const renderApp = (path = '/cashier') => render(<TalkBackProvider><AccessibilityProvider><MemoryRouter initialEntries={[path]}><AppRouter /><CurrentPath /></MemoryRouter></AccessibilityProvider></TalkBackProvider>);
const createMemoryStorage = (initialValue = null, failures = {}) => {
  let value = initialValue;
  return {
    getItem: () => { if (failures.read) throw new Error('read failed'); return value; },
    setItem: (_key, nextValue) => { if (failures.write) throw new Error('write failed'); value = nextValue; }
  };
};

describe('CashierDashboard y acceso por roles', () => {
  beforeEach(() => {
    localStorage.clear();
    cashierMocks.failQueueSync = false;
    authContext.logout.mockClear();
    authContext.user = { email: 'cajero.escazu@elcacique.com', nombre: 'Cajero QA', rol: 'cajero', sede: 'escazu' };
  });

  it('abre la ruta de caja y completa apertura, cobro, factura y arqueo', async () => {
    const printInvoice = vi.spyOn(window, 'print').mockImplementation(() => {});
    localStorage.setItem(CASHIER_ORDERS_STORAGE_KEY, JSON.stringify([{
      id: 'order-qa-1', sede: 'escazu', tableId: 7, mesa: 'Mesa 07', cliente: 'Cliente QA', cedula: '101230456',
      descripcion: '1 x Chifrijo QA', items: [{ nombre: 'Chifrijo QA', cantidad: 1, precio: 10000 }],
      subtotal: 10000, iva: 1300, servicio: 1000, total: 12300, pago: 'Efectivo', status: 'pending'
    }]));
    renderApp();

    expect(screen.getByRole('heading', { name: 'Panel de Cajero' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mapa de Mesas y Cuentas Activas' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Dibujo ilustrado del Cacique' })).toHaveAttribute('src', expect.stringContaining('Cacique.svg'));
    expect(screen.getByRole('button', { name: 'Mesa 02: Disponible' })).toHaveClass('bg-emerald-950/30');
    fireEvent.click(screen.getByRole('button', { name: 'Mesa 02: Disponible' }));
    expect(screen.getByText('Mesa 02 está disponible.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mesa 07: Pidiendo Cuenta' })).toHaveClass('bg-amber-500/20');
    fireEvent.click(screen.getByRole('button', { name: 'Mesa 07: Pidiendo Cuenta' }));
    expect(screen.getByRole('region', { name: 'Comanda activa Mesa 07' })).toHaveTextContent('1 × Chifrijo QA');
    expect(screen.getByText(/Servicio 10%/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Monto inicial'), { target: { value: '10000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir caja' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mesa 07: Pidiendo Cuenta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cobrar Efectivo' }));

    // Cobro normal: el comprobante se anuncia como recibo, no como factura electrónica.
    const invoice = await screen.findByRole('article', { name: 'Recibo de caja' });
    expect(within(invoice).getByText('Cliente: Cliente QA')).toBeInTheDocument();
    expect(within(invoice).getByText('Forma de pago: Efectivo')).toBeInTheDocument();
    expect(within(invoice).getByText(/Clave de Hacienda de demostración/).parentElement).toHaveTextContent(/\d{50}/);
    expect(within(invoice).getByRole('link', { name: 'Abrir soporte WhatsApp de la factura' })).toHaveAttribute('href', expect.stringContaining('wa.me'));
    expect(JSON.parse(localStorage.getItem('cacique_cashier_escazu')).sales).toEqual(expect.arrayContaining([
      expect.objectContaining({ orderId: 'order-qa-1', total: 12300, pago: 'Efectivo' })
    ]));
    expect(JSON.parse(localStorage.getItem(CASHIER_ORDERS_STORAGE_KEY))).toEqual([]);
    expect(JSON.parse(localStorage.getItem('cacique_cashier_escazu')).sales[0].pago).toBe('Efectivo');
    expect(screen.getByRole('button', { name: 'Mesa 07: Disponible' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Comanda activa Mesa 07' })).not.toBeInTheDocument();

    fireEvent.click(within(invoice).getByRole('button', { name: 'Imprimir factura' }));
    expect(printInvoice).toHaveBeenCalledOnce();
    const toastText = screen.getByText(/Cuenta de Mesa 07 cobrada/i);
    fireEvent.click(toastText.parentElement.querySelector('button'));
    expect(screen.queryByText(/Cuenta de Mesa 07 cobrada/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
    fireEvent.click(screen.getByRole('button', { name: 'Exportar Excel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Exportar JSON' }));

    fireEvent.change(screen.getByLabelText('Dinero contado al cierre'), { target: { value: '22300' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar caja y registrar arqueo' }));
    expect(screen.getByRole('status')).toHaveTextContent(/Cierre registrado.*ventas brutas.*IVA 13%.*diferencia/i);
    expect(JSON.parse(localStorage.getItem('cacique_cashier_escazu'))).toMatchObject({ cashOpen: false, countedAmount: 22300 });
  });

  it('mantiene el rol cajero fuera de la ruta exclusiva del mesero', () => {
    renderApp('/waiter');
    expect(screen.getByRole('heading', { name: /403 — Acceso Restringido/i })).toBeInTheDocument();
    expect(screen.queryByText('Terminal POS Salón')).not.toBeInTheDocument();
  });

  it('redirige al Login si se solicita la caja sin sesión autenticada', async () => {
    authContext.user = null;
    renderApp('/cashier');
    await waitFor(() => expect(screen.getByTestId('current-cashier-path')).toHaveTextContent('/login'));
    expect(screen.getByRole('heading', { name: 'Acceso al Sistema' })).toBeInTheDocument();
  });

  it('canoniza el alias de ruta del panel cajero', async () => {
    renderApp('/cashierdashboard');
    await waitFor(() => expect(screen.getByTestId('current-cashier-path')).toHaveTextContent('/cashier'));
  });

  it('redirige rutas desconocidas al Login cuando no hay sesión', async () => {
    authContext.user = null;
    renderApp('/ruta-inexistente');
    await waitFor(() => expect(screen.getByTestId('current-cashier-path')).toHaveTextContent('/login'));
  });

  it.each([
    [null, 'Login route'],
    [{ rol: 'administrador' }, 'Admin route'],
    [{ rol: 'cajero' }, 'Cashier route'],
    [{ rol: 'cocina' }, 'Kitchen route'],
    [{ rol: 'mesero' }, 'Waiter route'],
    [{ rol: 'cliente' }, 'Menu route']
  ])('redirige PublicRoute por rol a %s', (user, expectedText) => {
    authContext.user = user;
    render(<MemoryRouter initialEntries={['/login']}><Routes>
      <Route path="/login" element={<PublicRoute><span>Login route</span></PublicRoute>} />
      <Route path="/admin" element={<span>Admin route</span>} />
      <Route path="/cashier" element={<span>Cashier route</span>} />
      <Route path="/kitchen" element={<span>Kitchen route</span>} />
      <Route path="/waiter" element={<span>Waiter route</span>} />
      <Route path="/menu" element={<span>Menu route</span>} />
    </Routes></MemoryRouter>);
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it('muestra el estado vacío y no permite cobrar si la caja no se ha abierto', async () => {
    renderApp();
    expect(screen.getByText('No hay cuentas pendientes de cobro.')).toBeInTheDocument();

    localStorage.setItem(CASHIER_ORDERS_STORAGE_KEY, JSON.stringify([{
      id: 'order-closed', sede: 'escazu', tableId: 3, mesa: 'Mesa 03', cliente: 'QA', descripcion: 'Venta QA',
      subtotal: 1000, iva: 130, servicio: 100, total: 1230, pago: 'Efectivo', status: 'pending'
    }]));
    window.dispatchEvent(new Event('cacique-cashier-orders-updated'));
    await screen.findByRole('button', { name: 'Mesa 03: Pidiendo Cuenta' });
    fireEvent.click(screen.getByRole('button', { name: 'Mesa 03: Pidiendo Cuenta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cobrar Efectivo' }));

    expect(screen.getByText('La caja de esta sede está cerrada.')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(CASHIER_ORDERS_STORAGE_KEY))).toHaveLength(1);
    expect(screen.queryByRole('article', { name: /Factura electrónica de demostración|Recibo de caja/ })).not.toBeInTheDocument();
  });

  it('refresca la cola solo para cambios de caja y normaliza el alias de ruta', async () => {
    renderApp('/cashierdashboard');
    expect(screen.getByRole('heading', { name: 'Panel de Cajero' })).toBeInTheDocument();
    expect(screen.getByText('No hay cuentas pendientes de cobro.')).toBeInTheDocument();

    localStorage.setItem(CASHIER_ORDERS_STORAGE_KEY, JSON.stringify([{
      id: 'order-storage', sede: 'escazu', tableId: 4, mesa: 'Mesa 04', total: 123, status: 'pending'
    }]));
    window.dispatchEvent(new StorageEvent('storage', { key: 'unrelated-key' }));
    expect(screen.getByText('No hay cuentas pendientes de cobro.')).toBeInTheDocument();
    window.dispatchEvent(new StorageEvent('storage', { key: CASHIER_ORDERS_STORAGE_KEY }));
    expect(await screen.findByText('Mesa 04')).toBeInTheDocument();
  });

  it('muestra el cajero de turno por defecto, etiqueta mesas numeradas y avisa si la cola no se sincroniza', () => {
    authContext.user = { rol: 'cajero', sede: 'heredia' };
    localStorage.setItem('cacique_cashier_heredia', JSON.stringify({ cashOpen: true, openingAmount: 0, sales: [] }));
    localStorage.setItem(CASHIER_ORDERS_STORAGE_KEY, JSON.stringify([
      { id: 'order-mesa', sede: 'heredia', tableId: 2, mesa: 'Mesa 02', total: 900, status: 'pending' },
      { id: 'order-sin-nombre', sede: 'heredia', tableId: 6, total: 650, subtotal: 500, iva: 65, servicio: 50, status: 'pending' }
    ]));
    renderApp();

    expect(screen.getByText('Turno de Cajero de turno')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mesa 02: Pidiendo Cuenta' }));
    expect(screen.getByRole('region', { name: /Comanda activa Mesa 02/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mesa 06: Pidiendo Cuenta' }));
    expect(screen.getByRole('region', { name: /Comanda activa Mesa 06/ })).toBeInTheDocument();

    cashierMocks.failQueueSync = true;
    fireEvent.click(screen.getByRole('button', { name: 'Cobrar Efectivo' }));
    expect(screen.getByText(/actualice la cola para sincronizar la cuenta/i)).toBeInTheDocument();
  });

  it('rechaza un método de pago ajeno a las opciones del POS', () => {
    localStorage.setItem('cacique_cashier_escazu', JSON.stringify({ cashOpen: true, openingAmount: 5000, sales: [] }));
    localStorage.setItem(CASHIER_ORDERS_STORAGE_KEY, JSON.stringify([{
      id: 'order-invalid-payment', sede: 'escazu', tableId: 5, mesa: 'Mesa 05', cliente: 'QA', descripcion: 'Venta QA',
      subtotal: 1000, iva: 130, servicio: 100, total: 1230, pago: 'Criptomoneda', status: 'pending'
    }]));
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'Mesa 05: Pidiendo Cuenta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Emitir Factura Electrónica' }));
    expect(screen.getByText('Seleccione un método de pago válido.')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('cacique_cashier_escazu'))).toMatchObject({ cashOpen: true, sales: [] });
  });

  it('valida colas, evita comandas duplicadas y maneja almacenamiento ilegible', () => {
    expect(getCashierOrders('escazu', createMemoryStorage('{invalid'))).toEqual([]);
    expect(getCashierOrders('escazu', createMemoryStorage('{}'))).toEqual([]);
    expect(getCashierOrders('escazu', createMemoryStorage(null, { read: true }))).toEqual([]);
    expect(enqueueCashierOrder(null)).toMatchObject({ success: false });
    expect(enqueueCashierOrder({ sede: 'escazu', tableId: 1, total: 0 })).toMatchObject({ success: false });
    expect(enqueueCashierOrder({ sede: 'escazu', tableId: 1, total: 100 }, createMemoryStorage(null, { read: true }))).toMatchObject({ success: false });
    expect(enqueueCashierOrder({ sede: 'escazu', tableId: 1, total: 100 }, createMemoryStorage(null, { write: true }))).toMatchObject({ success: false });

    const existing = { id: 'pending-1', sede: 'escazu', tableId: 1, status: 'pending' };
    const duplicate = enqueueCashierOrder({ sede: 'escazu', tableId: 1, total: 500 }, createMemoryStorage(JSON.stringify([existing])));
    expect(duplicate).toMatchObject({ success: true, duplicate: true, order: existing });
  });

  it('retira comandas y hace idempotente el registro cuando el almacenamiento falla o repite orden', () => {
    const ordersStorage = createMemoryStorage(JSON.stringify([{ id: 'one' }]));
    expect(removeCashierOrder('one', ordersStorage)).toBe(true);
    expect(removeCashierOrder('one', createMemoryStorage('{broken'))).toBe(false);
    expect(removeCashierOrder('one', createMemoryStorage('[]', { write: true }))).toBe(false);

    const sale = { sede: 'escazu', cliente: 'QA', cedula: '', descripcion: 'Prueba', subtotal: 100, iva: 13, total: 123, pago: 'Efectivo', fecha: '2026-10-01', orderId: 'order-1' };
    expect(recordCashierSale(sale, createMemoryStorage('{broken'))).toMatchObject({ success: false, message: 'No se pudo leer el estado de la caja.' });
    const priorSale = { orderId: 'order-1', total: 123 };
    const duplicateState = { cashOpen: true, processedOrderIds: ['order-1'], sales: [priorSale] };
    expect(recordCashierSale(sale, createMemoryStorage(JSON.stringify(duplicateState)))).toMatchObject({ success: true, duplicate: true, sale: priorSale });
    expect(recordCashierSale(sale, createMemoryStorage(JSON.stringify({ cashOpen: true }), { write: true }))).toMatchObject({ success: false, message: 'No se pudo guardar el cobro en la caja.' });
  });

  it('muestra credenciales compactas por sede y autocompleta el formulario', () => {
    render(<TalkBackProvider><AccessibilityProvider><MemoryRouter><Login /></MemoryRouter></AccessibilityProvider></TalkBackProvider>);
    fireEvent.click(screen.getByRole('button', { name: /Accesos Rápidos de Prueba/i }));
    fireEvent.click(screen.getByRole('tab', { name: 'Cartago' }));
    const cashierCredential = screen.getByText('cajero.cartago@elcacique.com').closest('article');
    fireEvent.click(within(cashierCredential).getByRole('button', { name: 'Autocompletar' }));

    expect(screen.getByPlaceholderText(/admin@elcacique.com/i)).toHaveValue('cajero.cartago@elcacique.com');
    expect(screen.getByPlaceholderText('••••••••••••')).toHaveValue('CajaCartago2026!');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

