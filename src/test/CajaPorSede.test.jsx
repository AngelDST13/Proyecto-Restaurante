import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import WaiterDashboard from '../pages/WaiterDashboard';
import { recordCashierSale } from '../services/cashierService';

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
    render(<AuthProvider><MemoryRouter><WaiterDashboard /></MemoryRouter></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: /Mesa 02/i }));
    const product = screen.getByText('Chifrijo Especial de Paila').closest('div[class*="rounded-xl"]');
    fireEvent.click(within(product).getByTitle('Agregar a comanda'));
    fireEvent.click(screen.getByRole('button', { name: /Generar Pre-cuenta/i }));
  };

  it('guarda el cobro del mesero y libera la mesa únicamente con caja abierta', () => {
    localStorage.setItem('cacique_cashier_escazu', JSON.stringify({ cashOpen: true, openingAmount: 5000, sales: [] }));
    openTableReceipt();
    fireEvent.click(screen.getByRole('button', { name: 'Cobrar y cerrar cuenta' }));

    const cashier = JSON.parse(localStorage.getItem('cacique_cashier_escazu'));
    expect(cashier.sales).toHaveLength(1);
    expect(cashier.sales[0]).toMatchObject({ pago: 'Tarjeta', cliente: 'Cliente de mesa' });
    expect(cashier.sales[0].total).toBeGreaterThan(0);
    expect(screen.getByText('Cobro registrado en caja Escazú')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('conserva la mesa y el comprobante si la caja de la sede está cerrada', () => {
    openTableReceipt();
    fireEvent.click(screen.getByRole('button', { name: 'Cobrar y cerrar cuenta' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('La caja de esta sede está cerrada.')).toBeInTheDocument();
    expect(localStorage.getItem('cacique_cashier_escazu')).toBeNull();
  });
});