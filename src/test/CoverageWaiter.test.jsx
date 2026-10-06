import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import WaiterDashboard from '../pages/WaiterDashboard';
import { encryptData } from '../services/authSecurity';
import { CASHIER_ORDERS_STORAGE_KEY } from '../services/cashierService';
import { KITCHEN_ORDERS_KEY } from '../services/liveSync';

/**
 * POS de mesero: avisos de cocina, pisos, comanda en vivo, pre-cuenta,
 * division de cuenta, cupones de registro y envio a caja.
 */

const { authContext } = vi.hoisted(() => ({
  authContext: { user: { nombre: 'Mesero QA', rol: 'mesero', sede: 'escazu' }, logout: vi.fn() }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authContext,
  AuthProvider: ({ children }) => children
}));

const renderWaiter = () => render(<AccessibilityProvider><MemoryRouter><WaiterDashboard /></MemoryRouter></AccessibilityProvider>);
/** Agrega desde la tarjeta del catalogo (el nombre tambien aparece en la comanda). */
const addDish = (name) => {
  const card = screen.getAllByText(name)
    .map((element) => element.closest('div[class*="rounded-xl"]'))
    .find((candidate) => candidate && within(candidate).queryByTitle('Agregar a comanda'));
  fireEvent.click(within(card).getByTitle('Agregar a comanda'));
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('WaiterDashboard — POS completo', () => {
  it('muestra avisos de cocina aunque el evento no traiga id ni hora, y solo de su sede', () => {
    renderWaiter();
    act(() => {
      window.dispatchEvent(new CustomEvent('cacique-live-event', {
        detail: { modulo: 'PEDIDO_MENU', accion: 'NOTIFICAR_MESERO_LISTO', sede: 'heredia', mesa: 'Mesa 99' }
      }));
      window.dispatchEvent(new CustomEvent('cacique-live-event', {
        detail: { modulo: 'PEDIDO_MENU', accion: 'NOTIFICAR_MESERO_LISTO', sede: 'escazu', mesa: 'Mesa 03' }
      }));
    });
    expect(screen.getByText('Cocina avisa: pedido de Mesa 03 listo para servir')).toBeInTheDocument();
    expect(screen.queryByText(/Mesa 99/)).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar notificación' })[0]);
    expect(screen.queryByText('Cocina avisa: pedido de Mesa 03 listo para servir')).not.toBeInTheDocument();
  });

  it('cambia de piso y busca platillos', () => {
    renderWaiter();
    fireEvent.click(screen.getByRole('button', { name: /Piso 2 \(Terraza\)/ }));
    expect(screen.getByRole('button', { name: /Mesa T1/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Piso 1 \(Salón Principal\)/ }));
    fireEvent.click(screen.getByRole('button', { name: /Mesa 01/ }));

    fireEvent.change(screen.getByPlaceholderText('Buscar platillo o bebida...'), { target: { value: 'Cas' } });
    expect(screen.getByText('Refresco Natural de Cas (500ml)')).toBeInTheDocument();
    expect(screen.queryByText('Chifrijo Especial de Paila')).not.toBeInTheDocument();
  });

  it('arma la comanda en vivo y la despacha a cocina con su nota', () => {
    renderWaiter();
    fireEvent.click(screen.getByRole('button', { name: /Mesa 01/ }));
    addDish('Chifrijo Especial de Paila');
    addDish('Refresco Natural de Cas (500ml)');
    addDish('Chifrijo Especial de Paila');

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar Refresco Natural de Cas (500ml)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Disminuir Chifrijo Especial de Paila' }));
    fireEvent.click(screen.getByRole('button', { name: 'Disminuir Chifrijo Especial de Paila' }));
    expect(screen.queryByRole('button', { name: 'Disminuir Chifrijo Especial de Paila' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Nota especial para cocina/), { target: { value: 'Con hielo aparte' } });
    fireEvent.click(screen.getByRole('button', { name: /Despachar Comanda a Cocina/ }));

    const [order] = JSON.parse(localStorage.getItem(KITCHEN_ORDERS_KEY));
    expect(order.items).toEqual([expect.objectContaining({ nombre: 'Refresco Natural de Cas (500ml)', cantidad: 2, notas: 'Con hielo aparte' })]);
  });

  it('genera pre-cuenta dividida con SINPE, la imprime y la envía a caja', () => {
    window.print = vi.fn();
    renderWaiter();
    fireEvent.click(screen.getByRole('button', { name: /Mesa 02/ }));
    fireEvent.change(screen.getByDisplayValue('Tarjeta'), { target: { value: 'Sinpe Móvil' } });
    fireEvent.click(screen.getByRole('button', { name: /Dividir cuenta/ }));
    fireEvent.click(screen.getByRole('button', { name: /Generar Pre-cuenta/ }));

    const dialog = screen.getByRole('dialog', { name: 'Pre-cuenta / tiquete' });
    expect(within(dialog).getByText('Parte 1')).toBeInTheDocument();
    expect(within(dialog).getByText('Parte 2')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Imprimir comprobante' }));
    expect(window.print).toHaveBeenCalledTimes(1);

    // Pulsar dentro del dialogo no lo cierra.
    fireEvent.mouseDown(dialog);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar cuenta a caja' }));
    const [queued] = JSON.parse(localStorage.getItem(CASHIER_ORDERS_STORAGE_KEY));
    expect(queued).toMatchObject({ mesa: 'Mesa 02', pago: 'SINPE Móvil', cliente: 'Cliente de mesa' });
    expect(queued.total).toBe(queued.subtotal + queued.iva + queued.servicio);
  });

  it('cierra la pre-cuenta con el botón o pulsando fuera', () => {
    renderWaiter();
    fireEvent.click(screen.getByRole('button', { name: /Mesa 02/ }));
    fireEvent.click(screen.getByRole('button', { name: /Generar Pre-cuenta/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar pre-cuenta' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Piso 2 \(Terraza\)/ }));
    fireEvent.click(screen.getByRole('button', { name: /Mesa T2/ }));
    fireEvent.click(screen.getByRole('button', { name: /Generar Pre-cuenta/ }));
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('informa si la caja no pudo recibir la cuenta', () => {
    renderWaiter();
    fireEvent.click(screen.getByRole('button', { name: /Mesa 02/ }));
    fireEvent.click(screen.getByRole('button', { name: /Generar Pre-cuenta/ }));
    const originalSet = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function setItem(key, value) {
      if (key === CASHIER_ORDERS_STORAGE_KEY) throw new Error('QuotaExceededError');
      return originalSet.call(this, key, value);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar cuenta a caja' }));
    expect(screen.getByText('No se pudo enviar la cuenta a caja.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('aplica el cupón de registro en una factura electrónica y lo marca como usado', () => {
    localStorage.setItem('cacique_registered_clients', encryptData({
      'ana@correo.com': { nombre: 'Ana', rol: 'cliente', coupon: { code: 'CACIQUE5OFF', discountPercentage: 5 } }
    }));
    renderWaiter();
    fireEvent.click(screen.getByRole('button', { name: /Mesa 02/ }));
    fireEvent.change(screen.getByPlaceholderText('cliente@correo.com'), { target: { value: 'Ana@Correo.com' } });
    fireEvent.click(screen.getByLabelText('Aplicar cupón de bienvenida (5%)'));
    fireEvent.click(screen.getByLabelText(/Factura electrónica \(borrador imprimible\)/));
    fireEvent.change(screen.getByPlaceholderText('Nombre registrado del cliente'), { target: { value: 'Ana Pérez' } });
    fireEvent.change(screen.getByPlaceholderText('Identificación del cliente'), { target: { value: '101230456' } });
    fireEvent.change(screen.getByDisplayValue('561001'), { target: { value: '561002' } });
    fireEvent.click(screen.getByRole('button', { name: /Generar Factura \(borrador\)/ }));

    const dialog = screen.getByRole('dialog', { name: 'Factura electrónica (borrador)' });
    expect(within(dialog).getByText('561002')).toBeInTheDocument();
    expect(within(dialog).getByText('Descuento registro (5%)')).toBeInTheDocument();
    expect(localStorage.getItem('cacique_coupon_used_ana@correo.com_CACIQUE5OFF')).toBe('used');
  });
});
