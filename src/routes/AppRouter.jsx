import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
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

// Normalizador de URL para URLs canónicas limpias
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
      '/cocina': '/kitchen',
      '/waiterdashboard': '/waiter',
      '/waiter': '/waiter',
      '/mesero': '/waiter'
    };
    const canonicalPath = canonicalRoutes[cleanPath] || cleanPath;

    if (rawPath !== canonicalPath) {
      navigate(`${canonicalPath}${location.search}${location.hash}`, { replace: true });
    }
  }, [location, navigate]);

  return children;
}

export function AppRouter() {
  const { inactivityToast, setInactivityToast, user } = useAuth();
  const location = useLocation();

  // Control de vistas administrativas o paneles donde no se debe mostrar Navbar/Footer de cliente
  const isAdminRoute = location.pathname.startsWith('/admin');
  

  return (
    <URLNormalizer>
      <div className="flex flex-col min-h-screen bg-[#0A090C] text-[#F8FFE5]">
        
        {/* Notificación Toast por inactividad */}
        {inactivityToast && (
          <Toast 
            message="Su sesión se ha cerrado automáticamente por inactividad." 
            type="info" 
            onClose={() => setInactivityToast(false)} 
          />
        )}

        {/* Muestra el Navbar en Landing, Menú y Login, pero lo oculta en el Dashboard de Admin */}
        {!isAdminRoute && <Navbar />}

        <div className="flex-grow">
          <Routes>
            {/* VISTAS PÚBLICAS */}
            <Route path="/" element={<Landing />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* LOGIN (Ruta Pública Protegida) */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />

            {/* RUTA MESEROS */}
            <Route 
              path="/waiter" 
              element={
                <PrivateRoute allowedRoles={['mesero', 'administrador', 'admin']}>
                  <WaiterDashboard />
                </PrivateRoute>
              } 
            />

            {/* RUTA COCINA (KDS) */}
            <Route 
              path="/kitchen" 
              element={
                <PrivateRoute allowedRoles={['cocina', 'administrador', 'admin']}>
                  <KitchenDashboard />
                </PrivateRoute>
              } 
            />

            {/* RUTA ADMINISTRADOR */}
            <Route 
              path="/admin" 
              element={
                <PrivateRoute allowedRoles={['administrador', 'admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />

            {/* Redirección por defecto ante rutas desconocidas */}
            <Route path="*" element={<Navigate to={user ? "/menu" : "/login"} replace />} />
          </Routes>
        </div>

        {/* Footer global (oculto solo en Admin Dashboard) */}
        {!isAdminRoute && <Footer />}
      </div>
    </URLNormalizer>
  );
}

export default AppRouter;