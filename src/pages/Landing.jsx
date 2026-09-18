import { useNavigate } from 'react-router-dom';
import { Utensils, LogIn, Star, Award, Shield, Wine, Package } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00241B] border border-[#659B5E]/40 text-[#659B5E] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#659B5E] animate-ping"></span>
              <span>Sincronización Gastronómica en Vivo v3.2</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8FFE5] leading-tight">
              Gastronomía de Alta <span className="text-[#D16014]">Precisión &amp; Sincronía</span>
            </h1>

            <p className="text-base text-[#F8FFE5]/80 max-w-xl leading-relaxed">
              Plataforma integral de orquestación culinaria. Diseñada para unir la acústica sensorial del comensal con el ritmo milimétrico de la línea de expedición en tiempo real.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button onClick={() => navigate('/menu')} className="px-7 py-3.5 rounded-xl bg-[#D16014] text-[#F8FFE5] font-semibold flex items-center gap-2.5 shadow-lg shadow-[#D16014]/30 hover:bg-[#b8510f] transition-all">
                <Utensils className="w-5 h-5 text-[#F8FFE5]" />
                <span>Explorar Menú Digital</span>
              </button>

              <button onClick={() => navigate('/login')} className="px-7 py-3.5 rounded-xl bg-[#00241B] hover:bg-[#00241B]/80 border border-[#659B5E]/40 text-[#F8FFE5] font-semibold flex items-center gap-2.5 transition-all">
                <LogIn className="w-5 h-5 text-[#659B5E]" />
                <span>Acceso al Sistema</span>
              </button>
            </div>

            {/* Métricas Hero */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#F8FFE5]/15 max-w-lg">
              <div>
                <div className="flex items-center gap-1 text-[#D16014] text-3xl font-bold">
                  <span>4.9</span>
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div className="text-xs text-[#F8FFE5]/60 mt-1">Calificación Crítica</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-[#F8FFE5]">+120k</div>
                <div className="text-xs text-[#F8FFE5]/60 mt-1">Comensales Anuales</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#659B5E]">3 ★</div>
                <div className="text-xs text-[#F8FFE5]/60 mt-1">Inspiración Michelin</div>
              </div>
            </div>
          </div>

          {/* Bento Showcase */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#00241B]/60 backdrop-blur-xl border border-[#F8FFE5]/12 p-4 shadow-2xl">
              <div className="relative h-72 rounded-xl overflow-hidden group">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://images.unsplash.com/photo-1558030006-450675393462" alt="Tomahawk steak"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A090C] via-transparent to-transparent"></div>
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0A090C]/90 text-[#D16014] text-xs font-bold border border-[#D16014]/40">Platillo Firma</span>
                
                <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-[#00241B]/90 backdrop-blur-md border border-[#F8FFE5]/15 flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-bold text-[#F8FFE5]">Tomahawk Dry-Aged 45D</h2>
                    <p className="text-[11px] text-[#F8FFE5]/70">Corte noble con sal volcánica y mantequilla</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#D16014]">$125.00</span>
                    <span className="block text-[10px] text-[#659B5E]">₡64,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}