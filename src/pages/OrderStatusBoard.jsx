import { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Clock, Volume2, Sparkles } from 'lucide-react';
import caciqueIcon from '../assets/img/Cacique.svg';

export default function OrderStatusBoard() {
  const [orders, setOrders] = useState([
    { id: 'CMD-101', cliente: 'Mesa 02', estado: 'preparando', sede: 'escazu' },
    { id: 'CMD-102', cliente: 'Orden #45 (Para Llevar)', estado: 'preparando', sede: 'escazu' },
    { id: 'CMD-103', cliente: 'Mesa 08', estado: 'preparando', sede: 'escazu' },
    { id: 'CMD-104', cliente: 'Mesa 04', estado: 'listo', sede: 'escazu' },
    { id: 'CMD-105', cliente: 'Orden #48 (Para Llevar)', estado: 'listo', sede: 'escazu' },
    { id: 'CMD-106', cliente: 'Mesa 12', estado: 'listo', sede: 'escazu' }
  ]);

  // Escuchar eventos globales cuando cocina marca listo un pedido
  useEffect(() => {
    const handleOrderReady = (e) => {
      const newNotification = e.detail;
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === newNotification.orderId ? { ...ord, estado: 'listo' } : ord
        )
      );
    };

    window.addEventListener('cacique:order-ready', handleOrderReady);
    return () => window.removeEventListener('cacique:order-ready', handleOrderReady);
  }, []);

  const preparando = orders.filter((o) => o.estado === 'preparando');
  const listas = orders.filter((o) => o.estado === 'listo');

  return (
    <div className="min-h-screen bg-[#050507] text-[#F8FFE5] font-sans flex flex-col justify-between">
      <main className="flex-1 pt-24 px-6 pb-12 max-w-7xl mx-auto w-full space-y-8">
        
        {/* ENCABEZADO DEL MONITOR */}
        <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <img src={caciqueIcon} alt="Cacique" className="w-12 h-12 filter drop-shadow-[0_0_15px_rgba(209,96,20,0.8)]" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                ESTADO DE PEDIDOS <Sparkles className="w-5 h-5 text-[#D16014]" />
              </h1>
              <p className="text-xs text-[#659B5E] font-bold uppercase tracking-widest">
                Monitor en vivo para Salón &amp; Para Llevar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#0A090C] border border-amber-400/30 text-amber-400 text-xs font-mono font-bold">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>Avisos de Paila Activos</span>
          </div>
        </div>

        {/* CONTENEDOR ESTILO MC DONALD'S (2 COLUMNAS GIGANTES) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* COLUMNA 1: EN PREPARACIÓN */}
          <div className="bg-[#001812]/80 border-2 border-[#D16014]/40 rounded-3xl p-6 space-y-6 shadow-2xl min-h-[500px]">
            <div className="flex justify-between items-center border-b border-[#D16014]/30 pb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-7 h-7 text-[#D16014] animate-spin" style={{ animationDuration: '6s' }} />
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">En Preparación</h2>
              </div>
              <span className="px-3.5 py-1 rounded-full bg-[#D16014]/20 border border-[#D16014]/50 text-[#D16014] font-mono font-bold text-sm">
                {preparando.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {preparando.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-[#0A090C] border border-[#D16014]/30 space-y-1 text-center shadow-lg"
                >
                  <span className="font-mono text-2xl font-black text-[#D16014] block">{ord.id}</span>
                  <span className="text-xs font-bold text-gray-300 block">{ord.cliente}</span>
                  <span className="text-[10px] text-amber-400 font-mono flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3" /> En Paila y Fuego
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA 2: ¡LISTAS PARA ENTREGAR! */}
          <div className="bg-[#001812]/80 border-2 border-[#659B5E] rounded-3xl p-6 space-y-6 shadow-2xl min-h-[500px] relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-[#659B5E]/40 pb-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-[#659B5E] animate-bounce" />
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">¡Listos Servir!</h2>
              </div>
              <span className="px-3.5 py-1 rounded-full bg-[#659B5E]/20 border border-[#659B5E]/50 text-[#659B5E] font-mono font-bold text-sm">
                {listas.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listas.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-[#00241B] border-2 border-[#659B5E] space-y-1 text-center shadow-2xl animate-pulse"
                >
                  <span className="font-mono text-3xl font-black text-[#659B5E] block">{ord.id}</span>
                  <span className="text-sm font-black text-white block">{ord.cliente}</span>
                  <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider block">
                    ¡RETIRAR EN BARRA!
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
