'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getMonthlyRevenue,
  getOrdersByStatus,
  getTopSellingProducts,
  getAverageRatings,
  getWeeklyOrders,
  getOrders,
} from '@/api/api';
import { Order } from '@/assets/types';
import { GlobalLayout } from '@/components/Layout/GlobalLayout';
import { GraficoPedidosPorStatus } from '@/components/Graficos/GraficoPedidosPorStatus';
import { GraficoFaturamentoMensal } from '@/components/Graficos/GraficoFaturamentoMensal';
import { GraficoPedidosSemanais } from '@/components/Graficos/GraficoPedidosSemanais';
import { GraficoAvaliacoesMedias } from '@/components/Graficos/GraficoAvaliacoesMedias';

// Tipos para as respostas dos novos endpoints
interface MonthlyRevenueData {
  unidade: string;
  mes: string;
  faturamento_total: string;
}

interface OrdersByStatusData {
  status: string;
  total: number;
}

interface TopSellingProductsData {
  nome: string;
  total_vendido: number;
}

interface WeeklyOrdersData {
  semana: string;
  total_pedidos: number;
}

interface AverageRatingsData {
  unidade: string;
  media_nota: number;
}


export const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatusData[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<TopSellingProductsData[]>([]);
  const [averageRatings, setAverageRatings] = useState<AverageRatingsData[]>([]);
  const [weeklyOrders, setWeeklyOrders] = useState<WeeklyOrdersData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Estado para os filtros de data
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Efeito que busca os dados da API sempre que os filtros ou o estado de autenticação mudam
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setDataLoading(true);

      const filters = { start_date: startDate, end_date: endDate };

      try {
        const [
          ordersResponse,
          monthlyRevenueResponse,
          ordersByStatusResponse,
          topSellingResponse,
          averageRatingsResponse,
          weeklyOrdersResponse,
        ] = await Promise.all([
          getOrders(filters),
          getMonthlyRevenue(filters),
          getOrdersByStatus(filters),
          getTopSellingProducts(filters),
          getAverageRatings(filters),
          getWeeklyOrders(filters),
        ]);

        setOrders(ordersResponse.data);
        setMonthlyRevenue(monthlyRevenueResponse.data);
        setOrdersByStatus(ordersByStatusResponse.data);
        setTopSellingProducts(topSellingResponse.data);
        setAverageRatings(averageRatingsResponse.data);
        setWeeklyOrders(weeklyOrdersResponse.data);

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading, startDate, endDate]);


  if (authLoading || dataLoading) {
    return (
      <GlobalLayout>
        <div className="text-center text-lg text-gray-600 mt-10">Carregando dados...</div>
      </GlobalLayout>
    );
  }

  // Cálculo de KPIs a partir dos dados da API
  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + parseFloat(item.faturamento_total), 0);
  const deliveredOrders = ordersByStatus.find(item => item.status === 'Entregue')?.total || 0;
  const cancelledOrders = ordersByStatus.find(item => item.status === 'Cancelado')?.total || 0;
  const totalOrders = ordersByStatus.reduce((sum, item) => sum + item.total, 0);

  // Mapeamento dos dados para o formato esperado pelos gráficos
  const ordersByStatusChartData = ordersByStatus.map(item => ({
      name: item.status,
      value: item.total,
  }));

  const revenueByMonthChartData = monthlyRevenue.map(item => ({
      name: item.mes,
      revenue: parseFloat(item.faturamento_total),
  }));

  const weeklyOrdersChartData = weeklyOrders.map(item => ({
      semana: item.semana,
      total_pedidos: item.total_pedidos,
  }));

  const averageRatingsChartData = averageRatings.map(item => ({
      unidade: item.unidade,
      media_nota: item.media_nota,
  }));

  return (
    <GlobalLayout>
      {/* Seletor de datas */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex flex-col">
          <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Data de Início</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="endDate" className="text-sm font-medium text-gray-700">Data de Fim</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cards de KPIs */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-500">Faturamento Total</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">
            R$ {totalRevenue.toFixed(2)}
          </p>
        </div>

        {/* Card de Pedidos Totais */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-500">Total de Pedidos</h2>
          <p className="text-3xl font-bold text-gray-600 mt-2">
            {totalOrders}
          </p>
        </div>

        {/* Card de Pedidos Entregues */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-500">Pedidos Entregues</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {deliveredOrders}
          </p>
        </div>

        {/* Card de Pedidos Cancelados */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-500">Pedidos Cancelados</h2>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {cancelledOrders}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Gráfico de Pedidos por Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Pedidos por Status</h2>
          <GraficoPedidosPorStatus data={ordersByStatusChartData} />
        </div>

        {/* Gráfico de Faturamento Mensal */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Faturamento Mensal</h2>
          <GraficoFaturamentoMensal data={revenueByMonthChartData} />
        </div>

        {/* Gráfico de Linha de Pedidos por Semana */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Evolução de Pedidos por Semana</h2>
          <GraficoPedidosSemanais data={weeklyOrdersChartData} />
        </div>

        {/* Gráfico de Média de Avaliações por Unidade */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Média de Avaliações por Unidade</h2>
          <GraficoAvaliacoesMedias data={averageRatingsChartData} />
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Top 5 Produtos Mais Vendidos</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Vendido</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topSellingProducts.map((product, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{product.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.total_vendido}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlobalLayout>
  );
};
