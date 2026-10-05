import { describe, expect, it, vi } from 'vitest';
import assets, {
  ASSET_PATHS,
  caciqueAsset,
  logoDarkVariant,
  logoLightVariant,
} from '../assets/img';

/**
 * Valida que todos los activos visuales se resuelven desde `src/assets/img/`
 * mediante importacion ESM de Vite, sin duplicar carpetas ni depender de
 * rutas publicas estaticas.
 */

describe('Activos visuales consolidados en src/assets/img', () => {
  it('expone el vector oficial del Cacique con una URL resuelta por Vite', () => {
    expect(caciqueAsset).toBeTruthy();
    expect(typeof caciqueAsset).toBe('string');
    // En pruebas Vite devuelve la ruta del modulo; en build, la URL con hash.
    expect(caciqueAsset).toMatch(/Cacique|cacique/i);
    expect(caciqueAsset).toMatch(/assets\/img\//);
  });

  it('expone las variantes de logo sin duplicar la carga', () => {
    expect(logoDarkVariant).toBeTruthy();
    expect(logoLightVariant).toBeTruthy();
    expect(logoDarkVariant).not.toBe(logoLightVariant);
  });

  it('centraliza las rutas en ASSET_PATHS', () => {
    expect(ASSET_PATHS).toEqual({
      cacique: 'src/assets/img/Cacique.svg',
      caciqueBlack: 'src/assets/img/Caciquen.svg',
      logoDark: 'src/assets/img/LogoN.svg',
      logoLight: 'src/assets/img/LogoB.svg',
    });
  });

  it('ofrece tambien un export por defecto con los cuatro vectores', () => {
    expect(Object.keys(assets).sort()).toEqual(['cacique', 'caciqueBlack', 'logoDark', 'logoLight']);
    expect(assets.cacique).toBe(caciqueAsset);
    expect(assets.logoDark).toBe(logoDarkVariant);
    expect(assets.logoLight).toBe(logoLightVariant);
  });

  it('no depende de una carpeta publica duplicada para los SVG', async () => {
    // Si existiera `public/assets/img`, el navegador recibiria una copia
    // estatica; la arquitectura actual solo importa desde `src/assets/img`.
    expect(ASSET_PATHS.cacique.startsWith('src/')).toBe(true);
    expect(caciqueAsset).not.toBe('/assets/img/Cacique.svg');
  });

  it('resuelve el logo en cada componente que lo consume', async () => {
    const modules = await Promise.all([
      import('../components/Navbar'),
      import('../components/Footer'),
      import('../components/FacturacionPanel'),
      import('../pages/Landing'),
      import('../pages/Login'),
      import('../pages/Menu'),
      import('../pages/OrderStatusBoard'),
      import('../pages/AdminDashboard'),
      import('../pages/CashierDashboard'),
    ]);

    for (const module of modules) {
      expect(module.default).toBeTypeOf('function');
    }
  });

  it('mantiene el SVG del Cacique con contenido vectorial real', async () => {
    const { readFileSync, existsSync } = await import('node:fs');
    const { resolve, dirname } = await import('node:path');
    const { fileURLToPath } = await import('node:url');

    // `src/test` -> `src` -> `assets/img/Cacique.svg`
    const srcRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const svgPath = resolve(srcRoot, 'assets/img/Cacique.svg');

    expect(existsSync(svgPath)).toBe(true);
    const svg = readFileSync(svgPath, 'utf8');
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox');
    expect(svg.toLowerCase()).toContain('<path');
  });

  it('expone los mismos valores al importar el indice en frio', async () => {
    vi.resetModules();
    const fresh = await import('../assets/img');
    expect(fresh.caciqueAsset).toBe(caciqueAsset);
    expect(fresh.ASSET_PATHS.cacique).toContain('src/assets/img/Cacique.svg');
  });
});