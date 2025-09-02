'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GlobalLayout } from '@/components/Layout/GlobalLayout';
import { getOrders } from '@/services/orders';
import { Pedido } from '@/assets/types';

const PedidosPage = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await getOrders();
        setPedidos(response.data);
      } catch (err) {
        setError('Falha ao carregar pedidos.');
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  return (
    <GlobalLayout>
      {loading ? (
        <p className="text-ifood-gray-400">Carregando...</p>
      ) : error ? (
        <p className="text-ifood-red">{error}</p>
      ) : (
        <table className="min-w-full divide-y divide-ifood-gray-200 bg-white shadow-md rounded-lg">
          <thead className="bg-ifood-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-ifood-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-ifood-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-ifood-gray-400 uppercase tracking-wider">Valor</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-ifood-gray-200">
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-ifood-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-ifood-black">
                  <Link href={`/pedidos/${pedido.id}`}>{pedido.id}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-ifood-gray-400">{pedido.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-ifood-gray-400">
                  {Number(pedido.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </GlobalLayout>
  );
};

export default PedidosPage;
