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

  it('usa la paleta clara Gourmet con contraste legible: crema, esmeralda y ambar', () => {
    expect(LIGHT_PALETTE.canvas).toBe('#F4F0EA');
    expect(LIGHT_PALETTE.surface).toBe('#FDFBF7');
    expect(LIGHT_PALETTE.card).toBe('#062319');
    expect(LIGHT_PALETTE.border).toBe('#2D5A27');
    expect(LIGHT_PALETTE.heading).toBe('#0A2E20');
    expect(LIGHT_PALETTE.accent).toBe('#D97706');
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

  it('cierra el Dock de accesibilidad con Escape y con su boton de cierre', () => {
    render(
      <TalkBackProvider>
        <AccessibilityProvider>
          <AccessibilityPanel />
        </AccessibilityProvider>
      </TalkBackProvider>,
    );

    const openPanel = screen.getByRole('button', { name: 'Abrir accesibilidad' });
    fireEvent.click(openPanel);
    expect(screen.getByRole('region', { name: 'Panel de accesibilidad' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('region', { name: 'Panel de accesibilidad' })).not.toBeInTheDocument();

    fireEvent.click(openPanel);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar panel de accesibilidad' }));
    expect(screen.queryByRole('region', { name: 'Panel de accesibilidad' })).not.toBeInTheDocument();

    // El Dock permanece montado: solo se oculta su contenido.
    expect(openPanel).toBeInTheDocument();
  });

  it('expone el Dock con las cuatro pestañas de accesibilidad', () => {
    render(
      <TalkBackProvider>
        <AccessibilityProvider>
          <AccessibilityPanel />
        </AccessibilityProvider>
      </TalkBackProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));

    for (const tab of ['Voz', 'Tema', 'Visión', 'Texto']) {
      expect(screen.getByRole('tab', { name: tab })).toBeInTheDocument();
    }
    expect(screen.getByRole('tab', { name: 'Voz' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('dock-tab-voz')).toBeInTheDocument();
  });

  it('expone el cambio de tema desde la pestaña Tema del Dock', () => {
    render(
      <TalkBackProvider>
        <AccessibilityProvider>
          <AccessibilityPanel />
        </AccessibilityProvider>
      </TalkBackProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir accesibilidad' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Tema' }));
    expect(screen.getByTestId('dock-tab-tema')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Activar modo claro' }));
    expect(document.documentElement).toHaveClass('theme-light');
    expect(screen.getByRole('button', { name: 'Activar modo oscuro' })).toBeInTheDocument();
  });

  it('expone el resplandor claro y ambar del logo Cacique.svg', () => {
    renderWithProviders(<ThemeControls />);

    const darkGlow = document.documentElement.style.getPropertyValue('--cacique-logo-glow');
    expect(darkGlow).toContain('rgba(245, 158, 11, 0.4)');

    fireEvent.click(screen.getByRole('button', { name: 'Alternar tema' }));

    const lightGlow = document.documentElement.style.getPropertyValue('--cacique-logo-glow');
    expect(lightGlow).toContain('rgba(0, 0, 0, 0.6)');
    expect(lightGlow).toContain('rgba(255, 255, 255, 0.9)');
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

  it('mantiene el Navbar limpio, sin controles de accesibilidad duplicados', () => {
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

    // La barra solo conserva navegacion, reserva y sesion.
    for (const label of ['Inicio', 'Nosotros', 'Eventos', 'AGENDAR RESERVA']) {
      expect(screen.getAllByRole('button', { name: new RegExp(label, 'i') }).length).toBeGreaterThan(0);
    }

    // Los controles de accesibilidad viven exclusivamente en el Dock flotante.
    for (const label of [
      /Aumentar tamaño de letra/i,
      /Disminuir tamaño de letra/i,
      /Tipo de daltonismo/i,
      /Activar lector de voz/i,
    ]) {
      expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    }
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



