import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Home, Utensils, Calendar, User, LogOut, Menu as MenuIcon, X, Info, RotateCcw, ShoppingBag } from 'lucide-react';
import caciqueIcon from '../assets/img/Cacique.svg';

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A090C]/95 backdrop-blur-md border-b border-[#659B5E]/30 text-[#F8FFE5] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
        
        {/* LOGO ORGANICO CON CACIQUE.SVG */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center gap-3.5 group cursor-pointer py-1 select-none shrink-0"
          aria-label="Ir al inicio de El Cacique"
        >
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-[#D16014]/30 rounded-full blur-md group-hover:blur-lg transition-all"></div>
            <img
              src={caciqueIcon}
              alt="Logo El Cacique"
              className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_0_12px_rgba(209,96,20,0.8)] group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-wide block leading-none group-hover:text-[#D16014] transition-colors">
              EL CACIQUE
            </span>
            <span className="text-[10px] font-bold text-[#659B5E] tracking-widest uppercase mt-0.5 block">
              CHICHARRONERA GOURMET
            </span>
          </div>
        </Link>

        {/* MENÚ DESKTOP */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-5 xl:gap-8 text-xs xl:text-sm font-extrabold tracking-wide">
          <button 
            type="button"
            onClick={() => handleSectionClick('inicio')} 
            className="hover:text-[#D16014] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-[#D16014]" />
            <span>Inicio</span>
          </button>
          
          <Link to="/menu" className="hover:text-[#D16014] transition-colors flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-[#659B5E]" />
            <span>Menú</span>
          </Link>

          <button 
            type="button"
            onClick={() => handleSectionClick('nosotros')} 
            className="hover:text-[#D16014] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Nosotros</span>
          </button>

          <button 
            type="button"
            onClick={() => handleSectionClick('eventos')} 
            className="hover:text-[#D16014] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D16014]" />
            <span>Eventos</span>
          </button>
        </nav>

        {/* CONTROLES DE ACCESIBILIDAD Y SESIÓN */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#001812] border border-[#659B5E]/40 text-[10px] text-[#659B5E] font-bold whitespace-nowrap">
          <ShoppingBag className="w-3.5 h-3.5 text-[#D16014]" />
          <span>Servicio en Mesa &amp; Express / Recoger en Local</span>
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReservationClick}
            className="px-4 py-2 rounded-xl bg-[#659B5E] hover:bg-emerald-600 text-white font-extrabold text-xs uppercase transition-all shadow-md cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>AGENDAR RESERVA</span>
          </button>

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
          <button 
            type="button"
            onClick={() => handleSectionClick('inicio')} 
            className="flex items-center gap-2 w-full text-left py-2 hover:text-[#D16014]"
          >
            <Home className="w-4 h-4 text-[#D16014]" />
            <span>Inicio</span>
          </button>
          <Link to="/menu" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-2 hover:text-[#D16014]">
            <Utensils className="w-4 h-4 text-[#659B5E]" />
            <span>Menú</span>
          </Link>
          <button 
            type="button"
            onClick={() => handleSectionClick('nosotros')} 
            className="flex items-center gap-2 w-full text-left py-2 hover:text-[#D16014]"
          >
            <Info className="w-4 h-4 text-amber-400" />
            <span>Nosotros</span>
          </button>
          <button 
            type="button"
            onClick={() => handleSectionClick('eventos')} 
            className="flex items-center gap-2 w-full text-left py-2 hover:text-[#D16014]"
          >
            <Calendar className="w-4 h-4 text-[#D16014]" />
            <span>Eventos</span>
          </button>
          <button 
            type="button"
            onClick={handleReservationClick} 
            className="flex items-center gap-2 w-full text-left py-2 text-[#659B5E] font-bold"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Reserva</span>
          </button>

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
