import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, LogOut, Menu as MenuIcon, X, Calendar, User, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A090C]/90 backdrop-blur-md border-b border-[#F8FFE5]/10 text-[#F8FFE5]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#D16014] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-[#D16014]/30 group-hover:scale-105 transition-transform">
            C
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#F8FFE5] block leading-none">El Cacique</span>
            <span className="text-[10px] text-[#659B5E] font-semibold tracking-wider uppercase">Chicharronera Gourmet</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider uppercase">
          <Link to="/" className="hover:text-[#D16014] transition-colors">Inicio</Link>
          <Link to="/menu" className="hover:text-[#D16014] transition-colors flex items-center gap-1.5 text-[#659B5E]">
            <Utensils className="w-3.5 h-3.5" /> Menú &amp; Comanda
          </Link>
          <a href="/#nosotros" className="hover:text-[#D16014] transition-colors">Nosotros</a>
          <a href="/#eventos" className="hover:text-[#D16014] transition-colors flex items-center gap-1 text-amber-500">
            <Calendar className="w-3.5 h-3.5" /> Eventos
          </a>

          {user?.rol === 'administrador' && (
            <Link to="/admin" className="px-3 py-1.5 rounded-xl bg-[#D16014]/20 border border-[#D16014]/50 text-[#D16014] flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" /> Panel Admin
            </Link>
          )}

          {user?.rol === 'mesero' && (
            <Link to="/waiter" className="px-3 py-1.5 rounded-xl bg-[#659B5E]/20 border border-[#659B5E]/50 text-[#659B5E] flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5" /> Panel Mesero
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4 text-xs font-bold">
          {user ? (
            <div className="flex items-center gap-3 border-l border-[#F8FFE5]/15 pl-4">
              <div className="text-right">
                <span className="block text-[#F8FFE5] font-bold leading-tight">{user.email.split('@')[0]}</span>
                <span className="block text-[9px] text-[#659B5E] capitalize">{user.rol}</span>
              </div>
              <button 
                onClick={logout} 
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-xl bg-[#D16014] hover:bg-[#b8510f] text-white font-bold transition-all shadow-md shadow-[#D16014]/20 flex items-center gap-2"
            >
              <User className="w-4 h-4" /> Iniciar Sesión
            </button>
          )}
        </div>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden p-2 text-gray-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A090C] border-b border-[#F8FFE5]/10 px-6 py-4 space-y-3 text-xs font-bold uppercase">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2">Inicio</Link>
          <Link to="/menu" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#659B5E]">Menú &amp; Comanda</Link>
          {user?.rol === 'administrador' && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#D16014]">Panel Administrador</Link>
          )}
          {user?.rol === 'mesero' && (
            <Link to="/waiter" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#659B5E]">Panel Mesero</Link>
          )}
          {user ? (
            <button onClick={logout} className="w-full text-left py-2 text-red-400">Cerrar Sesión</button>
          ) : (
            <button onClick={() => navigate('/login')} className="w-full py-2.5 bg-[#D16014] rounded-xl text-center text-white mt-2">Iniciar Sesión</button>
          )}
        </div>
      )}
    </header>
  );
}