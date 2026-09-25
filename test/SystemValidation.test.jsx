/* eslint-disable no-undef */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import OrderStatusBoard from '../pages/OrderStatusBoard';
import { AuthProvider } from '../context/AuthContext';

describe('Suite de Pruebas Extendida GourmetSync', () => {
  test('Login muestra las credenciales de cocina para las 4 sucursales', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/cocina.escazu@elcacique.com/i)).toBeInTheDocument();
    expect(screen.getByText(/cocina.santaana@elcacique.com/i)).toBeInTheDocument();
    expect(screen.getByText(/cocina.cartago@elcacique.com/i)).toBeInTheDocument();
    expect(screen.getByText(/cocina.heredia@elcacique.com/i)).toBeInTheDocument();
  });

  test('El monitor de pedidos muestra la columna de "En Preparación" y "¡Listos Servir!"', () => {
    render(
      <MemoryRouter>
        <OrderStatusBoard />
      </MemoryRouter>
    );

    expect(screen.getByText(/En Preparación/i)).toBeInTheDocument();
    expect(screen.getByText(/¡Listos Servir!/i)).toBeInTheDocument();
  });
});