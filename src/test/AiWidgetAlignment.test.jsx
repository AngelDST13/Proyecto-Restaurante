import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AiAgentWidget from '../components/AiAgentWidget';

const { triggerN8nAutomation } = vi.hoisted(() => ({
  triggerN8nAutomation: vi.fn(async () => ({ respuesta: 'Respuesta de prueba' })),
}));

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: (...args) => triggerN8nAutomation(...args),
  subscribeToLiveEvents: () => () => {},
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

function renderWidget(path = '/menu') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AiAgentWidget />
    </MemoryRouter>,
  );
}

describe('Alineacion del boton circular del Asistente IA', () => {
  beforeEach(() => {
    triggerN8nAutomation.mockClear();
  });

  it('expone un unico boton circular amber-600 sin boton de ojo tachado', () => {
    const { container } = renderWidget();

    expect(screen.queryByRole('button', { name: 'Ocultar asistente' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mostrar asistente virtual' })).not.toBeInTheDocument();

    const launcher = container.querySelector('.cacique-bot-float button');
    expect(launcher).toBeInTheDocument();
    expect(container.querySelectorAll('.cacique-bot-float button')).toHaveLength(1);

    const className = launcher.className;
    expect(className).toMatch(/w-14/);
    expect(className).toMatch(/h-14/);
    expect(className).toMatch(/rounded-full/);
    expect(className).toMatch(/shadow-lg/);
    expect(className).toMatch(/bg-amber-600/);

    // Alineado en la esquina inferior izquierda en vistas publicas.
    expect(container.querySelector('.cacique-bot-float').className).toMatch(/left-4/);
    expect(container.querySelector('.cacique-bot-float').className).toMatch(/bottom-24/);
  });

  it('abre y cierra inmediatamente la ventana del chat al pulsar el boton', () => {
    const { container } = renderWidget();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));
    expect(container.querySelector('#cacique-chat-panel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar asistente virtual' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar asistente virtual' }));
    expect(container.querySelector('#cacique-chat-panel')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir asistente virtual' })).toBeInTheDocument();
  });

  it('minimiza al hacer clic fuera del widget y al presionar Escape', () => {
    renderWidget();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));
    fireEvent.mouseDown(document.body);
    expect(screen.getByRole('button', { name: 'Abrir asistente virtual' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Abrir asistente virtual' })).toBeInTheDocument();
  });

  it('mantiene la interactividad: el chat no bloquea el resto de la pagina', () => {
    const { container } = renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));

    // El overlay no cubre la pagina: no hay sibling fixed con inset-0.
    expect(container.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
    expect(container.querySelector('#cacique-chat-panel').className).toMatch(/pointer-events-auto/);
  });
});