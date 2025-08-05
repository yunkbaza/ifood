// frontend/src/components/Charts/OrdersByStatusChart.tsx

'use client';

import React from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

const COLORS = {
  'Entregue': '#22C55E', // verde
  'Cancelado': '#EF4444', // vermelho
  'Em andamento': '#F97316', // laranja
  'Saiu para entrega': '#3B82F6', // azul
};

const OrdersByStatusChart = ({ data }: { data: ChartData[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default OrdersByStatusChart;