import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    nombre: 'Angel Salazar',
    email: 'admin@gourmetsync.com',
    rol: 'administrador'
  });

  const login = (email, password) => {
    let role = 'cliente';
    if (email.includes('admin')) role = 'administrador';
    else if (email.includes('mesero')) role = 'mesero';

    const userData = { email, rol: role, nombre: email.split('@')[0] };
    setUser(userData);
    return userData;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};