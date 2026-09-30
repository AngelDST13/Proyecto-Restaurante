import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { within } from '@testing-library/react';
import Menu from '../pages/Menu';

describe('Menú digital y sedes exclusivas', () => {
  it('muestra el aviso de exclusividad y permite seleccionar sede', () => {
    render(<Menu />);
    expect(screen.getByText(/Nota de exclusividad/i)).toBeInTheDocument();
    const selector = screen.getByRole('combobox');
    fireEvent.change(selector, { target: { value: 'Sede Cartago' } });
    expect(selector).toHaveValue('Sede Cartago');
    expect(screen.getByText('No disponible en Sede Cartago')).toBeInTheDocument();
  });

  it('filtra por categoría y bloquea el platillo no disponible en la sede elegida', () => {
    render(<Menu />);
    fireEvent.click(screen.getByRole('button', { name: /Cortes a la Leña/i }));
    expect(screen.getByText('Corte Especial de Tira')).toBeInTheDocument();
    expect(screen.queryByText('Chifrijo Especial de Paila')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Sede Cartago' } });
    expect(screen.getByRole('button', { name: /No disponible/i })).toBeDisabled();
  });

  it('gestiona el carrito, abre/cierra el aviso y confirma el pedido de WhatsApp', () => {
    localStorage.removeItem('elcacique_cart');
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<Menu />);
    fireEvent.click(screen.getByRole('button', { name: /Cortes a la Leña/i }));
    const exclusiveCard = screen.getByText('Corte Especial de Tira').closest('div[class*="group"]');
    fireEvent.click(within(exclusiveCard).getByRole('button', { name: /Agregar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ver Pedido/i }));
    const cartRow = screen.getAllByText('Corte Especial de Tira')[1].closest('div[class*="rounded-2xl border"]');
    fireEvent.click(within(cartRow).getAllByRole('button')[1]);
    expect(screen.getByText('Total Estimado:').parentElement).toHaveTextContent(/30\s?750/);
    fireEvent.click(screen.getByRole('button', { name: /Solicitar Pedido por WhatsApp/i }));
    expect(screen.getByRole('heading', { name: 'Procesamiento de Pedidos' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Regresar' }));
    fireEvent.click(screen.getByRole('button', { name: /Solicitar Pedido por WhatsApp/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continuar a WhatsApp/i }));
    expect(open).toHaveBeenCalledWith(expect.stringContaining('wa.me/50622008888'), '_blank');
    expect(screen.queryByRole('button', { name: /Ver Pedido/i })).not.toBeInTheDocument();
    open.mockRestore();
  });
});
