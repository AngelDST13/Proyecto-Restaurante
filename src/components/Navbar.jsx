import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Calendar, User, LogOut, Menu as MenuIcon, X } from 'lucide-react';
import logoBlanco from '../assets/img/LogoB.svg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { replace: false });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSectionClick = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { replace: false });
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#001812]/95 backdrop-blur-md border-b border-[#659B5E]/20 text-[#F8FFE5]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGOTIPO FLUIDO SIN BORDES NINGUNO QUE LO LIMITE */}
        <a 
          href="/" 
          onClick={handleLogoClick} 
          className="flex items-center gap-3.5 group cursor-pointer py-1 select-none"
          aria-label="Ir al inicio de El Cacique"
        >
          <img 
            src={logoBlanco} 
            alt="El Cacique Logo" 
            className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_12px_rgba(209,96,20,0.5)]" 
          />
          <div className="flex flex-col">
            <span className="font-black text-lg text-white tracking-wider leading-none group-hover:text-[#D16014] transition-colors">
              EL CACIQUE
            </span>
            <span className="text-[9px] font-mono text-[#D16014] uppercase tracking-widest font-black mt-0.5">
              CHICHARRONERA GOURMET
            </span>
          </div>
        </a>

        {/* MENÚ DE NAVEGACIÓN DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider">
          <button onClick={() => handleSectionClick('inicio')} className="hover:text-[#D16014] transition-colors cursor-pointer">
            Inicio
          </button>
          
          <Link to="/menu" className="hover:text-[#D16014] transition-colors flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-[#659B5E]" />
            <span>Menú Digital</span>
          </Link>

          <button onClick={() => handleSectionClick('nosotros')} className="hover:text-[#D16014] transition-colors cursor-pointer">
            Nosotros
          </button>

          <button onClick={() => handleSectionClick('eventos')} className="hover:text-[#D16014] transition-colors flex items-center gap-1.5 cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-[#D16014]" />
            <span>Eventos</span>
          </button>
        </nav>

        {/* BOTÓN DE ACCESO / PERFIL */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 bg-[#0A090C] border border-[#659B5E]/40 px-4 py-2 rounded-2xl">
              <span className="text-xs font-bold text-[#F8FFE5] flex items-center gap-2">
                <User className="w-4 h-4 text-[#D16014]" /> {user.nombre || user.email?.split('@')[0]}
              </span>
              <button 
                onClick={logout} 
                className="text-red-400 hover:text-red-300 p-1 transition-colors cursor-pointer"
                title="Cerrar Sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-[#D16014] hover:bg-[#b8510f] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D16014]/20 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>

        {/* BOTÓN MÓVIL */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-[#F8FFE5] hover:text-[#D16014]"
          aria-label="Alternar menú de navegación"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>

      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#001812] border-b border-[#659B5E]/30 px-6 py-6 space-y-4 text-xs font-extrabold uppercase">
          <button onClick={() => handleSectionClick('inicio')} className="block w-full text-left py-2 hover:text-[#D16014]">
            Inicio
          </button>
          <Link to="/menu" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-[#D16014]">
            Menú Digital
          </Link>
          <button onClick={() => handleSectionClick('nosotros')} className="block w-full text-left py-2 hover:text-[#D16014]">
            Nosotros
          </button>
          <button onClick={() => handleSectionClick('eventos')} className="block w-full text-left py-2 hover:text-[#D16014]">
            Eventos
          </button>
          
          <div className="pt-4 border-t border-[#F8FFE5]/10">
            {user ? (
              <button onClick={logout} className="w-full py-2.5 bg-red-500/20 text-red-400 rounded-xl text-center">
                Cerrar Sesión ({user.nombre || user.email?.split('@')[0]})
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-2.5 bg-[#D16014] text-white text-center rounded-xl">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

