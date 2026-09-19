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

// The hook is kept here for the public auth API; it is intentionally excluded
// from the Fast Refresh export check because this file also owns the provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}