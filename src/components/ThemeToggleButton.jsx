import { Moon, Sun } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

/**
 * Boton de alternancia Claro / Oscuro reutilizable.
 *
 * Todos los paneles operativos (Admin, Cajero, Mesero y Cocina) montan este
 * componente en su encabezado superior para exponer el conmutador de tema
 * sin duplicar la logica de `useAccessibility`.
 *
 * Accesibilidad:
 *  - `aria-pressed` comunica el estado actual a lectores de pantalla.
 *  - El `aria-label` anuncia la ACCION (a donde lleva el boton), no el estado,
 *    de modo que nunca resulta ambiguo para el usuario de Tecnologia Asistiva.
 */
export default function ThemeToggleButton({ className = '', tone = 'panel' }) {
  const { isLightTheme, toggleTheme } = useAccessibility();

  // `panel` (paneles operativos) vs `site` (Landing) comparten la misma
  // estructura; solo cambia el color del borde para mejor contraste.
  const borderTone = tone === 'panel' ? 'border-white/15' : 'border-(--cacique-border)/40';
  const textTone = tone === 'panel' ? 'text-zinc-200' : 'text-(--cacique-text)';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isLightTheme}
      aria-label={isLightTheme ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
      title={isLightTheme ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
      data-testid="theme-toggle"
      className={`inline-flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-lg border ${borderTone} transition-colors cursor-pointer hover:border-(--cacique-accent) ${textTone} ${className}`.trim()}
    >
      {isLightTheme
        ? <Moon className="h-4 w-4" aria-hidden="true" />
        : <Sun className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
