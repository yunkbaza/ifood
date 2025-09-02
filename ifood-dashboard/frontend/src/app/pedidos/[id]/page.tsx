'use client';

import React, { useEffect, useState } from 'react';
import { GlobalLayout } from '@/components/Layout/GlobalLayout';
import { getOrderById, exportOrder } from '@/services/orders';
import { Pedido } from '@/assets/types';

interface PageProps {
  params: { id: string };
}

const PedidoDetalhePage = ({ params }: PageProps) => {
  const { id } = params;
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const response = await getOrderById(id);
        setPedido(response.data);
      } catch (err) {
        setError('Falha ao carregar pedido.');
      } finally {
        setLoading(false);
      }
    };
    fetchPedido();
  }, [id]);

  const handleExport = async () => {
    try {
      const response = await exportOrder(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pedido_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Erro ao exportar pedido');
    }
  };

  return (
    <GlobalLayout>
      {loading ? (
        <p className="text-ifood-gray-400">Carregando...</p>
      ) : error ? (
        <p className="text-ifood-red">{error}</p>
      ) : pedido ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-ifood-black">Pedido {pedido.id}</h2>
          <p className="text-ifood-gray-400 mb-2">Status: {pedido.status}</p>
          <p className="text-ifood-gray-400 mb-2">
            Valor:{' '}
            {Number(pedido.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-ifood-gray-400 mb-4">
            Data: {new Date(pedido.data_pedido).toLocaleString('pt-BR')}
          </p>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-ifood-red text-white rounded-md hover:opacity-90"
          >
            Exportar CSV
          </button>
        </div>
      ) : null}
    </GlobalLayout>
  );
};

export default PedidoDetalhePage;
