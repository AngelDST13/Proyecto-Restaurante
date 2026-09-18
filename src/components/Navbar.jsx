import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, ShoppingBag, LogOut, ShieldCheck, User } from 'lucide-react';

export default function Navbar({ onToggleCart, cartCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-[#F8FFE5]/10 bg-[#0A090C]/90 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D16014] flex items-center justify-center font-bold text-lg text-[#F8FFE5] shadow-lg shadow-[#D16014]/30">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#F8FFE5]">GourmetSync</span>
            <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#00241B] text-[#659B5E] border border-[#659B5E]/40">v3.2</span>
          </div>
        </Link>

        {/* Links dinámicos según Rol */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
          <Link to="/" className="px-3 py-1.5 rounded-lg text-[#F8FFE5]/70 hover:text-[#F8FFE5] hover:bg-[#00241B]">Inicio</Link>
          
          {user && (
            <Link to="/menu" className="px-3 py-1.5 rounded-lg text-[#F8FFE5]/70 hover:text-[#F8FFE5] hover:bg-[#00241B]">
              {user.rol === 'mesero' ? 'Terminal Mesero' : 'Menú & Pedidos'}
            </Link>
          )}

          {user?.rol === 'administrador' && (
            <Link to="/admin" className="px-3 py-1.5 rounded-lg bg-[#D16014]/20 text-[#D16014] border border-[#D16014]/40 font-bold">
              Dashboard Admin
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <button 
            onClick={onToggleCart}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#00241B] border border-[#659B5E]/40 text-[#F8FFE5] text-xs font-semibold"
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
            <div className="bg-[#00241B] px-3 py-1 rounded-lg border border-[#F8FFE5]/10 text-xs text-left">
              <span className="flex items-center gap-1 font-bold text-[#F8FFE5] capitalize">
                {user.rol === 'administrador' && <ShieldCheck className="w-3.5 h-3.5 text-[#D16014]" />}
                {user.rol === 'mesero' && <User className="w-3.5 h-3.5 text-[#659B5E]" />}
                {user.rol}
              </span>
              <span className="block text-[10px] text-[#F8FFE5]/60">{user.email}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-lg bg-[#00241B] hover:bg-[#D16014] text-[#F8FFE5] border border-[#F8FFE5]/10 transition-colors text-xs font-bold"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link to="/login" className="px-4 py-1.5 rounded-lg bg-[#D16014] font-bold text-xs text-[#F8FFE5] shadow-md">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </header>
  );
}