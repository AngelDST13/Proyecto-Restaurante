import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cacique_user_session');
    return saved ? JSON.parse(saved) : null;
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
      // Asignar sede según credencial o defecto Escazú
      if (lowerEmail.includes('cartago')) sedeAsignada = 'cartago';
      else if (lowerEmail.includes('heredia')) sedeAsignada = 'heredia';
      else if (lowerEmail.includes('santa')) sedeAsignada = 'santa_ana';
      else sedeAsignada = 'escazu';
    }

    const userData = { email, rol: role, sede: sedeAsignada, loggedAt: new Date().toISOString() };
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

function useAuth() {
  return useContext(AuthContext);
}

// Keep the hook in this module without exporting a non-component, avoiding
// Fast Refresh warnings when this file is treated as a component module.
AuthProvider.useAuth = useAuth;