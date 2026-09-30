import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import AiAgentWidget from '../components/AiAgentWidget';

const renderWidget = route => render(<AuthProvider><MemoryRouter initialEntries={[route]}><AiAgentWidget /></MemoryRouter></AuthProvider>);

describe('Widget del agente IA', () => {
  it('se posiciona a la izquierda en vistas públicas y puede ocultarse y mostrarse', () => {
    const { container } = renderWidget('/menu');
    expect(container.querySelector('.cacique-bot-float')).toHaveClass('left-4');
    expect(container.querySelector('.cacique-bot-float')).toHaveClass('cacique-bot-bounce');
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar asistente' }));
    expect(screen.getByRole('button', { name: 'Mostrar asistente virtual' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar asistente virtual' }));
    expect(screen.getByRole('button', { name: 'Abrir asistente virtual' })).toBeInTheDocument();
  });

  it('se posiciona a la derecha dentro de un panel interno', () => {
    const { container } = renderWidget('/admin');
    expect(container.querySelector('.cacique-bot-float')).toHaveClass('right-4');
    expect(screen.getByText('IA Operativa Staff')).toBeInTheDocument();
  });
});
