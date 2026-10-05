import { useContext } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { caciqueAsset, caciqueBlackAsset, logoDarkVariant, logoLightVariant } from '../assets/img';

/**
 * Isotipo del Cacique sensible al tema.
 *
 * - Modo Oscuro: `Cacique.svg` (trazo blanco) con resplandor dorado.
 * - Modo Claro: `Caciquen.svg` (trazo negro) directamente sobre el beige.
 *
 * El resplandor y el contraste se definen en index.css segun
 * `data-variant`, de modo que funcionen tambien en Alto Contraste.
 * Si el vector no carga, se usa el logotipo del mismo tono (LogoN blanco en
 * oscuro, LogoB negro en claro).
 * Fuera de un AccessibilityProvider se usa la clase del documento.
 */
export default function CaciqueLogo({ className = '', alt = 'Logo El Cacique', ...props }) {
  const accessibility = useContext(AccessibilityContext);
  const isLight = accessibility
    ? accessibility.isLightTheme
    : typeof document !== 'undefined' && document.documentElement.classList.contains('theme-light');

  return (
    <img
      {...props}
      src={isLight ? caciqueBlackAsset : caciqueAsset}
      alt={alt}
      data-variant={isLight ? 'light' : 'dark'}
      onError={(event) => {
        // Un solo reintento: si el respaldo tambien falla no se entra en bucle.
        if (event.currentTarget.dataset.fallback) return;
        event.currentTarget.dataset.fallback = 'true';
        event.currentTarget.src = isLight ? logoLightVariant : logoDarkVariant;
        props.onError?.(event);
      }}
      className={`cacique-logo object-contain ${className}`.trim()}
    />
  );
}
