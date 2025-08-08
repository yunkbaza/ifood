'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DollarSign, ShoppingBag, XCircle, CheckCircle } from 'lucide-react';

import {
  getMonthlyRevenue,
  getOrdersByStatus,
  getTopSellingProducts,
  getAverageRatings,
  getWeeklyOrders,
} from '@/api/api';

import RevenueChart from '@/components/Graficos/GraficoFaturamentoMensal';
import OrdersStatusChart from '@/components/Graficos/GraficoPedidosPorStatus';
import WeeklyOrdersChart from '@/components/Graficos/GraficoPedidosSemanais';
import AverageRatingsChart from '@/components/Graficos/GraficoAvaliacoesMedias';
import GlobalLayout from '@/components/Layout/GlobalLayout';

// Interfaces para os dados que vêm da API (como strings)
interface MonthlyRevenueData { mes: string; faturamento_total: string; }
interface OrdersByStatusData { status: string; total: number; }
interface TopSellingProductsData { nome: string; total_vendido: string; }
interface WeeklyOrdersDataAPI { semana: string; total_pedidos: string; }
interface AverageRatingsDataAPI { unidade: string; media_nota: string; }

// Interfaces para os dados que os gráficos esperam (com números)
interface WeeklyOrdersChartData { semana: string; total_pedidos: number; }
interface AverageRatingsChartData { unidade: string; media_nota: number; }


// Componente para os cartões de KPI
const KpiCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: string | number, icon: React.ElementType, colorClass: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="text-white" size={24} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatusData[]>([]);
  const [topProducts, setTopProducts] = useState<TopSellingProductsData[]>([]);
  const [avgRatings, setAvgRatings] = useState<AverageRatingsChartData[]>([]); // Usa o tipo numérico
  const [weeklyOrders, setWeeklyOrders] = useState<WeeklyOrdersChartData[]>([]); // Usa o tipo numérico
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setDataLoading(true);
      try {
        const [revenueRes, statusRes, topProductsRes, ratingsRes, weeklyRes] = await Promise.all([
          getMonthlyRevenue(), getOrdersByStatus(), getTopSellingProducts(), getAverageRatings(), getWeeklyOrders(),
        ]);
        
        setMonthlyRevenue(revenueRes.data);
        setOrdersByStatus(statusRes.data);
        setTopProducts(topProductsRes.data);
        
        // --- CORREÇÃO PRINCIPAL AQUI ---
        // Converte os dados de string para número antes de salvar no estado
        const parsedRatings: AverageRatingsChartData[] = (ratingsRes.data as AverageRatingsDataAPI[]).map(item => ({
            ...item,
            media_nota: parseFloat(item.media_nota)
        }));
        setAvgRatings(parsedRatings);

        const parsedWeekly: WeeklyOrdersChartData[] = (weeklyRes.data as WeeklyOrdersDataAPI[]).map(item => ({
            ...item,
            total_pedidos: parseInt(item.total_pedidos, 10)
        }));
        setWeeklyOrders(parsedWeekly);

      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading) fetchData();
  }, [user, authLoading]);

  if (authLoading || dataLoading) {
    return (
      <GlobalLayout>
        <div className="flex items-center justify-center h-full"><p>Carregando dashboard...</p></div>
      </GlobalLayout>
    );
  }

  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + parseFloat(item.faturamento_total), 0);
  const deliveredOrders = ordersByStatus.find(item => item.status === 'Entregue')?.total || 0;
  const cancelledOrders = ordersByStatus.find(item => item.status === 'Cancelado')?.total || 0;
  const totalOrders = ordersByStatus.reduce((sum, item) => sum + item.total, 0);

  return (
    <GlobalLayout>
      <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard title="Faturamento Total" value={`R$ ${totalRevenue.toFixed(2)}`} icon={DollarSign} colorClass="bg-green-500" />
              <KpiCard title="Total de Pedidos" value={totalOrders} icon={ShoppingBag} colorClass="bg-blue-500" />
              <KpiCard title="Pedidos Entregues" value={deliveredOrders} icon={CheckCircle} colorClass="bg-teal-500" />
              <KpiCard title="Pedidos Cancelados" value={cancelledOrders} icon={XCircle} colorClass="bg-red-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Faturamento Mensal</h3>
                  <RevenueChart data={monthlyRevenue} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Pedidos por Status</h3>
                  <OrdersStatusChart data={ordersByStatus} />
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Evolução de Pedidos (Semanal)</h3>
                  <WeeklyOrdersChart data={weeklyOrders} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col">
                  <h3 className="font-bold text-lg mb-4">Satisfação do Cliente</h3>
                  <AverageRatingsChart data={avgRatings} />
              </div>
          </div>
      </div>
    </GlobalLayout>
  );
};

export default DashboardPage;