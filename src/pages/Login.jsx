import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, IdCard } from 'lucide-react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;

    const loggedUser = login(email);
    alert(isRegistering ? '¡Registro completado con éxito!' : '¡Sesión iniciada correctamente!');
    
    if (loggedUser.rol === 'administrador') navigate('/admin');
    else navigate('/menu');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center bg-[#0A090C]">
      <div className="w-full max-w-md bg-[#00241B]/80 backdrop-blur-2xl border border-[#F8FFE5]/15 rounded-2xl p-8 space-y-6 shadow-2xl">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-[#F8FFE5]">
            {isRegistering ? 'Registro de Cliente' : 'Acceso al Sistema'}
          </h2>
          <p className="text-xs text-[#F8FFE5]/70">
            {isRegistering ? 'Crea tu cuenta para realizar pedidos en línea' : 'Ingrese sus credenciales registradas'}
          </p>
        </div>

        <div className="flex bg-[#0A090C] p-1 rounded-xl border border-[#F8FFE5]/10 text-xs font-bold">
          <button
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2 rounded-lg transition-all ${!isRegistering ? 'bg-[#D16014] text-white' : 'text-[#F8FFE5]/60'}`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-2 rounded-lg transition-all ${isRegistering ? 'bg-[#D16014] text-white' : 'text-[#F8FFE5]/60'}`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
          {isRegistering && (
            <>
              <div>
                <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Nombre Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-[#F8FFE5]/40" />
                  <input type="text" required placeholder="Juan Pérez" className="w-full bg-[#001812]/50 border border-[#F8FFE5]/15 rounded-xl pl-9 pr-4 py-2.5 text-[#F8FFE5]" />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Número de Cédula / ID</label>
                <div className="relative">
                  <IdCard className="w-4 h-4 absolute left-3 top-3 text-[#F8FFE5]/40" />
                  <input type="text" required placeholder="1-0234-0567" className="w-full bg-[#001812]/50 border border-[#F8FFE5]/15 rounded-xl pl-9 pr-4 py-2.5 text-[#F8FFE5]" />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Teléfono Móvil</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-[#F8FFE5]/40" />
                  <input type="tel" required placeholder="8888-8888" className="w-full bg-[#001812]/50 border border-[#F8FFE5]/15 rounded-xl pl-9 pr-4 py-2.5 text-[#F8FFE5]" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block mb-1 font-semibold text-[#F8FFE5]/80">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#F8FFE5]/40" />
              <input id="auth-email" type="email" defaultValue="admin@gourmetsync.com" required className="w-full bg-[#001812]/50 border border-[#F8FFE5]/15 rounded-xl pl-9 pr-4 py-2.5 text-[#F8FFE5]" />
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
            {isRegistering ? 'Completar Registro' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}