import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import KitchenDashboard from '../pages/KitchenDashboard';

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: vi.fn(() => () => {})
}));

const renderKitchen = () => render(<AuthProvider><MemoryRouter><KitchenDashboard /></MemoryRouter></AuthProvider>);

describe('KitchenDashboard KDS', () => {
  it('ajusta el tiempo estimado de preparación', () => {
    renderKitchen();
    const order = screen.getByText('ORD-101').closest('div[class*="bg-[#001812]"]');
    expect(within(order).getByText('20 min total')).toBeInTheDocument();
    fireEvent.click(within(order).getByRole('button', { name: '+5 min' }));
    expect(within(order).getByText('25 min total')).toBeInTheDocument();
  });

  it('cambia el estado de una comanda y filtra por sede', () => {
    renderKitchen();
    const order = screen.getByText('ORD-101').closest('div[class*="bg-[#001812]"]');
    fireEvent.click(within(order).getByRole('button', { name: /Listo Servir/i }));
    expect(screen.getByText(/Comanda ORD-101 marcada como: LISTO/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'santa_ana' } });
    expect(screen.getByText('ORD-102')).toBeInTheDocument();
    expect(screen.queryByText('ORD-101')).not.toBeInTheDocument();
  });
});
