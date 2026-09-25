import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  authenticateCredentials,
  registerNewClient,
  sanitizeInput,
  sanitizeUserForSession,
  encryptData,
  decryptData,
  generateSessionSignature,
  verifySessionIntegrity
} from '../services/authSecurity';

const AuthContext = createContext();
const ENCRYPTED_USER_KEY = 'gourmetsync_enc_user';
const SIGNATURE_KEY = 'gourmetsync_sig';

function clearStoredSession() {
  localStorage.removeItem(ENCRYPTED_USER_KEY);
  localStorage.removeItem(SIGNATURE_KEY);
  localStorage.removeItem('cacique_user');
  localStorage.removeItem('gourmetsync_user');
  localStorage.removeItem('cacique_jwt_token');
  localStorage.removeItem('cacique_session_signature');
}

function readStoredUser() {
  try {
    const encryptedUser = localStorage.getItem(ENCRYPTED_USER_KEY);
    const savedSignature = localStorage.getItem(SIGNATURE_KEY);
    if (!encryptedUser || !savedSignature) return null;

    const decryptedUser = decryptData(encryptedUser);
    return decryptedUser && verifySessionIntegrity(decryptedUser, savedSignature)
      ? decryptedUser
      : null;
  } catch {
    return null;
  }
}

function storeSession(userData) {
  const safeUser = sanitizeUserForSession(userData);
  const signature = generateSessionSignature(safeUser);
  const cipherText = encryptData(safeUser);

  if (!cipherText) return null;
  localStorage.setItem(ENCRYPTED_USER_KEY, cipherText);
  localStorage.setItem(SIGNATURE_KEY, signature);
  return safeUser;
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
    sessionStorage.clear();
    if (timerRef.current) clearTimeout(timerRef.current);
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    if (user) {
      const checkIntegrity = () => {
        const storedUser = readStoredUser();
        if (!storedUser) logout();
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

  const login = (userData) => {
    const cleanEmail = sanitizeInput(userData?.email);
    const safeUser = storeSession({
      ...userData,
      email: cleanEmail,
      sede: sanitizeInput(userData?.sede || 'escazu'),
      nombre: userData?.nombre || cleanEmail.split('@')[0]
    });

    if (!safeUser) return { success: false, message: 'No se pudo crear la sesión segura.' };
    setUser(safeUser);
    return { success: true, user: safeUser };
  };

  const loginWithCredentials = (email, password) => {
    const cleanEmail = sanitizeInput(email);
    const result = authenticateCredentials(cleanEmail, password);
    if (!result.success) return result;

    return login({ ...result.user, email: cleanEmail });
  };

  const registerClient = (email, password, nombre) => {
    const result = registerNewClient(email, password, nombre);
    if (!result.success) return result;

    const sessionResult = login({ ...result.user, email: sanitizeInput(email) });
    if (!sessionResult.success) return sessionResult;

    return { ...sessionResult, coupon: result.user.coupon };
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
