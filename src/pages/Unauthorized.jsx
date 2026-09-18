import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-[#00241B]/80 backdrop-blur-2xl border border-[#D16014]/40 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#D16014]/20 border border-[#D16014] text-[#D16014] mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#F8FFE5]">403 — Acceso Restringido</h1>
          <p className="text-xs text-[#F8FFE5]/70">
            No posee los privilegios de seguridad necesarios para consultar este módulo. Su intento de acceso ha sido registrado.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-xl bg-[#D16014] hover:bg-[#b8510f] text-[#F8FFE5] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D16014]/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio Seguro</span>
        </button>
      </div>
    </div>
  );
}