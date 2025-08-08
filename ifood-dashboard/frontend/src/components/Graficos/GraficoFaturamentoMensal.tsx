'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChartData {
  mes: string;
  faturamento_total: string;
}

const RevenueChart = ({ data }: { data: ChartData[] }) => {
  const chartData = data.map(item => ({
    // Formata a data para "Mês Abreviado" (ex: Jan)
    name: format(parseISO(item.mes), "MMM", { locale: ptBR }),
    Faturamento: parseFloat(item.faturamento_total),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EA1D2C" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#EA1D2C" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
        <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Faturamento"]} />
        <Area type="monotone" dataKey="Faturamento" stroke="#EA1D2C" fillOpacity={1} fill="url(#colorRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;