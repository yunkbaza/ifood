'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';

interface ChartData {
  semana: string;
  total_pedidos: number;
}

const WeeklyOrdersChart = ({ data }: { data: ChartData[] }) => {
  const chartData = data.map(item => ({
    // Formata a data para "dd/MM"
    name: format(parseISO(item.semana), "dd/MM"),
    Pedidos: item.total_pedidos,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="Pedidos" stroke="var(--chart-blue)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeeklyOrdersChart;