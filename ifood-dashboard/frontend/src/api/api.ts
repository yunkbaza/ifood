// frontend/src/api/api.ts

import axios from 'axios';
import { User, Order, Restaurant } from '../assets/types';

// Cria uma instância do Axios para se conectar com o backend.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Adiciona o token de autenticação a cada requisição para proteger as rotas.
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

// Define a interface para os filtros de data.
interface DateFilter {
  start_date?: string;
  end_date?: string;
}

// Funções para interagir com os endpoints do backend.
export const loginApi = (email: string, password: string) => {
  return api.post<{ user: User, token: string }>('/auth/login', { email, password });
};

// Funções para buscar dados, agora com suporte a filtros de data.
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