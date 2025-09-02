'use client';

import { Download } from 'lucide-react';
import React from 'react';

interface ExportButtonProps {
  data: Record<string, any>[];
  filename?: string;
}

function exportToCsv(rows: Record<string, any>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, filename = 'relatorio.csv' }) => {
  return (
    <button
      type="button"
      onClick={() => exportToCsv(data, filename)}
      className="flex items-center px-4 py-2 bg-ifood-red text-white rounded-md hover:opacity-90"
    >
      <Download className="w-4 h-4 mr-2" />
      Exportar CSV
    </button>
  );
};

