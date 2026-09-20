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

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cacique_jwt_token');
    localStorage.removeItem('cacique_registered_clients');
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!user || user.rol !== 'cliente') {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setInactivityToast(true);
        logout();
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

// This hook is intentionally colocated to preserve the existing public API.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}