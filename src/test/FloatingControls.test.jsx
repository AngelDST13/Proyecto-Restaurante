import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WhatsAppFloatButton from '../components/WhatsAppFloatButton';
import AccessibilityPanel from '../components/AccessibilityPanel';
import AiAgentWidget from '../components/AiAgentWidget';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { TalkBackProvider } from '../context/TalkBackContext';
import { AuthProvider } from '../context/AuthContext';

/**
 * Columna flotante izquierda (WhatsApp + IA) y Dock de Accesibilidad:
 * ningun contenedor invisible debe capturar los clics de los botones.
 */

describe('Boton flotante de WhatsApp', () => {
  it('es un enlace directo, fijo abajo a la izquierda y con feedback tactil', () => {
    render(<WhatsAppFloatButton />);
    const link = screen.getByTestId('whatsapp-float');

    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://wa.me/50622008888');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    for (const token of [
      'fixed', 'bottom-6', 'left-4', 'z-50', 'pointer-events-auto', 'w-14', 'h-14', 'rounded-full',
      'bg-[#25D366]', 'hover:bg-[#20ba5a]', 'shadow-2xl', 'flex', 'items-center', 'justify-center',
      'active:scale-95', 'focus-visible:ring-2', 'focus-visible:ring-amber-500'
    ]) {
      expect(link, token).toHaveClass(token);
    }
  });

  it('no contiene capas superpuestas: solo el icono decorativo sin eventos', () => {
    render(<WhatsAppFloatButton />);
    const link = screen.getByRole('link', { name: 'WhatsApp El Cacique' });

    expect(link.children).toHaveLength(1);
    expect(link.firstElementChild.tagName.toLowerCase()).toBe('svg');
    expect(link.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(link.firstElementChild).toHaveClass('pointer-events-none');
    expect(link.querySelector('div')).toBeNull();
  });
});

describe('Dock de Accesibilidad', () => {
  beforeEach(() => window.localStorage.clear());

  const renderDock = () => render(
    <TalkBackProvider>
      <AccessibilityProvider>
        <AccessibilityPanel />
      </AccessibilityProvider>
    </TalkBackProvider>
  );

  it('no forma una franja de ancho completo que bloquee el puntero', () => {
    renderDock();
    const dock = screen.getByTestId('accessibility-dock');

    expect(dock).toHaveClass('pointer-events-none', 'right-4', 'bottom-4');
    expect(dock).not.toHaveClass('w-full');
    expect(screen.getByRole('button', { name: 'Abrir accesibilidad' })).toHaveClass('pointer-events-auto');
  });

  it('el panel abierto si recibe eventos', () => {
    renderDock();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    expect(screen.getByRole('region', { name: 'Panel de accesibilidad' })).toHaveClass('pointer-events-auto');
  });
});

describe('Columna izquierda: WhatsApp e IA alineados', () => {
  it('apila WhatsApp (bottom-6), launcher IA (bottom-24) y chat (bottom-44) en left-4', () => {
    const { container } = render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <AiAgentWidget />
          <WhatsAppFloatButton />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByTestId('whatsapp-float')).toHaveClass('bottom-6', 'left-4');
    expect(container.querySelector('.cacique-bot-float')).toHaveClass('bottom-24', 'left-4', 'z-50');

    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));
    const chat = container.querySelector('.cacique-chat-enter');
    for (const token of ['bottom-44', 'left-4', 'max-h-[80vh]', 'w-[90vw]', 'max-w-sm', 'sm:max-w-md', 'shadow-2xl', 'rounded-2xl', 'overflow-hidden']) {
      expect(chat, token).toHaveClass(token);
    }
  });

  it('la barra del chat solo tiene el boton de cierre', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AiAgentWidget />
        </MemoryRouter>
      </AuthProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente virtual' }));

    const header = screen.getByRole('heading', { name: /Cacique Bot IA/i }).closest('.justify-between');
    const headerButtons = header.querySelectorAll('button');
    expect(headerButtons).toHaveLength(1);
    expect(headerButtons[0]).toHaveAccessibleName('Cerrar asistente');
  });

  it('el widget conserva su paleta oscura en Modo Claro', () => {
    const { container } = render(
      <AuthProvider>
        <MemoryRouter>
          <AiAgentWidget />
        </MemoryRouter>
      </AuthProvider>
    );
    expect(container.firstElementChild).toHaveClass('cacique-keep-colors');
  });
});
