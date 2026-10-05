import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import {
  STAFF_INACTIVITY_TIMEOUT_MS,
  STAFF_INACTIVITY_WARNING_MS,
  useAutoLogout
} from '../hooks/useAutoLogout';

/**
 * Cierre de sesion por inactividad para los paneles operativos.
 *
 * Tras 15 minutos sin interaccion la sesion se cierra y se redirige a /login,
 * donde se informa el motivo. Un minuto antes aparece un aviso centrado que
 * permite continuar trabajando.
 */
export default function InactivityGuard({
  timeoutMs = STAFF_INACTIVITY_TIMEOUT_MS,
  warningMs = STAFF_INACTIVITY_WARNING_MS
}) {
  const { showWarning, resetTimer } = useAutoLogout(null, { timeoutMs, warningMs });

  if (!showWarning) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="inactivity-title"
        aria-describedby="inactivity-description"
        data-inactivity-dialog
        className="w-full max-w-sm space-y-4 rounded-3xl border border-(--cacique-border)/40 bg-(--cacique-card) p-6 text-center text-(--cacique-text) shadow-2xl cacique-card"
      >
        <Clock className="mx-auto h-10 w-10 text-amber-500" aria-hidden="true" />
        <h2 id="inactivity-title" className="text-lg font-black text-(--cacique-on-card)">¿Sigue ahí?</h2>
        <p id="inactivity-description" className="text-sm text-(--cacique-on-card-muted)">
          Por seguridad, la sesión se cerrará automáticamente en 1 minuto por inactividad.
        </p>
        <button
          type="button"
          autoFocus
          onClick={resetTimer}
          className="w-full rounded-xl bg-[#659B5E] px-4 py-3 font-extrabold text-white transition-colors hover:bg-[#52824c] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          Mantener sesión activa
        </button>
      </div>
    </div>,
    document.body
  );
}
