import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Lock, Mail, Eye, EyeOff, Flame } from 'lucide-react';
import logoNegro from '../assets/img/LogoN.svg';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Por favor complete todos los campos de acceso', 'error');
      return;
    }

    const loggedUser = login(email, password);
    showToast('¡Bienvenido a Chicharronera El Cacique!', 'success');
    
    setTimeout(() => {
      if (loggedUser.rol === 'administrador') navigate('/admin');
      else if (loggedUser.rol === 'mesero') navigate('/waiter');
      else navigate('/menu');
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center bg-[#0A090C] relative overflow-hidden">
      
      {/* EFECTOS DE LUZ AMBIENTAL DE FONDO */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D16014]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#659B5E]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="w-full max-w-md bg-[#001812]/90 backdrop-blur-2xl border border-[#659B5E]/30 rounded-3xl p-8 space-y-6 shadow-2xl relative z-10 transform transition-all duration-500 hover:scale-[1.01]">
        
        {/* CABECERA CON LOGO OFICIAL */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-[#0A090C] border border-[#F8FFE5]/10 shadow-lg mx-auto flex items-center justify-center p-3 group">
            <img 
              src={logoNegro} 
              alt="Logo El Cacique" 
              className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(209,96,20,0.4)] group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          <div>
            <h2 className="text-2xl font-black text-[#F8FFE5] tracking-tight">
              Portal Institucional
            </h2>
            <p className="text-xs text-[#659B5E] font-bold uppercase tracking-wider mt-1 flex items-center justify-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#D16014]" />
              <span>Sabor y Tradición a la Leña</span>
            </p>
          </div>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleAuthSubmit} autoComplete="off" className="space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="block font-bold text-[#F8FFE5]/80">Correo Institucional</label>
            <div className="relative group">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#F8FFE5]/40 group-focus-within:text-[#D16014] transition-colors" />
              <input 
                type="email" 
                name="user_email_secure"
                autoComplete="off"
                placeholder="ej: usuario@elcacique.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
                className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-4 py-3 text-[#F8FFE5] focus:outline-none focus:border-[#D16014] transition-colors" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#F8FFE5]/80">Contraseña</label>
            <div className="relative group">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#F8FFE5]/40 group-focus-within:text-[#D16014] transition-colors" />
              <input 
                type={showPassword ? 'text' : 'password'}
                name="user_password_secure"
                autoComplete="new-password"
                placeholder="••••••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
                className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-10 py-3 text-[#F8FFE5] focus:outline-none focus:border-[#D16014] transition-colors" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#0A090C] border border-[#F8FFE5]/10 rounded-xl space-y-1 shadow-inner">
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Accesos Rápidos:</span>
            <span className="text-[10px] text-[#659B5E] block font-mono">Admin: admin@elcacique.com</span>
            <span className="text-[10px] text-amber-400 block font-mono">Mesero: mesero.escazu@elcacique.com</span>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 rounded-xl bg-[#D16014] hover:bg-[#b8510f] font-extrabold text-white text-xs shadow-lg shadow-[#D16014]/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider cursor-pointer"
          >
            Iniciar Sesión en el Sistema
          </button>
        </form>
      </div>
    </div>
  );
}