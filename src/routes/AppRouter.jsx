import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Menu from '../pages/Menu';
import AdminDashboard from '../pages/AdminDashboard';
import WaiterDashboard from '../pages/WaiterDashboard';
import KitchenDashboard from '../pages/KitchenDashboard';
import Unauthorized from '../pages/Unauthorized';

import ProtectedRoute from './ProtectedRoute';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export function AppRouter() {
  const { inactivityToast, setInactivityToast } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-[#0A090C] text-[#F8FFE5]">
      {inactivityToast && (
        <Toast 
          message="Su sesión se ha cerrado automáticamente por 3 minutos de inactividad." 
          type="info" 
          onClose={() => setInactivityToast(false)} 
        />
      )}

      {!isAdminRoute && <Navbar />}

      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* RUTA MESEROS */}
          <Route 
            path="/waiter" 
            element={
              <ProtectedRoute allowedRoles={['mesero', 'administrador']}>
                <WaiterDashboard />
              </ProtectedRoute>
            } 
          />

          {/* RUTA PANEL DE COCINA KDS */}
          <Route 
            path="/kitchen" 
            element={
              <ProtectedRoute allowedRoles={['mesero', 'administrador']}>
                <KitchenDashboard />
              </ProtectedRoute>
            } 
          />

          {/* RUTA ADMINISTRADOR DEDICADA */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
    </div>
  );
}