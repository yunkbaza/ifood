'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { GlobalLayout } from '@/components/Layout/GlobalLayout';
import { useAuth } from '@/context/AuthContext';
import { getDailyOverview, getDailyCumulativeRevenue, getDailyAcceptTimeByHour, getDailyCancellationsByHour } from '@/services/daily';
import { GraficoPedidosPorStatus } from '@/components/Graficos/GraficoPedidosPorStatus';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';

const todayISO = () => new Date().toISOString().slice(0,10);

export default function DiarioPage() {
  const { isAuthenticated } = useAuth();
  const [date, setDate] = useState<string>(todayISO());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [kpis, setKpis] = useState<{ total_pedidos: number; faturamento_dia: number; tempo_medio_aceite: number | null; tempo_medio_entrega: number | null; } | null>(null);
  const [porStatus, setPorStatus] = useState<{ status: string; total: number }[]>([]);
  const [clientes, setClientes] = useState<{ novos: number; recorrentes: number } | null>(null);
  const [cumulative, setCumulative] = useState<{ ts: string; valor_total: number }[]>([]);
  const [acceptByHour, setAcceptByHour] = useState<{ hora: number; tempo_medio: number }[]>([]);
  const [cancelByHour, setCancelByHour] = useState<{ hora: number; motivo: string; qtd: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      setError('');
      try {
        const [ov, cr, at, ch] = await Promise.all([
          getDailyOverview({ date }),
          getDailyCumulativeRevenue({ date }),
          getDailyAcceptTimeByHour({ date }),
          getDailyCancellationsByHour({ date }),
        ]);
        setKpis(ov.data);
        setPorStatus(ov.data?.por_status || []);
        setClientes(ov.data?.clientes || null);
        setCumulative(cr.data || []);
        setAcceptByHour(at.data || []);
        setCancelByHour(ch.data || []);
      } catch (e) {
        setError('Falha ao carregar dados do dia.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [date, isAuthenticated]);

  // Preparos de gráfico
  const donutStatus = porStatus.map(x => ({ name: x.status, value: x.total }));
  const cumulativeSeries = useMemo(() => {
    let sum = 0;
    return cumulative.map(r => ({ hora: new Date(r.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), acumulado: (sum += Number(r.valor_total || 0)) }));
  }, [cumulative]);

  // Cancelamentos stacked por hora
  const cancelHoras = Array.from(new Set(cancelByHour.map(x => x.hora))).sort((a,b)=>a-b);
  const cancelMotivos = Array.from(new Set(cancelByHour.map(x => x.motivo)));
  const cancelData = cancelHoras.map(h => {
    const row: any = { hora: String(h).padStart(2,'0')+':00' };
    cancelMotivos.forEach(m => {
      row[m] = cancelByHour.find(x => x.hora === h && x.motivo === m)?.qtd || 0;
    });
    return row;
  });

  return (
    <GlobalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Diário (Operacional)</h1>
            <p className="text-sm text-accent-gray">Métricas e evolução do dia selecionado.</p>
          </div>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 rounded p-3 text-sm">{error}</div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-accent-gray">Total de Pedidos</div>
            <div className="text-2xl font-bold">{kpis?.total_pedidos ?? 0}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-accent-gray">Faturamento do Dia</div>
            <div className="text-2xl font-bold">{(kpis?.faturamento_dia||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-accent-gray">Tempo Médio de Aceite</div>
            <div className="text-2xl font-bold">{kpis?.tempo_medio_aceite!=null ? `${kpis?.tempo_medio_aceite.toFixed(0)} min` : 'N/A'}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-accent-gray">Tempo Médio de Entrega</div>
            <div className="text-2xl font-bold">{kpis?.tempo_medio_entrega!=null ? `${kpis?.tempo_medio_entrega.toFixed(0)} min` : 'N/A'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Pedidos por Status</h3>
            <GraficoPedidosPorStatus data={donutStatus} />
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Clientes Novos x Recorrentes</h3>
            <div className="text-sm text-accent-gray">Novos: {clientes?.novos ?? 0} • Recorrentes: {clientes?.recorrentes ?? 0}</div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Faturamento Acumulado ao Longo do Dia</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={cumulativeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="acumulado" stroke="#4CC9F0" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Tempo Médio de Aceite por Hora</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={acceptByHour.map(a=>({hora:String(a.hora).padStart(2,'0')+':00', tempo:a.tempo_medio}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="tempo" stroke="#F72585" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Cancelamentos por Hora e Causa</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cancelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Legend />
                {cancelMotivos.map((m, i) => (
                  <Bar key={m} dataKey={m} stackId="a" fill={['#EA1D2C','#4CC9F0','#22C55E','#F59E0B','#8B5CF6'][i%5]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </GlobalLayout>
  );
}

