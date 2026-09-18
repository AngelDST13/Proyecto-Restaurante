import React, { useState } from 'react';

export default function Menu() {
  const [activeTable, setActiveTable] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tableState = [
    { n: 1, status: 'free' }, { n: 2, status: 'occupied' }, { n: 3, status: 'free' },
    { n: 4, status: 'paid' }, { n: 5, status: 'occupied' }, { n: 6, status: 'free' },
    { n: 7, status: 'occupied' }, { n: 8, status: 'paid' }, { n: 9, status: 'free' },
    { n: 10, status: 'free' }, { n: 11, status: 'occupied' }, { n: 12, status: 'occupied' },
    { n: 13, status: 'free' }, { n: 14, status: 'paid' }, { n: 15, status: 'occupied' },
    { n: 16, status: 'free' }, { n: 17, status: 'free' }, { n: 18, status: 'occupied' }
  ];

  const dishes = [
    { id: 1, name: 'Tartar de Atún Rojo Bluefin', cat: 'entradas', price: 32.00, img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb' },
    { id: 2, name: 'Ribeye Black Angus Prime 400g', cat: 'cortes', price: 68.00, img: 'https://images.unsplash.com/photo-1558030006-450675393462' },
    { id: 3, name: 'Langosta Caribeña al Gratén', cat: 'mariscos', price: 84.00, img: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47' }
  ];

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/15">
        <h2 className="text-xl font-bold text-[#F8FFE5]">Menú Digital & Terminal de Comandas</h2>
        <p className="text-xs text-[#F8FFE5]/70">Mesa activa asignada: #{activeTable}</p>
      </div>

      <div className="p-5 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-3">
        <h3 className="font-bold text-xs text-[#F8FFE5]">Matriz de Salón en Vivo (18 Mesas)</h3>
        <div className="grid grid-cols-6 lg:grid-cols-9 gap-2">
          {tableState.map(t => (
            <button
              key={t.n}
              onClick={() => setActiveTable(t.n)}
              className={`p-2 rounded-xl text-center text-xs font-bold border ${
                t.n === activeTable ? 'border-[#D16014] bg-[#D16014]/30' : 'bg-[#00241B] border-[#F8FFE5]/10'
              }`}
            >
              Mesa {String(t.n).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dishes.map(dish => (
          <div key={dish.id} className="p-4 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-3">
            <img className="h-40 w-full object-cover rounded-xl" src={dish.img} alt={dish.name} />
            <h3 className="font-bold text-sm text-[#F8FFE5]">{dish.name}</h3>
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-[#D16014]">${dish.price.toFixed(2)}</span>
              <button className="px-3 py-1.5 rounded-lg bg-[#D16014] text-xs font-bold text-[#F8FFE5]">
                + Agregar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}