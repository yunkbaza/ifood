'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getMonthlyRevenue,
  getOrdersByStatus,
  getAverageRatings,
  getWeeklyOrders,
} from '@/services/metrics';
import { GlobalLayout } from '@/components/Layout/GlobalLayout';
import { MetricCard } from '@/components/Dashboard/MetricCard';
import { GraficoPedidosPorStatus } from '@/components/Graficos/GraficoPedidosPorStatus';
import { GraficoFaturamentoMensal } from '@/components/Graficos/GraficoFaturamentoMensal';
import { GraficoPedidosSemanais } from '@/components/Graficos/GraficoPedidosSemanais';
import { GraficoAvaliacoesMedias } from '@/components/Graficos/GraficoAvaliacoesMedias';
import { Alert } from '@/components/Dashboard/Alert';

// --- Tipos de Dados ---
  interface MonthlyRevenueData {
    unidade: string;
    mes: string;
    faturamento_total: number;
  }

interface OrdersByStatusData {
  status: string;
  total: number;
}

interface WeeklyOrdersData {
  semana: string;
  total_pedidos: number;
}

interface AverageRatingsData {
  unidade: string;
  media_nota: number;
}

// --- Componente de Loading ---
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="w-16 h-16 border-4 border-ifood-red border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-lg text-ifood-gray-400">Carregando dados...</p>
  </div>
);

// --- Componente Principal da Página ---
export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  
  // --- Estados para os dados da API ---
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatusData[]>([]);
  const [averageRatings, setAverageRatings] = useState<AverageRatingsData[]>([]);
  const [weeklyOrders, setWeeklyOrders] = useState<WeeklyOrdersData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // --- Estados para os filtros de data ---
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- Busca os dados da API ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setDataLoading(true);
      const filters = { start_date: startDate, end_date: endDate };

      try {
        const [
          monthlyRevenueResponse,
          ordersByStatusResponse,
          averageRatingsResponse,
          weeklyOrdersResponse,
        ] = await Promise.all([
          getMonthlyRevenue(filters),
          getOrdersByStatus(filters),
          getAverageRatings(filters),
          getWeeklyOrders(filters),
        ]);

        setMonthlyRevenue(
          monthlyRevenueResponse.data.map((item: any) => ({
            ...item,
            // backend pode retornar total_faturamento; normaliza para faturamento_total
            faturamento_total: Number(item.faturamento_total ?? item.total_faturamento ?? 0),
          }))
        );
        setOrdersByStatus(ordersByStatusResponse.data);
        setAverageRatings(averageRatingsResponse.data);
        setWeeklyOrders(weeklyOrdersResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading, startDate, endDate]);

  // --- Cálculos de KPIs ---
  const totalRevenue = monthlyRevenue.reduce(
    (sum, item) => sum + item.faturamento_total,
    0
  );
  const deliveredOrders = ordersByStatus.find(item => item.status === 'Entregue')?.total || 0;
  const cancelledOrders = ordersByStatus.find(item => item.status === 'Cancelado')?.total || 0;
  const totalOrders = ordersByStatus.reduce((sum, item) => sum + item.total, 0);
  const cancelledRatio = totalOrders ? cancelledOrders / totalOrders : 0;

  // --- Formatação de dados para os gráficos ---
  const ordersByStatusChartData = ordersByStatus.map(item => ({ name: item.status, value: item.total }));
  const revenueByMonthChartData = monthlyRevenue.map(item => ({
    name: item.mes,
    revenue: item.faturamento_total,
  }));
  const weeklyOrdersChartData = weeklyOrders.map(item => ({ semana: item.semana, total_pedidos: item.total_pedidos }));
  const averageRatingsChartData = averageRatings.map(item => ({ unidade: item.unidade, media_nota: item.media_nota }));

  // --- Renderização ---
  return (
    <GlobalLayout>
      {authLoading || (dataLoading && !monthlyRevenue.length) ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Cabeçalho da Página e Filtros */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-ifood-black">Visão Geral</h2>
              <p className="text-ifood-gray-400 mt-1">Acompanhe o desempenho do seu negócio.</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-ifood-gray-200 rounded-md px-3 py-2 text-sm text-ifood-gray-400 focus:ring-2 focus:ring-ifood-red focus:outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border border-ifood-gray-200 rounded-md px-3 py-2 text-sm text-ifood-gray-400 focus:ring-2 focus:ring-ifood-red focus:outline-none"
              />
            </div>
          </div>

          {cancelledRatio > 0.3 && (
            <Alert message="Alto número de pedidos cancelados detectado." />
          )}

          {/* Grade de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              variant="primary"
              title="Faturamento Total"
              value={totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              icon="money"
            />
            <MetricCard title="Total de Pedidos" value={String(totalOrders)} icon="orders" />
            <MetricCard title="Pedidos Entregues" value={String(deliveredOrders)} icon="delivered" />
            <MetricCard title="Pedidos Cancelados" value={String(cancelledOrders)} icon="cancelled" />
          </div>

          {/* Grade de Gráficos e Tabela */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Gráficos */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-ifood-black mb-4">Pedidos por Status</h3>
              <GraficoPedidosPorStatus data={ordersByStatusChartData} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-ifood-black mb-4">Faturamento Mensal</h3>
              <GraficoFaturamentoMensal data={revenueByMonthChartData} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-ifood-black mb-4">Evolução Semanal de Pedidos</h3>
              <GraficoPedidosSemanais data={weeklyOrdersChartData} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-ifood-black mb-4">Avaliações Médias por Unidade</h3>
              <GraficoAvaliacoesMedias data={averageRatingsChartData} />
            </div>
          </div>
        </>
      )}
    </GlobalLayout>
  );
}
