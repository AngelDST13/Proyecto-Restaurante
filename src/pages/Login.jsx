import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Lock, Mail, Eye, EyeOff, Flame, UserPlus, Ticket } from 'lucide-react';
import logoNegro from '../assets/img/LogoN.svg';

export default function Login() {
  const { loginWithCredentials, registerClient } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegister) {
      if (!nombre || !email || !password) {
        showToast('Por favor complete todos los datos de registro', 'error');
        return;
      }

      const res = registerClient(email, password, nombre);
      if (!res.success) {
        showToast(res.message, 'error');
        return;
      }

      setNewCoupon(res.coupon);
      showToast('¡Registro completado! Se ha generado tu cupón de 5% de descuento', 'success');
      setTimeout(() => navigate('/menu'), 2500);

    } else {
      if (!email || !password) {
        showToast('Ingrese su correo y contraseña', 'error');
        return;
      }

      const res = loginWithCredentials(email, password);
      if (!res.success) {
        showToast(res.message, 'error');
        return;
      }

      showToast(`¡Bienvenido ${res.user.nombre || res.user.alias}!`, 'success');
      setTimeout(() => {
        if (res.user.rol === 'administrador') navigate('/admin');
        else if (res.user.rol === 'mesero') navigate('/waiter');
        else navigate('/menu');
      }, 800);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center bg-[#0A090C] relative overflow-hidden font-sans">
      
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D16014]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#659B5E]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="w-full max-w-md bg-[#001812]/95 backdrop-blur-2xl border border-[#659B5E]/30 rounded-3xl p-8 space-y-6 shadow-2xl relative z-10">
        
        {/* LOGO E IDENTIDAD INSTITUCIONAL */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-[#0A090C] border border-[#F8FFE5]/10 shadow-lg mx-auto flex items-center justify-center p-3">
            <img 
              src={logoNegro} 
              alt="Logo El Cacique" 
              className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(209,96,20,0.4)]"
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
          </div>

          {/* CONMUTADOR LOGIN / REGISTRO */}
          <div className="flex bg-[#0A090C] p-1 rounded-xl border border-[#F8FFE5]/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 rounded-lg transition-all ${!isRegister ? 'bg-[#D16014] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 rounded-lg transition-all ${isRegister ? 'bg-[#D16014] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Crear Cuenta (+5% OFF)
            </button>
          </div>
        </div>

        {/* ALERTA DE CUPÓN GENERADO */}
        {newCoupon && (
          <div className="p-4 bg-[#659B5E]/20 border border-[#659B5E]/50 rounded-2xl text-center space-y-1 animate-bounce">
            <div className="flex items-center justify-center gap-2 text-[#659B5E] font-black text-xs uppercase">
              <Ticket className="w-4 h-4" />
              <span>¡Cupón de Bienvenida Asignado!</span>
            </div>
            <p className="text-sm font-black text-white tracking-widest">{newCoupon.code}</p>
            <p className="text-[10px] text-gray-300">Aplica 5% de descuento en tu primer pedido digital</p>
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-xs">
          
          {isRegister && (
            <div className="space-y-1">
              <label className="block font-bold text-[#F8FFE5]/80">Nombre Completo</label>
              <div className="relative">
                <UserPlus className="w-4 h-4 absolute left-3.5 top-3 text-[#F8FFE5]/40" />
                <input 
                  type="text" 
                  placeholder="ej: María Alvarado"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
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
                required 
                className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-4 py-3 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#F8FFE5]/80">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#F8FFE5]/40" />
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
                className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-10 py-3 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isRegister && (
            <div className="p-3 bg-[#0A090C] border border-[#F8FFE5]/10 rounded-xl space-y-1 text-[10px]">
              <span className="text-gray-400 font-bold block uppercase">Credenciales Oficiales de Acceso:</span>
              <p className="text-[#659B5E] font-mono">Admin: admin@elcacique.com | AdminCacique2026!</p>
              <p className="text-amber-400 font-mono">Mesero: mesero.escazu@elcacique.com | MeseroEscazu2026!</p>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-3.5 rounded-xl bg-[#D16014] hover:bg-[#b8510f] font-extrabold text-white text-xs shadow-lg shadow-[#D16014]/30 transition-all uppercase tracking-wider cursor-pointer"
          >
            {isRegister ? 'Registrarme y Obtener Cupón 5% OFF' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}