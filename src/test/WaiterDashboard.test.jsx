import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import WaiterDashboard from '../pages/WaiterDashboard';

const renderWaiter = () => render(<AuthProvider><MemoryRouter><WaiterDashboard /></MemoryRouter></AuthProvider>);

describe('WaiterDashboard POS', () => {
  it('calcula subtotal, IVA y servicio al agregar un platillo', () => {
    renderWaiter();
    fireEvent.click(screen.getByRole('button', { name: /Mesa 01/i }));
    const menuItem = screen.getByText('Chifrijo Especial de Paila').closest('div[class*="rounded-xl"]');
    fireEvent.click(within(menuItem).getByTitle('Agregar a comanda'));
    expect(screen.getByText('Subtotal:').parentElement).toHaveTextContent(/6\s?800/);
    expect(screen.getByText('Total Comanda:').parentElement).toHaveTextContent(/8\s?364/);
  });

  it('permite dividir la cuenta y valida los datos fiscales requeridos', () => {
    renderWaiter();
    fireEvent.click(screen.getByRole('button', { name: /Mesa 02/i }));
    fireEvent.click(screen.getByRole('button', { name: /Dividir cuenta/i }));
    expect(screen.getByText(/Total dividido:/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Factura electrónica/i));
    fireEvent.click(screen.getByRole('button', { name: /Generar Factura/i }));
    expect(screen.getByText(/complete nombre o razón social, cédula, actividad económica y correo/i)).toBeInTheDocument();
  });

  it('asigna cliente, ajusta cantidades, elimina ítems y genera borrador fiscal', () => {
    renderWaiter();
    fireEvent.click(screen.getByRole('button', { name: /Mesa 01/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Asignar' }));
    expect(screen.getByText(/Seleccione una mesa e indique el nombre/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Nombre del cliente'), { target: { value: 'Cliente QA' } });
    fireEvent.click(screen.getByRole('button', { name: 'Asignar' }));
    expect(screen.getByText('Cliente QA')).toBeInTheDocument();

    const menuProduct = screen.getByText('Chifrijo Especial de Paila').closest('div[class*="rounded-xl"]');
    fireEvent.click(within(menuProduct).getByTitle('Agregar a comanda'));
    fireEvent.click(within(menuProduct).getByTitle('Agregar a comanda'));
    expect(screen.getByText('Ítems Seleccionados (2):')).toBeInTheDocument();
    const orderItem = screen.getAllByText('Chifrijo Especial de Paila')[1].closest('div[class*="p-2 bg-[#07090E]/60"]');
    fireEvent.click(within(orderItem).getAllByRole('button')[0]);
    expect(screen.getByText('Ítems Seleccionados (1):')).toBeInTheDocument();
    fireEvent.click(within(orderItem).getAllByRole('button')[2]);
    expect(screen.getByText('Ítems Seleccionados (0):')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Mesa 02/i }));
    fireEvent.click(screen.getByLabelText(/Factura electrónica/i));
    fireEvent.change(screen.getByPlaceholderText('Nombre registrado del cliente'), { target: { value: 'Razón QA S.A.' } });
    fireEvent.change(screen.getByPlaceholderText('Identificación del cliente'), { target: { value: '3101123456' } });
    fireEvent.change(screen.getByPlaceholderText('cliente@correo.com'), { target: { value: 'qa@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Generar Factura/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByText(/Factura electrónica/i)).toBeInTheDocument();
  });

  it('filtra mesas y productos, cambia de piso y envía una comanda a cocina', () => {
    renderWaiter();
    const tableSearch = screen.getByRole('searchbox', { name: /Buscar por número de mesa/i });
    fireEvent.change(tableSearch, { target: { value: 'Mesa 02' } });
    expect(screen.getByRole('button', { name: /Mesa 02/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mesa 01/i })).not.toBeInTheDocument();
    fireEvent.change(tableSearch, { target: { value: '   ' } });

    fireEvent.click(screen.getByRole('button', { name: /Piso 2 \(Terraza\)/i }));
    fireEvent.click(screen.getByRole('button', { name: /Mesa T1/i }));
    fireEvent.click(screen.getByRole('button', { name: 'bebidas' }));
    expect(screen.getByText('Cerveza Imperial Helada (350ml)')).toBeInTheDocument();
    expect(screen.queryByText('Chifrijo Especial de Paila')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByTitle('Agregar a comanda')[0]);
    fireEvent.click(screen.getByRole('button', { name: /Despachar Comanda a Cocina/i }));
    expect(screen.getByText(/enviada a Cocina para Mesa T1/i)).toBeInTheDocument();
    expect(screen.getByText('Seleccione mesa')).toBeInTheDocument();
  });
});
