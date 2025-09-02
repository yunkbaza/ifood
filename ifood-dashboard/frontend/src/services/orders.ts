import { api } from '@/api/api';

export const getOrders = () => api.get('/pedidos');

export const getOrderById = (id: string | number) => api.get(`/pedidos/${id}`);

export const exportOrder = (id: string | number) =>
  api.get(`/pedidos/${id}/export`, { responseType: 'blob' });
