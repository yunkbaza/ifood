'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Interface para a tipagem dos dados do gráfico
interface ChartData {
  semana: string;
  total_pedidos: number;
}

export const GraficoPedidosSemanais = ({ data }: { data: ChartData[] }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="semana" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="total_pedidos" stroke="#EA1D2C" strokeWidth={2.5} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};
