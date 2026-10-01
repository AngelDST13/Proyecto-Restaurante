import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FacturacionPanel from '../components/FacturacionPanel';

describe('FacturacionPanel: caja, ventas e inventario', () => {
  beforeEach(() => localStorage.clear());

  it('abre caja, registra ventas y compras, emite factura simulada y permite arqueo', () => {
    const onPurchase = vi.fn();
    render(<FacturacionPanel sede="cartago" sedeNombre="Cartago" inventory={[]} onPurchase={onPurchase} />);

    fireEvent.change(screen.getByLabelText('Monto inicial'), { target: { value: '15000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir caja' }));

    fireEvent.change(screen.getByLabelText('Cliente de venta'), { target: { value: 'Cliente QA' } });
    fireEvent.change(screen.getByLabelText('Cédula del cliente'), { target: { value: '101230456' } });
    fireEvent.change(screen.getByLabelText('Detalle de venta'), { target: { value: 'Chifrijo' } });
    fireEvent.change(screen.getByLabelText('Subtotal de venta'), { target: { value: '10000' } });
    fireEvent.change(screen.getByLabelText('Método de pago'), { target: { value: 'SINPE Móvil' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar venta' }));
    expect(screen.getByRole('article', { name: 'Factura emitida' })).toBeInTheDocument();
    expect(screen.getByText(/Clave numérica simulada:/)).toBeInTheDocument();
    expect(screen.getByAltText('Código QR para soporte por WhatsApp')).toHaveAttribute('src', expect.stringContaining('qrserver.com'));
    const invoice = screen.getByRole('article', { name: 'Factura emitida' });
    expect(within(invoice).getByText(/IVA 13%:/)).toBeInTheDocument();
    expect(within(invoice).getByText(/Total: ₡11.?300/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Insumo comprado'), { target: { value: 'Carne' } });
    fireEvent.change(screen.getByLabelText('Cantidad comprada'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Costo de compra'), { target: { value: '3500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar compra' }));
    expect(onPurchase).toHaveBeenCalledWith(expect.objectContaining({ insumo: 'Carne', cantidad: 4, costo: 3500, sede: 'cartago' }));

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar caja y registrar arqueo' }));
    expect(screen.getByRole('status')).toHaveTextContent('Cierre registrado');
    expect(JSON.parse(localStorage.getItem('cacique_cashier_cartago')).cashOpen).toBe(false);
  });
});
