import axios from 'axios';

// 1. Cria uma instância central do Axios
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 2. Interceptor de Requisição: Adiciona o token em cada chamada
api.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Se o token existir, anexa ao cabeçalho de autorização
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Resposta: Lida com erros de autenticação globalmente
api.interceptors.response.use(
  (response) => response, // Se a resposta for OK, não faz nada
  (error) => {
    // Se o erro for 401 (Não Autorizado), o token é inválido ou expirou
    if (error.response && error.response.status === 401) {
      // Limpa o armazenamento local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redireciona o usuário para a tela de login para se autenticar novamente
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Funções da API ---
// Agora todas as suas chamadas usarão a instância 'api' e serão autenticadas

// Função de Login
export const loginApi = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

// Funções de Métricas
export const getMonthlyRevenue = (params?: {
  start_date?: string;
  end_date?: string;
}) => api.get('/metrics/monthly-revenue', { params });

export const getOrdersByStatus = (params?: {
  start_date?: string;
  end_date?: string;
}) => api.get('/metrics/orders-by-status', { params });

export const getTopSellingProducts = (params?: {
  start_date?: string;
  end_date?: string;
}) => api.get('/metrics/top-selling-products', { params });

export const getAverageRatings = (params?: {
  start_date?: string;
  end_date?: string;
}) => api.get('/metrics/average-ratings', { params });

export const getWeeklyOrders = (params?: {
  start_date?: string;
  end_date?: string;
}) => api.get('/metrics/weekly-orders', { params });
