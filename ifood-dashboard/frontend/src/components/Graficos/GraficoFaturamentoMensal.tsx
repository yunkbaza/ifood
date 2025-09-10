'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Interface para a tipagem dos dados do gráfico
interface ChartData {
  name: string;
  revenue: number;
}

export const GraficoFaturamentoMensal = ({ data }: { data: ChartData[] }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="revenue" fill="#EA1D2C" barSize={32} radius={[6,6,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
