import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import WaiterDashboard from '../pages/WaiterDashboard';
import { CASHIER_ORDERS_STORAGE_KEY, recordCashierSale } from '../services/cashierService';

const saleDetails = {
  sede: 'cartago',
  cliente: '<script>alert(1)</script>Cliente QA',
  cedula: '101230456',
  descripcion: '<b>Chifrijo</b>',
  subtotal: 10000,
  iva: 1300,
  total: 11300,
  pago: 'Efectivo',
  fecha: '2026-10-01T12:00:00.000Z'
};

describe('Cobros POS por sede', () => {
  beforeEach(() => localStorage.clear());

  it.each(['Efectivo', 'Tarjeta', 'SINPE Móvil'])('registra y sanea pagos de tipo %s en la caja de su sede', pago => {
    localStorage.setItem('cacique_cashier_cartago', JSON.stringify({ cashOpen: true, openingAmount: 5000, sales: [] }));
    const result = recordCashierSale({ ...saleDetails, pago });

    expect(result.success).toBe(true);
    expect(result.sale).toMatchObject({ cliente: 'Cliente QA', descripcion: 'Chifrijo', pago, total: 11300 });
    expect(JSON.parse(localStorage.getItem('cacique_cashier_cartago')).sales).toHaveLength(1);
    expect(localStorage.getItem('cacique_cashier_escazu')).toBeNull();
  });

  it('rechaza cobros con caja cerrada, montos inválidos y método desconocido', () => {
    localStorage.setItem('cacique_cashier_cartago', JSON.stringify({ cashOpen: false, sales: [] }));
    expect(recordCashierSale(saleDetails)).toMatchObject({ success: false, message: 'La caja de esta sede está cerrada.' });
    expect(recordCashierSale({ ...saleDetails, total: -1 })).toMatchObject({ success: false });
    expect(recordCashierSale({ ...saleDetails, pago: 'Criptomoneda' })).toMatchObject({ success: false });
    expect(recordCashierSale({ ...saleDetails, sede: 'escazu' })).toMatchObject({ success: false, message: 'La caja de esta sede está cerrada.' });
  });

  const openTableReceipt = () => {
    render(<AccessibilityProvider><AuthProvider><MemoryRouter><WaiterDashboard /></MemoryRouter></AuthProvider></AccessibilityProvider>);
    fireEvent.click(screen.getByRole('button', { name: /Mesa 02/i }));
    const product = screen.getByText('Chifrijo Especial de Paila').closest('div[class*="rounded-xl"]');
    fireEvent.click(within(product).getByTitle('Agregar a comanda'));
    fireEvent.click(screen.getByRole('button', { name: /Generar Pre-cuenta/i }));
  };

  it('envía la cuenta del mesero a la cola de caja sin registrar un cobro', () => {
    openTableReceipt();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar cuenta a caja' }));

    const orders = JSON.parse(localStorage.getItem(CASHIER_ORDERS_STORAGE_KEY));
    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({ sede: 'escazu', tableId: 2, mesa: 'Mesa 02', pago: 'Tarjeta', status: 'pending' });
    expect(orders[0].total).toBeGreaterThan(0);
    expect(localStorage.getItem('cacique_cashier_escazu')).toBeNull();
    expect(screen.getByText('Cuenta enviada a caja Escazú')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('permite encolar cuentas aunque la caja esté cerrada para que el cajero las liquide después', () => {
    openTableReceipt();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar cuenta a caja' }));

    expect(JSON.parse(localStorage.getItem(CASHIER_ORDERS_STORAGE_KEY))).toHaveLength(1);
    expect(localStorage.getItem('cacique_cashier_escazu')).toBeNull();
  });
});