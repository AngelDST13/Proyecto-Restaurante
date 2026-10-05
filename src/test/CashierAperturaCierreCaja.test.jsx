import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import CashierDashboard from '../pages/CashierDashboard';
import {
  closeCashierRegister,
  getCashierState,
  openCashierRegister,
  recordCashierSale
} from '../services/cashierService';

const baseSale = {  sede: 'escazu',
  cliente: 'Cliente QA',
  cedula: '101230456',
  descripcion: 'Chifrijo',
  subtotal: 10000,
  iva: 1300,
  total: 11300,
  pago: 'Efectivo',
  fecha: '2026-10-01T12:00:00.000Z'
};

// El panel del cajero se monta con una sesión de cajero simulada, de modo que el
// estado de la caja se controla íntegramente desde el test.
const { useAuthMock, logoutMock } = vi.hoisted(() => ({ useAuthMock: vi.fn(), logoutMock: vi.fn() }));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

describe('Apertura y cierre de caja (servicio)', () => {
  beforeEach(() => localStorage.clear());

  it('la caja no arranca cerrada de forma irreversible: se abre con arqueo inicial', () => {
    expect(getCashierState('escazu')).toBeNull();

    const result = openCashierRegister({ sede: 'escazu', openingAmount: 50000 });

    expect(result.success).toBe(true);
    expect(getCashierState('escazu')).toMatchObject({ cashOpen: true, openingAmount: 50000, closedAt: null });
  });

  it('rechaza el arqueo inicial duplicado, la sede inválida y el monto negativo', () => {
    openCashierRegister({ sede: 'escazu', openingAmount: 50000 });

    expect(openCashierRegister({ sede: 'escazu', openingAmount: 50000 })).toMatchObject({
      success: false,
      message: 'La caja de esta sede ya está abierta.'
    });
    expect(openCashierRegister({ sede: '', openingAmount: 50000 })).toMatchObject({ success: false });
    expect(openCashierRegister({ sede: 'escazu', openingAmount: -1 })).toMatchObject({ success: false });
  });

  it('solo permite cobrar con la caja abierta', () => {
    expect(recordCashierSale(baseSale)).toMatchObject({ success: false, message: 'La caja de esta sede está cerrada.' });

    openCashierRegister({ sede: 'escazu', openingAmount: 50000 });
    expect(recordCashierSale(baseSale)).toMatchObject({ success: true });
  });

  it('el arqueo final resume las ventas por método de pago y el efectivo esperado', () => {
    openCashierRegister({ sede: 'escazu', openingAmount: 50000 });
    recordCashierSale({ ...baseSale, total: 10000, pago: 'Efectivo' });
    recordCashierSale({ ...baseSale, total: 20000, pago: 'Tarjeta' });
    recordCashierSale({ ...baseSale, total: 30000, pago: 'SINPE Móvil' });

    const result = closeCashierRegister({ sede: 'escazu' });

    expect(result.success).toBe(true);
    expect(result.summary.byPaymentMethod).toEqual({
      'Efectivo': 10000,
      'Tarjeta': 20000,
      'SINPE Móvil': 30000
    });
    // El efectivo esperado es la caja chica inicial más lo cobrado en efectivo.
    expect(result.summary.expectedCash).toBe(60000);
    expect(result.summary.openingAmount).toBe(50000);
    expect(result.summary.totalSales).toBe(60000);
    expect(result.summary.salesCount).toBe(3);
    expect(result.summary.difference).toBe(0);
  });

  it('compara el efectivo contado contra el esperado y calcula la diferencia', () => {
    // Cada arqueo final cierra la caja, por lo que se reabre entre escenario y
    // escenario para poder comparar distintos conteos de gaveta.
    const closeWithDeclaredCash = declaredCash => {
      // Se reinicia el turno: las ventas se conservan al cerrar, por lo que sin
      // limpiar el storage el efectivo esperado acumularía ventas de otros turnos.
      localStorage.clear();
      openCashierRegister({ sede: 'escazu', openingAmount: 50000 });
      recordCashierSale({ ...baseSale, total: 10000, pago: 'Efectivo' });
      return closeCashierRegister({ sede: 'escazu', declaredCash }).summary.difference;
    };

    expect(closeWithDeclaredCash(60000)).toBe(0);
    expect(closeWithDeclaredCash(59500)).toBe(-500);
    expect(closeWithDeclaredCash(61000)).toBe(1000);
  });

  it('restablece el estado al cerrar y permite reabrir la caja en un nuevo turno', () => {
    openCashierRegister({ sede: 'escazu', openingAmount: 50000 });
    recordCashierSale({ ...baseSale, orderId: 'orden-1' });
    closeCashierRegister({ sede: 'escazu' });

    expect(getCashierState('escazu').cashOpen).toBe(false);
    // El historial de ventas se conserva, pero el turno queda reiniciado.
    expect(getCashierState('escazu').sales).toHaveLength(1);
    expect(getCashierState('escazu').processedOrderIds).toEqual([]);

    // Reabrir con un nuevo arqueo inicial es posible (no es irreversible).
    expect(openCashierRegister({ sede: 'escazu', openingAmount: 25000 })).toMatchObject({ success: true });
    expect(getCashierState('escazu').openingAmount).toBe(25000);
  });

  it('rechaza el cierre si la caja ya está cerrada o la sede es inválida', () => {
    expect(closeCashierRegister({ sede: 'escazu' })).toMatchObject({
      success: false,
      message: 'La caja de esta sede ya está cerrada.'
    });

    openCashierRegister({ sede: 'escazu', openingAmount: 50000 });
    expect(closeCashierRegister({ sede: '' })).toMatchObject({ success: false });
  });

  it('las cajas de cada sede son independientes', () => {
    openCashierRegister({ sede: 'escazu', openingAmount: 50000 });

    expect(getCashierState('cartago')).toBeNull();
    expect(closeCashierRegister({ sede: 'cartago' })).toMatchObject({ success: false });
    expect(getCashierState('escazu').cashOpen).toBe(true);
  });
});

describe('Panel del Cajero: apertura y cierre de caja', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthMock.mockReturnValue({ user: { nombre: 'Cajero QA', rol: 'cajero', sede: 'escazu' }, logout: logoutMock });
  });

  const renderCashier = () => render(
    <AccessibilityProvider>
      <MemoryRouter><CashierDashboard /></MemoryRouter>
    </AccessibilityProvider>,
  );

  it('arranca con la caja cerrada pero ofrece la apertura interactiva', () => {
    renderCashier();

    expect(screen.getByTestId('cash-register-status')).toHaveTextContent('Caja Cerrada');
    expect(screen.getByRole('button', { name: /Abrir Caja \/ Arqueo Inicial/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cerrar Caja \/ Arqueo Final/i })).not.toBeInTheDocument();
  });

  it('abre la caja con el monto de caja chica solicitado y persiste el arqueo', () => {
    renderCashier();

    fireEvent.click(screen.getByRole('button', { name: /Abrir Caja \/ Arqueo Inicial/i }));
    fireEvent.change(screen.getByLabelText(/Monto de caja chica inicial/i), { target: { value: '50000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar apertura' }));

    expect(getCashierState('escazu')).toMatchObject({ cashOpen: true, openingAmount: 50000 });
    expect(screen.getByTestId('cash-register-status')).toHaveTextContent('Caja Abierta');
    expect(screen.getByRole('button', { name: /Cerrar Caja \/ Arqueo Final/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Abrir Caja \/ Arqueo Inicial/i })).not.toBeInTheDocument();
  });

  it('rechaza un monto de caja chica no numérico', () => {
    renderCashier();

    fireEvent.click(screen.getByRole('button', { name: /Abrir Caja \/ Arqueo Inicial/i }));
    fireEvent.change(screen.getByLabelText(/Monto de caja chica inicial/i), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar apertura' }));

    expect(screen.getByText(/monto de caja chica inicial no es válido/i)).toBeInTheDocument();
    expect(screen.getByTestId('cash-register-status')).toHaveTextContent('Caja Cerrada');
  });

  it('cierra la caja y muestra el resumen de ventas por método de pago', () => {
    openCashierRegister({ sede: 'escazu', openingAmount: 50000 });
    recordCashierSale({ ...baseSale, total: 10000, pago: 'Efectivo' });
    recordCashierSale({ ...baseSale, total: 20000, pago: 'Tarjeta' });
    recordCashierSale({ ...baseSale, total: 30000, pago: 'SINPE Móvil' });

    renderCashier();
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Caja \/ Arqueo Final/i }));
    fireEvent.change(screen.getByLabelText(/Efectivo contado en gaveta/i), { target: { value: '60000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cierre' }));

    expect(screen.getByTestId('closing-summary')).toHaveTextContent('Efectivo');
    expect(screen.getByTestId('closing-summary')).toHaveTextContent('Tarjeta');
    expect(screen.getByTestId('closing-summary')).toHaveTextContent('SINPE Móvil');
    // El efectivo esperado (caja chica 50.000 + 10.000 en efectivo) se formatea
    // con el separador de miles de es-CR, que puede ser punto o espacio según
    // los datos de ICU disponibles, por lo que se comparan solo los dígitos.
    expect(screen.getByTestId('closing-summary').textContent.replace(/\D/g, '')).toContain('60000');
    expect(screen.getByTestId('cash-register-status')).toHaveTextContent('Caja Cerrada');
    expect(getCashierState('escazu').cashOpen).toBe(false);
  });

  it('permite cancelar la apertura y el cierre sin alterar el estado', () => {
    renderCashier();

    fireEvent.click(screen.getByRole('button', { name: /Abrir Caja \/ Arqueo Inicial/i }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Cancelar' })[0]);
    expect(screen.queryByLabelText(/Monto de caja chica inicial/i)).not.toBeInTheDocument();
    expect(getCashierState('escazu')).toBeNull();
  });
});
