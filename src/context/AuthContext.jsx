/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { generateJWT, verifyJWT, authenticateCredentials, registerNewClient } from '../services/authSecurity';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('cacique_jwt_token');
    if (!token) return null;
    const payload = verifyJWT(token);
    return payload ? { email: payload.sub, nombre: payload.name, rol: payload.role, sede: payload.sede, token } : null;
  });

  const [inactivityToast, setInactivityToast] = useState(false);
  const timerRef = useRef(null);
  const warnedRef = useRef(false);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cacique_jwt_token');
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // CONTROL DE INACTIVIDAD DE 3 MINUTOS SOLO PARA CLIENTES
  useEffect(() => {
    if (!user || user.rol !== 'cliente') {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      warnedRef.current = false;

      // 3 Minutos = 180,000 milisegundos
      timerRef.current = setTimeout(() => {
        if (!warnedRef.current) {
          warnedRef.current = true;
          setInactivityToast(true);
          logout();
        }
      }, 180000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, logout]);

  const loginWithCredentials = (email, password) => {
    const result = authenticateCredentials(email, password);
    if (!result.success) return result;

    const token = generateJWT(result.user);
    const sessionUser = { ...result.user, token };

    setUser(sessionUser);
    localStorage.setItem('cacique_jwt_token', token);
    return { success: true, user: sessionUser };
  };

  const registerClient = (email, password, nombre) => {
    const result = registerNewClient(email, password, nombre);
    if (!result.success) return result;

    const token = generateJWT(result.user);
    const sessionUser = { ...result.user, token };

    setUser(sessionUser);
    localStorage.setItem('cacique_jwt_token', token);
    return { success: true, user: sessionUser, coupon: result.user.coupon };
  };

  return (
    <AuthContext.Provider value={{ user, loginWithCredentials, registerClient, logout, inactivityToast, setInactivityToast }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}