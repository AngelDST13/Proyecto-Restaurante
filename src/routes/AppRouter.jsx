import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
    const cleanPath = rawPath.replace(/[./]+$/, '') || '/';

    if (rawPath !== cleanPath) {
      navigate(`${cleanPath}${location.search}${location.hash}`, { replace: true });
    }
  }, [location, navigate]);

  return children;
}

function ProtectedAdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.rol !== 'administrador') return <Navigate to="/unauthorized" replace />;
  return children;
}

function ProtectedKitchenRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.rol !== 'cocina' && user.rol !== 'administrador') return <Navigate to="/unauthorized" replace />;
  return children;
}

function ProtectedWaiterRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.rol !== 'mesero' && user.rol !== 'administrador') return <Navigate to="/unauthorized" replace />;
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
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* RUTA MESEROS */}
          <Route 
            path="/waiter" 
            element={
              <ProtectedWaiterRoute>
                <WaiterDashboard />
              </ProtectedWaiterRoute>
            } 
          />

          {/* RUTA COCINA KDS */}
          <Route 
            path="/kitchen" 
            element={
              <ProtectedKitchenRoute>
                <KitchenDashboard />
              </ProtectedKitchenRoute>
            } 
          />

          {/* RUTA ADMINISTRADOR DEDICADA */}
          <Route 
            path="/admin" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
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