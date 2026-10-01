import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FacturacionPanel from '../components/FacturacionPanel';
import { createXlsxBlob } from '../services/spreadsheetService';

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

  it('valida el estado de caja, montos y campos antes de aceptar operaciones', () => {
    render(<FacturacionPanel sede="escazu" />);
    fireEvent.submit(screen.getByRole('button', { name: 'Registrar venta' }).closest('form'));
    expect(screen.getByRole('status')).toHaveTextContent('Abra la caja antes de registrar ventas.');

    fireEvent.change(screen.getByLabelText('Monto inicial'), { target: { value: '-1' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Abrir caja' }).closest('form'));
    expect(screen.getByRole('status')).toHaveTextContent('Ingrese un monto inicial válido.');

    fireEvent.change(screen.getByLabelText('Monto inicial'), { target: { value: '5000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir caja' }));
    fireEvent.submit(screen.getByRole('button', { name: 'Registrar venta' }).closest('form'));
    expect(screen.getByRole('status')).toHaveTextContent('Complete cliente, cédula, detalle y subtotal válido.');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar movimiento' }));
    expect(screen.getByRole('status')).toHaveTextContent('Abra la caja y complete monto y motivo del movimiento.');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar compra' }));
    expect(screen.getByRole('status')).toHaveTextContent('Complete insumo, cantidad y costo de compra.');

    fireEvent.change(screen.getByLabelText('Tipo de movimiento'), { target: { value: 'Salida' } });
    fireEvent.change(screen.getByLabelText('Monto del movimiento'), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText('Motivo del movimiento'), { target: { value: 'Compra de hielo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar movimiento' }));
    expect(JSON.parse(localStorage.getItem('cacique_cashier_escazu')).movements[0]).toMatchObject({ tipo: 'Salida', monto: 250, nota: 'Compra de hielo' });
  });

  it('importa reportes financieros CSV validados y rechaza fórmulas o datos incompletos', async () => {
    render(<FacturacionPanel sede="heredia" sedeNombre="Heredia" />);
    const input = screen.getByLabelText('Importar archivo financiero');
    const csv = 'sede,periodo,ventas,costos\n<script>alert(1)</script>Heredia,2026-09,125000,45000';
    fireEvent.change(input, { target: { files: [new File([csv], 'finanzas.csv', { type: 'text/csv' })] } });

    expect(await screen.findByRole('status')).toHaveTextContent('1 registros financieros importados y validados.');
    expect(screen.getByText('Registros financieros importados: 1')).toBeInTheDocument();
    expect(screen.getByText('Heredia')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('cacique_cashier_heredia')).financeImports).toEqual([
      { sede: 'Heredia', periodo: '2026-09', ventas: 125000, costos: 45000 }
    ]);

    const workbook = createXlsxBlob([{ sede: 'Heredia', periodo: '2026-08', ventas: 50000, costos: 18000 }], ['sede', 'periodo', 'ventas', 'costos']);
    fireEvent.change(input, { target: { files: [new File([workbook], 'historico.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })] } });
    await waitFor(() => expect(screen.getByText('Registros financieros importados: 2')).toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem('cacique_cashier_heredia')).financeImports).toHaveLength(2);

    fireEvent.change(input, { target: { files: [new File(['sede,periodo,ventas,costos\nHeredia,2026-09,=1+1,0'], 'formula.csv', { type: 'text/csv' })] } });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Fila 2: sede, periodo, ventas o costos no válidos.'));
    expect(JSON.parse(localStorage.getItem('cacique_cashier_heredia')).financeImports).toHaveLength(2);

    fireEvent.change(input, { target: { files: [new File(['data'], 'finanzas.json', { type: 'application/json' })] } });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Formato no compatible. Seleccione CSV o XLSX.'));
  });
});
