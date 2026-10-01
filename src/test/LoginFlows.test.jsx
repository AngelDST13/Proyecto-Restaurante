import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: vi.fn(() => () => {})
}));

function CurrentPath() {
  return <output data-testid="current-path">{useLocation().pathname}</output>;
}

const renderLogin = () => render(<AuthProvider><MemoryRouter initialEntries={['/login']}><Login /><CurrentPath /></MemoryRouter></AuthProvider>);

afterEach(() => vi.useRealTimers());

describe('Login: validaciones, errores y redirección por rol', () => {
  it('valida campos vacíos y credenciales incorrectas', () => {
    renderLogin();
    const submitButton = screen.getAllByRole('button', { name: /Iniciar Sesión/i }).find(button => button.type === 'submit');
    const form = submitButton.closest('form');
    fireEvent.submit(form);
    expect(screen.getByText(/Ingrese una dirección de correo válida/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/admin@elcacique.com/i), { target: { value: 'nadie@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), { target: { value: 'wrong-pass' } });
    fireEvent.submit(form);
    expect(screen.getByText(/no existe/i)).toBeInTheDocument();
  });

  it('redirige al panel correcto tras autenticar al administrador', async () => {
    vi.useFakeTimers();
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/admin@elcacique.com/i), { target: { value: 'admin@elcacique.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), { target: { value: 'AdminCacique2026!' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Iniciar Sesión/i }).find(button => button.type === 'submit'));
    expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(screen.getByTestId('current-path')).toHaveTextContent('/admin');
  });

  it.each([
    ['mesero.escazu@elcacique.com', 'MeseroEscazu2026!', '/waiter'],
    ['cocina.escazu@elcacique.com', 'CocinaEscazu2026!', '/kitchen'],
    ['cocina.santaana@elcacique.com', 'CocinaSantaAna2026!', '/kitchen'],
    ['cocina.cartago@elcacique.com', 'CocinaCartago2026!', '/kitchen'],
    ['cocina.heredia@elcacique.com', 'CocinaHeredia2026!', '/kitchen']
  ])('redirige las credenciales del personal a %s -> %s', async (emailValue, passwordValue, expectedPath) => {
    vi.useFakeTimers();
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/admin@elcacique.com/i), { target: { value: emailValue } });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), { target: { value: passwordValue } });
    fireEvent.click(screen.getAllByRole('button', { name: /Iniciar Sesión/i }).find(button => button.type === 'submit'));
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(screen.getByTestId('current-path')).toHaveTextContent(expectedPath);
  });

  it('carga las credenciales seleccionadas en el formulario sin enviarlo', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Cargar credenciales Cocina KDS Escazú' }));
    expect(screen.getByPlaceholderText(/admin@elcacique.com/i)).toHaveValue('cocina.escazu@elcacique.com');
    expect(screen.getByPlaceholderText('••••••••••••')).toHaveValue('CocinaEscazu2026!');
    expect(screen.getByTestId('current-path')).toHaveTextContent('/login');
  });

  it('valida el registro y asigna un cupón al nuevo cliente', async () => {
    vi.useFakeTimers();
    localStorage.removeItem('cacique_registered_clients');
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta/i }));
    const submit = screen.getByRole('button', { name: /Registrarme y Obtener Cupón/i });
    fireEvent.change(screen.getByPlaceholderText(/Angel Salazar/i), { target: { value: 'QA' } });
    fireEvent.change(screen.getByPlaceholderText(/admin@elcacique.com/i), { target: { value: 'new.qa@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), { target: { value: 'client123' } });
    fireEvent.click(submit);
    expect(screen.getByText(/al menos 3 letras/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Angel Salazar/i), { target: { value: 'Nuevo Cliente' } });
    fireEvent.click(submit);
    expect(screen.getByText('CACIQUE5OFF')).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(screen.getByTestId('current-path')).toHaveTextContent('/menu');
  });
});
