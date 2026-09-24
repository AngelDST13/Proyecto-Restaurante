import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Utensils, Calendar, User, LogOut, Menu as MenuIcon, X, Info, RotateCcw } from 'lucide-react';
import logoNegro from '../assets/img/LogoN.svg';

export default function Navbar({ onOpenReservation }) {
  const { user, logout } = useAuth();
  const { fontSizeLevel, increaseFontSize, decreaseFontSize, resetFontSize } = useAccessibility();
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

  const handleReservationClick = () => {
    setIsMobileMenuOpen(false);
    if (typeof onOpenReservation === 'function') {
      onOpenReservation();
    } else {
      handleSectionClick('eventos');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#001812]/95 backdrop-blur-md border-b border-[#659B5E]/30 text-[#F8FFE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* LOGO CON FONDO BLANCO/CREMA Y ASERRÍ */}
        <a 
          href="/" 
          onClick={handleLogoClick} 
          className="flex items-center gap-3 group cursor-pointer py-1 select-none"
          aria-label="Ir al inicio de El Cacique"
        >
          <div className="bg-[#F8FFE5] p-1.5 rounded-xl border border-[#D16014] shadow-md group-hover:scale-105 transition-transform">
            <img 
              src={logoNegro} 
              alt="El Cacique Logo" 
              className="h-9 w-auto object-contain" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg sm:text-xl text-white tracking-wider leading-none group-hover:text-[#D16014] transition-colors">
              EL CACIQUE
            </span>
            <span className="text-[10px] font-mono text-[#D16014] uppercase tracking-widest font-black mt-1">
              ASERRÍ
            </span>
          </div>
        </a>

        {/* MENÚ DESKTOP CON ICONOS */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-black uppercase tracking-wider">
          <button onClick={() => handleSectionClick('inicio')} className="hover:text-[#D16014] transition-colors cursor-pointer">
            Inicio
          </button>
          
          <Link to="/menu" className="hover:text-[#D16014] transition-colors flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-[#659B5E]" />
            <span>Menú Digital</span>
          </Link>

          <button onClick={() => handleSectionClick('nosotros')} className="hover:text-[#D16014] transition-colors flex items-center gap-1.5 cursor-pointer">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Nosotros</span>
          </button>

          <button onClick={() => handleSectionClick('eventos')} className="hover:text-[#D16014] transition-colors flex items-center gap-1.5 cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-[#D16014]" />
            <span>Eventos</span>
          </button>

          <button 
            type="button"
            onClick={handleReservationClick} 
            className="px-4 py-2 rounded-xl bg-[#659B5E] hover:bg-[#52824c] text-white font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>AGENDAR RESERVA</span>
          </button>
        </nav>

        {/* CONTROLES DE ACCESIBILIDAD Y PERFIL */}
        <div className="hidden md:flex items-center gap-3">
          
          <div className="flex items-center gap-1 bg-[#0A090C] border border-[#659B5E]/30 p-1 rounded-xl">
            <button 
              type="button"
              onClick={decreaseFontSize} 
              disabled={fontSizeLevel <= -1}
              className="px-2 py-1 text-xs font-black hover:bg-[#D16014] rounded-lg disabled:opacity-30 transition-colors cursor-pointer"
              title="Disminuir Tamaño de Letra"
              aria-label="Disminuir tamaño de letra"
            >
              A-
            </button>
            <button 
              type="button"
              onClick={resetFontSize} 
              className="p-1 hover:bg-[#659B5E] rounded-lg transition-colors cursor-pointer text-gray-300"
              title="Restablecer Tamaño"
              aria-label="Restablecer tamaño de letra"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button 
              type="button"
              onClick={increaseFontSize} 
              disabled={fontSizeLevel >= 2}
              className="px-2 py-1 text-xs font-black hover:bg-[#D16014] rounded-lg disabled:opacity-30 transition-colors cursor-pointer"
              title="Aumentar Tamaño de Letra"
              aria-label="Aumentar tamaño de letra"
            >
              A+
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3 bg-[#0A090C] border border-[#659B5E]/40 px-4 py-2 rounded-2xl">
              <span className="text-xs font-bold text-[#F8FFE5] flex items-center gap-2">
                <User className="w-4 h-4 text-[#D16014]" /> {user.nombre || user.email?.split('@')[0]}
              </span>
              <button 
                type="button"
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
              className="px-5 py-2.5 rounded-xl bg-[#D16014] hover:bg-[#b8510f] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>

        {/* BOTÓN MÓVIL */}
        <button 
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-[#F8FFE5] hover:text-[#D16014]"
          aria-label="Alternar menú de navegación"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>

      </div>

      {/* MENÚ MÓVIL */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#001812] border-b border-[#659B5E]/30 px-6 py-6 space-y-4 text-xs font-extrabold uppercase">
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
          <button onClick={handleReservationClick} className="block w-full text-left py-2 text-[#659B5E] font-bold">
            Agendar Reserva
          </button>

          {/* CONTROLES ACCESIBILIDAD MÓVIL */}
          <div className="pt-4 border-t border-[#F8FFE5]/10 flex justify-between items-center">
            <span className="text-[10px] text-gray-400">Tamaño de letra:</span>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={decreaseFontSize} 
                disabled={fontSizeLevel <= -1}
                className="px-2.5 py-1 bg-[#0A090C] border border-[#659B5E]/30 rounded text-white disabled:opacity-30"
              >
                A-
              </button>
              <button 
                type="button" 
                onClick={resetFontSize} 
                className="px-2.5 py-1 bg-[#0A090C] border border-[#659B5E]/30 rounded text-gray-400"
              >
                Normal
              </button>
              <button 
                type="button" 
                onClick={increaseFontSize} 
                disabled={fontSizeLevel >= 2}
                className="px-2.5 py-1 bg-[#0A090C] border border-[#659B5E]/30 rounded text-white disabled:opacity-30"
              >
                A+
              </button>
            </div>
          </div>

          {/* ESTADO USUARIO MÓVIL */}
          <div className="pt-3 border-t border-[#F8FFE5]/10">
            {user ? (
              <button 
                type="button"
                onClick={logout} 
                className="w-full py-2.5 bg-red-500/20 text-red-400 rounded-xl text-center font-bold"
              >
                Cerrar Sesión ({user.nombre || user.email?.split('@')[0]})
              </button>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="block w-full py-2.5 bg-[#D16014] text-white text-center rounded-xl font-bold"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
