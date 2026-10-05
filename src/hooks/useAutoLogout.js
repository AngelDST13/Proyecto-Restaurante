import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { INACTIVITY_REASON } from '../services/sessionReasons';

/** Paneles operativos (Admin, Caja, Mesero, Cocina): 15 minutos sin actividad. */
export const STAFF_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
/** El aviso "¿Sigue ahí?" aparece 1 minuto antes del cierre. */
export const STAFF_INACTIVITY_WARNING_MS = STAFF_INACTIVITY_TIMEOUT_MS - 60 * 1000;
/** Interacciones que reinician el contador de inactividad. */
export const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];

/**
 * Cierra la sesion tras `timeoutMs` sin interaccion. El cierre usa el motivo
 * `inactividad`, que AuthContext conserva para mostrar el aviso en /login.
 */
export function useAutoLogout(onLogoutNotify, options = {}) {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const startTimersRef = useRef(null);
  const timeoutMs = options.timeoutMs ?? 180000;
  const warningMs = options.warningMs ?? timeoutMs - 30000;
  const onTimeout = options.onTimeout;

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    if (startTimersRef.current) {
      startTimersRef.current();
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    let warningTimer;
    let logoutTimer;

    const startTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);

      warningTimer = setTimeout(() => {
        setShowWarning(true);
      }, warningMs);

      logoutTimer = setTimeout(() => {
        setShowWarning(false);
        logout(INACTIVITY_REASON);
        if (typeof onTimeout === 'function') onTimeout();
        if (typeof onLogoutNotify === 'function') {
          onLogoutNotify(`Su sesión ha caducado por ${Math.round(timeoutMs / 60000)} minutos de inactividad.`, 'info');
        }
      }, timeoutMs);
    };

    startTimersRef.current = startTimers;

    const handleActivity = (event) => {
      if (event.target?.closest?.('[data-inactivity-dialog]')) return;
      setShowWarning(false);
      startTimers();
    };

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity));

    startTimers();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      startTimersRef.current = null;
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [user, logout, onLogoutNotify, onTimeout, timeoutMs, warningMs]);

  return { showWarning, resetTimer };
}

export default useAutoLogout;