import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@gourmetsync.com');
  const [password, setPassword] = useState('••••••••••••');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = login(email, password);
    if (user.rol === 'administrador') {
      navigate('/admin');
    } else {
      navigate('/menu');
    }
  };

  return (
    <div className="py-12 flex-1 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="rounded-2xl bg-[#00241B]/60 backdrop-blur-2xl border border-[#F8FFE5]/15 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#0A090C] border border-[#D16014]/50 text-[#D16014] mx-auto mb-3 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-[#F8FFE5]">Acceso Unificado</h2>
            <p className="text-xs text-[#F8FFE5]/70 mt-1">Autenticación por roles a través de db.json</p>
          </div>

          <div className="mb-5 p-3 rounded-xl bg-[#0A090C]/80 border border-[#659B5E]/30 space-y-1.5 text-xs">
            <span className="block text-[11px] font-bold text-[#659B5E]">Credenciales de prueba:</span>
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
              <button onClick={() => setEmail('admin@gourmetsync.com')} className="px-2 py-1 rounded bg-[#00241B] hover:bg-[#D16014] text-[#F8FFE5] border border-[#F8FFE5]/10">Admin</button>
              <button onClick={() => setEmail('mesero@gourmetsync.com')} className="px-2 py-1 rounded bg-[#00241B] hover:bg-[#D16014] text-[#F8FFE5] border border-[#F8FFE5]/10">Mesero</button>
              <button onClick={() => setEmail('cliente@gourmetsync.com')} className="px-2 py-1 rounded bg-[#00241B] hover:bg-[#D16014] text-[#F8FFE5] border border-[#F8FFE5]/10">Cliente</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#F8FFE5]/80 mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#F8FFE5]/50" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#001812]/40 border border-[#F8FFE5]/12 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FFE5]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F8FFE5]/80 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#F8FFE5]/50" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-[#001812]/40 border border-[#F8FFE5]/12 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FFE5]" />
              </div>
            </div>

            <button type="submit" className="w-full mt-2 py-3 rounded-xl bg-[#D16014] text-[#F8FFE5] font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#D16014]/30 hover:bg-[#b8510f]">
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}