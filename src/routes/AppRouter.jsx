import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Menu from '../pages/Menu';
import AdminDashboard from '../pages/AdminDashboard';
import WaiterDashboard from '../pages/WaiterDashboard';
import Unauthorized from '../pages/Unauthorized';

import AdminRoute from './AdminRoute';
import WaiterRoute from './WaiterRoute';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export function AppRouter() {
  const { inactivityToast, setInactivityToast } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[#0A090C] text-[#F8FFE5]">
      {inactivityToast && (
        <Toast 
          message="Su sesión se ha cerrado automáticamente por 3 minutos de inactividad." 
          type="info" 
          onClose={() => setInactivityToast(false)} 
        />
      )}

      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* RUTA PROTEGIDA DE MESEROS */}
          <Route 
            path="/waiter" 
            element={
              <WaiterRoute>
                <WaiterDashboard />
              </WaiterRoute>
            } 
          />

          {/* RUTA PROTEGIDA DE ADMINISTRADOR */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}