import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRouter from '../routes/AppRouter';
import LoginQuickAccessModal from '../components/LoginQuickAccessModal';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { TalkBackProvider } from '../context/TalkBackContext';
import { TEST_ACCESS_CREDENTIALS } from '../services/authSecurity';

/**
 * Logout unificado (un solo boton por vista, siempre con confirmacion),
 * modal de Accesos Rapidos en Modo Claro y degradados claros de los paneles.
 */

const { authContext } = vi.hoisted(() => ({
  authContext: {
    user: null,
    logout: vi.fn(),
    inactivityToast: false,
    setInactivityToast: vi.fn(),
    loginWithCredentials: vi.fn(),
    registerClient: vi.fn()
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authContext,
  AuthProvider: ({ children }) => children
}));
vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: vi.fn(() => () => {})
}));

const CONFIRM_TEXT = /¿Está seguro que desea cerrar la sesión activa\?/i;

const renderRoute = (path) => render(
  <TalkBackProvider>
    <AccessibilityProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRouter />
      </MemoryRouter>
    </AccessibilityProvider>
  </TalkBackProvider>
);

const logoutButtons = () => screen.getAllByRole('button', { name: /cerrar sesi[oó]n/i });

beforeEach(() => {
  localStorage.clear();
  authContext.logout.mockClear();
});

describe('Cierre de sesión unificado', () => {
  it.each([
    ['/kitchen', 'cocina'],
    ['/waiter', 'mesero'],
    ['/admin', 'administrador'],
    ['/cashier', 'cajero'],
    ['/', 'cliente']
  ])('%s (%s) siempre confirma antes de cerrar la sesión', (path, rol) => {
    authContext.user = { email: `${rol}@elcacique.com`, nombre: `QA ${rol}`, rol, sede: 'escazu' };
    renderRoute(path);

    fireEvent.click(logoutButtons()[0]);
    expect(screen.getByText(CONFIRM_TEXT)).toBeInTheDocument();
    expect(authContext.logout).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByText(CONFIRM_TEXT)).not.toBeInTheDocument();
    expect(authContext.logout).not.toHaveBeenCalled();
  });

  it('Cocina muestra un único botón de salida: el de la barra superior', () => {
    authContext.user = { email: 'cocina@elcacique.com', nombre: 'Chef QA', rol: 'cocina', sede: 'escazu' };
    renderRoute('/kitchen');

    const buttons = logoutButtons();
    expect(buttons).toHaveLength(1);
    expect(buttons[0].closest('header')).not.toBeNull();

    fireEvent.click(buttons[0]);
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí, Cerrar' }));
    expect(authContext.logout).toHaveBeenCalledTimes(1);
  });
});

describe('Modal de Accesos Rápidos de Prueba', () => {
  const open = (onAutofill = vi.fn()) => {
    render(<LoginQuickAccessModal onAutofill={onAutofill} />);
    fireEvent.click(screen.getByRole('button', { name: /Accesos Rápidos de Prueba/i }));
    return onAutofill;
  };

  it('usa la paleta clara artesanal en Modo Claro sin fondos oscuros fijos', () => {
    open();
    const modal = screen.getByTestId('quick-access-modal');

    for (const token of [
      'bg-zinc-900', 'light:bg-[#FFFFFF]',
      'border-amber-500/30', 'light:border-[#4A3525]/20',
      'text-zinc-100', 'light:text-[#2C1A0E]'
    ]) {
      expect(modal, token).toHaveClass(token);
    }
    expect(modal.className).not.toMatch(/bg-\[#07110D\]/);
    expect(modal.closest('.cacique-keep-colors')).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Accesos de prueba' })).toHaveClass('light:text-[#2C1A0E]');
  });

  it('los botones Autocompletar tienen hover, click y foco visibles', () => {
    open();
    const [button] = screen.getAllByRole('button', { name: 'Autocompletar' });
    for (const token of ['hover:bg-amber-500/10', 'active:scale-95', 'light:hover:bg-[#7A3E0A]', 'light:hover:text-white', 'focus-visible:ring-2']) {
      expect(button, token).toHaveClass(token);
    }
  });

  it('autocompleta la credencial y cierra el modal', () => {
    const onAutofill = open();
    fireEvent.click(screen.getByRole('tab', { name: 'Cartago' }));
    expect(screen.getByRole('tab', { name: 'Cartago' })).toHaveAttribute('aria-selected', 'true');

    const cartagoCredential = TEST_ACCESS_CREDENTIALS.find((credential) => credential.sede === 'Cartago' && credential.rol !== 'Cliente Registrado');
    const option = screen.getByText(cartagoCredential.email).closest('article');
    fireEvent.click(within(option).getByRole('button', { name: 'Autocompletar' }));

    expect(onAutofill).toHaveBeenCalledWith(cartagoCredential);
    expect(screen.queryByTestId('quick-access-modal')).not.toBeInTheDocument();
  });

  it('se cierra con la X y al pulsar fuera del cuadro', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar accesos rápidos' }));
    expect(screen.queryByTestId('quick-access-modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Accesos Rápidos de Prueba/i }));
    const overlay = screen.getByTestId('quick-access-modal').parentElement;
    fireEvent.mouseDown(screen.getByTestId('quick-access-modal'));
    expect(screen.getByTestId('quick-access-modal')).toBeInTheDocument();
    fireEvent.mouseDown(overlay);
    expect(screen.queryByTestId('quick-access-modal')).not.toBeInTheDocument();
  });
});

describe('Degradados claros en paneles operativos', () => {
  let read;
  beforeAll(async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
    read = (file) => fs.readFileSync(path.resolve(root, file), 'utf8');
  });

  it.each([
    'src/pages/AdminDashboard.jsx',
    'src/pages/CashierDashboard.jsx',
    'src/pages/WaiterDashboard.jsx',
    'src/pages/KitchenDashboard.jsx',
    'src/components/FacturacionPanel.jsx'
  ])('%s no deja degradados oscuros sin su par claro', (file) => {
    const gradients = read(file).match(/className=["{`][^"`]*from-\[#001812\][^"`]*/g) ?? [];
    for (const gradient of gradients.filter((value) => value.includes('via-zinc-900'))) {
      expect(gradient).toContain('light:from-[#F5EFE6]');
      expect(gradient).toContain('light:to-[#E8DFD8]');
    }
  });

  it('index.css deja actuar las utilidades light: de los degradados e inputs marfil', () => {
    const css = read('src/index.css');
    expect(css).toContain("[class*='from-[#001812]']:not([class*='light:from-'])");
    expect(css).toContain("[class*='via-zinc-9']");
    expect(css).toMatch(/:is\(input:not\(\[type='checkbox'\], \[type='radio'\], \[type='range'\]\), select, textarea\):not\(\.cacique-keep-colors \*\) \{\s*background-color: #FFFFFF;\s*border-color: rgba\(74, 53, 37, 0\.3\);/);
  });
});
