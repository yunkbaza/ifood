'use client';

import React from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from 'recharts';

interface ChartData {
  status: string;
  total: number;
}

const COLORS = {
  'Entregue': 'var(--chart-green)',
  'Cancelado': 'var(--ifood-red)',
  'Em andamento': 'var(--chart-orange)',
  'Saiu para entrega': 'var(--chart-blue)',
};

const OrdersStatusChart = ({ data }: { data: ChartData[] }) => {
  const chartData = data.map(item => ({
    name: item.status,
    value: item.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
            return (
              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14}>
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, "Pedidos"]} />
        <Legend iconSize={10} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default OrdersStatusChart;