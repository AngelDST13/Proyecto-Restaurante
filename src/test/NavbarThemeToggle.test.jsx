import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import Navbar from '../components/Navbar';
import { AccessibilityProvider, LIGHT_PALETTE } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';

/**
 * Alternancia de tema desde el conmutador rapido del Navbar
 * (Lucide Sun / Moon) y resplandor del logo Cacique.svg.
 */

const renderNavbar = () =>
  render(
    <AuthProvider>
      <AccessibilityProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AccessibilityProvider>
    </AuthProvider>,
  );

describe('NavbarThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  it('muestra el conmutador en modo oscuro con el icono Sun', () => {
    renderNavbar();

    const toggle = screen.getByRole('button', { name: 'Activar modo claro' });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle.querySelector('svg')).not.toBeNull();
  });

  it('alterna a modo claro con un solo clic y actualiza el icono a Moon', () => {
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: 'Activar modo claro' }));

    expect(document.documentElement).toHaveClass('theme-light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    const back = screen.getByRole('button', { name: 'Activar modo oscuro' });
    expect(back).toHaveAttribute('aria-pressed', 'true');
  });

  it('vuelve a modo oscuro con un segundo clic', () => {
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: 'Activar modo claro' }));
    fireEvent.click(screen.getByRole('button', { name: 'Activar modo oscuro' }));

    expect(document.documentElement).toHaveClass('theme-dark');
    expect(document.documentElement).not.toHaveClass('theme-light');
  });

  it('aplica las variables CSS de la paleta artesanal clara', () => {
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: 'Activar modo claro' }));

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--cacique-canvas')).toBe(LIGHT_PALETTE.canvas);
    expect(root.style.getPropertyValue('--cacique-surface')).toBe(LIGHT_PALETTE.surface);
    expect(root.style.getPropertyValue('--cacique-card')).toBe(LIGHT_PALETTE.card);
    expect(root.style.getPropertyValue('--cacique-heading')).toBe(LIGHT_PALETTE.heading);
    expect(root.style.getPropertyValue('--cacique-forest')).toBe(LIGHT_PALETTE.forest);
    expect(root.style.getPropertyValue('--cacique-accent')).toBe(LIGHT_PALETTE.accent);
  });

  it('persiste la preferencia de tema entre montajes', () => {
    const { unmount } = renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: 'Activar modo claro' }));
    expect(window.localStorage.getItem('cacique_theme')).toBe('light');
    unmount();

    renderNavbar();
    expect(screen.getByRole('button', { name: 'Activar modo oscuro' })).toBeInTheDocument();
  });

  it('expone el conmutador tambien en el menu movil', () => {
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: 'Alternar menú de navegación' }));
    const toggles = screen.getAllByRole('button', { name: 'Activar modo claro' });
    expect(toggles.length).toBeGreaterThanOrEqual(2);
  });

  it('muestra Cacique.svg con resplandor dorado en Modo Oscuro', () => {
    renderNavbar();

    const logo = screen.getByAltText('Logo El Cacique');
    expect(logo).toHaveClass('cacique-logo');
    // El resplandor dorado se aplica en index.css segun data-variant.
    expect(logo).toHaveAttribute('data-variant', 'dark');
    expect(logo.getAttribute('src')).toMatch(/Cacique.svg/);
  });

  it('el conmutador mantiene el branding completo sin recortarse', () => {
    renderNavbar();

    expect(screen.getByText('EL CACIQUE')).toBeInTheDocument();
    expect(screen.getByText('CHICHARRONERA GOURMET')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir al inicio de El Cacique' })).toBeInTheDocument();
  });

  it('el conmutador no duplica los controles del Dock flotante', () => {
    renderNavbar();

    // El Navbar ofrece tema, pero no TalkBack, daltonismo ni escalado de texto.
    expect(screen.queryByRole('button', { name: /Aumentar tamaño de letra/i })).toBeNull();
    expect(screen.queryByLabelText('Tipo de daltonismo')).toBeNull();
  });
});