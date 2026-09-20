import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatSedeName } from '../services/authSecurity';
import { Utensils, LogOut, Menu as MenuIcon, X, Calendar, User, ShieldAlert, ChefHat, Monitor, AlertCircle } from 'lucide-react';
import logoNegro from '../assets/img/LogoN.svg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#001812]/90 backdrop-blur-md border-b border-[#659B5E]/30 text-[#F8FFE5]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <button onClick={() => scrollToSection('inicio')} className="flex items-center gap-3 group cursor-pointer text-left">
          <div className="w-10 h-10 rounded-xl bg-[#F8FFE5] border border-[#D16014] p-1.5 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <img src={logoNegro} alt="Logo Chicharronera El Cacique" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-black text-base text-white tracking-wide block leading-none">EL CACIQUE</span>
            <span className="text-[9px] font-mono text-[#D16014] uppercase tracking-widest font-extrabold">CHICHARRONERA GOURMET</span>
          </div>
        </button>

        {/* NAVEGACIÓN */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-black tracking-wider uppercase">
          <button onClick={() => scrollToSection('inicio')} className="hover:text-[#D16014] transition-colors cursor-pointer">
            Inicio
          </button>
          
          <Link to="/menu" className="hover:text-[#D16014] transition-colors flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-[#659B5E]" /> Menú Digital
          </Link>

          <button onClick={() => scrollToSection('nosotros')} className="hover:text-[#D16014] transition-colors cursor-pointer">
            Nosotros
          </button>

          <button onClick={() => scrollToSection('eventos')} className="hover:text-[#D16014] transition-colors flex items-center gap-1.5 cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-[#D16014]" /> Eventos
          </button>

          {(user?.rol === 'mesero' || user?.rol === 'administrador') && (
            <Link to="/waiter" className="px-3 py-1.5 rounded-xl bg-[#659B5E]/20 border border-[#659B5E]/50 text-[#659B5E] flex items-center gap-1.5 hover:bg-[#659B5E]/30">
              <Monitor className="w-3.5 h-3.5" /> Panel Mesero
            </Link>
          )}

          {(user?.rol === 'mesero' || user?.rol === 'administrador') && (
            <Link to="/kitchen" className="px-3 py-1.5 rounded-xl bg-[#D16014]/20 border border-[#D16014]/50 text-[#D16014] flex items-center gap-1.5 hover:bg-[#D16014]/30">
              <ChefHat className="w-3.5 h-3.5" /> Cocina • {formatSedeName(user?.sede)}
            </Link>
          )}

          {user?.rol === 'administrador' && (
            <Link to="/admin" className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center gap-1.5 hover:bg-amber-500/30">
              <ShieldAlert className="w-3.5 h-3.5" /> Panel Admin
            </Link>
          )}
        </nav>

        {/* USUARIO */}
        <div className="hidden md:flex items-center gap-4 text-xs font-bold">
          {user ? (
            <div className="flex items-center gap-3 border-l border-[#F8FFE5]/15 pl-4">
              <div className="text-right">
                <span className="block text-[#F8FFE5] font-bold leading-tight">{user.nombre || user.email.split('@')[0]}</span>
                <span className="block text-[9px] text-[#659B5E] capitalize">{user.rol} • Sede {formatSedeName(user.sede)}</span>
              </div>
              <button 
                onClick={() => setIsLogoutModalOpen(true)} 
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl cursor-pointer" 
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-xl bg-[#D16014] hover:bg-[#b8510f] text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer">
              <User className="w-4 h-4" /> Iniciar Sesión
            </button>
          )}
        </div>

        {/* MENÚ MÓVIL */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-300">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A090C] border-b border-[#F8FFE5]/10 px-6 py-4 space-y-3 text-xs font-bold uppercase">
          <button onClick={() => scrollToSection('inicio')} className="block w-full text-left py-2">Inicio</button>
          <Link to="/menu" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#659B5E]">Menú Digital</Link>
          {(user?.rol === 'mesero' || user?.rol === 'administrador') && (
            <Link to="/waiter" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#659B5E]">Panel Mesero</Link>
          )}
          {(user?.rol === 'mesero' || user?.rol === 'administrador') && (
            <Link to="/kitchen" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#D16014]">Cocina</Link>
          )}
          {user ? (
            <button onClick={() => { setMobileMenuOpen(false); setIsLogoutModalOpen(true); }} className="w-full text-left py-2 text-red-400">Cerrar Sesión</button>
          ) : (
            <button onClick={() => navigate('/login')} className="w-full py-2.5 bg-[#D16014] rounded-xl text-center text-white mt-2">Iniciar Sesión</button>
          )}
        </div>
      )}

      {/* MODAL ADVERTENCIA CIERRE SESIÓN */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
          <div className="w-full max-w-sm bg-[#001812] border border-red-500/40 rounded-3xl p-6 space-y-5 text-center shadow-2xl text-xs text-[#F8FFE5]">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">¿Cerrar Sesión Activa?</h3>
              <p className="text-gray-400">¿Estás seguro de que deseas salir del sistema?</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 text-gray-300 font-bold hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold shadow-lg cursor-pointer"
              >
                Sí, Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}