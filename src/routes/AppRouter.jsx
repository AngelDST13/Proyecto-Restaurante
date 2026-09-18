import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

import Navbar from '../components/Navbar';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Menu from '../pages/Menu';
import AdminDashboard from '../pages/AdminDashboard';
import Unauthorized from '../pages/Unauthorized';

export const AppRouter = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([
    { id: 1, nombre: 'Tomahawk Dry-Aged 45D', precio: 125.00, nota: 'Término Medio' },
    { id: 2, nombre: 'Carpaccio de Vieiras & Caviar', precio: 38.00, nota: 'Sin sésamo' }
  ]);

  return (
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] relative">
      <Navbar onToggleCart={() => setCartOpen(!cartOpen)} cartCount={cartItems.length} />

      {/* Drawer de Comanda Global */}
      <aside className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-[#00241B]/95 backdrop-blur-2xl border-l border-[#F8FFE5]/15 z-[90] transform ${cartOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 flex flex-col justify-between shadow-2xl p-6`}>
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#F8FFE5]/15">
            <h3 className="font-bold text-[#F8FFE5] text-base">Comanda de Salón · Mesa #12</h3>
            <button onClick={() => setCartOpen(false)} className="text-[#F8FFE5]/70 hover:text-[#F8FFE5]">✕</button>
          </div>
          <div className="mt-4 space-y-3">
            {cartItems.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#00241B] border border-[#F8FFE5]/10 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-[#F8FFE5]">{item.nombre}</div>
                  <div className="text-[11px] text-[#D16014] font-semibold">${item.precio.toFixed(2)}</div>
                </div>
                <span className="text-xs text-[#659B5E] font-bold bg-[#0A090C] px-2 py-1 rounded">x1</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-[#F8FFE5]/15 pt-4 space-y-3 text-xs">
          <div className="flex justify-between font-bold text-[#F8FFE5]">
            <span>Total Comanda</span>
            <span className="text-[#D16014]">${cartItems.reduce((a, b) => a + b.precio, 0).toFixed(2)}</span>
          </div>
          <button onClick={() => setCartOpen(false)} className="w-full py-3 rounded-xl bg-[#D16014] font-bold text-[#F8FFE5]">
            Despachar a Cocina (N8N)
          </button>
        </div>
      </aside>

      <main className="pt-16">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rutas Protegidas (Cliente, Mesero, Administrador) */}
          <Route element={<ProtectedRoute allowedRoles={['cliente', 'mesero', 'administrador']} />}>
            <Route path="/menu" element={<Menu onAddToCart={(item) => setCartItems([...cartItems, item])} />} />
          </Route>

          {/* Rutas Protegidas Exclusivas (Solo Administrador) */}
          <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};