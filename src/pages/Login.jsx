import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Lock, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';

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
    showToast('¡Autenticación cifrada exitosa!', 'success');
    
    setTimeout(() => {
      if (loggedUser.rol === 'administrador') navigate('/admin');
      else if (loggedUser.rol === 'mesero') navigate('/waiter');
      else navigate('/menu');
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center bg-[#0A090C]">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="w-full max-w-md bg-[#001812]/90 backdrop-blur-2xl border border-[#659B5E]/30 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#D16014] text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-[#D16014]/30">
            C
          </div>
          <h2 className="text-2xl font-extrabold text-[#F8FFE5]">
            Acceso al Sistema El Cacique
          </h2>
          <p className="text-xs text-[#659B5E] font-semibold flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#D16014]" />
            <span>Portal Seguro de Autenticación Cifrada</span>
          </p>
        </div>

        {/* FORMULARIO CON ANTI-AUTOLLENADO */}
        <form onSubmit={handleAuthSubmit} autoComplete="off" className="space-y-4 text-xs">
          
          <div>
            <label className="block mb-1.5 font-bold text-[#F8FFE5]/80">Correo Electrónico Institucional</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#F8FFE5]/40" />
              <input 
                type="email" 
                name="user_email_secure"
                autoComplete="off"
                placeholder="ej: usuario@elcacique.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
                className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]" 
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-[#F8FFE5]/80">Contraseña de Seguridad</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#F8FFE5]/40" />
              <input 
                type={showPassword ? 'text' : 'password'}
                name="user_password_secure"
                autoComplete="new-password"
                placeholder="••••••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
                className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-10 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#0A090C] border border-[#F8FFE5]/10 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-400 font-bold block">Credenciales de Prueba:</span>
            <span className="text-[10px] text-[#659B5E] block font-mono">Admin: admin@elcacique.com</span>
            <span className="text-[10px] text-amber-400 block font-mono">Mesero: mesero.escazu@elcacique.com</span>
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-[#D16014] hover:bg-[#b8510f] font-bold text-white text-xs shadow-lg shadow-[#D16014]/30 transition-all uppercase tracking-wider">
            Ingresar al Sistema Cifrado
          </button>
        </form>
      </div>
    </div>
  );
}