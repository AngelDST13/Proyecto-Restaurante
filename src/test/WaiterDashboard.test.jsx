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
});
