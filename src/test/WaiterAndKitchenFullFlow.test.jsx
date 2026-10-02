import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import WaiterDashboard from '../pages/WaiterDashboard';
import KitchenDashboard from '../pages/KitchenDashboard';
import { encryptData } from '../services/authSecurity';

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

  it('usa valores predeterminados en eventos KDS y evita duplicados por orderId aunque cambie event id', () => {
    localStorage.removeItem('cacique_ready_order_notifications');
    render(withAuth(<WaiterDashboard />));
    const onLiveEvent = liveSubscribers.at(-1);
    const baseEvent = { modulo: 'PEDIDO_MENU', accion: 'NOTIFICAR_MESERO_LISTO', sede: 'escazu', orderId: 'ORD-DEFAULT' };
    act(() => onLiveEvent(baseEvent));
    expect(screen.getByText(/Mesa desconocida \(ORD-DEFAULT\) listo para servir/i)).toBeInTheDocument();
    act(() => onLiveEvent({ ...baseEvent, id: 'different-event-id', mesa: 'Otra mesa' }));
    expect(screen.getAllByText(/ORD-DEFAULT.*listo para servir/i)).toHaveLength(1);
  });

  it('hidrata notificaciones guardadas solo de su sede y deduplica al recibir storage', () => {
    localStorage.setItem('cacique_ready_order_notifications', JSON.stringify([
      { id: 'stored-escazu', orderId: 'ORD-STORED', sede: 'escazu', mesa: 'Mesa guardada', createdAt: 0 },
      { id: 'stored-cartago', orderId: 'ORD-OTHER', sede: 'cartago', mesa: 'Mesa externa', createdAt: 100 }
    ]));
    render(withAuth(<WaiterDashboard />));
    expect(screen.getByText(/Mesa guardada \(ORD-STORED\) listo para servir/i)).toBeInTheDocument();
    expect(screen.queryByText(/Mesa externa/i)).not.toBeInTheDocument();

    localStorage.setItem('cacique_ready_order_notifications', JSON.stringify([
      { id: 'stored-escazu', orderId: 'ORD-STORED', sede: 'escazu', mesa: 'Mesa guardada', createdAt: 0 },
      { id: 'new-escazu', orderId: 'ORD-NEW', sede: 'escazu', mesa: 'Mesa nueva', createdAt: 200 }
    ]));
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'cacique_ready_order_notifications' })));
    expect(screen.getAllByText(/ORD-STORED.*listo para servir/i)).toHaveLength(1);
    expect(screen.getByText(/Mesa nueva \(ORD-NEW\) listo para servir/i)).toBeInTheDocument();
  });

  it('asigna cliente a mesa y valida la acción antes de asignar', () => {
    render(withAuth(<WaiterDashboard />));
    fireEvent.click(screen.getByRole('button', { name: /Mesa 01/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Asignar' }));
    expect(screen.getByText(/Seleccione una mesa e indique el nombre del cliente/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Nombre del cliente'), { target: { value: 'Cliente de mesa QA' } });
    fireEvent.click(screen.getByRole('button', { name: 'Asignar' }));
    expect(screen.getByText('Cliente de mesa QA')).toBeInTheDocument();
  });

  it('aplica una vez el cupón de bienvenida registrado al emitir una pre-cuenta', () => {
    const email = 'coupon.qa@example.com';
    localStorage.setItem('cacique_registered_clients', encryptData({
      [email]: { nombre: 'Cliente Cupón', coupon: { code: 'WELCOME5', discountPercentage: 5 } }
    }));
    render(withAuth(<WaiterDashboard />));
    fireEvent.click(screen.getByRole('button', { name: /Mesa 02/i }));
    fireEvent.change(screen.getByPlaceholderText('cliente@correo.com'), { target: { value: email } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Aplicar cupón de bienvenida/i }));
    fireEvent.click(screen.getByLabelText(/Factura electrónica/i));
    fireEvent.change(screen.getByPlaceholderText('Nombre registrado del cliente'), { target: { value: 'Cliente Cupón S.A.' } });
    fireEvent.change(screen.getByPlaceholderText('Identificación del cliente'), { target: { value: '3101123456' } });
    const product = screen.getByText('Chifrijo Especial de Paila').closest('div[class*="rounded-xl"]');
    fireEvent.click(within(product).getByTitle('Agregar a comanda'));
    fireEvent.click(screen.getByRole('button', { name: /Generar Factura/i }));

    expect(screen.getByText(/Descuento registro \(5%\)/i)).toBeInTheDocument();
    expect(localStorage.getItem(`cacique_coupon_used_${email}_WELCOME5`)).toBe('used');
  });
});
