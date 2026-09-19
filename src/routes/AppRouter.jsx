import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Menu from '../pages/Menu';
import AdminDashboard from '../pages/AdminDashboard';
import WaiterDashboard from '../pages/WaiterDashboard';
import Unauthorized from '../pages/Unauthorized';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export function AppRouter() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A090C] text-[#F8FFE5]">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route 
            path="/waiter" 
            element={
              <ProtectedRoute allowedRoles={['mesero', 'administrador']}>
                <WaiterDashboard />
              </ProtectedRoute>
            } 
          />

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
      <Footer />
    </div>
  );
}