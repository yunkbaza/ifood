import { api } from '@/api/api';

export const getTopProductsRevenue = (params: { start_date?: string; end_date?: string; limit?: number }) =>
  api.get('/metrics/top-products-revenue', { params });

export const getDailyRevenue = (params: { start_date: string; end_date: string }) =>
  api.get('/metrics/daily-revenue', { params });

export const getCancellationCost = (params: { start_date?: string; end_date?: string }) =>
  api.get('/metrics/cancellation-cost', { params });

export const getTopCancelledProducts = (params: { start_date?: string; end_date?: string; limit?: number }) =>
  api.get('/insights/top-cancelled-products', { params });

export const getOrdersHeatmap = (params: { start_date?: string; end_date?: string }) =>
  api.get('/insights/orders-heatmap', { params });

export const getNegativeFeedbacks = (params: { start_date?: string; end_date?: string; limit?: number }) =>
  api.get('/insights/negative-feedbacks', { params });
