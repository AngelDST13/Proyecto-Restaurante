import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import WaiterDashboard from '../pages/WaiterDashboard';
import KitchenDashboard from '../pages/KitchenDashboard';

const { liveSubscribers } = vi.hoisted(() => ({ liveSubscribers: [] }));
vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: vi.fn(callback => {
    liveSubscribers.push(callback);
    return () => {};
  })
}));

const withAuth = element => <AuthProvider><MemoryRouter>{element}</MemoryRouter></AuthProvider>;

describe('Flujos completos de POS y KDS', () => {
  it('reparte el total entre N personas y actualiza el desglose al cambiar N', () => {
    render(withAuth(<WaiterDashboard />));
    fireEvent.click(screen.getByRole('button', { name: /Mesa 01/i }));
    const product = screen.getByText('Chifrijo Especial de Paila').closest('div[class*="rounded-xl"]');
    fireEvent.click(within(product).getByTitle('Agregar a comanda'));
    fireEvent.click(screen.getByRole('button', { name: /Dividir cuenta/i }));
    expect(screen.getAllByText(/Persona [12]/i)).toHaveLength(2);
    const total = screen.getByText(/Total dividido:/i).textContent;
    fireEvent.click(screen.getByRole('button', { name: 'Una persona más' }));
    expect(screen.getAllByText(/Persona [123]/i)).toHaveLength(3);
    expect(screen.getByText(/Total dividido:/i).textContent.replace(/\s/g, '')).toBe(total.replace(/\s/g, ''));
    fireEvent.click(screen.getByRole('button', { name: 'Una persona menos' }));
    expect(screen.getAllByText(/Persona [12]/i)).toHaveLength(2);
  });

  it('cambia el estado de una comanda en las transiciones que expone el KDS', () => {
    localStorage.removeItem('cacique_ready_order_notifications');
    render(withAuth(<KitchenDashboard />));
    const order = screen.getByText('ORD-101').closest('div[class*="bg-[#001812]"]');
    fireEvent.click(within(order).getByRole('button', { name: 'En Paila' }));
    expect(screen.getByText(/Comanda ORD-101 marcada como: EN PAILA/i)).toBeInTheDocument();
    fireEvent.click(within(order).getByRole('button', { name: 'Listo Servir' }));
    expect(screen.getByText(/Comanda ORD-101 marcada como: LISTO/i)).toBeInTheDocument();
    fireEvent.click(within(order).getByRole('button', { name: '-5 min' }));
    expect(within(order).getByText(/15 min total/i)).toBeInTheDocument();
  });

  it('acepta eventos KDS de su sede, ignora duplicados y confirma la entrega', () => {
    localStorage.removeItem('cacique_ready_order_notifications');
    render(withAuth(<WaiterDashboard />));
    const onLiveEvent = liveSubscribers.at(-1);
    expect(onLiveEvent).toBeTypeOf('function');
    act(() => onLiveEvent({ modulo: 'OTRO', accion: 'IGNORAR', sede: 'escazu', id: 'skip' }));
    expect(screen.queryByText(/ORD-QA listo para servir/i)).not.toBeInTheDocument();

    const readyEvent = { modulo: 'PEDIDO_MENU', accion: 'NOTIFICAR_MESERO_LISTO', sede: 'escazu', id: 'evt-qa', orderId: 'ORD-QA', mesa: 'Mesa QA', fechaEnvio: '2026-05-01T12:00:00.000Z' };
    act(() => { onLiveEvent(readyEvent); onLiveEvent(readyEvent); });
    expect(screen.getAllByText(/Mesa QA \(ORD-QA\) listo para servir/i)).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar Entrega' }));
    expect(screen.queryByText(/Mesa QA \(ORD-QA\) listo para servir/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Servicio entregado a Mesa QA/i)).toBeInTheDocument();
  });
});
