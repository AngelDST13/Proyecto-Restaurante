import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  generateJWT,
  verifyJWT,
  authenticateCredentials,
  registerNewClient,
  sanitizeInput,
  generateSessionSignature,
  verifySessionIntegrity
} from '../services/authSecurity';

const AuthContext = createContext();
const USER_STORAGE_KEY = 'gourmetsync_user';
const SIGNATURE_STORAGE_KEY = 'gourmetsync_sig';

function clearStoredSession() {
  localStorage.removeItem('cacique_jwt_token');
  localStorage.removeItem('cacique_session_signature');
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(SIGNATURE_STORAGE_KEY);
}

function readStoredUser() {
  try {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    const savedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    const token = localStorage.getItem('cacique_jwt_token');
    const legacySignature = localStorage.getItem('cacique_session_signature');
    let modernUser = null;

    if (savedUser || savedSignature) {
      if (!savedUser || !savedSignature) return null;
      const parsedUser = JSON.parse(savedUser);
      if (!verifySessionIntegrity(parsedUser, savedSignature)) return null;
      modernUser = parsedUser;
    }

    if (token || legacySignature) {
      if (!token || !legacySignature) return null;
      const payload = verifyJWT(token);
      const legacyUser = payload ? {
        email: payload.sub,
        nombre: payload.name,
        rol: payload.role,
        sede: payload.sede,
        token
      } : null;
      if (!verifySessionIntegrity(legacyUser, legacySignature)) return null;
      return modernUser || legacyUser;
    }

    return modernUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = readStoredUser();
    if (!storedUser) clearStoredSession();
    return storedUser;
  });

  const [inactivityToast, setInactivityToast] = useState(false);
  const timerRef = useRef(null);

  const logout = useCallback(() => {
    setUser(null);
    clearStoredSession();
    localStorage.removeItem('cacique_registered_clients');
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (user) {
      const checkIntegrity = () => {
        if (!readStoredUser()) logout();
      };
      const interval = window.setInterval(checkIntegrity, 500);
      window.addEventListener('storage', checkIntegrity);

      return () => {
        window.clearInterval(interval);
        window.removeEventListener('storage', checkIntegrity);
      };
    }
  }, [user, logout]);

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
    const cleanEmail = sanitizeInput(email);
    const result = authenticateCredentials(cleanEmail, password);
    if (!result.success) return result;

    const formattedUser = {
      ...result.user,
      email: cleanEmail,
      sede: sanitizeInput(result.user.sede || 'escazu'),
      nombre: result.user.nombre || cleanEmail.split('@')[0]
    };
    const token = generateJWT(formattedUser);
    const sessionUser = { ...formattedUser, token };
    const signature = generateSessionSignature(sessionUser);

    setUser(sessionUser);
    localStorage.setItem('cacique_jwt_token', token);
    localStorage.setItem('cacique_session_signature', signature);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
    localStorage.setItem(SIGNATURE_STORAGE_KEY, signature);
    return { success: true, user: sessionUser };
  };

  const registerClient = (email, password, nombre) => {
    const result = registerNewClient(email, password, nombre);
    if (!result.success) return result;

    const cleanEmail = sanitizeInput(email);
    const formattedUser = {
      ...result.user,
      email: cleanEmail,
      sede: sanitizeInput(result.user.sede || 'escazu'),
      nombre: result.user.nombre || cleanEmail.split('@')[0]
    };
    const token = generateJWT(formattedUser);
    const sessionUser = { ...formattedUser, token };
    const signature = generateSessionSignature(sessionUser);

    setUser(sessionUser);
    localStorage.setItem('cacique_jwt_token', token);
    localStorage.setItem('cacique_session_signature', signature);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
    localStorage.setItem(SIGNATURE_STORAGE_KEY, signature);
    return { success: true, user: sessionUser, coupon: result.user.coupon };
  };

  const login = (userData) => {
    const cleanEmail = sanitizeInput(userData?.email);
    const formattedUser = {
      ...userData,
      email: cleanEmail,
      sede: sanitizeInput(userData?.sede || 'escazu'),
      nombre: userData?.nombre || cleanEmail.split('@')[0]
    };
    const token = generateJWT(formattedUser);
    const sessionUser = { ...formattedUser, token };
    const signature = generateSessionSignature(sessionUser);

    setUser(sessionUser);
    localStorage.setItem('cacique_jwt_token', token);
    localStorage.setItem('cacique_session_signature', signature);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
    localStorage.setItem(SIGNATURE_STORAGE_KEY, signature);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithCredentials, registerClient, logout, inactivityToast, setInactivityToast }}>
      {children}
    </AuthContext.Provider>
  );
}

// This hook is intentionally colocated to preserve the existing public API.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}