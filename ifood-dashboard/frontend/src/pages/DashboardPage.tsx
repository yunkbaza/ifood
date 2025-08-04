// frontend/src/pages/DashboardPage.tsx

'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Bem-vindo ao Dashboard do iFood, {user?.name}!
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ANOTAÇÃO: Aqui você pode começar a adicionar os componentes de gráficos e KPIs */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Métricas de Vendas</h2>
          <p>Gráfico de faturamento mensal...</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pedidos por Status</h2>
          <p>Gráfico de pizza com status de pedidos...</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top 5 Produtos</h2>
          <p>Tabela ou gráfico de barras dos produtos mais vendidos...</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;