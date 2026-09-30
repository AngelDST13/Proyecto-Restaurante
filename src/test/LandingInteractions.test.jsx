import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Landing from '../pages/Landing';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';

vi.mock('../hooks/useAutoLogout', () => ({
  useAutoLogout: () => ({ showWarning: true, resetTimer: vi.fn() })
}));

const renderLanding = () => render(
  <AccessibilityProvider><AuthProvider><MemoryRouter><Landing /></MemoryRouter></AuthProvider></AccessibilityProvider>
);

describe('Landing: interacciones de navegación y sede', () => {
  it('cambia las ubicaciones y actualiza los datos del mapa', () => {
    renderLanding();
    expect(screen.getByText('SEDE ESCAZÚ • CENTRO CULINARIO')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'CARTAGO' }));
    expect(screen.getByText('SEDE CARTAGO • PASO ANCHO')).toBeInTheDocument();
    expect(screen.getByTitle(/SEDE CARTAGO/)).toHaveAttribute('src', expect.stringContaining('Cartago'));
    fireEvent.click(screen.getByRole('button', { name: 'HEREDIA' }));
    expect(screen.getByText('Paseo de las Flores, Heredia Centro')).toBeInTheDocument();
  });

  it('abre la reserva general y una reserva de evento, y permite continuar sesión', () => {
    renderLanding();
    fireEvent.click(screen.getAllByRole('button', { name: /AGENDAR RESERVA/i }).at(-1));
    expect(screen.getByRole('heading', { name: /Agendar Mesa o Evento/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cerrar modal/i }));
    fireEvent.click(screen.getByRole('button', { name: /AGENDAR AGÜIZOTES/i }));
    expect(screen.getByText(/Noche Criolla de Agüizotes/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Agendar Mesa o Evento/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /MANTENER SESIÓN ACTIVA/i }));
  });

  it('alterna las imágenes del hero', () => {
    renderLanding();
    const next = screen.getAllByRole('button').find(button => button.className.includes('right-4'));
    const previous = screen.getAllByRole('button').find(button => button.className.includes('left-4'));
    fireEvent.click(next);
    expect(document.querySelectorAll('.opacity-100.scale-105').length).toBeGreaterThan(0);
    fireEvent.click(previous);
    expect(document.querySelectorAll('.opacity-100.scale-105').length).toBeGreaterThan(0);
  });
});
