import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAutoLogout = (timeoutInMinutes = 5) => {
  const { user, logout } = useAuth();
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (user) {
      timerRef.current = setTimeout(() => {
        alert('Su sesión ha caducado por inactividad (5 minutos). Por favor, inicie sesión nuevamente.');
        logout();
      }, timeoutInMinutes * 60 * 1000);
    }
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const handleActivity = () => resetTimer();

    if (user) {
      resetTimer();
      events.forEach((evt) => window.addEventListener(evt, handleActivity));
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [user]);
};