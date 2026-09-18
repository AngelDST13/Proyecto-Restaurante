import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Flame, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050507] border-t border-[#F8FFE5]/10 pt-12 pb-8 px-6 text-[#F8FFE5]/70 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#F8FFE5]/10">
        
        {/* Columna 1: Marca */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D16014] flex items-center justify-center font-bold text-white">
              G
            </div>
            <span className="font-bold text-lg text-[#F8FFE5] uppercase">GourmetSync</span>
          </div>
          <p className="text-[#F8FFE5]/60 leading-relaxed">
            Plataforma de gestión culinaria y chicharronera artesanal a la leña. Sabor criollo tradicional con tecnología en tiempo real.
          </p>
        </div>

        {/* Columna 2: Sedes */}
        <div className="space-y-2">
          <h4 className="font-bold text-[#F8FFE5] uppercase tracking-wider text-xs flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#D16014]" /> Sedes Principales
          </h4>
          <ul className="space-y-1 text-[#F8FFE5]/60">
            <li>Escazú • Centro Gastronómico</li>
            <li>Santa Ana • Plaza Real</li>
            <li>Cartago • Paso Ancho</li>
            <li>Heredia • Vía Central</li>
          </ul>
        </div>

        {/* Columna 3: Horarios & Contacto */}
        <div className="space-y-2">
          <h4 className="font-bold text-[#F8FFE5] uppercase tracking-wider text-xs flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#659B5E]" /> Horarios de Atención
          </h4>
          <p className="text-[#F8FFE5]/60">Lun - Sáb: 11:30 AM - 11:00 PM</p>
          <p className="text-[#F8FFE5]/60">Dom Brunch: 10:30 AM - 10:00 PM</p>
          <p className="text-[#D16014] font-semibold pt-1 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" /> Central: +506 2200-8888
          </p>
        </div>

        {/* Columna 4: Seguridad */}
        <div className="space-y-2 bg-[#00241B]/40 p-4 rounded-xl border border-[#659B5E]/30">
          <div className="flex items-center gap-2 text-[#659B5E] font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span>Seguridad JWT & N8N</span>
          </div>
          <p className="text-[11px] text-[#F8FFE5]/70 leading-relaxed">
            Cierre automático por inactividad activo (5 min). Sistema enlazado con webhooks para despacho inmediato a cocina.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#F8FFE5]/50">
        <p>© 2026 GourmetSync Chicharronera. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-[#D16014]">Inicio</Link>
          <Link to="/menu" className="hover:text-[#D16014]">Menú</Link>
          <Link to="/login" className="hover:text-[#D16014]">Acceso / Registro</Link>
        </div>
      </div>
    </footer>
  );
}