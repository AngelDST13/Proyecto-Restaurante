import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AiAgentWidget from '../components/AiAgentWidget';

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(async () => ({ respuesta: 'ok' })),
  subscribeToLiveEvents: () => () => {},
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

const openChat = () => fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));

describe('Encabezado del chat Cacique Bot IA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('contiene unicamente el boton de cerrar (X) y no el de minimizar (-)', () => {
    render(
      <MemoryRouter initialEntries={['/menu']}>
        <AiAgentWidget />
      </MemoryRouter>,
    );

    openChat();

    expect(screen.getByRole('button', { name: 'Cerrar asistente' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Minimizar asistente' })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Minimizar')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Cerrar')).not.toBeNull();
  });

  it('expone exactamente un control accionable en el encabezado', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/menu']}>
        <AiAgentWidget />
      </MemoryRouter>,
    );

    openChat();

    const header = container.querySelector('#cacique-chat-panel > div');
    const headerButtons = header.querySelectorAll('button');
    expect(headerButtons).toHaveLength(1);
    expect(headerButtons[0]).toHaveAttribute('aria-label', 'Cerrar asistente');
  });

  it('el boton X cierra el chat y el launcher circular vuelve a la posicion alineada', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/menu']}>
        <AiAgentWidget />
      </MemoryRouter>,
    );

    openChat();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar asistente' }));

    expect(container.querySelector('#cacique-chat-panel')).not.toBeInTheDocument();
    const launcher = container.querySelector('.cacique-bot-float');
    expect(launcher.className).toMatch(/left-4/);
    expect(launcher.className).toMatch(/bottom-24/);
  });

  it('el panel se situa encima del launcher sin bloquear la pagina', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/menu']}>
        <AiAgentWidget />
      </MemoryRouter>,
    );

    openChat();

    const panel = container.querySelector('.cacique-chat-enter');
    expect(panel.className).toMatch(/bottom-44/);
    expect(panel.className).toMatch(/left-4/);
    expect(container.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
  });
});