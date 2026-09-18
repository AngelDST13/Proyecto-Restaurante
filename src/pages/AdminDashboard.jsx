import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [inventario, setInventario] = useState([]);

  useEffect(() => {
    api.getInventario().then(data => setInventario(data));
  }, []);

  const dataGrafico = [
    { hora: '12:00', ventas: 45000 },
    { hora: '14:00', ventas: 120000 },
    { hora: '18:00', ventas: 65000 },
    { hora: '20:00', ventas: 180000 },
    { hora: '22:00', ventas: 90000 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="border-b border-[#F8FFE5]/15 pb-4">
        <h1 className="text-2xl font-bold text-[#F8FFE5]">Centro de Operaciones GourmetSync</h1>
        <p className="text-xs text-[#F8FFE5]/70">Métricas clave y control del restaurante</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/10">
          <span className="text-xs text-[#F8FFE5]/60">Ventas del Día</span>
          <div className="text-2xl font-bold text-[#F8FFE5]">₡500,000</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/10">
          <span className="text-xs text-[#F8FFE5]/60">Mesas Activas</span>
          <div className="text-2xl font-bold text-[#659B5E]">8 / 12</div>
        </div>
      </div>

      {/* Gráficos Recharts (Requisito Obligatorio FWD) */}
      <div className="p-6 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/10 space-y-4">
        <h3 className="font-bold text-sm text-[#F8FFE5]">Evolución Horaria de Facturación (Recharts)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataGrafico}>
              <XAxis dataKey="hora" stroke="#F8FFE5" opacity={0.6} />
              <YAxis stroke="#F8FFE5" opacity={0.6} />
              <Tooltip contentStyle={{ backgroundColor: '#0A090C', borderColor: '#D16014' }} />
              <Bar dataKey="ventas" fill="#D16014" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}