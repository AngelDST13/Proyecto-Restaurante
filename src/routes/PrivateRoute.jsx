// src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user) {
    // Redirige al Login en lugar de la Landing Page '/'
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.rol !== requiredRole && user.rol !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}