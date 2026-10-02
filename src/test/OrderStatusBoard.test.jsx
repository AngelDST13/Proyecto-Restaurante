import { act, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OrderStatusBoard from '../pages/OrderStatusBoard';

describe('Monitor público de estado de pedidos', () => {
  it('mueve a listo el pedido notificado y deja intactos los pedidos desconocidos', () => {
    render(<OrderStatusBoard />);
    const preparing = screen.getByText('En Preparación').closest('div[class*="border-2"]');
    const ready = screen.getByText('¡Listos Servir!').closest('div[class*="border-2"]');
    expect(within(preparing).getByText('CMD-101')).toBeInTheDocument();
    expect(within(ready).getByText('CMD-104')).toBeInTheDocument();

    act(() => window.dispatchEvent(new CustomEvent('cacique:order-ready', { detail: { orderId: 'missing-order' } })));
    expect(within(preparing).getByText('CMD-101')).toBeInTheDocument();

    act(() => window.dispatchEvent(new CustomEvent('cacique:order-ready', { detail: { orderId: 'CMD-101' } })));
    expect(within(preparing).queryByText('CMD-101')).not.toBeInTheDocument();
    expect(within(ready).getByText('CMD-101')).toBeInTheDocument();
    expect(within(preparing).getByText('CMD-102')).toBeInTheDocument();
  });
});