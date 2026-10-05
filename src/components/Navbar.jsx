import { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Utensils, UtensilsCrossed, ChefHat, LayoutDashboard, CreditCard, Calendar, User, LogOut, LogIn, Menu as MenuIcon, X, Info, ShoppingBag, Sun, Moon } from 'lucide-react';
import { caciqueAsset as caciqueIcon } from '../assets/img';
import LogoutConfirmModal from './LogoutConfirmModal';
import { requestReservationModal } from '../hooks/useReservationModal';

export default function Navbar({ onOpenReservation }) {
  const { user, logout } = useAuth();
  const { isLightTheme, toggleTheme } = useAccessibility();
  // Modal universal: salir del sitio con una sesion activa siempre exige
  // confirmacion explicita, sin importar el rol (Admin, Cajero, Mesero o Cocina).
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const requestLogout = () => setIsLogoutModalOpen(true);
  const confirmLogout = () => { setIsLogoutModalOpen(false); logout(); };
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
      // El Navbar global no recibe props: se comunica mediante un evento global.
      requestReservationModal();
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full max-w-full overflow-x-hidden border-b border-(--cacique-border)/20 bg-(--cacique-canvas)/95 backdrop-blur-md text-(--cacique-text) shadow-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl min-w-0 items-center justify-between gap-2 overflow-x-auto px-4 sm:px-6 xl:gap-4">

        {/* LOGO ORGANICO CON CACIQUE.SVG */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="group flex shrink-0 cursor-pointer select-none items-center gap-3 py-1"
          aria-label="Ir al inicio de El Cacique"
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-(--cacique-accent)/30 blur-md transition-all group-hover:blur-lg"></div>
            <img
              src={caciqueIcon}
              alt="Logo El Cacique"
              className="cacique-logo relative z-10 h-full w-full object-contain drop-shadow-[0_0_12px_rgba(0,0,0,0.9)] transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 shrink">
            <span className="block whitespace-nowrap font-extrabold leading-none tracking-wide text-(--cacique-heading) drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors group-hover:text-(--cacique-accent) text-base sm:text-lg">
              EL CACIQUE
            </span>
            <span className="mt-0.5 block whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-(--cacique-accent-alt) drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              CHICHARRONERA GOURMET
            </span>
          </div>
        </Link>

        {/* MENÚ DESKTOP */}
        <nav className="hidden xl:flex flex-1 items-center justify-center gap-4 xl:gap-6 text-xs xl:text-sm font-extrabold tracking-wide">
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
        <div className="hidden min-[1800px]:flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full bg-(--cacique-surface) border border-(--cacique-border)/20 text-[10px] text-(--cacique-accent-alt) font-bold whitespace-nowrap">
          <ShoppingBag className="w-3.5 h-3.5 text-[#D16014]" />
          <span>Servicio en Mesa &amp; Express / Recoger en Local</span>
        </div>

        <div className="hidden xl:flex shrink-0 items-center gap-2 pl-2">
          {/* Conmutador rapido de tema: un solo clic alterna Claro / Oscuro. */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={isLightTheme}
            aria-label={isLightTheme ? 'Activar modo oscuro' : 'Activar modo claro'}
            title={isLightTheme ? 'Activar modo oscuro' : 'Activar modo claro'}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--cacique-border)/30 bg-(--cacique-card) text-(--cacique-accent-alt) shadow-sm transition-colors cursor-pointer hover:border-(--cacique-accent) hover:text-(--cacique-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--cacique-accent)"
          >
            {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

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

          {user ? (
            <div className="flex items-center gap-3 bg-[#0A090C] border border-[#659B5E]/40 px-4 py-2 rounded-2xl">
              <span className="max-w-40 truncate text-xs font-bold text-[#F8FFE5] flex items-center gap-2">
                <User className="w-4 h-4 text-[#D16014]" /> {user.nombre || user.email?.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={requestLogout}
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

          <div className="pt-3 border-t border-[#F8FFE5]/10">
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={isLightTheme}
            aria-label={isLightTheme ? 'Activar modo oscuro' : 'Activar modo claro'}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#659B5E]/40 px-3 py-2.5 text-xs font-bold text-[#F8FFE5] transition-colors cursor-pointer"
          >
            {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>{isLightTheme ? 'Modo oscuro' : 'Modo claro'}</span>
          </button>
        </div>

        <div className="pt-3 border-t border-[#F8FFE5]/10">
            {user ? (
              <button
                type="button"
                onClick={requestLogout} 
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
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </header>
  );
}


