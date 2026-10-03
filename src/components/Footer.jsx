import { Link } from 'react-router-dom';
import { Phone, Clock, Mail, MessageSquare, ShieldCheck, Store } from 'lucide-react';
import { caciqueAsset as caciqueIcon } from '../assets/img';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050507] border-t border-[#F8FFE5]/10 text-[#F8FFE5]/80 text-xs pt-12 pb-8 px-6 font-sans mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {/* COLUMNA 1: MARCA Y LOGO */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative shrink-0">
              <img
                src={caciqueIcon}
                alt="Logo El Cacique"
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(209,96,20,0.8)]"
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#F8FFE5] block leading-none">El Cacique</span>
              <span className="text-[10px] text-[#659B5E] font-bold tracking-wider uppercase">Chicharronera Gourmet</span>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-400">
            Sabor criollo auténtico a la leña y paila. Tradición gastronómica costarricense con gestión digital en tiempo real.
          </p>
          <div className="flex items-center gap-2 text-[#659B5E] text-[11px] font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Calidad Garantizada 100% Criolla</span>
          </div>
          <div className="flex flex-wrap gap-3 pt-1" aria-label="Redes sociales oficiales">
            <a aria-label="Facebook El Cacique" href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="group inline-flex h-10 w-10 items-center justify-center rounded-full text-[#1877F2] transition-colors hover:bg-white/5 hover:text-[#1877F2] focus-visible:outline-2 focus-visible:outline-amber-400">
              <svg className="h-6 w-6 transition-transform duration-200 group-hover:scale-110 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.02 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.973h-1.513c-1.49 0-1.956.93-1.956 1.885v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.093 24 18.093 24 12.073Z"/></svg>
            </a>
            <a aria-label="Instagram El Cacique" href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="group inline-flex h-10 w-10 items-center justify-center rounded-full text-[#E4405F] transition-colors hover:bg-white/5 hover:text-[#E4405F] focus-visible:outline-2 focus-visible:outline-amber-400">
              <svg className="h-6 w-6 transition-transform duration-200 group-hover:scale-110 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <a aria-label="WhatsApp El Cacique" href="https://wa.me/50622008888" target="_blank" rel="noreferrer" className="group inline-flex h-10 w-10 items-center justify-center rounded-full text-[#25D366] transition-colors hover:bg-white/5 hover:text-[#25D366] focus-visible:outline-2 focus-visible:outline-amber-400">
              <svg className="h-6 w-6 transition-transform duration-200 group-hover:scale-110 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.5 0 .15 5.34.14 11.92c0 2.1.55 4.15 1.6 5.96L.04 24l6.27-1.64a11.94 11.94 0 0 0 5.76 1.47h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.49-8.42ZM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.63-.24-.37a9.86 9.86 0 0 1-1.52-5.26c0-5.46 4.45-9.9 9.91-9.9 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.9 7c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.51-1.78-1.69-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>
            </a>
            <a aria-label="TikTok El Cacique" href="https://www.tiktok.com/" target="_blank" rel="noreferrer" className="group inline-flex h-10 w-10 items-center justify-center rounded-full text-[#FE2C55] transition-colors hover:bg-white/5 hover:text-[#FE2C55] focus-visible:outline-2 focus-visible:outline-amber-400">
              <svg className="h-6 w-6 transition-transform duration-200 group-hover:scale-110 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.33V2h-3.52v13.67a2.9 2.9 0 0 1-2.9 2.9 2.9 2.9 0 1 1 2.9-2.9c0-.16-.01-.32-.04-.48V11.6a6.42 6.42 0 1 0 3.56 5.76V10.4a8.3 8.3 0 0 0 4.85 1.56V8.44a4.82 4.82 0 0 1-1.08-.12Z"/></svg>
            </a>
          </div>
        </div>

        {/* COLUMNA 2: NAVEGACIÓN */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#F8FFE5] uppercase tracking-wider text-xs border-b border-[#F8FFE5]/10 pb-2">Navegación Rápida</h4>
          <ul className="space-y-2 text-[11px] font-semibold text-gray-300">
            <li><Link to="/" className="hover:text-[#D16014] transition-colors block">• Inicio &amp; Experiencia</Link></li>
            <li><Link to="/menu" className="hover:text-[#D16014] text-[#659B5E] transition-colors block">• Menú Digital &amp; Comanda</Link></li>
            <li><a href="/#nosotros" className="hover:text-[#D16014] transition-colors block">• Nuestra Historia</a></li>
            <li><a href="/#eventos" className="hover:text-[#D16014] text-amber-400 transition-colors block">• Reservas &amp; Eventos</a></li>
          </ul>
        </div>

        {/* COLUMNA 3: CONTACTO */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#F8FFE5] uppercase tracking-wider text-xs border-b border-[#F8FFE5]/10 pb-2">Central &amp; Horarios</h4>
          <div className="space-y-2.5 text-[11px] text-gray-300">
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#D16014] shrink-0" /> Central: +506 2200-8888</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#D16014] shrink-0" /> info@chicharroneraelcacique.com</p>
            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#659B5E] shrink-0" /> Lunes a Domingo: 11:30 AM - 11:00 PM</p>
          </div>
        </div>

        {/* COLUMNA 4: SERVICIO DE RETIRO */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#F8FFE5] uppercase tracking-wider text-xs border-b border-[#F8FFE5]/10 pb-2">Modalidad de Servicio</h4>
          <div className="p-3.5 rounded-2xl bg-[#001812] border border-[#659B5E]/30 space-y-1">
            <p className="flex items-center gap-1.5 text-[#659B5E] font-bold text-[11px]">
              <Store className="w-4 h-4 text-[#D16014] shrink-0" /> Recoger en Restaurante
            </p>
            <p className="text-[10px] text-gray-400">Sedes: Escazú, Santa Ana, Cartago y Heredia.</p>
          </div>
          <a
            href="https://wa.me/50622008888"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-[#00241B] border border-[#F8FFE5]/10 text-white hover:text-[#D16014] font-bold text-[11px] transition-colors w-full justify-center"
          >
            <MessageSquare className="w-4 h-4 text-[#659B5E]" /> Consultas WhatsApp
          </a>
        </div>
      </div>

      {/* CINTILLO INFERIOR */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-[#F8FFE5]/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-gray-500 font-medium">
        <p>© 2026 Chicharronera El Cacique. Todos los derechos reservados. Desarrollado por <strong className="text-gray-300">BVA</strong>.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Políticas de Privacidad</a>
          <span>•</span>
          <a href="#" className="hover:underline">Términos del Servicio</a>
        </div>
      </div>
    </footer>
  );
}

