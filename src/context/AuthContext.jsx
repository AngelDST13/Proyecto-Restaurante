/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { encryptData, decryptData } from '../services/cryptoService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedEncrypted = localStorage.getItem('cacique_encrypted_session');
    return savedEncrypted ? decryptData(savedEncrypted) : null;
  });

  const login = (email) => {
    let role = 'cliente';
    let sedeAsignada = 'escazu';
    const lowerEmail = email.toLowerCase();

    if (lowerEmail.includes('admin')) {
      role = 'administrador';
      sedeAsignada = 'escazu';
    } else if (lowerEmail.includes('mesero')) {
      role = 'mesero';
      if (lowerEmail.includes('cartago')) sedeAsignada = 'cartago';
      else if (lowerEmail.includes('heredia')) sedeAsignada = 'heredia';
      else if (lowerEmail.includes('santa')) sedeAsignada = 'santa_ana';
      else sedeAsignada = 'escazu';
    }

    const userData = { 
      email, 
      rol: role, 
      sede: sedeAsignada, 
      securityToken: encryptData({ timestamp: Date.now(), role }),
      loggedAt: new Date().toISOString() 
    };

    setUser(userData);
    localStorage.setItem('cacique_encrypted_session', encryptData(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cacique_encrypted_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}