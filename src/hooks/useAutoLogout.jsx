import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export function useAutoLogout(onLogoutNotify) {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const startTimersRef = useRef(null);

  // 3 minutos = 180,000 ms. Advertencia a los 2.5 minutos (150,000 ms)
  const TIMEOUT_MS = 180000;
  const WARNING_MS = 150000;

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
      }, WARNING_MS);

      logoutTimer = setTimeout(() => {
        setShowWarning(false);
        logout();
        if (typeof onLogoutNotify === 'function') {
          onLogoutNotify('Su sesión ha caducado por 3 minutos de inactividad.', 'info');
        }
      }, TIMEOUT_MS);
    };

    startTimersRef.current = startTimers;

    const handleActivity = () => {
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
  }, [user, logout, onLogoutNotify, TIMEOUT_MS, WARNING_MS]);

  return { showWarning, resetTimer };
}

export default useAutoLogout;
