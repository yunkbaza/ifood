// frontend/src/api/api.ts

import axios from 'axios';
import { User, Order, Restaurant } from '../assets/types';

// ANOTAÇÃO: Cria uma instância do Axios com a URL base do seu backend.
// Acessa a variável de ambiente com o prefixo NEXT_PUBLIC_
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

export const getOrders = () => {
  return api.get<Order[]>('/orders');
};

export const getRestaurants = () => {
  return api.get<Restaurant[]>('/restaurants');
};