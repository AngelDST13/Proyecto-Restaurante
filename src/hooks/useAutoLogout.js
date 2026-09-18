import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAutoLogout = (onLogoutNotify, timeoutInMinutes = 5) => {
  const { user, logout } = useAuth();

  const handleLogout = useCallback(() => {
    if (user?.rol === 'cliente') {
      logout();
      if (onLogoutNotify) {
        onLogoutNotify('Su sesión ha caducado por inactividad (5 minutos).', 'info');
      }
    }
  }, [user, logout, onLogoutNotify]);

  useEffect(() => {
    // CONDICIONAL: Solo activa el temporizador si el usuario existe y su rol es CLIENTE
    if (!user || user.rol !== 'cliente') return;

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