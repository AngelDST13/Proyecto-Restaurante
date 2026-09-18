import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAutoLogout = (timeoutInMinutes = 5) => {
  const { user, logout } = useAuth();

  const handleLogout = useCallback(() => {
    alert('Su sesión ha caducado por inactividad (5 minutos). Por favor, inicie sesión nuevamente.');
    logout();
  }, [logout]);

  useEffect(() => {
    if (!user) return;

    let timer = setTimeout(handleLogout, timeoutInMinutes * 60 * 1000);

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(handleLogout, timeoutInMinutes * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [user, timeoutInMinutes, handleLogout]);
};