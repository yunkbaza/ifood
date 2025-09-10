
'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// Interface para a tipagem dos dados do gráfico
interface ChartData {
  unidade: string;
  media_nota: number;
}

export const GraficoAvaliacoesMedias = ({ data }: { data: ChartData[] }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="unidade" />
        <YAxis domain={[0, 5]} />
        <Tooltip />
        <Bar dataKey="media_nota" fill="#22C55E" barSize={28} radius={[6,6,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
