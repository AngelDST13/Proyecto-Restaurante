/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Inicializa nulo para evitar accesos indebidos
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cacique_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email) => {
    let role = 'cliente';
    if (email.toLowerCase().includes('admin')) {
      role = 'administrador';
    } else if (email.toLowerCase().includes('mesero')) {
      role = 'mesero';
    }

    const userData = { email, rol: role, loggedAt: new Date().toISOString() };
    setUser(userData);
    localStorage.setItem('cacique_user_session', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cacique_user_session');
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