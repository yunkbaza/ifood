'use client';

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

// CORREÇÃO: A interface agora espera um número
interface ChartData {
  unidade: string;
  media_nota: number;
}

const AverageRatingsChart = ({ data }: { data: ChartData[] }) => {
  const averageRating = data.length > 0 ? data[0].media_nota : 0;
  
  const chartData = [
    {
      name: 'Avaliação',
      value: averageRating, // Não precisa mais de parseFloat aqui
      fill: 'var(--chart-orange)',
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadialBarChart
        innerRadius="70%"
        outerRadius="85%"
        barSize={20}
        data={chartData}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 5]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          background
          dataKey="value"
          cornerRadius={10}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-3xl font-bold"
          fill="var(--text-primary)"
        >
          {averageRating.toFixed(1)}
        </text>
         <text
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm"
          fill="var(--text-secondary)"
        >
          de 5 estrelas
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

export default AverageRatingsChart;