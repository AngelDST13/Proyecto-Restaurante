import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Menu from '../pages/Menu';
import AdminDashboard from '../pages/AdminDashboard';
import Unauthorized from '../pages/Unauthorized';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Rutas Privadas: Comandos (Cliente, Mesero, Admin) */}
      <Route element={<ProtectedRoute allowedRoles={['cliente', 'mesero', 'administrador']} />}>
        <Route path="/menu" element={<Menu />} />
      </Route>

      {/* Rutas Privadas Exclusivas: Backoffice (Solo Administrador) */}
      <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};