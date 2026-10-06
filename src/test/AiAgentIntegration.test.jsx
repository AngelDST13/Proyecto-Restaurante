import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import AiAgentWidget from '../components/AiAgentWidget';

const { triggerMock } = vi.hoisted(() => ({ triggerMock: vi.fn() }));
vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: triggerMock,
  subscribeToLiveEvents: vi.fn(() => () => {})
}));

const renderWidget = route => render(<AuthProvider><MemoryRouter initialEntries={[route]}><AiAgentWidget /></MemoryRouter></AuthProvider>);

const originalScrollIntoView = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
afterEach(() => {
  if (originalScrollIntoView) Object.defineProperty(Element.prototype, 'scrollIntoView', originalScrollIntoView);
  else delete Element.prototype.scrollIntoView;
});

describe('Widget del agente IA', () => {
  it('se posiciona a la izquierda en vistas públicas y alterna el chat con un unico boton', () => {
    const { container } = renderWidget('/menu');
    expect(container.querySelector('.cacique-bot-float')).toHaveClass('left-4');
    expect(container.querySelector('.cacique-bot-float')).toHaveClass('cacique-bot-bounce');
    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));
    expect(screen.getByRole('button', { name: 'Cerrar asistente virtual' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar asistente virtual' }));
    expect(screen.getByRole('button', { name: 'Abrir asistente virtual' })).toBeInTheDocument();
  });

  it('se posiciona en la esquina inferior izquierda también dentro de un panel interno', () => {
    const { container } = renderWidget('/admin');
    const launcher = container.querySelector('.cacique-bot-float');
    expect(launcher).toHaveClass('left-4');
    expect(launcher).toHaveClass('bottom-24');
    expect(launcher).not.toHaveClass('right-4');
    // En /admin el asistente es la analitica interna; Cocina/Mesero usan el operativo.
    expect(screen.getByText('IA Analítica Administrativa')).toBeInTheDocument();
  });

  it('en Cocina usa el asistente operativo del personal', () => {
    renderWidget('/kitchen');
    expect(screen.getByText('IA Operativa Staff')).toBeInTheDocument();
  });

  it('rechaza prompts con emojis y muestra respuestas, emojis limpios y errores del servicio', async () => {
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
    triggerMock.mockResolvedValueOnce({ success: true, respuesta: '¡Hola 👋!' });
    renderWidget('/menu');
    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));
    const input = screen.getByPlaceholderText('Escriba su consulta...');
    fireEvent.change(input, { target: { value: 'Dame el menú con emojis' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(await screen.findByText(/no utiliza emojis/i)).toBeInTheDocument();
    expect(triggerMock).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'Precio del chifrijo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(await screen.findByText('¡Hola !')).toBeInTheDocument();
    expect(triggerMock).toHaveBeenCalledOnce();

    // n8n caido: el cliente recibe la respuesta local, nunca el error tecnico.
    triggerMock.mockResolvedValueOnce({ success: false, offline: true, respuesta: 'Verifique que el workflow esté en estado Published.' });
    fireEvent.change(input, { target: { value: 'Sedes del restaurante' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(await screen.findByText(/Nuestras sedes:/)).toBeInTheDocument();
    expect(screen.queryByText(/Published/)).not.toBeInTheDocument();
  });
});
