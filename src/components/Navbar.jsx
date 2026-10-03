import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Home, Utensils, UtensilsCrossed, ChefHat, LayoutDashboard, CreditCard, Calendar, User, LogOut, LogIn, Menu as MenuIcon, X, Info, RotateCcw, ShoppingBag, Sun, Moon, Volume2, VolumeX, Eye } from 'lucide-react';
import caciqueIcon from '../assets/img/Cacique.svg';
import { useTalkBack } from '../context/TalkBackContext';

export default function Navbar({ onOpenReservation }) {
  const { user, logout } = useAuth();
  const { fontSizeLevel, increaseFontSize, decreaseFontSize, resetFontSize, isLightTheme, toggleTheme, colorBlindMode, colorBlindModes, setColorBlindMode } = useAccessibility();
  const { isEnabled: isTalkBackEnabled, toggleTalkBack, announce } = useTalkBack();

  /** Aplica un filtro visual y lo anuncia en voz alta. */
  const handleColorBlindChange = (modeId) => {
    setColorBlindMode(modeId);
    const mode = colorBlindModes.find((item) => item.id === modeId);
    if (mode) announce(`Filtro visual activado: ${mode.label}. ${mode.description}`);
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getDashboardButtonConfig = () => {
    if (!user?.rol) return null;

    const role = String(user.rol).toLowerCase().trim();
    if (['admin', 'administrador'].includes(role)) {
      return { label: 'Panel Admin', path: '/admin', icon: LayoutDashboard };
    }
    if (['mesero', 'waiter', 'pos'].includes(role)) {
      return { label: 'Panel Mesero POS', path: '/waiter', icon: UtensilsCrossed };
    }
    if (role === 'cajero') {
      return { label: 'Panel Caja', path: '/cashier', icon: CreditCard };
    }
    if (['cocina', 'kitchen', 'kds'].includes(role)) {
      return { label: 'Panel Cocina KDS', path: '/kitchen', icon: ChefHat };
    }

    return null;
  };

  const dashboardConfig = getDashboardButtonConfig();
  const DashboardIcon = dashboardConfig?.icon;

  const handleLandingClick = (e) => {
    e?.preventDefault();
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/', { replace: false });
    }
  };

  const handleLogoClick = (e) => {
    handleLandingClick(e);
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
    <header className="fixed inset-x-0 top-0 z-50 w-full max-w-full overflow-x-hidden border-b border-(--cacique-border)/20 bg-(--cacique-canvas)/95 backdrop-blur-md text-(--cacique-text) shadow-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl min-w-0 items-center justify-between gap-2 overflow-x-auto px-4 sm:px-6 xl:gap-4">

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
              className="cacique-logo w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div>
            <span className="font-extrabold text-lg text-(--cacique-heading) tracking-wide block leading-none group-hover:text-(--cacique-accent) transition-colors">
              EL CACIQUE
            </span>
            <span className="text-[10px] font-bold text-(--cacique-accent-alt) tracking-widest uppercase mt-0.5 block">
              CHICHARRONERA GOURMET
            </span>
          </div>
        </Link>

        {/* MENÚ DESKTOP */}
        <nav className="hidden xl:flex flex-1 items-center justify-center gap-5 xl:gap-8 text-xs xl:text-sm font-extrabold tracking-wide">
          <button
            type="button"
            onClick={handleLandingClick}
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
        <div className="hidden 2xl:flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full bg-(--cacique-surface) border border-(--cacique-border)/20 text-[10px] text-(--cacique-accent-alt) font-bold whitespace-nowrap">
          <ShoppingBag className="w-3.5 h-3.5 text-[#D16014]" />
          <span>Servicio en Mesa &amp; Express / Recoger en Local</span>
        </div>

        <div className="hidden xl:flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleReservationClick}
            className="px-4 py-2 rounded-xl bg-[#659B5E] hover:bg-emerald-600 text-white font-extrabold text-xs uppercase transition-all shadow-md cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>AGENDAR RESERVA</span>
          </button>

          {dashboardConfig && DashboardIcon && (
            <Link
              to={dashboardConfig.path}
              aria-current={location.pathname === dashboardConfig.path ? 'page' : undefined}
              aria-label={dashboardConfig.label}
              title={dashboardConfig.label}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-400 shadow-sm transition-all hover:bg-amber-500/20 2xl:px-3.5"
            >
              <DashboardIcon className="h-4 w-4" />
              <span className="hidden 2xl:inline">{dashboardConfig.label}</span>
            </Link>
          )}

          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-(--cacique-border)/20 bg-(--cacique-card) p-1">
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={isLightTheme}
              aria-label={isLightTheme ? 'Activar modo oscuro' : 'Activar modo claro'}
              title={isLightTheme ? 'Activar modo oscuro' : 'Activar modo claro'}
              className="px-2 py-1 rounded-lg hover:bg-[#D16014] transition-colors cursor-pointer"
            >
              {isLightTheme ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={toggleTalkBack}
              aria-pressed={isTalkBackEnabled}
              aria-label={isTalkBackEnabled ? 'Desactivar lector de voz' : 'Activar lector de voz'}
              title={isTalkBackEnabled ? 'Desactivar lector de voz' : 'Activar lector de voz'}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${isTalkBackEnabled ? 'bg-[#D16014] text-white' : 'hover:bg-[#D16014]'}`}
            >
              {isTalkBackEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>

          <label className="flex shrink-0 items-center gap-1.5 rounded-xl border border-(--cacique-border)/20 bg-(--cacique-card) p-1">
            <Eye className="w-3.5 h-3.5 shrink-0 text-(--cacique-accent-alt)" aria-hidden="true" />
            <span className="sr-only">Tipo de daltonismo</span>
            <select
              aria-label="Tipo de daltonismo"
              value={colorBlindMode}
              onChange={(event) => handleColorBlindChange(event.target.value)}
              title="Filtro visual de contraste"
              className="w-34 shrink-0 cursor-pointer truncate rounded-lg bg-transparent px-1 py-1 text-[11px] font-bold uppercase tracking-wide text-(--cacique-text) focus-visible:outline-2 focus-visible:outline-(--cacique-accent)"
            >
              {colorBlindModes.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-(--cacique-border)/20 bg-(--cacique-card) p-1">
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
              <span className="max-w-40 truncate text-xs font-bold text-[#F8FFE5] flex items-center gap-2">
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
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>

        {/* BOTÓN MÓVIL */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="shrink-0 rounded-xl border border-(--cacique-border)/20 bg-(--cacique-card) p-2 text-(--cacique-text) hover:text-(--cacique-accent) transition-colors xl:hidden"
          aria-label="Alternar menú de navegación"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>

      </div>

      {/* MENÚ MÓVIL */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="max-h-[calc(100vh-5rem)] w-full max-w-full min-w-0 overflow-x-auto overflow-y-auto border-b border-(--cacique-border)/20 bg-(--cacique-surface) px-6 py-6 space-y-4 text-xs font-extrabold uppercase"
        >
          <Link
            to="/"
            onClick={handleLandingClick}
            className="flex items-center gap-2 w-full text-left py-2 hover:text-[#D16014]"
          >
            <Home className="w-4 h-4 text-[#D16014]" />
            <span>Inicio</span>
          </Link>
          <Link to="/menu" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-2 hover:text-[#D16014]">
            <Utensils className="w-4 h-4 text-[#659B5E]" />
            <span>Menú</span>
          </Link>
          {dashboardConfig && DashboardIcon && (
            <Link
              to={dashboardConfig.path}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={location.pathname === dashboardConfig.path ? 'page' : undefined}
              className="flex w-full items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-amber-400 hover:bg-amber-500/20"
            >
              <DashboardIcon className="h-4 w-4" />
              <span>{dashboardConfig.label}</span>
            </Link>
          )}
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D16014] py-2.5 text-center font-bold text-white"
              >
                <LogIn className="h-4 w-4" />
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

