'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { GlobalLayout } from '@/components/Layout/GlobalLayout';
import { getMonthlyRevenue, getOrdersByStatus, getAverageRatings } from '@/services/metrics';
import { getTopProductsRevenue, getDailyRevenue, getCancellationCost } from '@/services/insights';
import { GraficoFaturamentoMensal } from '@/components/Graficos/GraficoFaturamentoMensal';
import { GraficoPedidosPorStatus } from '@/components/Graficos/GraficoPedidosPorStatus';
import { useAuth } from '@/context/AuthContext';

type MR = { unidade: string; mes: string; faturamento_total: number };

const fmtMonth = (s: string) => {
  const d = new Date(s);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const toDate = (ym: string, end = false) => {
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  if (!end) return first.toISOString().slice(0, 10);
  const last = new Date(Date.UTC(y, m, 0));
  return last.toISOString().slice(0, 10);
};

export default function MensalPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [months, setMonths] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [mr, setMr] = useState<MR[]>([]);
  const [statusData, setStatusData] = useState<{ status: string; total: number }[]>([]);
  const [avgRatings, setAvgRatings] = useState<{ unidade: string; media_nota: number }[]>([]);
  const [topRevenue, setTopRevenue] = useState<{ produto: string; receita: number }[]>([]);
  const [daily, setDaily] = useState<{ dia: string; faturamento: number; ticket_medio: number }[]>([]);
  const [cancelCost, setCancelCost] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getMonthlyRevenue({});
        const data: MR[] = res.data.map((x: any) => ({
          unidade: x.unidade,
          mes: x.mes,
          faturamento_total: Number(x.faturamento_total ?? 0),
        }));
        setMr(data);
        const monthsUnique = Array.from(new Set(data.map((x) => fmtMonth(x.mes)))).sort();
        setMonths(monthsUnique);
        setSelected(monthsUnique[monthsUnique.length - 1] ?? '');
      } catch (e: any) {
        setError('Falha ao conectar ao backend. Verifique se o servidor está em http://localhost:8000 e se você está logado.');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && isAuthenticated) load();
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!selected || !isAuthenticated) return;
    const start = toDate(selected, false);
    const end = toDate(selected, true);
    setError('');
    setLoading(true);
    Promise.all([
      getOrdersByStatus({ start_date: start, end_date: end }),
      getAverageRatings({ start_date: start, end_date: end }),
      getTopProductsRevenue({ start_date: start, end_date: end, limit: 5 }),
      getDailyRevenue({ start_date: start, end_date: end }),
      getCancellationCost({ start_date: start, end_date: end }),
    ])
      .then(([st, ar, top, dr, cc]) => {
        setStatusData(st.data || []);
        setAvgRatings(ar.data || []);
        setTopRevenue(top.data || []);
        setDaily(dr.data || []);
        setCancelCost(Number(cc.data?.custo_cancelamento ?? 0));
      })
      .catch(() => setError('Falha ao carregar métricas.'))
      .finally(() => setLoading(false));
  }, [selected, isAuthenticated]);

  const monthRevenue = useMemo(() => {
    if (!selected) return 0;
    const start = toDate(selected, false);
    const end = toDate(selected, true);
    // soma de todas unidades no mês
    return mr
      .filter((x) => {
        const ym = fmtMonth(x.mes);
        return ym === selected;
      })
      .reduce((s, x) => s + (x.faturamento_total || 0), 0);
  }, [mr, selected]);

  const prevMonthRevenue = useMemo(() => {
    if (!selected || months.length < 2) return 0;
    const idx = months.indexOf(selected);
    const prev = months[Math.max(0, idx - 1)];
    return mr
      .filter((x) => fmtMonth(x.mes) === prev)
      .reduce((s, x) => s + (x.faturamento_total || 0), 0);
  }, [mr, months, selected]);

  const delta = useMemo(() => {
    const a = prevMonthRevenue || 0;
    const b = monthRevenue || 0;
    if (!a) return 'N/A';
    const pct = ((b - a) / a) * 100;
    return `${pct.toFixed(2)}% vs mês anterior`;
  }, [prevMonthRevenue, monthRevenue]);

  const overallRating = useMemo(() => {
    if (!avgRatings.length) return 0;
    const sum = avgRatings.reduce((s, x) => s + (Number(x.media_nota) || 0), 0);
    return sum / avgRatings.length;
  }, [avgRatings]);

  return (
    <GlobalLayout>
      <div className="space-y-6">
        {!isAuthenticated ? (
          <p className="text-sm text-accent-gray">Faça login para ver o dashboard mensal.</p>
        ) : null}
        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 rounded p-3 text-sm">
            {error}
          </div>
        )}
        {loading && (
          <p className="text-sm text-accent-gray">Carregando…</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Mensal (Estratégico)</h1>
            <p className="text-sm text-accent-gray">Selecione um mês para analisar.</p>
          </div>
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

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-accent-gray">Faturamento Mensal</div>
            <div className="text-2xl font-bold">{monthRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div className="text-xs text-accent-red mt-1">{delta}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-accent-gray">Ticket Médio (aprox.)</div>
            <div className="text-2xl font-bold">{(daily.length ? (daily.reduce((s,d)=>s+d.ticket_medio,0)/daily.length):0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-accent-gray">Custo de Cancelamento</div>
            <div className="text-2xl font-bold">{cancelCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-accent-gray">Nota Média Geral</div>
            <div className="text-2xl font-bold">{overallRating.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Pedidos por Status</h3>
            <GraficoPedidosPorStatus data={statusData.map((x)=>({name:x.status, value:x.total}))} />
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Faturamento por Dia (barra)</h3>
            <GraficoFaturamentoMensal data={daily.map(d=>({ name: d.dia, revenue: d.faturamento }))} />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Top 5 Produtos (Receita)</h3>
          <ul className="space-y-2">
            {topRevenue.map((t) => (
              <li key={t.produto} className="flex justify-between text-sm">
                <span>{t.produto}</span>
                <span className="text-accent-cyan">{Number(t.receita).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlobalLayout>
  );
}
