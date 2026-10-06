import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { TalkBackProvider } from '../context/TalkBackContext';
import AccessibilityPanel from '../components/AccessibilityPanel';
import AiAgentWidget from '../components/AiAgentWidget';
import FacturacionPanel from '../components/FacturacionPanel';
import Navbar from '../components/Navbar';

/**
 * Interacciones de componentes: pestaña de tamaño de texto, chat IA,
 * caja/facturacion (exportes, importes, impresion) y Navbar movil.
 */

const { authContext, triggerMock } = vi.hoisted(() => ({
  authContext: { user: null, logout: vi.fn(), inactivityToast: false, setInactivityToast: vi.fn() },
  triggerMock: vi.fn()
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authContext,
  AuthProvider: ({ children }) => children
}));
vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: (...args) => triggerMock(...args),
  subscribeToLiveEvents: () => () => {}
}));

beforeEach(() => {
  localStorage.clear();
  authContext.user = null;
  triggerMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/* ------------------------------------------------------------------------ */

describe('AccessibilityPanel', () => {
  const renderDock = () => render(
    <TalkBackProvider><AccessibilityProvider><AccessibilityPanel /></AccessibilityProvider></TalkBackProvider>
  );

  it('ajusta el tamaño de letra desde la pestaña Texto', () => {
    renderDock();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    fireEvent.click(screen.getByRole('tab', { name: /Texto/i }));

    expect(screen.getByText(/Nivel actual: Normal/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Disminuir tamaño de letra' }));
    expect(screen.getByText(/Nivel actual: Pequeño/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar tamaño de letra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar tamaño de letra' }));
    expect(screen.getByText(/Nivel actual: Grande/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer tamaño de letra' }));
    expect(screen.getByText(/Nivel actual: Normal/)).toBeInTheDocument();
  });

  it('solo Escape cierra el panel', () => {
    renderDock();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    fireEvent.keyDown(document, { key: 'a' });
    expect(screen.getByRole('region', { name: 'Panel de accesibilidad' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('region', { name: 'Panel de accesibilidad' })).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------ */

describe('AiAgentWidget', () => {
  const renderWidget = (path = '/') => render(
    <MemoryRouter initialEntries={[path]}><AiAgentWidget /></MemoryRouter>
  );
  const open = () => fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));

  it('no se cierra al pulsar dentro del chat ni con otras teclas', () => {
    renderWidget();
    open();
    fireEvent.mouseDown(screen.getByPlaceholderText('Escriba su consulta...'));
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.getElementById('cacique-chat-panel')).toBeInTheDocument();
  });

  it('se cierra cuando el usuario abre el carrito', () => {
    renderWidget();
    open();
    act(() => window.dispatchEvent(new Event('cart-opened')));
    expect(document.getElementById('cacique-chat-panel')).not.toBeInTheDocument();
  });

  it('ignora el envío de mensajes vacíos', () => {
    renderWidget();
    open();
    fireEvent.change(screen.getByPlaceholderText('Escriba su consulta...'), { target: { value: '   ' } });
    fireEvent.submit(screen.getByPlaceholderText('Escriba su consulta...').closest('form'));
    expect(triggerMock).not.toHaveBeenCalled();
  });

  it('envía con Enter y responde con la información local si el bot no responde texto', async () => {
    triggerMock.mockResolvedValue({ success: true, respuesta: '' });
    renderWidget();
    open();
    const input = screen.getByPlaceholderText('Escriba su consulta...');
    fireEvent.change(input, { target: { value: '¿Horario de Escazú?' } });
    fireEvent.submit(input.closest('form'));
    expect(await screen.findByText(/Horarios de atención:/)).toBeInTheDocument();
    expect(screen.getByText(/Escazú: Lunes a Domingo: 11:30 AM - 11:00 PM/)).toBeInTheDocument();
  });

  it('muestra el estado de consulta del personal mientras espera', async () => {
    let resolve;
    triggerMock.mockImplementation(() => new Promise((done) => { resolve = done; }));
    renderWidget('/kitchen');
    open();
    const input = screen.getByPlaceholderText('Consulte sobre KDS, inventario o comandas...');
    fireEvent.change(input, { target: { value: 'Stock de chicharrón' } });
    fireEvent.submit(input.closest('form'));
    expect(await screen.findByText('Consultando datos del dashboard...')).toBeInTheDocument();
    await act(async () => resolve({ success: true, respuesta: 'Stock suficiente' }));
    expect(screen.getByText('Stock suficiente')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------ */

describe('FacturacionPanel', () => {
  const sale = { id: 's1', cliente: 'Ana', cedula: '1', descripcion: 'Chifrijo', subtotal: 1000, total: 0, pago: 'Tarjeta', fecha: '2026-09-10T10:00:00.000Z' };

  const mockDownloads = () => {
    const createObjectURL = vi.fn(() => 'blob:mock');
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    return { createObjectURL, click };
  };

  it('recupera un estado guardado corrupto como caja nueva', () => {
    localStorage.setItem('cacique_cashier_escazu', '{roto');
    render(<FacturacionPanel />);
    expect(screen.getByRole('button', { name: 'Abrir caja' })).toBeInTheDocument();
    expect(screen.getByLabelText('Responsable de caja')).toHaveValue('Cajero de turno');
  });

  it('registra compras sin callback y entradas de efectivo', () => {
    render(<FacturacionPanel />);
    fireEvent.change(screen.getByLabelText('Monto inicial'), { target: { value: '1000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir caja' }));

    fireEvent.change(screen.getByLabelText('Insumo comprado'), { target: { value: 'Yuca' } });
    fireEvent.change(screen.getByLabelText('Cantidad comprada'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Costo de compra'), { target: { value: '300' } });
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Registrar compra' }))).not.toThrow();

    fireEvent.change(screen.getByLabelText('Tipo de movimiento'), { target: { value: 'Entrada' } });
    fireEvent.change(screen.getByLabelText('Monto del movimiento'), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText('Motivo del movimiento'), { target: { value: 'Cambio' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar movimiento' }));
    const state = JSON.parse(localStorage.getItem('cacique_cashier_escazu'));
    expect(state.movements[0]).toMatchObject({ tipo: 'Entrada', monto: 500 });
    expect(state.expenses[0]).toMatchObject({ insumo: 'Yuca', pagadoEfectivo: true });
  });

  it('exige un monto contado válido y tolera ventas guardadas sin IVA', () => {
    localStorage.setItem('cacique_cashier_escazu', JSON.stringify({ cashOpen: true, openingAmount: 0, sales: [sale] }));
    render(<FacturacionPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar caja y registrar arqueo' }));
    expect(screen.getByRole('status')).toHaveTextContent('Ingrese un monto contado válido para cerrar la caja.');

    fireEvent.change(screen.getByLabelText('Dinero contado al cierre'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar caja y registrar arqueo' }));
    expect(screen.getByRole('status')).toHaveTextContent(/Ventas brutas: ₡0; IVA 13%: ₡0/);
  });

  it('exporta ventas, compras e importaciones en CSV, Excel y JSON', async () => {
    localStorage.setItem('cacique_cashier_escazu', JSON.stringify({
      cashOpen: true,
      openingAmount: 0,
      sales: [{ ...sale, total: 1130 }],
      expenses: [
        { id: 'e1', insumo: 'Carne', cantidad: 1, costo: 200, pagadoEfectivo: true, fecha: '2026-09-11T00:00:00.000Z' },
        { id: 'e2', insumo: 'Leña', cantidad: 1, costo: 100, pagadoEfectivo: false, fecha: '2026-09-12T00:00:00.000Z' }
      ],
      financeImports: [{ sede: 'Escazú', periodo: '2026-08', ventas: 900, costos: 100 }]
    }));
    const { createObjectURL } = mockDownloads();
    render(<FacturacionPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
    fireEvent.click(screen.getByRole('button', { name: 'Exportar Excel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Exportar JSON' }));
    expect(createObjectURL).toHaveBeenCalledTimes(3);

    const csv = await createObjectURL.mock.calls[0][0].text();
    expect(csv).toContain('"Venta"');
    expect(csv).toContain('"Compra / costo"');
    expect(csv).toContain('"Otro"');
    expect(csv).toContain('"Importación"');
    const json = JSON.parse(await createObjectURL.mock.calls[2][0].text());
    // Costos: compras 200 + 100 e importación 100.
    expect(json).toMatchObject({ sede: 'escazu', ventas: 1130, costos: 400 });
  });

  it('ignora la importación si no se eligió archivo', () => {
    render(<FacturacionPanel />);
    fireEvent.change(screen.getByLabelText('Importar archivo financiero'), { target: { files: [] } });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('imprime la factura emitida', () => {
    window.print = vi.fn();
    render(<FacturacionPanel />);
    fireEvent.change(screen.getByLabelText('Monto inicial'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir caja' }));
    fireEvent.change(screen.getByLabelText('Cliente de venta'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Cédula del cliente'), { target: { value: '101' } });
    fireEvent.change(screen.getByLabelText('Detalle de venta'), { target: { value: 'Chifrijo' } });
    fireEvent.change(screen.getByLabelText('Subtotal de venta'), { target: { value: '1000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar venta' }));
    fireEvent.click(screen.getByRole('button', { name: /Imprimir factura/ }));
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});

/* ------------------------------------------------------------------------ */

function CurrentPath() {
  return <span data-testid="path">{useLocation().pathname}</span>;
}

describe('Navbar', () => {
  const renderNavbar = (path = '/') => render(
    <AccessibilityProvider>
      <MemoryRouter initialEntries={[path]}><Navbar /><CurrentPath /></MemoryRouter>
    </AccessibilityProvider>
  );

  const addSection = (id) => {
    const section = document.createElement('section');
    section.id = id;
    document.body.appendChild(section);
    return section;
  };

  it('el logo vuelve a la Landing desde otra ruta', () => {
    renderNavbar('/menu');
    fireEvent.click(screen.getByAltText('Logo El Cacique'));
    expect(screen.getByTestId('path')).toHaveTextContent('/');
  });

  it('Eventos navega a la Landing y desplaza a la sección tras cargarla', () => {
    vi.useFakeTimers();
    const scroll = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
    renderNavbar('/menu');
    const section = addSection('eventos');
    fireEvent.click(screen.getByRole('button', { name: /Eventos/i }));
    expect(screen.getByTestId('path')).toHaveTextContent('/');
    act(() => vi.advanceTimersByTime(100));
    expect(scroll).toHaveBeenCalledTimes(1);
    section.remove();
  });

  it('no falla si la sección aún no existe (en otra ruta o en la Landing)', () => {
    vi.useFakeTimers();
    const scroll = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
    renderNavbar('/menu');
    fireEvent.click(screen.getByRole('button', { name: /Eventos/i }));
    act(() => vi.advanceTimersByTime(100));
    fireEvent.click(screen.getByRole('button', { name: /Eventos/i }));
    expect(scroll).not.toHaveBeenCalled();
  });

  it('desplaza directamente cuando ya está en la Landing', () => {
    const scroll = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
    const section = addSection('eventos');
    renderNavbar('/');
    fireEvent.click(screen.getByRole('button', { name: /Eventos/i }));
    expect(scroll).toHaveBeenCalledTimes(1);
    section.remove();
  });

  it('menú móvil: enlaces, panel activo, tema claro y cierre de sesión sin nombre', () => {
    localStorage.setItem('cacique_theme', 'light');
    authContext.user = { email: 'mesero.qa@elcacique.com', rol: 'mesero', sede: 'escazu' };
    renderNavbar('/waiter');

    // Sin nombre se usa el prefijo del correo.
    expect(screen.getAllByText(/mesero\.qa/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Alternar menú de navegación' }));
    const mobile = document.getElementById('mobile-navigation');
    const dashboardLink = within(mobile).getAllByRole('link').find((link) => link.getAttribute('aria-current') === 'page');
    expect(dashboardLink).toBeDefined();
    expect(within(mobile).getByRole('button', { name: 'Activar modo oscuro' })).toBeInTheDocument();
    expect(within(mobile).getByRole('button', { name: /Cerrar Sesión \(mesero\.qa\)/ })).toBeInTheDocument();

    fireEvent.click(dashboardLink);
    expect(document.getElementById('mobile-navigation')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Alternar menú de navegación' }));
    fireEvent.click(within(document.getElementById('mobile-navigation')).getByRole('link', { name: /Menú/ }));
    expect(document.getElementById('mobile-navigation')).not.toBeInTheDocument();
  });

  it('menú móvil: iniciar sesión cierra el menú', async () => {
    renderNavbar('/');
    fireEvent.click(screen.getByRole('button', { name: 'Alternar menú de navegación' }));
    const mobile = document.getElementById('mobile-navigation');
    fireEvent.click(within(mobile).getByRole('link', { name: /Iniciar Sesión/i }));
    await waitFor(() => expect(document.getElementById('mobile-navigation')).not.toBeInTheDocument());
  });
});
