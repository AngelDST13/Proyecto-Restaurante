// src/routes/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // 1. Si el usuario cerró sesión o expiró, redirige AL LOGIN
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si tiene sesión pero no el rol permitido, redirige a no autorizado
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}