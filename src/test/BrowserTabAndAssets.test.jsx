import { beforeAll, describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import App from '../App';
import defaultAssets, { ASSET_PATHS, caciqueAsset, logoDarkVariant, logoLightVariant } from '../assets/img';

/**
 * Pestaña del navegador ("El Cacique" + favicon Cacique.svg), activos
 * centralizados en `src/assets/img/index.js`, convencion `.jsx` de las pruebas
 * y contrato del modo Alto Contraste en `index.css`.
 */

let fs;
let path;
let projectRoot;
const read = (relative) => fs.readFileSync(path.resolve(projectRoot, relative), 'utf8');

/** Lista recursiva de archivos bajo `dir` (ruta relativa al proyecto). */
const listFiles = (dir) => fs.readdirSync(path.resolve(projectRoot, dir), { withFileTypes: true })
  .flatMap((entry) => {
    const relative = `${dir}/${entry.name}`;
    return entry.isDirectory() ? listFiles(relative) : [relative];
  });

beforeAll(async () => {
  fs = await import('node:fs');
  path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  // `src/test` -> raiz del proyecto
  projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
});

describe('Pestaña del navegador', () => {
  it('index.html muestra exactamente "El Cacique" con el favicon del Cacique', () => {
    const html = read('index.html');
    expect(html).toContain('<title>El Cacique</title>');
    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/src/assets/img/Cacique.svg" />');
    expect(html).not.toContain('LogoB.svg');
    expect(fs.existsSync(path.resolve(projectRoot, 'src/assets/img/Cacique.svg'))).toBe(true);
  });

  it('App fija document.title en "El Cacique" al montar', async () => {
    document.title = 'Titulo previo';
    render(<App />);
    await waitFor(() => expect(document.title).toBe('El Cacique'));
  });
});

describe('Activos centralizados en src/assets/img', () => {
  it('el indice exporta los tres vectores oficiales', () => {
    expect(caciqueAsset).toBeTruthy();
    expect(logoDarkVariant).toBeTruthy();
    expect(logoLightVariant).toBeTruthy();
    expect(defaultAssets).toEqual({ cacique: caciqueAsset, logoDark: logoDarkVariant, logoLight: logoLightVariant });
    for (const assetPath of Object.values(ASSET_PATHS)) {
      expect(fs.existsSync(path.resolve(projectRoot, assetPath)), assetPath).toBe(true);
    }
  });

  it('src/assets/img solo contiene los vectores y su indice', () => {
    expect(listFiles('src/assets').sort()).toEqual([
      'src/assets/img/Cacique.svg',
      'src/assets/img/LogoB.svg',
      'src/assets/img/LogoN.svg',
      'src/assets/img/index.js'
    ]);
  });

  it('no existen carpetas de imagenes duplicadas en public/', () => {
    expect(fs.existsSync(path.resolve(projectRoot, 'public/assets'))).toBe(false);
    const publicImages = listFiles('public').filter((file) => /.(svg|png|jpe?g|webp|gif|ico)$/i.test(file));
    expect(publicImages).toEqual([]);
  });

  it('ningun componente importa imagenes locales fuera del indice', () => {
    const sources = listFiles('src').filter((file) =>
      /\.(jsx?|css)$/.test(file) && !file.startsWith('src/test/') && file !== 'src/assets/img/index.js');
    const offenders = sources.filter((file) =>
      /(from\s+|url\(|src=)["'][^"']*\.(svg|png|jpe?g|webp|gif|ico)["']/.test(read(file)));
    expect(offenders).toEqual([]);
  });

  it.each([
    'src/components/Navbar.jsx',
    'src/components/Footer.jsx',
    'src/pages/Landing.jsx',
    'src/pages/Login.jsx',
    'src/pages/AdminDashboard.jsx',
    'src/pages/CashierDashboard.jsx'
  ])('%s importa sus logos desde ../assets/img', (file) => {
    expect(read(file)).toMatch(/from '\.\.\/assets\/img';/);
  });
});

describe('Convencion de pruebas .jsx', () => {
  it('todos los archivos de src/test usan la extension .jsx', () => {
    const nonJsx = listFiles('src/test').filter((file) => !file.endsWith('.jsx'));
    expect(nonJsx).toEqual([]);
  });

  it('vite.config.js incluye src/test/**/*.test.jsx y el setup .jsx', () => {
    const config = read('vite.config.js');
    expect(config).toContain("include: ['src/test/**/*.test.jsx']");
    expect(config).toContain("setupFiles: ['./src/test/setup.jsx']");
  });
});

describe('Alto Contraste en index.css', () => {
  let css;
  beforeAll(() => {
    css = read('src/index.css');
  });

  it('usa amarillo fluorescente #FFD700 y elimina el tono anterior', () => {
    expect(css).toContain('border: 2px solid #FFD700 !important;');
    expect(css.toLowerCase()).not.toContain('#ffd400');
  });

  it('formularios con fondo negro puro y borde fluorescente', () => {
    expect(css).toMatch(/html\.cb-alto-contraste :is\(form, fieldset\) \{\s*background-color: #000000 !important;\s*border-color: #FFD700 !important;/);
  });

  it('inputs con texto blanco nitido sobre negro', () => {
    expect(css).toMatch(/html\.cb-alto-contraste input,\s*html\.cb-alto-contraste select,\s*html\.cb-alto-contraste textarea \{\s*border: 2px solid #FFD700 !important;\s*color: #ffffff !important;\s*background-color: #000000 !important;/);
    expect(css).toMatch(/:is\(input, select, textarea\) \{\s*caret-color: #FFD700;\s*-webkit-text-fill-color: #ffffff;/);
  });

  it('fuerza negro en todas las superficies, incluidas las tarjetas claras', () => {
    const rule = css.match(/html\.cb-alto-contraste body :is\(([\s\S]*?)\) \{([\s\S]*?)\}/);
    expect(rule).not.toBeNull();
    for (const surface of ['.cacique-card', '.glass-card', "[class*='bg-[#']", "[role='dialog']"]) {
      expect(rule[1]).toContain(surface);
    }
    expect(rule[2]).toContain('background-color: #000000 !important;');
    expect(rule[2]).toContain('background-image: none !important;');
  });
});
