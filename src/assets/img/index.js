/**
 * Punto de entrada unico para todos los activos visuales.
 *
 * Evita imports dispersos del mismo archivo en distintos componentes y
 * garantiza que cualquier cambio de ruta se resuelva en un solo lugar.
 * Todas las rutas usan importacion ESM de Vite desde `src/assets/img/`.
 */

import caciqueLogo from './Cacique.svg';
import caciqueNegro from './Caciquen.svg';
import logoNegro from './LogoN.svg';
import logoBlanco from './LogoB.svg';

/** Vector oficial del Cacique (trazo blanco): Modo Oscuro. */
export const caciqueAsset = caciqueLogo;

/** Mismo vector en trazo negro: Modo Claro sobre beige marfil. */
export const caciqueBlackAsset = caciqueNegro;

/** Logos alternativos de marca (version para fondo oscuro / claro). */
export const logoDarkVariant = logoNegro;
export const logoLightVariant = logoBlanco;

/** Ruta original dentro de `src/assets/img/` para depuracion y pruebas. */
export const ASSET_PATHS = {
  cacique: 'src/assets/img/Cacique.svg',
  caciqueBlack: 'src/assets/img/Caciquen.svg',
  logoDark: 'src/assets/img/LogoN.svg',
  logoLight: 'src/assets/img/LogoB.svg',
};

export default { cacique: caciqueLogo, caciqueBlack: caciqueNegro, logoDark: logoNegro, logoLight: logoBlanco };