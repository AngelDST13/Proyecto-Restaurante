import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../hooks/useAccessibility';
import { Utensils, ShoppingBag, LogOut, Type } from 'lucide-react';

export default function Navbar({ onToggleCart, cartCount }) {
  const { user, logout } = useAuth();
  const { toggleFontSize } = useAccessibility();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 w-full border-b border-[#F8FFE5]/10 bg-[#0A090C]/90 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#D16014] flex items-center justify-center shadow-lg shadow-[#D16014]/30 border border-[#D16014]/60 group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5 text-[#F8FFE5]" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-[#F8FFE5]">GourmetSync</span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#00241B] text-[#659B5E] border border-[#659B5E]/40">v3.2</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
          <Link to="/" className="px-3.5 py-1.5 rounded-lg text-[#F8FFE5]/70 hover:text-[#F8FFE5] hover:bg-[#00241B]">Inicio</Link>
          {user && (
            <Link to="/menu" className="px-3.5 py-1.5 rounded-lg text-[#F8FFE5]/70 hover:text-[#F8FFE5] hover:bg-[#00241B]">Menú & Pedidos</Link>
          )}
          {user?.rol === 'administrador' && (
            <Link to="/admin" className="px-3.5 py-1.5 rounded-lg text-[#F8FFE5]/70 hover:text-[#F8FFE5] hover:bg-[#00241B]">Dashboard Admin</Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleFontSize}
          title="Ajustar tamaño de texto (Accesibilidad)"
          className="p-1.5 rounded-lg bg-[#00241B] hover:bg-[#D16014] text-[#F8FFE5]/80 hover:text-[#F8FFE5] border border-[#F8FFE5]/10 transition-colors flex items-center gap-1 text-xs font-bold"
          aria-label="Ajustar tamaño de texto"
        >
          <Type className="w-4 h-4" />
          <span className="hidden sm:inline">Texto</span>
        </button>

        {user && (
          <button 
            onClick={onToggleCart}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#00241B] hover:bg-[#00241B]/80 border border-[#659B5E]/40 text-[#F8FFE5] transition-all shadow-md text-xs font-semibold"
          >
            <ShoppingBag className="w-4 h-4 text-[#D16014]" />
            <span className="hidden sm:inline">Comanda</span>
            <span className="w-5 h-5 rounded-full bg-[#D16014] text-[#F8FFE5] text-[11px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-[#F8FFE5]/15">
            <div className="flex items-center gap-2 bg-[#00241B] px-2.5 py-1 rounded-lg border border-[#F8FFE5]/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#659B5E] animate-pulse"></span>
              <div className="leading-none text-left">
                <span className="block font-bold text-[#F8FFE5] capitalize">{user.rol}</span>
                <span className="block text-[10px] text-[#F8FFE5]/60">{user.email}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              title="Cerrar sesión"
              className="p-1.5 rounded-lg bg-[#00241B] hover:bg-[#D16014] text-[#F8FFE5]/80 hover:text-[#F8FFE5] border border-[#F8FFE5]/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link to="/login" className="px-4 py-1.5 rounded-lg bg-[#D16014] text-[#F8FFE5] font-semibold text-xs shadow-md">
            Acceso Unificado
          </Link>
        )}
      </div>
    </header>
  );
}