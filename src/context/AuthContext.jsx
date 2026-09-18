import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('gourmet_user');
    const token = sessionStorage.getItem('gourmet_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await api.loginUser(email, password);
    // Simulación de Token JWT para autenticación
    const mockJwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(userData))}.signature`;
    
    sessionStorage.setItem('gourmet_user', JSON.stringify(userData));
    sessionStorage.setItem('gourmet_token', mockJwtToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    sessionStorage.removeItem('gourmet_user');
    sessionStorage.removeItem('gourmet_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);