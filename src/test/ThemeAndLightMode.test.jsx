import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider, LIGHT_PALETTE, useAccessibility } from '../context/AccessibilityContext';
import AccessibilityPanel from '../components/AccessibilityPanel';
import Navbar from '../components/Navbar';
import { TalkBackProvider } from '../context/TalkBackContext';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';

/**
 * Pruebas del Modo Claro: alternancia, variables CSS de la paleta oficial
 * y el resplandor del logo Cacique.svg.
 */

function ThemeControls() {
  const { theme, isLightTheme, toggleTheme, setTheme } = useAccessibility();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="isLight">{String(isLightTheme)}</span>
      <button type="button" onClick={toggleTheme}>Alternar tema</button>
      <button type="button" onClick={() => setTheme('light')}>Forzar claro</button>
      <button type="button" onClick={() => setTheme('oscuro-invalido')}>Forzar invalido</button>
    </div>
  );
}

const renderWithProviders = (ui) =>
  render(
    <TalkBackProvider>
      <AccessibilityProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </AccessibilityProvider>
    </TalkBackProvider>,
  );

describe('ThemeAndLightMode', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  it('arranca en modo oscuro por defecto y aplica las variables del tema oscuro', () => {
    renderWithProviders(<ThemeControls />);

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveClass('theme-dark');
    expect(document.documentElement).not.toHaveClass('theme-light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement.style.getPropertyValue('--cacique-canvas')).toBe('#0A090C');
  });

  it('alterna a modo claro y aplica la paleta oficial artesanal', () => {
    renderWithProviders(<ThemeControls />);

    fireEvent.click(screen.getByRole('button', { name: 'Alternar tema' }));

    const root = document.documentElement;
    expect(screen.getByTestId('isLight')).toHaveTextContent('true');
    expect(root).toHaveClass('theme-light');
    expect(root).not.toHaveClass('theme-dark');
    expect(root).toHaveAttribute('data-theme', 'light');
    expect(root.style.getPropertyValue('--cacique-canvas')).toBe(LIGHT_PALETTE.canvas);
    expect(root.style.getPropertyValue('--cacique-surface')).toBe(LIGHT_PALETTE.surface);
    expect(root.style.getPropertyValue('--cacique-card')).toBe(LIGHT_PALETTE.card);
    expect(root.style.getPropertyValue('--cacique-heading')).toBe(LIGHT_PALETTE.heading);
    expect(root.style.getPropertyValue('--cacique-text')).toBe(LIGHT_PALETTE.text);
    expect(root.style.getPropertyValue('--cacique-accent')).toBe(LIGHT_PALETTE.accent);
    expect(root.style.getPropertyValue('--cacique-accent-alt')).toBe(LIGHT_PALETTE.accentAlt);
  });

  it('usa la paleta clara con contraste legible: marfil, blanco puro y verde hoja', () => {
    expect(LIGHT_PALETTE.canvas).toBe('#FDFBF7');
    expect(LIGHT_PALETTE.surface).toBe('#F8F5EE');
    expect(LIGHT_PALETTE.card).toBe('#FFFFFF');
    expect(LIGHT_PALETTE.border).toBe('#2D5A27');
    expect(LIGHT_PALETTE.heading).toBe('#0F291E');
    expect(LIGHT_PALETTE.accent).toBe('#E65100');
    expect(LIGHT_PALETTE.accentAlt).toBe('#D97706');
  });

  it('persiste el tema seleccionado y lo restaura en el siguiente montaje', () => {
    const { unmount } = renderWithProviders(<ThemeControls />);
    fireEvent.click(screen.getByRole('button', { name: 'Alternar tema' }));
    expect(window.localStorage.getItem('cacique_theme')).toBe('light');
    unmount();

    renderWithProviders(<ThemeControls />);
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement).toHaveClass('theme-light');
  });

  it('ignora un valor de tema corrupto almacenado', () => {
    window.localStorage.setItem('cacique_theme', 'neon-punk');
    renderWithProviders(<ThemeControls />);
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('ignora un setTheme con valor no soportado', () => {
    renderWithProviders(<ThemeControls />);
    fireEvent.click(screen.getByRole('button', { name: 'Forzar invalido' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('acepta un setTheme valido para el modo claro y el oscuro', () => {
    renderWithProviders(<ThemeControls />);

    fireEvent.click(screen.getByRole('button', { name: 'Forzar claro' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement).toHaveClass('theme-light');

    fireEvent.click(screen.getByRole('button', { name: 'Alternar tema' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('cierra el panel de accesibilidad con Escape y con clic fuera', () => {
    render(
      <TalkBackProvider>
        <AccessibilityProvider>
          <AccessibilityPanel />
        </AccessibilityProvider>
      </TalkBackProvider>,
    );

    const openPanel = screen.getByRole('button', { name: 'Abrir panel de accesibilidad' });
    fireEvent.click(openPanel);
    expect(screen.getByRole('region', { name: 'Panel de accesibilidad' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('region', { name: 'Panel de accesibilidad' })).not.toBeInTheDocument();

    fireEvent.click(openPanel);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('region', { name: 'Panel de accesibilidad' })).not.toBeInTheDocument();

    fireEvent.click(openPanel);
    fireEvent.mouseDown(screen.getByRole('region', { name: 'Panel de accesibilidad' }));
    expect(screen.getByRole('region', { name: 'Panel de accesibilidad' })).toBeInTheDocument();
  });

  it('expone el resplandor claro y ambar del logo Cacique.svg', () => {
    renderWithProviders(<ThemeControls />);

    const darkGlow = document.documentElement.style.getPropertyValue('--cacique-logo-glow');
    expect(darkGlow).toContain('rgba(245, 158, 11, 0.4)');

    fireEvent.click(screen.getByRole('button', { name: 'Alternar tema' }));

    const lightGlow = document.documentElement.style.getPropertyValue('--cacique-logo-glow');
    expect(lightGlow).toContain('rgba(255, 255, 255, 0.9)');
    expect(lightGlow).toContain('rgba(230, 81, 0, 0.3)');
  });

  it('renderiza el logo Cacique.svg con la clase de resplandor en el Navbar', () => {
    render(
      <TalkBackProvider>
        <AuthProvider>
          <AccessibilityProvider>
            <MemoryRouter>
              <Navbar />
            </MemoryRouter>
          </AccessibilityProvider>
        </AuthProvider>
      </TalkBackProvider>,
    );

    const logo = screen.getByAltText('Logo El Cacique');
    expect(logo.tagName).toBe('IMG');
    expect(logo).toHaveClass('cacique-logo');
    expect(logo.getAttribute('src')).toContain('Cacique');
  });

  it('permite cambiar el tema desde el boton del Navbar', () => {
    render(
      <TalkBackProvider>
        <AuthProvider>
          <AccessibilityProvider>
            <MemoryRouter>
              <Navbar />
            </MemoryRouter>
          </AccessibilityProvider>
        </AuthProvider>
      </TalkBackProvider>,
    );

    const toggle = screen.getByRole('button', { name: 'Activar modo claro' });
    fireEvent.click(toggle);
    expect(document.documentElement).toHaveClass('theme-light');
    expect(screen.getByRole('button', { name: 'Activar modo oscuro' })).toBeInTheDocument();
  });

  it('expone el contenedor raiz del que depende el filtro visual', () => {
    const { container } = render(<App />);
    expect(container.querySelector('#cacique-app-root')).not.toBeNull();
    expect(container.querySelector('#cacique-aria-live-region')).toHaveAttribute('aria-live', 'polite');
  });

  it('mantiene la escala tipografica junto al cambio de tema', () => {
    function FontControls() {
      const { increaseFontSize, decreaseFontSize, resetFontSize, toggleTheme, fontSizeLevel } =
        useAccessibility();
      return (
        <div>
          <span data-testid="level">{fontSizeLevel}</span>
          <button type="button" onClick={increaseFontSize}>Mas grande</button>
          <button type="button" onClick={decreaseFontSize}>Mas pequena</button>
          <button type="button" onClick={resetFontSize}>Normal</button>
          <button type="button" onClick={toggleTheme}>Tema</button>
        </div>
      );
    }

    renderWithProviders(<FontControls />);

    fireEvent.click(screen.getByRole('button', { name: 'Mas grande' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mas grande' }));
    expect(document.documentElement.style.fontSize).toBe('120%');

    fireEvent.click(screen.getByRole('button', { name: 'Tema' }));
    expect(document.documentElement.style.fontSize).toBe('120%');

    fireEvent.click(screen.getByRole('button', { name: 'Mas pequena' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mas pequena' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mas pequena' }));
    expect(document.documentElement.style.fontSize).toBe('90%');

    fireEvent.click(screen.getByRole('button', { name: 'Normal' }));
    expect(document.documentElement.style.fontSize).toBe('100%');
  });

  it('lanza un error claro si el hook se usa fuera del proveedor', () => {
    function Orphan() {
      useAccessibility();
      return null;
    }
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(
      /debe usarse dentro de un AccessibilityProvider/,
    );
    consoleError.mockRestore();
  });

  it('sigue funcionando cuando localStorage no esta disponible', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('almacenamiento bloqueado');
      },
    });

    act(() => {
      renderWithProviders(<ThemeControls />);
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    fireEvent.click(screen.getByRole('button', { name: 'Alternar tema' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    Object.defineProperty(window, 'localStorage', original);
  });
});


