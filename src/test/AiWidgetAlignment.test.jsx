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
    expect(container.querySelector('.cacique-bot-float').className).toMatch(/bottom-6/);
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

  it('queda alineado en la esquina inferior izquierda en TODAS las pantallas', () => {
    // No debe variar por ruta: los paneles administrativos también lo alinean a
    // la izquierda, encima del botón de WhatsApp (`bottom-6 left-4`).
    for (const path of ['/menu', '/', '/admin', '/waiter', '/kitchen', '/cashier']) {
      const { container, unmount } = renderWidget(path);
      const launcher = container.querySelector('.cacique-bot-float');

      expect(launcher, `launcher ausente en ${path}`).toBeInTheDocument();
      expect(launcher).toHaveClass('fixed');
      expect(launcher).toHaveClass('bottom-6');
      expect(launcher).toHaveClass('left-4');
      expect(launcher).not.toHaveClass('right-4');
      expect(launcher).not.toHaveClass('right-6');

      unmount();
    }
  });

  it('mantiene el chat abierto en la misma columna que el launcher', () => {
    for (const path of ['/menu', '/admin']) {
      const { container, unmount } = renderWidget(path);

      fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));
      const panel = container.querySelector('#cacique-chat-panel');

      expect(panel).toBeInTheDocument();
      // El panel se apila sobre el launcher, sin salirse a la derecha.
      expect(container.querySelector('.cacique-chat-enter')).toHaveClass('left-4');
      expect(container.querySelector('.cacique-chat-enter')).not.toHaveClass('right-4');
      // Debe quedar por encima del launcher (bottom-24 > bottom-6).
      expect(container.querySelector('.cacique-chat-enter')).toHaveClass('bottom-24');

      unmount();
    }
  });

  it('mantiene la interactividad: el chat no bloquea el resto de la pagina', () => {
    const { container } = renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));

    // El overlay no cubre la pagina: no hay sibling fixed con inset-0.
    expect(container.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
    expect(container.querySelector('#cacique-chat-panel').className).toMatch(/pointer-events-auto/);
  });

  it('el encabezado del chat conserva únicamente el botón de cerrar', () => {
    const { container } = renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));

    // Un único control en el encabezado: cerrar (X de Lucide).
    const header = container.querySelector('#cacique-chat-panel > div');
    const headerButtons = header.querySelectorAll('button');
    expect(headerButtons).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Cerrar asistente' })).toBeInTheDocument();

    // No debe quedar el botón de minimizar ni el de "mostrar asistente".
    expect(screen.queryByRole('button', { name: /Minimizar asistente/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mostrar asistente virtual' })).not.toBeInTheDocument();
  });
});