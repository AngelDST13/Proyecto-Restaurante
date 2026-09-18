import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('gourmet_user');
    return saved ? JSON.parse(saved) : { email: 'admin@gourmetsync.com', rol: 'administrador' };
  });

  const login = (email, password) => {
    let rol = 'cliente';
    if (email.includes('admin')) rol = 'administrador';
    else if (email.includes('mesero')) rol = 'mesero';

    const userData = { email, rol, nombre: email.split('@')[0] };
    sessionStorage.setItem('gourmet_user', JSON.stringify(userData));
    sessionStorage.setItem('gourmet_token', 'mock-jwt-token-123');
    setUser(userData);
    return userData;
  };

  const logout = () => {
    sessionStorage.removeItem('gourmet_user');
    sessionStorage.removeItem('gourmet_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, login: () => {}, logout: () => {} };
  }
  return context;
};