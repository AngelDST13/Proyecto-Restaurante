// src/routes/PublicRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute({ children }) {
  const { user } = useAuth();

  // Si ya hay usuario autenticado y trata de ir al /login, lo manda al Menú/Dashboard
  if (user) {
    if (user.rol === 'admin' || user.rol === 'administrador') return <Navigate to="/admin" replace />;
    if (user.rol === 'cocina') return <Navigate to="/kitchen" replace />;
    if (user.rol === 'mesero') return <Navigate to="/waiter" replace />;
    return <Navigate to="/menu" replace />;
  }

  // Si NO hay usuario (o acaba de cerrar sesión), renderiza el formulario de Login
  return children;
}