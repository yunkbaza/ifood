import axios from 'axios';
import { User, Order, Restaurant } from '../assets/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

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

interface DateFilter {
  start_date?: string;
  end_date?: string;
}

export const loginApi = (email: string, password: string) => {
  return api.post<{ user: User, token: string }>('/auth/login', { email, password });
};

// --- NOVO CÓDIGO ADICIONADO ---
// Função para buscar os dados do usuário logado a partir do token
export const getMe = () => {
  return api.get<User>('/auth/me');
};

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