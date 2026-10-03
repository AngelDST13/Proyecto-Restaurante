import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Sistema de accesibilidad de "Chicharronera El Cacique".
 *
 * Gestiona tres ejes independientes:
 *  1. Escala tipográfica (WCAG 1.4.4).
 *  2. Tema claro/oscuro con la paleta oficial de marca.
 *  3. Filtros para los 5 tipos de daltonismo más comunes (WCAG 1.4.1).
 */

// eslint-disable-next-line react-refresh/only-export-components
export const AccessibilityContext = createContext();

/** Escala tipográfica: -1 Pequeño, 0 Normal, 1 Grande, 2 Muy Grande. */
// eslint-disable-next-line react-refresh/only-export-components
export const FONT_SIZE_MAP = {
  '-1': '90%',
  0: '100%',
  1: '110%',
  2: '120%',
};

/** Paleta oficial del Modo Claro (artesanal / gourmet). */
// eslint-disable-next-line react-refresh/only-export-components
export const LIGHT_PALETTE = {
  canvas: '#FDFBF7',
  surface: '#F8F5EE',
  card: '#FFFFFF',
  border: '#2D5A27',
  heading: '#0F291E',
  text: '#18181B',
  accent: '#E65100',
  accentAlt: '#D97706',
};

/** Paleta original del Modo Oscuro. */
// eslint-disable-next-line react-refresh/only-export-components
export const DARK_PALETTE = {
  canvas: '#0A090C',
  surface: '#001812',
  card: '#0A090C',
  border: '#659B5E',
  heading: '#F8FFE5',
  text: '#F8FFE5',
  accent: '#D16014',
  accentAlt: '#D97706',
};

/**
 * Catálogo de filtros de daltonismo. Cada modo expone:
 *  - `className`: clase aplicada a <html> y al contenedor raíz.
 *  - `filterId`: id del filtro SVG (feColorMatrix) definido en AccessibilityPanel.
 *  - `description`: texto leído por el TalkBack y mostrado en el panel.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const COLOR_BLIND_MODES = [
  {
    id: 'none',
    label: 'Visión normal',
    className: 'cb-none',
    filterId: null,
    description: 'Sin ajustes de color. Paleta original de la marca.',
  },
  {
    id: 'protanopia',
    label: 'Protanopía (deficiencia de rojo)',
    className: 'cb-protanopia',
    filterId: 'cb-filter-protanopia',
    description: 'Los rojos se sustituyen por matices de azul y amarillo de alto contraste.',
  },
  {
    id: 'deuteranopia',
    label: 'Deuteranopía (deficiencia de verde)',
    className: 'cb-deuteranopia',
    filterId: 'cb-filter-deuteranopia',
    description: 'Los verdes se ajustan a tonos oliva y azul acero.',
  },
  {
    id: 'tritanopia',
    label: 'Tritanopía (deficiencia de azul)',
    className: 'cb-tritanopia',
    filterId: 'cb-filter-tritanopia',
    description: 'Los acentos azules se adaptan a tonos rosados y rojos claros.',
  },
  {
    id: 'acromatopsia',
    label: 'Acromatopsia (monocromatismo)',
    className: 'cb-acromatopsia',
    filterId: 'cb-filter-acromatopsia',
    description: 'Escala de grises pura de alto contraste.',
  },
  {
    id: 'alto-contraste',
    label: 'Alto contraste mejorado',
    className: 'cb-alto-contraste',
    filterId: 'cb-filter-alto-contraste',
    description: 'Fondos negros o blancos puros con bordes amarillos fluorescentes.',
  },
];

const COLOR_BLIND_STORAGE_KEY = 'cacique_color_blind_mode';
const THEME_STORAGE_KEY = 'cacique_theme';

const isValidColorBlindMode = (value) => COLOR_BLIND_MODES.some((mode) => mode.id === value);

const readStoredValue = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStoredValue = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Almacenamiento no disponible (modo privado): la preferencia dura la sesión.
  }
};

export function AccessibilityProvider({ children }) {
  const [fontSizeLevel, setFontSizeLevel] = useState(0);
  const [theme, setThemeState] = useState(() => {
    const stored = readStoredValue(THEME_STORAGE_KEY, 'dark');
    return stored === 'light' ? 'light' : 'dark';
  });
  const [colorBlindMode, setColorBlindModeState] = useState(() => {
    const stored = readStoredValue(COLOR_BLIND_STORAGE_KEY, 'none');
    return isValidColorBlindMode(stored) ? stored : 'none';
  });

  const increaseFontSize = useCallback(() => setFontSizeLevel((prev) => Math.min(prev + 1, 2)), []);
  const decreaseFontSize = useCallback(() => setFontSizeLevel((prev) => Math.max(prev - 1, -1)), []);
  const resetFontSize = useCallback(() => setFontSizeLevel(0), []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((nextTheme) => {
    if (nextTheme !== 'light' && nextTheme !== 'dark') return;
    setThemeState(nextTheme);
  }, []);

  const setColorBlindMode = useCallback((modeId) => {
    if (!isValidColorBlindMode(modeId)) return;
    setColorBlindModeState(modeId);
  }, []);

  const resetColorBlindMode = useCallback(() => setColorBlindModeState('none'), []);

  // Escala tipográfica sobre el elemento raíz.
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[String(fontSizeLevel)] ?? '100%';
  }, [fontSizeLevel]);

  // Tema: clase, atributo y variables CSS de la paleta oficial.
  useEffect(() => {
    const root = document.documentElement;
    const palette = theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE;

    root.classList.toggle('theme-light', theme === 'light');
    root.classList.toggle('theme-dark', theme === 'dark');
    root.setAttribute('data-theme', theme);

    root.style.setProperty('--cacique-canvas', palette.canvas);
    root.style.setProperty('--cacique-surface', palette.surface);
    root.style.setProperty('--cacique-card', palette.card);
    root.style.setProperty('--cacique-border', palette.border);
    root.style.setProperty('--cacique-heading', palette.heading);
    root.style.setProperty('--cacique-text', palette.text);
    root.style.setProperty('--cacique-accent', palette.accent);
    root.style.setProperty('--cacique-accent-alt', palette.accentAlt);

    root.style.setProperty('--cacique-border-alpha', `${palette.border}33`);
    root.style.setProperty('--cacique-accent-alpha', `${palette.accent}1f`);
    root.style.setProperty(
      '--cacique-logo-glow',
      theme === 'light'
        ? 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 8px rgba(230, 81, 0, 0.3))'
        : 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.4))',
    );

    writeStoredValue(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Filtro de daltonismo: clase + atributo en <html>.
  useEffect(() => {
    const root = document.documentElement;
    const mode = COLOR_BLIND_MODES.find((item) => item.id === colorBlindMode) ?? COLOR_BLIND_MODES[0];

    COLOR_BLIND_MODES.forEach((item) => root.classList.remove(item.className));
    root.classList.add(mode.className);
    root.setAttribute('data-colorblind', mode.id);

    writeStoredValue(COLOR_BLIND_STORAGE_KEY, mode.id);
  }, [colorBlindMode]);

  const value = useMemo(
    () => ({
      fontSizeLevel,
      increaseFontSize,
      decreaseFontSize,
      resetFontSize,
      theme,
      isLightTheme: theme === 'light',
      toggleTheme,
      setTheme,
      colorBlindMode,
      setColorBlindMode,
      resetColorBlindMode,
      colorBlindModes: COLOR_BLIND_MODES,
      activeColorBlindClass:
        COLOR_BLIND_MODES.find((item) => item.id === colorBlindMode)?.className ?? 'cb-none',
    }),
    [
      fontSizeLevel,
      increaseFontSize,
      decreaseFontSize,
      resetFontSize,
      theme,
      toggleTheme,
      setTheme,
      colorBlindMode,
      setColorBlindMode,
      resetColorBlindMode,
    ],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe usarse dentro de un AccessibilityProvider');
  }
  return context;
};