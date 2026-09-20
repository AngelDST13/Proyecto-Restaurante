import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, LogOut, Menu as MenuIcon, X, Calendar, User, ShieldAlert } from 'lucide-react';
import logoNegro from '../assets/img/LogoN.svg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 150);
    } else {
      if (sectionId === 'inicio') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A090C]/90 backdrop-blur-md border-b border-[#F8FFE5]/10 text-[#F8FFE5]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO INSTITUCIONAL */}
        <button onClick={() => scrollToSection('inicio')} className="flex items-center gap-3 group cursor-pointer text-left">
          <img 
            src={logoNegro} 
            alt="Logo Chicharronera El Cacique" 
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#F8FFE5] block leading-none">El Cacique</span>
            <span className="text-[10px] text-[#659B5E] font-semibold tracking-wider uppercase">Chicharronera Gourmet</span>
          </div>
        </button>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider uppercase">
          <button onClick={() => scrollToSection('inicio')} className="hover:text-[#D16014] transition-colors cursor-pointer">
            Inicio
          </button>
          
          <Link to="/menu" className="hover:text-[#D16014] transition-colors flex items-center gap-1.5 text-[#659B5E]">
            <Utensils className="w-3.5 h-3.5" /> Menú Digital
          </Link>

          <button onClick={() => scrollToSection('nosotros')} className="hover:text-[#D16014] transition-colors cursor-pointer">
            Nosotros
          </button>

          <button onClick={() => scrollToSection('eventos')} className="hover:text-[#D16014] transition-colors flex items-center gap-1 text-amber-500 cursor-pointer">
            <Calendar className="w-3.5 h-3.5" /> Eventos
          </button>

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

        {/* PERFIL / INICIAR SESIÓN */}
        <div className="hidden md:flex items-center gap-4 text-xs font-bold">
          {user ? (
            <div className="flex items-center gap-3 border-l border-[#F8FFE5]/15 pl-4">
              <div className="text-right">
                <span className="block text-[#F8FFE5] font-bold leading-tight">{user.nombre || user.email.split('@')[0]}</span>
                <span className="block text-[9px] text-[#659B5E] capitalize">{user.rol}</span>
              </div>
              <button 
                onClick={logout} 
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-xl bg-[#D16014] hover:bg-[#b8510f] text-white font-bold transition-all shadow-md shadow-[#D16014]/20 flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" /> Iniciar Sesión
            </button>
          )}
        </div>

        {/* MENÚ MÓVIL */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden p-2 text-gray-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A090C] border-b border-[#F8FFE5]/10 px-6 py-4 space-y-3 text-xs font-bold uppercase">
          <button onClick={() => scrollToSection('inicio')} className="block w-full text-left py-2">Inicio</button>
          <Link to="/menu" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#659B5E]">Menú Digital</Link>
          <button onClick={() => scrollToSection('nosotros')} className="block w-full text-left py-2">Nosotros</button>
          <button onClick={() => scrollToSection('eventos')} className="block w-full text-left py-2 text-amber-500">Eventos</button>
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