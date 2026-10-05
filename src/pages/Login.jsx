import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { triggerN8nAutomation } from '../services/n8nService';
import { sanitizePlainTextInput } from '../services/authSecurity';
import LoginQuickAccessModal from '../components/LoginQuickAccessModal';
import { Lock, Mail, Eye, EyeOff, Flame, UserPlus, Ticket, Store } from 'lucide-react';
import { caciqueAsset as caciqueIcon } from '../assets/img';

export default function Login() {
  const { loginWithCredentials, registerClient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState(location.state?.password || '');
  const [nombre, setNombre] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [newCoupon, setNewCoupon] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isRegister) {
      if (!nombre.trim() || nombre.trim().length < 3) {
        showToast('El nombre debe contener al menos 3 letras.', 'error');
        return false;
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre.trim())) {
        showToast('El nombre solo debe contener letras y espacios.', 'error');
        return false;
      }
    }

    if (!emailRegex.test(email.trim())) {
      showToast('Ingrese una dirección de correo válida.', 'error');
      return false;
    }

    if (password.length < 6) {
      showToast('La contraseña debe tener mínimo 6 caracteres.', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isRegister) {
      const res = registerClient(email, password, nombre);
      if (!res.success) {
        showToast(res.message, 'error');
        return;
      }

      setNewCoupon(res.coupon);
      showToast('¡Registro exitoso! Se ha asignado tu cupón del 5% OFF.', 'success');

      // Notificar a n8n
      triggerN8nAutomation('REGISTRO_CLIENTE', {
        nombre: nombre,
        email: email
      });

      setTimeout(() => navigate('/menu'), 1000);

    } else {
      const res = loginWithCredentials(email, password);
      if (!res.success) {
        showToast(res.message, 'error');
        return;
      }

      showToast(`¡Bienvenido ${res.user.nombre || res.user.alias}!`, 'success');

      setTimeout(() => {
        if (res.user.rol === 'administrador') {
          navigate('/admin');
        } else if (res.user.rol === 'cajero') {
          navigate('/cashier');
        } else if (res.user.rol === 'mesero') {
          navigate('/waiter');
        } else if (res.user.rol === 'cocina') {
          navigate('/kitchen');
        } else {
          navigate('/menu');
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center bg-[#0A090C] cacique-login-canvas relative overflow-hidden font-sans">

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#001812]/95 backdrop-blur-2xl border border-[#659B5E]/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative z-10 cacique-login-card"
      >
        <div className="text-center space-y-3">

          <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-[#D16014]/40 rounded-full blur-2xl animate-pulse"></div>
            <img
              src={caciqueIcon}
              alt="Isotipo El Cacique"
              className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_0_25px_rgba(209,96,20,0.9)] hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div>
            <h2 className="text-2xl font-black text-[#F8FFE5] tracking-tight">
              {isRegister ? 'Registro de Comensal' : 'Acceso al Sistema'}
            </h2>
            <p className="text-xs text-[#659B5E] font-bold uppercase tracking-wider mt-1 flex items-center justify-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#D16014]" />
              <span>Chicharronera El Cacique • Tradición &amp; Sabor</span>
            </p>
            <div className="mt-4 p-3 rounded-2xl bg-[#0A090C] border border-[#659B5E]/30 flex items-center justify-center gap-2 text-xs font-bold text-[#659B5E] cacique-login-banner">
              <Store className="w-4 h-4 text-[#D16014]" />
              <span>Pedidos para Mesa, Express o Recoger en Local</span>
            </div>
          </div>

          <div className="flex bg-[#0A090C] p-1 rounded-xl border border-[#F8FFE5]/10 text-xs font-bold cacique-login-switch">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setEmail(''); setPassword(''); }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${!isRegister ? 'bg-[#D16014] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setEmail(''); setPassword(''); }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${isRegister ? 'bg-[#D16014] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Crear Cuenta (5% Desc. en 1er Pedido)
            </button>
          </div>
        </div>

        {newCoupon && (
          <div className="p-4 bg-[#659B5E]/20 border border-[#659B5E]/50 rounded-2xl text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-[#659B5E] font-black text-xs uppercase">
              <Ticket className="w-4 h-4" />
              <span>¡Cupón de Bienvenida Asignado!</span>
            </div>
            <p className="text-sm font-black text-white tracking-widest">{newCoupon.code}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-xs">
          {isRegister && (
            <div className="space-y-1">
              <label className="block font-bold text-[#F8FFE5]/80">Nombre Completo (Mín. 3 letras)</label>
              <div className="relative">
                <UserPlus className="w-4 h-4 absolute left-3.5 top-3 text-[#F8FFE5]/40" />
                <input
                  type="text"
                  placeholder="ej: Angel Salazar"
                  value={nombre}
                  onChange={e => setNombre(sanitizePlainTextInput(e.target.value))}
                  autoComplete="off"
                  required 
                  className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-4 py-3 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]" 
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-bold text-[#F8FFE5]/80">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#F8FFE5]/40" />
              <input 
                type="email" 
                placeholder="ej: admin@elcacique.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="off"
                required 
                className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-4 py-3 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#F8FFE5]/80">Contraseña (Mín. 6 caracteres)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#F8FFE5]/40" />
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required 
                className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-10 py-3 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 rounded-xl bg-[#D16014] hover:bg-[#b8510f] font-extrabold text-white text-xs shadow-lg uppercase tracking-wider cursor-pointer"
          >
            {isRegister ? 'Registrarme y Obtener Cupón 5% OFF' : 'Iniciar Sesión'}
          </button>
        </form>
        {!isRegister && <LoginQuickAccessModal onAutofill={credential => { setIsRegister(false); setEmail(credential.email); setPassword(credential.password); }} />}
      </motion.div>
    </div>
  );
}
