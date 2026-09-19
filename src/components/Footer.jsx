import { Flame, MapPin, Phone, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050507] border-t border-[#F8FFE5]/10 text-[#F8FFE5]/70 text-xs py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#F8FFE5] font-extrabold text-base">
            <Flame className="w-5 h-5 text-[#D16014]" />
            <span>Chicharronera El Cacique</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Tradición culinaria costarricense en paila y leña con gestión digital en tiempo real.
          </p>
        </div>

        <div className="space-y-2">
          <span className="font-bold text-[#F8FFE5] block uppercase tracking-wider text-[11px]">Contactos &amp; Central</span>
          <div className="flex items-center gap-2 text-[11px]">
            <Phone className="w-3.5 h-3.5 text-[#D16014]" />
            <span>Central: +506 2200-8888</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-[#659B5E]" />
            <span>Lun - Dom: 11:30 AM - 11:00 PM</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-bold text-[#F8FFE5] block uppercase tracking-wider text-[11px]">Sedes Nacionales</span>
          <div className="flex items-center gap-2 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-[#659B5E]" />
            <span>Escazú • Santa Ana • Cartago • Heredia</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-[#F8FFE5]/5 text-center text-[10px] text-[#F8FFE5]/40">
        © 2026 Chicharronera El Cacique. Todos los derechos reservados.
      </div>
    </footer>
  );
}