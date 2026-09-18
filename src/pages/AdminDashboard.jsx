import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [adminTab, setAdminTab] = useState('overview');

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-[#F8FFE5]/15 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F8FFE5]">Centro de Operaciones GourmetSync</h2>
          <p className="text-xs text-[#F8FFE5]/70">Control de salón, insumos, nómina y conectividad JWT.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#659B5E]/20 text-[#659B5E] border border-[#659B5E]/40 text-xs font-bold">
          Sesión Activa: {user?.email}
        </span>
      </div>

      <div className="flex gap-2 border-b border-[#F8FFE5]/15 pb-2 text-xs">
        {['overview', 'inventory', 'payroll', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setAdminTab(tab)}
            className={`px-4 py-2 rounded-xl font-bold capitalize ${
              adminTab === tab ? 'bg-[#D16014] text-[#F8FFE5]' : 'bg-[#00241B] text-[#F8FFE5]/70'
            }`}
          >
            {tab === 'overview' ? 'Resumen General' : tab === 'inventory' ? 'Inventario' : tab === 'payroll' ? 'Nómina' : 'Usuarios'}
          </button>
        ))}
      </div>

      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/10">
              <span className="text-xs text-[#F8FFE5]/60">Ventas del Día</span>
              <div className="text-2xl font-bold text-[#F8FFE5]">$4,850.00</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/10">
              <span className="text-xs text-[#F8FFE5]/60">Mesas Activas</span>
              <div className="text-2xl font-bold text-[#659B5E]">18 / 24</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/10">
              <span className="text-xs text-[#F8FFE5]/60">Pedidos en Cocina</span>
              <div className="text-2xl font-bold text-[#D16014]">7 en Pase</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#00241B]/80 border border-[#F8FFE5]/10">
              <span className="text-xs text-[#F8FFE5]/60">Ticket Promedio</span>
              <div className="text-2xl font-bold text-[#F8FFE5]">$89.40</div>
            </div>
          </div>
        </div>
      )}

      {adminTab === 'inventory' && (
        <div className="p-5 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#F8FFE5]/15 text-[#F8FFE5]/60">
                <th className="py-2">Insumo</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FFE5]/10">
              <tr>
                <td className="py-3 font-bold">Lomo Wagyu A5 Miyazaki</td>
                <td>Cárnicos</td>
                <td className="text-[#D16014]">3.2 kg</td>
                <td><span className="px-2 py-0.5 rounded bg-[#D16014]/20 text-[#D16014]">Bajo Mínimo</span></td>
              </tr>
              <tr>
                <td className="py-3 font-bold">Vieiras de Hokkaido</td>
                <td>Mariscos</td>
                <td className="text-[#659B5E]">14.5 kg</td>
                <td><span className="px-2 py-0.5 rounded bg-[#659B5E]/20 text-[#659B5E]">Óptimo</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {adminTab === 'payroll' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-2">
            <div className="font-bold text-[#F8FFE5]">Chef Alejandro Gallardo</div>
            <div className="text-[#D16014]">Chef Ejecutivo · $4,120.00</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-2">
            <div className="font-bold text-[#F8FFE5]">Valeria Rossi</div>
            <div className="text-[#659B5E]">Head Sommelier · $3,310.00</div>
          </div>
        </div>
      )}

      {adminTab === 'users' && (
        <div className="p-4 rounded-2xl bg-[#00241B]/60 border border-[#F8FFE5]/10 space-y-2 text-xs">
          <div className="flex justify-between p-2 bg-[#0A090C] rounded">
            <span>admin@gourmetsync.com</span>
            <span className="text-[#D16014] font-bold">Administrador</span>
          </div>
          <div className="flex justify-between p-2 bg-[#0A090C] rounded">
            <span>mesero@gourmetsync.com</span>
            <span className="text-[#659B5E] font-bold">Mesero</span>
          </div>
          <div className="flex justify-between p-2 bg-[#0A090C] rounded">
            <span>cliente@gourmetsync.com</span>
            <span>Cliente</span>
          </div>
        </div>
      )}
    </div>
  );
}