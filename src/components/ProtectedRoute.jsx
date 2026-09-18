import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  const token = sessionStorage.getItem('gourmet_token');

  // Si no hay token de sesión ni usuario autenticado, redirige a Login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario existe pero su rol no tiene permiso para el módulo actual
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};