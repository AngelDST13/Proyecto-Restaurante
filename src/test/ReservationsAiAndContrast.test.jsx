import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Landing from '../pages/Landing';
import Navbar from '../components/Navbar';
import AiAgentWidget from '../components/AiAgentWidget';
import AccessibilityPanel from '../components/AccessibilityPanel';
import { AccessibilityProvider, LIGHT_PALETTE } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';
import { TalkBackProvider } from '../context/TalkBackContext';
import {
  RESERVATION_REQUEST_EVENT,
  requestReservationModal,
  useReservationRequestHandler,
} from '../hooks/useReservationModal';

/**
 * Apertura fluida del modal de reservas, interaccion del asistente IA y
 * legibilidad del selector de daltonismo en modo de alto contraste.
 */

const Providers = ({ children }) => (
  <TalkBackProvider>
    <AuthProvider>
      <AccessibilityProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </AccessibilityProvider>
    </AuthProvider>
  </TalkBackProvider>
);

describe('Modal de reservas', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('abre el modal al pulsar AGENDAR RESERVA desde el Navbar', async () => {
    render(
      <Providers>
        <Navbar />
        <Landing />
      </Providers>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'AGENDAR RESERVA' })[0]);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Agendar Mesa o Evento/i }),
    ).toBeInTheDocument();
  });

  it('abre el modal desde las tarjetas de la seccion de Eventos', async () => {
    render(
      <Providers>
        <Landing />
      </Providers>,
    );

    const eventButtons = screen.getAllByRole('button', { name: /Reservar|Agendar/i });
    expect(eventButtons.length).toBeGreaterThan(0);

    fireEvent.click(eventButtons[0]);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('el Navbar emite el evento global de solicitud', () => {
    const listener = vi.fn();
    window.addEventListener(RESERVATION_REQUEST_EVENT, listener);

    render(
      <Providers>
        <Navbar />
        <Landing />
      </Providers>,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'AGENDAR RESERVA' })[0]);

    expect(listener).toHaveBeenCalled();
    expect(listener.mock.calls[0][0].detail).toHaveProperty('type');
    window.removeEventListener(RESERVATION_REQUEST_EVENT, listener);
  });

  it('requestReservationModal permite abrirlo desde cualquier punto', () => {
    const handler = vi.fn();
    render(<HookHost onOpen={handler} />);

    requestReservationModal('Banquete Familiar');
    expect(handler).toHaveBeenCalledWith('Banquete Familiar');
  });

  it('el manejador ignora un callback no funcion', () => {
    render(<HookHost onOpen={undefined} />);

    expect(() => requestReservationModal('General')).not.toThrow();
  });

  it('valida los campos obligatorios del formulario', async () => {
    render(
      <Providers>
        <Landing />
      </Providers>,
    );

    fireEvent.click(screen.getAllByRole('button', { name: /Reservar|Agendar/i })[0]);

    const confirm = await screen.findByRole('button', { name: /CONFIRMAR RESERVACIÓN/i });
    fireEvent.click(confirm);

    expect(await screen.findByText(/Ingrese un nombre válido/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingrese un teléfono válido/i)).toBeInTheDocument();
  });

  it('expone fecha, hora y numero de comensales', async () => {
    render(
      <Providers>
        <Landing />
      </Providers>,
    );

    fireEvent.click(screen.getAllByRole('button', { name: /Reservar|Agendar/i })[0]);

    expect(await screen.findByLabelText('Fecha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aumentar personas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Disminuir personas/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Hora/i)).toBeInTheDocument();
  });

  it('permite seleccionar la sucursal', async () => {
    render(
      <Providers>
        <Landing />
      </Providers>,
    );

    fireEvent.click(screen.getAllByRole('button', { name: /Reservar|Agendar/i })[0]);

    const sedeSelect = await screen.findByLabelText(/Sucursal|Sede/i);
    expect(sedeSelect.tagName).toBe('SELECT');
    expect(sedeSelect.options.length).toBeGreaterThan(1);
  });
});

function HookHost({ onOpen }) {
  useReservationRequestHandler(onOpen);
  return <div data-testid="hook-host" />;
}

describe('Asistente IA', () => {
  it('alterna la ventana del chat al pulsar el boton flotante', async () => {
    render(
      <Providers>
        <AiAgentWidget />
      </Providers>,
    );

    const openButton = screen.getByRole('button', { name: 'Abrir asistente virtual' });
    expect(openButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Minimizar asistente' })).not.toBeInTheDocument();

    fireEvent.click(openButton);

    // Al desplegarse aparece el control de cerrar y la ventana del chat.
    expect(await screen.findByRole('button', { name: 'Cerrar asistente' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Escriba su consulta/i)).toBeInTheDocument();

    // Un segundo toque cierra la ventana.
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar asistente' }));

    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/Escriba su consulta/i)).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Abrir asistente virtual' })).toBeInTheDocument();
  });

  it('el icono flotante es circular y proporcional', () => {
    render(
      <Providers>
        <AiAgentWidget />
      </Providers>,
    );

    const button = screen.getByRole('button', { name: 'Abrir asistente virtual' });
    expect(button).toHaveClass('h-14');
    expect(button).toHaveClass('w-14');
    expect(button).toHaveClass('rounded-full');
  });

  it('se ubica en la esquina inferior izquierda', () => {
    render(
      <Providers>
        <AiAgentWidget />
      </Providers>,
    );

    const wrapper = screen.getByRole('button', { name: 'Abrir asistente virtual' }).parentElement;
    expect(wrapper.className).toContain('left-4');
  });

  it('se cierra al hacer clic fuera del contenedor', async () => {
    render(
      <Providers>
        <AiAgentWidget />
        <div data-testid="outside">Fuera del asistente</div>
      </Providers>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));
    expect(screen.getByRole('button', { name: 'Cerrar asistente' })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Cerrar asistente' })).not.toBeInTheDocument(),
    );
  });

  it('se cierra con la tecla Escape', async () => {
    render(
      <Providers>
        <AiAgentWidget />
      </Providers>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Cerrar asistente' })).not.toBeInTheDocument(),
    );
  });

  it('permite ocultar el asistente de forma permanente', () => {
    render(
      <Providers>
        <AiAgentWidget />
      </Providers>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar asistente' }));
    expect(screen.queryByRole('button', { name: 'Abrir asistente virtual' })).not.toBeInTheDocument();
  });
});

describe('Selector de daltonismo en Alto Contraste', () => {
  it('mantiene el texto blanco sobre fondo negro en el desplegable', () => {
    render(
      <Providers>
        <AccessibilityPanel />
      </Providers>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Visión' }));

    const select = screen.getByLabelText('Tipo de daltonismo');
    expect(select).toHaveClass('bg-zinc-900');
    expect(select).toHaveClass('text-zinc-100');
    expect(select.className).toContain('font-bold');
  });

  it('expone las 5 opciones con clase de contraste explicita', () => {
    render(
      <Providers>
        <AccessibilityPanel />
      </Providers>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Visión' }));

    const options = screen.getByLabelText('Tipo de daltonismo').options;
    expect(options).toHaveLength(6);
    for (const option of options) {
      expect(option.className).toContain('text-zinc-100');
      expect(option.className).toContain('bg-zinc-900');
    }
  });

  it('no superpone texto blanco sobre fondo blanco', () => {
    render(
      <Providers>
        <AccessibilityPanel />
      </Providers>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Visión' }));

    const select = screen.getByLabelText('Tipo de daltonismo');
    expect(select.className).not.toContain('text-white');
    expect(select.className).not.toContain('bg-white');
  });

  it('el modo claro declara el fondo blanco con verde oscuro', () => {
    // Las reglas de `index.css` fijan `bg-white text-emerald-950` en tema claro.
    expect(LIGHT_PALETTE.card).toBe('#FFFFFF');
    expect(LIGHT_PALETTE.forest).toBe('#0A2E20');
  });
});