import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Menu from '../pages/Menu';
import AdminDashboard from '../pages/AdminDashboard';
import Unauthorized from '../pages/Unauthorized';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Rutas Privadas */}
      <Route element={<ProtectedRoute allowedRoles={['cliente', 'mesero', 'administrador']} />}>
        <Route path="/menu" element={<Menu />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};