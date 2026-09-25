import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import logoNegro from '../assets/img/LogoN.svg';

export default function Footer() {
  return (
    <footer className="bg-[#050507] border-t border-[#F8FFE5]/10 text-[#F8FFE5]/70 text-xs pt-12 pb-8 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        
        {/* COLUMNA 1: MARCA CON LOGO NEGRO Y RESEÑA */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img 
              src={logoNegro} 
              alt="Logo Chicharronera El Cacique" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#F8FFE5] block leading-none">El Cacique</span>
              <span className="text-[10px] text-[#659B5E] font-semibold tracking-wider uppercase">Chicharronera Gourmet</span>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-[#F8FFE5]/60">
            Sabor criollo auténtico a la leña y chicharrones de paila. Tradición gastronómica costarricense con gestión digital e innovación en tiempo real.
          </p>
          <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#659B5E]" />
            <span>Calidad Garantizada 100% Criolla</span>
          </div>
        </div>

        {/* COLUMNA 2: NAVEGACIÓN RÁPIDA */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#F8FFE5] uppercase tracking-wider text-xs border-b border-[#F8FFE5]/10 pb-2">Navegación Rápida</h4>
          <ul className="space-y-2 text-[11px] font-semibold">
            <li>
              <Link to="/" className="hover:text-[#D16014] transition-colors flex items-center gap-1.5">
                • Inicio &amp; Experiencia
              </Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-[#D16014] transition-colors text-[#659B5E] flex items-center gap-1.5">
                • Menú Digital &amp; Comanda
              </Link>
            </li>
            <li>
              <a href="/#nosotros" className="hover:text-[#D16014] transition-colors flex items-center gap-1.5">
                • Nuestra Historia
              </a>
            </li>
            <li>
              <a href="/#eventos" className="hover:text-[#D16014] transition-colors text-amber-500 flex items-center gap-1.5">
                • Reservas &amp; Eventos Especiales
              </a>
            </li>
          </ul>
        </div>

        {/* COLUMNA 3: CONTACTOS Y HORARIOS */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#F8FFE5] uppercase tracking-wider text-xs border-b border-[#F8FFE5]/10 pb-2">Central &amp; Horarios</h4>
          <div className="space-y-2.5 text-[11px]">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#D16014] shrink-0" />
              <span>Central Telefónica: +506 2200-8888</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#D16014] shrink-0" />
              <span>info@chicharroneraelcacique.com</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#659B5E] shrink-0" />
              <span>Lunes a Domingo: 11:30 AM - 11:00 PM</span>
            </div>
          </div>
        </div>

        {/* COLUMNA 4: SEDES Y REDES SOCIALES */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#F8FFE5] uppercase tracking-wider text-xs border-b border-[#F8FFE5]/10 pb-2">Sedes &amp; Contacto Directo</h4>
          <div className="flex items-start gap-2 text-[11px] mb-3">
            <MapPin className="w-4 h-4 text-[#659B5E] shrink-0 mt-0.5" />
            <span>Escazú • Santa Ana • Cartago • Heredia</span>
          </div>
          <span className="block text-[10px] text-[#F8FFE5]/50 font-bold uppercase tracking-wider">Atención de Pedidos</span>
          <div className="flex items-center gap-3 pt-1">
            <a href="https://wa.me/50622008888" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-[#00241B] text-[#F8FFE5] hover:text-[#D16014] border border-[#F8FFE5]/10 transition-colors flex items-center gap-2 font-bold text-[11px]" aria-label="WhatsApp API">
              <MessageSquare className="w-4 h-4 text-[#659B5E]" />
              <span>Consultas WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

      {/* CINTILLO LEGAL Y COPYRIGHT CON FIRMA BVA */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-[#F8FFE5]/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-[#F8FFE5]/40 font-medium">
        <p>© 2026 Chicharronera El Cacique. Todos los derechos reservados. Desarrollado por <strong className="text-[#F8FFE5]/80">BVA</strong>.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Políticas de Privacidad</a>
          <span>•</span>
          <a href="#" className="hover:underline">Términos del Servicio</a>
        </div>
      </div>
    </footer>
  );
}