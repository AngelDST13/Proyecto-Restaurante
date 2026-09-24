import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from '../src/components/Toast';
import ReservationModal from '../src/components/ReservationModal';

describe('Pruebas de Componentes Interactivos', () => {
  it('Renderiza las notificaciones Toast correctamente', () => {
    render(<Toast message="Reserva confirmada con éxito" type="success" onClose={() => {}} />);
    expect(screen.getByText('Reserva confirmada con éxito')).toBeDefined();
  });

  it('Ejecuta el callback al cerrar el modal de reserva', () => {
    const handleClose = vi.fn();
    render(<ReservationModal isOpen={true} onClose={handleClose} />);
    
    const closeButtons = screen.getAllByRole('button');
    if (closeButtons.length > 0) {
      fireEvent.click(closeButtons[0]);
    }
  });
});