import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Menu from '../pages/Menu';
import AdminDashboard from '../pages/AdminDashboard';
import WaiterDashboard from '../pages/WaiterDashboard';
import KitchenDashboard from '../pages/KitchenDashboard';
import Unauthorized from '../pages/Unauthorized';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

function URLNormalizer({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const rawPath = location.pathname;
    const cleanPath = rawPath.toLowerCase().replace(/[./]+$/, '') || '/';
    const canonicalRoutes = {
      '/admindashboard': '/admin',
      '/admin': '/admin',
      '/kitchendashboard': '/kitchen',
      '/kitchen': '/kitchen',
      '/waiterdashboard': '/waiter',
      '/waiter': '/waiter'
    };
    const canonicalPath = canonicalRoutes[cleanPath] || cleanPath;

    if (rawPath !== canonicalPath) {
      navigate(`${canonicalPath}${location.search}${location.hash}`, { replace: true });
    }
  }, [location, navigate]);

  return children;
}

export function AppRouter() {
  const { inactivityToast, setInactivityToast } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <URLNormalizer>
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
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* RUTA MESEROS */}
          <Route 
            path="/waiter" 
            element={
              <PrivateRoute allowedRoles={['mesero', 'administrador']}>
                <WaiterDashboard />
              </PrivateRoute>
            } 
          />

          {/* RUTA COCINA KDS */}
          <Route 
            path="/kitchen" 
            element={
              <PrivateRoute allowedRoles={['cocina', 'administrador']}>
                <KitchenDashboard />
              </PrivateRoute>
            } 
          />

          {/* RUTA ADMINISTRADOR DEDICADA */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute allowedRoles={['administrador']}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          </Routes>
        </div>

        {!isAdminRoute && <Footer />}
      </div>
    </URLNormalizer>
  );
}

export default AppRouter;