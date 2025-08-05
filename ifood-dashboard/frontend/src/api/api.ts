// frontend/src/api/api.ts

import axios from 'axios';
import { User, Order, Restaurant } from '../assets/types';

// ANOTAÇÃO: Cria uma instância do Axios com a URL base do seu backend.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
});

// ANOTAÇÃO: Adiciona o token de autenticação a cada requisição
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ANOTAÇÃO: Funções para interagir com os endpoints do seu backend.
export const loginApi = (email: string, password: string) => {
  return api.post<{ user: User, token: string }>('/auth/login', { email, password });
};

// ANOTAÇÃO: Funções de métricas agora aceitam um objeto de filtro
interface DateFilter {
  start_date?: string;
  end_date?: string;
}

export const getOrders = (filters: DateFilter = {}) => {
  return api.get<Order[]>('/orders', { params: filters });
};

export const getRestaurants = () => {
  return api.get<Restaurant[]>('/restaurants');
};

export const getMonthlyRevenue = (filters: DateFilter = {}) => {
  return api.get('/metrics/monthly-revenue', { params: filters });
};

export const getTopSellingProducts = (filters: DateFilter = {}) => {
  return api.get('/metrics/top-selling-products', { params: filters });
};

export const getAverageRatings = (filters: DateFilter = {}) => {
  return api.get('/metrics/average-ratings', { params: filters });
};

export const getOrdersByStatus = (filters: DateFilter = {}) => {
  return api.get('/metrics/orders-by-status', { params: filters });
};

export const getWeeklyOrders = (filters: DateFilter = {}) => {
  return api.get('/metrics/weekly-orders', { params: filters });
};