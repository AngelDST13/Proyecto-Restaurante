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

  // TEMPORIZADOR DE 3 MINUTOS DE INACTIVIDAD (SOLO CLIENTES)
  useEffect(() => {
    if (!user || user.rol !== 'cliente') {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      warnedRef.current = false;

      // 180,000 ms = 3 Minutos
      timerRef.current = setTimeout(() => {
        if (!warnedRef.current) {
          warnedRef.current = true;
          setInactivityToast(true);
          logout();
        }
      }, 180000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(ev => window.addEventListener(ev, resetTimer));
    resetTimer();

    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, logout]);

  const loginWithCredentials = async (email, password) => {
    const result = await authenticateCredentials(email, password);
    if (!result.success) return result;

    const token = generateJWT(result.user);
    const sessionUser = { ...result.user, token };

    setUser(sessionUser);
    localStorage.setItem('cacique_jwt_token', token);
    return { success: true, user: sessionUser };
  };

  const registerClient = async (email, password, nombre) => {
    const result = await registerNewClient(email, password, nombre);
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}