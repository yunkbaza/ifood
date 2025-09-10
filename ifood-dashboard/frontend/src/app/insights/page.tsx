'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GlobalLayout } from '@/components/Layout/GlobalLayout';
import { useAuth } from '@/context/AuthContext';
import {
  getCancellationCost,
  getNegativeFeedbacks,
  getOrdersHeatmap,
  getTopCancelledProducts,
  getTopProductsRevenue,
} from '@/services/insights';

const monthToDates = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
};

const lastNMonths = (n: number) => {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    out.push(`${y}-${m}`);
  }
  return out.reverse();
};

const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function InsightsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const search = useSearchParams();
  const initialMonth = search?.get('mes') || '';

  const [months, setMonths] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');

  const [cancelCost, setCancelCost] = useState<number>(0);
  const [topRevenue, setTopRevenue] = useState<{ produto: string; receita: number }[]>([]);
  const [topCancelled, setTopCancelled] = useState<{ produto: string; qtd_cancelada: number; perda_total: number }[]>([]);
  const [heatmap, setHeatmap] = useState<{ dow: number; hora: number; qtd: number }[]>([]);
  const [negatives, setNegatives] = useState<Array<{ id: number; nota: number; tipo_feedback: string; comentario: string; id_pedido: number; data_pedido: string; motivo_cancelamento: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Gera últimos 12 meses
    const ms = lastNMonths(12);
    setMonths(ms);
    setSelected(initialMonth && ms.includes(initialMonth) ? initialMonth : ms[ms.length - 1]);
  }, [initialMonth]);

  useEffect(() => {
    if (!selected || !isAuthenticated) return;
    const { start, end } = monthToDates(selected);
    setLoading(true);
    setError('');
    Promise.all([
      getCancellationCost({ start_date: start, end_date: end }),
      getTopProductsRevenue({ start_date: start, end_date: end, limit: 5 }),
      getTopCancelledProducts({ start_date: start, end_date: end, limit: 5 }),
      getOrdersHeatmap({ start_date: start, end_date: end }),
      getNegativeFeedbacks({ start_date: start, end_date: end, limit: 50 }),
    ])
      .then(([cc, tr, tc, hm, nf]) => {
        setCancelCost(Number(cc.data?.custo_cancelamento ?? 0));
        setTopRevenue(tr.data || []);
        setTopCancelled(tc.data || []);
        setHeatmap(hm.data || []);
        setNegatives(nf.data || []);
      })
      .catch(() => setError('Falha ao carregar insights. Verifique o backend e autenticação.'))
      .finally(() => setLoading(false));
  }, [selected, isAuthenticated]);

  const heatMax = useMemo(() => heatmap.reduce((m, r) => Math.max(m, Number(r.qtd) || 0), 0), [heatmap]);
  const heatCells = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of heatmap) {
      map.set(`${r.dow}-${r.hora}`, Number(r.qtd) || 0);
    }
    return map;
  }, [heatmap]);

  return (
    <GlobalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Insights de Marketing</h1>
            <p className="text-sm text-accent-gray">Produtos problemáticos, picos de demanda e feedbacks para ação.</p>
          </div>
          <div>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
            >
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 rounded p-3 text-sm">{error}</div>
        )}
        {loading && <p className="text-sm text-accent-gray">Carregando…</p>}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-accent-gray">Custo de Cancelamento</div>
            <div className="text-2xl font-bold">{Number(cancelCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-accent-gray">Produto mais cancelado</div>
            <div className="text-2xl font-bold">{topCancelled[0]?.produto || '—'}</div>
            {topCancelled[0] && (
              <div className="text-xs text-accent-gray">{topCancelled[0].qtd_cancelada} cancelamentos</div>
            )}
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-accent-gray">Top por Receita</div>
            <div className="text-2xl font-bold">{topRevenue[0]?.produto || '—'}</div>
            {topRevenue[0] && (
              <div className="text-xs text-accent-gray">{Number(topRevenue[0].receita).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Top 5 Produtos Cancelados</h3>
            <ul className="space-y-2">
              {topCancelled.map((t) => (
                <li key={t.produto} className="flex justify-between text-sm">
                  <span>{t.produto}</span>
                  <span className="text-accent-red">{t.qtd_cancelada} • {Number(t.perda_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </li>
              ))}
              {!topCancelled.length && <li className="text-sm text-accent-gray">Sem cancelamentos no período.</li>}
            </ul>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Top 5 Produtos por Receita</h3>
            <ul className="space-y-2">
              {topRevenue.map((t) => (
                <li key={t.produto} className="flex justify-between text-sm">
                  <span>{t.produto}</span>
                  <span className="text-accent-cyan">{Number(t.receita).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </li>
              ))}
              {!topRevenue.length && <li className="text-sm text-accent-gray">Sem vendas entregues no período.</li>}
            </ul>
          </div>
        </div>

        {/* Heatmap simples */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Picos de Demanda (Dia x Hora)</h3>
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[80px_repeat(24,_1fr)] gap-1">
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={`h${h}`} className="text-[10px] text-center text-accent-gray">{h}h</div>
                ))}
                {Array.from({ length: 7 }, (_, d) => (
                  <React.Fragment key={`row${d}`}>
                    <div className="text-xs text-accent-gray h-6 flex items-center">{days[d]}</div>
                    {Array.from({ length: 24 }, (_, h) => {
                      const v = heatCells.get(`${d}-${h}`) || 0;
                      const alpha = heatMax ? Math.max(0.1, v / heatMax) : 0;
                      const bg = `rgba(56,189,248,${alpha})`;
                      return <div key={`c${d}-${h}`} title={`${v} pedidos`} className="h-6 rounded" style={{ backgroundColor: v ? bg : 'rgba(148,163,184,0.15)' }} />;
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feedbacks negativos */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Feedbacks Negativos</h3>
          <ul className="space-y-3">
            {negatives.map((f) => (
              <li key={f.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-accent-red">Nota {f.nota} • {f.tipo_feedback}</span>
                  <span className="text-xs text-accent-gray">{new Date(f.data_pedido).toLocaleString('pt-BR')}</span>
                </div>
                {f.comentario && <p className="text-sm mt-1">{f.comentario}</p>}
                {f.motivo_cancelamento && <p className="text-xs text-accent-gray mt-1">Cancelamento: {f.motivo_cancelamento}</p>}
              </li>
            ))}
            {!negatives.length && <li className="text-sm text-accent-gray">Sem feedbacks negativos no período.</li>}
          </ul>
        </div>
      </div>
    </GlobalLayout>
  );
}

