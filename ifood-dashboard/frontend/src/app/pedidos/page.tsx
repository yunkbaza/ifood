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
        <p className="text-accent-gray">Carregando...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-slate-700/40">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/pedidos/${pedido.id}`}>{pedido.id}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{pedido.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {Number(pedido.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlobalLayout>
  );
};

export default PedidosPage;
