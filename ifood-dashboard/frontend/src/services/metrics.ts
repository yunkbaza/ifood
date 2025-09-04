import { api } from '@/api/api';

export const getMonthlyRevenue = (params?: { start_date?: string; end_date?: string }) =>
  api.get('/metrics/monthly-revenue', { params });

export const getOrdersByStatus = (params?: { start_date?: string; end_date?: string }) =>
  api.get('/metrics/orders-by-status', { params });

export const getAverageRatings = (params?: { start_date?: string; end_date?: string }) =>
  api.get('/metrics/average-ratings', { params });

export const getWeeklyOrders = (params?: { start_date?: string; end_date?: string }) =>
  api.get('/metrics/weekly-orders', { params });
