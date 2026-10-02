import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import Toast from '../components/Toast';
import ReservationModal from '../components/ReservationModal';

afterEach(() => vi.useRealTimers());

describe('Pruebas de Componentes Interactivos', () => {
  it('Renderiza las notificaciones Toast correctamente', () => {
    const onClose = vi.fn();
    render(<Toast message="Reserva confirmada con éxito" type="success" onClose={onClose} />);
    expect(screen.getByText('Reserva confirmada con éxito')).toBeDefined();
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('usa el icono informativo por defecto ante un tipo de Toast desconocido', () => {
    render(<Toast message="Tipo desconocido" type="warning" onClose={vi.fn()} />);
    expect(screen.getByText('Tipo desconocido').parentElement.querySelector('svg')).toHaveClass('lucide-info');
  });

  it('cierra la notificación al vencer su duración', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Temporizador de prueba" type="info" duration={1000} onClose={onClose} />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('Ejecuta el callback al cerrar el modal de reserva', () => {
    const handleClose = vi.fn();
    render(<ReservationModal isOpen={true} onClose={handleClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar modal' }));
    expect(handleClose).toHaveBeenCalledOnce();
  });
});
