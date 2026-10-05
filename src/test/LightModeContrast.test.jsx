import { beforeAll, describe, expect, it } from 'vitest';
import { LIGHT_PALETTE } from '../context/AccessibilityContext';

/**
 * Contrato de `index.css` para el Modo Claro Gourmet.
 *
 * jsdom no aplica cascadas de Tailwind, por lo que se valida la hoja de
 * estilos como texto: los remapeos deben quedar fuera de `@layer` (de lo
 * contrario `@layer utilities` los anula) y los pares de color deben cumplir
 * WCAG AAA (>= 7:1).
 */

let css = '';

beforeAll(async () => {
  const { readFileSync } = await import('node:fs');
  const { resolve, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  // `src/test` -> `src/index.css`
  css = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '..', 'index.css'), 'utf8');
});

const channel = (value) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const [r, g, b] = hex.replace('#', '').match(/.{2}/g).map((part) => parseInt(part, 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Profundidad de llaves `{}` en el indice dado (0 = nivel superior). */
const depthAt = (index) => {
  let depth = 0;
  for (let i = 0; i < index; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}') depth -= 1;
  }
  return depth;
};

describe('index.css — capa de compatibilidad del Modo Claro', () => {
  it('declara los remapeos fuera de cualquier @layer', () => {
    for (const selector of [
      "html.theme-light :is([class*='bg-[#0A090C]']",
      "html.theme-light [class*='bg-[#001812]']",
      'html.theme-light :is(\n  .text-white',
      'html.theme-light :is(h1, h2, h3, h4)',
      "html.theme-light :is(\n  [class*='text-gray-300']",
      'html.theme-light .cacique-footer {'
    ]) {
      const index = css.indexOf(selector);
      expect(index, `selector ausente: ${selector}`).toBeGreaterThan(-1);
      expect(depthAt(index), `selector dentro de un bloque: ${selector}`).toBe(0);
    }
  });

  it('no deja remapeos de color de texto del Modo Claro dentro de @layer components', () => {
    const layerBlocks = css.match(/@layer components \{[\s\S]*?\n\}/g) ?? [];
    for (const block of layerBlocks) {
      expect(block).not.toMatch(/html\.theme-light \.text-white/);
      expect(block).not.toMatch(/text-\[#F8FFE5\]/);
    }
  });

  it('restaura los colores originales en zonas oscuras y fondos solidos', () => {
    expect(css).toMatch(/\.cacique-keep-colors \*\s*\{[^}]*color: revert-layer/);
    expect(css).toContain("[class~='bg-[#D16014]']");
    expect(css).toContain("[class~='bg-[#25D366]']");
  });

  it('expone la variante light: y el foco accesible global', () => {
    expect(css).toContain('@custom-variant light (&:where(.theme-light, .theme-light *));');
    expect(css).toMatch(/:focus-visible \{\s*outline: 2px solid var\(--cacique-focus-ring\)/);
    expect(css).toMatch(/:not\(:disabled\):active \{\s*translate: 0 1px/);
  });
});

describe('Contraste WCAG AAA del Modo Claro', () => {
  const ACCENT_TEXT = '#6B3508';
  const MUTED = '#4F3B2D';
  const backgrounds = { canvas: LIGHT_PALETTE.canvas, card: LIGHT_PALETTE.card, surface: LIGHT_PALETTE.surface, panelGradientEnd: '#E8DFD8' };

  it('usa en index.css los tokens validados', () => {
    expect(css).toContain(`--cacique-accent-text: ${ACCENT_TEXT};`);
    expect(css).toContain(`--cacique-muted-text: ${MUTED};`);
  });

  it.each(Object.entries(backgrounds))('titulos, descripciones y precios superan 7:1 sobre %s', (_name, bg) => {
    expect(contrast(LIGHT_PALETTE.heading, bg)).toBeGreaterThanOrEqual(7);
    expect(contrast(LIGHT_PALETTE.forest, bg)).toBeGreaterThanOrEqual(7);
    expect(contrast(MUTED, bg)).toBeGreaterThanOrEqual(7);
    expect(contrast(ACCENT_TEXT, bg)).toBeGreaterThanOrEqual(7);
  });

  it('el blanco nunca se usa como texto sobre los fondos claros', () => {
    for (const bg of Object.values(backgrounds)) {
      expect(contrast('#FFFFFF', bg)).toBeLessThan(1.5);
    }
  });

  it('el CTA del footer cumple AAA con texto blanco sobre ambar tostado', () => {
    expect(contrast('#FFFFFF', ACCENT_TEXT)).toBeGreaterThanOrEqual(7);
    // El ambar original solo alcanzaba 3.7:1 con texto blanco.
    expect(contrast('#FFFFFF', LIGHT_PALETTE.accent)).toBeLessThan(4.5);
  });
});
