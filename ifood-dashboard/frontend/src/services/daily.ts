import { api } from '@/api/api';

export const getDailyOverview = (params: { date: string }) =>
  api.get('/metrics/daily-overview', { params });

export const getDailyCumulativeRevenue = (params: { date: string }) =>
  api.get('/metrics/daily-cumulative-revenue', { params });

export const getDailyAcceptTimeByHour = (params: { date: string }) =>
  api.get('/metrics/daily-accept-time-by-hour', { params });

export const getDailyCancellationsByHour = (params: { date: string }) =>
  api.get('/metrics/daily-cancellations-by-hour', { params });

