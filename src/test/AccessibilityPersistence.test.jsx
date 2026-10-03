import { describe, expect, it, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  AccessibilityProvider,
  LIGHT_PALETTE,
  useAccessibility,
} from '../context/AccessibilityContext';
import { TalkBackProvider, useTalkBack } from '../context/TalkBackContext';

const THEME_KEY = 'cacique_theme';
const COLOR_KEY = 'cacique_color_blind_mode';
const FONT_KEY = 'cacique_font_scale';
const TALKBACK_KEY = 'cacique_talkback_enabled';
const RATE_KEY = 'cacique_talkback_rate';

function PreferencesProbe() {
  const { theme, setTheme, colorBlindMode, setColorBlindMode, increaseFontSize } = useAccessibility();
  const { isEnabled, toggleTalkBack, rate, changeRate } = useTalkBack();

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="colorblind">{colorBlindMode}</span>
      <span data-testid="talkback">{String(isEnabled)}</span>
      <span data-testid="rate">{rate}</span>
      <button type="button" onClick={() => setTheme('light')}>tema claro</button>
      <button type="button" onClick={() => setTheme('dark')}>tema oscuro</button>
      <button type="button" onClick={() => setColorBlindMode('deuteranopia')}>deuteranopia</button>
      <button type="button" onClick={toggleTalkBack}>toggle talkback</button>
      <button type="button" onClick={() => changeRate(1.2)}>velocidad rapida</button>
      <button type="button" onClick={increaseFontSize}>aumentar texto</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <AccessibilityProvider>
      <TalkBackProvider>
        <PreferencesProbe />
      </TalkBackProvider>
    </AccessibilityProvider>,
  );

describe('Persistencia de preferencias de accesibilidad', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-colorblind');
    document.documentElement.style.fontSize = '';
  });

  it('guarda TalkBack, tema, daltonismo, escala de texto y velocidad en localStorage', () => {
    renderProbe();

    fireEvent.click(screen.getByText('tema claro'));
    fireEvent.click(screen.getByText('deuteranopia'));
    fireEvent.click(screen.getByText('toggle talkback'));
    fireEvent.click(screen.getByText('velocidad rapida'));
    fireEvent.click(screen.getByText('aumentar texto'));

    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(localStorage.getItem(COLOR_KEY)).toBe('deuteranopia');
    expect(localStorage.getItem(TALKBACK_KEY)).toBe('true');
    expect(localStorage.getItem(RATE_KEY)).toBe('1.2');
    expect(localStorage.getItem(FONT_KEY)).toBe('1');
  });

  it('restaura todas las preferencias desde el primer render', () => {
    localStorage.setItem(THEME_KEY, 'light');
    localStorage.setItem(COLOR_KEY, 'tritanopia');
    localStorage.setItem(TALKBACK_KEY, 'true');
    localStorage.setItem(RATE_KEY, '0.8');
    localStorage.setItem(FONT_KEY, '2');

    renderProbe();

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('colorblind')).toHaveTextContent('tritanopia');
    expect(screen.getByTestId('talkback')).toHaveTextContent('true');
    expect(screen.getByTestId('rate')).toHaveTextContent('0.8');
    expect(document.documentElement.style.fontSize).toBe('120%');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.documentElement).toHaveAttribute('data-colorblind', 'tritanopia');
    expect(document.documentElement).toHaveClass('theme-light');
  });

  it('descarta valores guardados invalidos', () => {
    localStorage.setItem(FONT_KEY, '99');
    localStorage.setItem(COLOR_KEY, 'modo-inexistente');
    localStorage.setItem(THEME_KEY, 'neon');

    renderProbe();

    expect(document.documentElement.style.fontSize).toBe('100%');
    expect(screen.getByTestId('colorblind')).toHaveTextContent('none');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('aplica la paleta artesanal clara (Beige / Cafe / Verde Menta)', () => {
    expect(LIGHT_PALETTE.canvas).toBe('#F5EFE6');
    expect(LIGHT_PALETTE.card).toBe('#FFFFFF');
    expect(LIGHT_PALETTE.surface).toBe('#E8F5E9');
    expect(LIGHT_PALETTE.border).toBe('#4A3525');
    expect(LIGHT_PALETTE.heading).toBe('#2C1A0E');
    expect(LIGHT_PALETTE.forest).toBe('#0F291E');
    expect(LIGHT_PALETTE.accent).toBe('#C86D12');
    expect(LIGHT_PALETTE.accentAlt).toBe('#D97706');
  });

  it('expone la sombra perimetral difuminada del logo Cacique en ambos temas', () => {
    localStorage.setItem(THEME_KEY, 'light');
    renderProbe();
    const light = document.documentElement.style.getPropertyValue('--cacique-logo-glow');
    expect(light).toContain('drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.85))');
  });
});