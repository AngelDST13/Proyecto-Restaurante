import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
});
