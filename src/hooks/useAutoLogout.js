import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

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
        logout();
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

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, handleActivity));

    startTimers();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      startTimersRef.current = null;
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [user, logout, onLogoutNotify, onTimeout, timeoutMs, warningMs]);

  return { showWarning, resetTimer };
}

export default useAutoLogout;