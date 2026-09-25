import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Mail, MessageSquare, ShieldCheck, Store } from 'lucide-react';
import caciqueIcon from '../assets/img/Cacique.svg';

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
        <p>© 2026 Chicharronera El Cacique. Todos los derechos reservados. Desarrollado por <strong className="text-gray-300">BVA</strong> (Bryan, Victor &amp; Angel).</p>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Políticas de Privacidad</a>
          <span>•</span>
          <a href="#" className="hover:underline">Términos del Servicio</a>
        </div>
      </div>
    </footer>
  );
}