import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    if (user.rol === 'administrador') return <Navigate to="/admin" replace />;
    if (user.rol === 'cocina') return <Navigate to="/kitchen" replace />;
    if (user.rol === 'mesero') return <Navigate to="/waiter" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}