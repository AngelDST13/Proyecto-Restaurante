import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { aiService } from '../services/aiService';

export default function Menu({ onAddToCart }) {
  const [menu, setMenu] = useState([]);
  const [activeTable, setActiveTable] = useState(12);
  const [aiRecomendacion, setAiRecomendacion] = useState(null);

  useEffect(() => {
    api.getMenu().then(data => setMenu(data));
  }, []);

  const solicitarIA = async () => {
    const res = await aiService.getRecommendation('Corte noble', 70000, menu);
    setAiRecomendacion(res);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Subheader */}
      <div className="flex justify-between items-center p-6 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/15">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FFE5]">Menú Digital & Terminal de Comandas</h1>
          <p className="text-xs text-[#F8FFE5]/70">Mesa activa seleccionada: #{activeTable}</p>
        </div>
        <button onClick={solicitarIA} className="px-4 py-2 rounded-xl bg-[#659B5E] text-[#F8FFE5] text-xs font-bold">
          ✨ Sugerencia Asistente IA
        </button>
      </div>

      {aiRecomendacion && (
        <div className="p-4 rounded-xl bg-[#D16014]/20 border border-[#D16014] text-xs">
          <p className="font-bold text-[#F8FFE5]">{aiRecomendacion.sugerencia}</p>
          <p className="text-[#659B5E] mt-1">Maridaje recomendado: {aiRecomendacion.maridaje}</p>
        </div>
      )}

      {/* Grid de Platillos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menu.map((dish) => (
          <div key={dish.id} className="rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 overflow-hidden p-4 space-y-3">
            <img src={dish.imagen} alt={dish.nombre} className="h-40 w-full object-cover rounded-xl" />
            <h3 className="font-bold text-sm text-[#F8FFE5]">{dish.nombre}</h3>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-[#D16014]">₡{dish.precio.toLocaleString()}</span>
              <button 
                onClick={() => onAddToCart({ id: dish.id, nombre: dish.nombre, precio: dish.precio })}
                className="px-3 py-1.5 rounded-lg bg-[#D16014] text-xs font-bold text-[#F8FFE5]"
              >
                + Agregar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}