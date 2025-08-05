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

interface ChartData {
  unidade: string;
  media_nota: number;
}

const AverageRatingsChart = ({ data }: { data: ChartData[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="unidade" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="media_nota" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AverageRatingsChart;