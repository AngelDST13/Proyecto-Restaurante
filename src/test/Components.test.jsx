import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';

const renderWithProviders = (ui) => render(
  <AuthProvider>
    <AccessibilityProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </AccessibilityProvider>
  </AuthProvider>
);

describe('Componentes principales de GourmetSync', () => {
  test('Navbar muestra Menú y la información de recoger en local', () => {
    renderWithProviders(<Navbar onOpenReservation={() => {}} />);

    expect(screen.getAllByText(/Menú/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Recoger en Local/i)).toBeInTheDocument();
  });

  test('Footer incluye la firma del equipo BVA', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByText(/Desarrollado por/i)).toBeInTheDocument();
    expect(screen.getByText(/BVA/i)).toBeInTheDocument();
    expect(screen.getByText(/Recoger en Restaurante/i)).toBeInTheDocument();
  });

  test('Login informa que se puede recoger el pedido en el local', () => {
    renderWithProviders(<Login />);

    expect(screen.getByText(/Pedidos para Mesa, Express o Recoger en Local/i)).toBeInTheDocument();
  });
});
