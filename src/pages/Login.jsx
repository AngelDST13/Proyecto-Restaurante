import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Lock, Mail, User, Phone, IdCard } from 'lucide-react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;

    const loggedUser = login(email);
    showToast('¡Sesión iniciada correctamente!', 'success');
    
    setTimeout(() => {
      if (loggedUser.rol === 'administrador') navigate('/admin');
      else if (loggedUser.rol === 'mesero') navigate('/waiter');
      else navigate('/menu');
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center bg-[#0A090C]">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="w-full max-w-md bg-[#00241B]/80 backdrop-blur-2xl border border-[#F8FFE5]/15 rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-[#F8FFE5]">
            {isRegistering ? 'Registro de Cliente' : 'Acceso al Sistema El Cacique'}
          </h2>
          <p className="text-xs text-[#F8FFE5]/70">
            {isRegistering ? 'Crea tu cuenta para realizar pedidos' : 'Ingresa tus credenciales autorizadas'}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#F8FFE5]/40" />
              <input id="auth-email" type="email" defaultValue="mesero.escazu@elcacique.com" required className="w-full bg-[#001812]/50 border border-[#F8FFE5]/15 rounded-xl pl-9 pr-4 py-2.5 text-[#F8FFE5]" />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#F8FFE5]/40" />
              <input id="auth-password" type="password" defaultValue="••••••••••••" required className="w-full bg-[#001812]/50 border border-[#F8FFE5]/15 rounded-xl pl-9 pr-4 py-2.5 text-[#F8FFE5]" />
            </div>
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-[#D16014] hover:bg-[#b8510f] font-bold text-white text-xs shadow-lg shadow-[#D16014]/30 transition-all">
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}