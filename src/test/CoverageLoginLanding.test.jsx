import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';
import { TalkBackProvider } from '../context/TalkBackContext';
import Login from '../pages/Login';
import Landing from '../pages/Landing';

/**
 * Validaciones de registro, inicio de sesion de clientes y accesos al menu
 * desde la Landing (incluida la confirmacion de reserva en linea).
 */

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: () => () => {}
}));

function CurrentPath() {
  return <span data-testid="path">{useLocation().pathname}</span>;
}

const renderAt = (path, element) => render(
  <TalkBackProvider>
    <AccessibilityProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path={path} element={element} />
            <Route path="*" element={null} />
          </Routes>
          <CurrentPath />
        </MemoryRouter>
      </AuthProvider>
    </AccessibilityProvider>
  </TalkBackProvider>
);

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Login', () => {
  const fill = ({ nombre, email, password }) => {
    if (nombre !== undefined) fireEvent.change(screen.getByPlaceholderText('ej: Angel Salazar'), { target: { value: nombre } });
    fireEvent.change(screen.getByPlaceholderText('ej: admin@elcacique.com'), { target: { value: email } });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), { target: { value: password } });
  };

  it('valida el nombre, la contraseña y los correos ya registrados al crear cuenta', () => {
    renderAt('/login', <Login />);
    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta/ }));
    const submit = () => fireEvent.click(screen.getByRole('button', { name: /Registrarme y Obtener Cupón/ }));

    fill({ nombre: 'Ana 2026', email: 'ana@correo.com', password: 'segura123' });
    submit();
    expect(screen.getByText('El nombre solo debe contener letras y espacios.')).toBeInTheDocument();

    fill({ nombre: 'Ana Pérez', email: 'ana@correo.com', password: '123' });
    submit();
    expect(screen.getByText('La contraseña debe tener mínimo 6 caracteres.')).toBeInTheDocument();

    fill({ nombre: 'Ana Pérez', email: 'admin@elcacique.com', password: 'segura123' });
    submit();
    expect(screen.getByText('El correo electrónico ya está registrado.')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar notificación' })[0]);
    expect(screen.queryByText('El correo electrónico ya está registrado.')).not.toBeInTheDocument();
  });

  it('un cliente que inicia sesión vuelve al menú', () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderAt('/login', <Login />);
    fill({ email: 'cliente.escazu@elcacique.com', password: 'Cliente2026!' });
    fireEvent.click(screen.getAllByRole('button', { name: 'Iniciar Sesión' }).at(-1));
    expect(screen.getByText('¡Bienvenido Cliente Registrado Escazú!')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByTestId('path')).toHaveTextContent('/menu');
  });
});

describe('Landing — accesos al menú', () => {
  it.each([
    'ORDENAR EN COMANDA',
    'PRE-ORDENAR CON ANTICIPACIÓN',
    'EXPLORAR MENÚ PERMANENTE'
  ])('"%s" lleva al menú digital', (label) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    // Octubre: sin temporada activa, se muestran los accesos "Próximamente".
    vi.setSystemTime(new Date(2026, 9, 5, 12, 0, 0));
    renderAt('/', <Landing />);
    fireEvent.click(screen.getAllByRole('button', { name: new RegExp(label) })[0]);
    expect(screen.getByTestId('path')).toHaveTextContent('/menu');
  });

  it('confirma la reserva en línea con un aviso de éxito', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url, options) => Promise.resolve({
      ok: true,
      status: 201,
      json: async () => (String(url).endsWith('/reservaciones') ? { id: 1, ...JSON.parse(options.body) } : {})
    })));
    renderAt('/', <Landing />);
    fireEvent.click(screen.getAllByRole('button', { name: /AGENDAR RESERVA/i })[0]);
    fireEvent.change(screen.getByPlaceholderText(/Angel Salazar/i), { target: { value: 'Ana Pérez' } });
    fireEvent.change(screen.getByPlaceholderText(/8888-8888/i), { target: { value: '88881234' } });
    fireEvent.click(screen.getByRole('button', { name: /CONFIRMAR RESERVACIÓN/i }));
    expect(await screen.findByText(/¡Reserva confirmada con éxito para Ana Pérez/)).toBeInTheDocument();
  });
});
