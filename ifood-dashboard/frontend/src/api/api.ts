import axios from 'axios';

// 1. Cria uma instância central do Axios
export const api = axios.create({
  // CORREÇÃO: Altere a porta para 3000 para corresponder ao seu backend
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
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
export const loginApi = (email: string, password: string) => api.post('/auth/login', { email, password });

// Funções de Métricas
export const getMonthlyRevenue = (filters?: { start_date?: string; end_date?: string }) => api.get('/metrics/monthly-revenue', { params: filters });
export const getOrdersByStatus = (filters?: { start_date?: string; end_date?: string }) => api.get('/metrics/orders-by-status', { params: filters });
export const getTopSellingProducts = (filters?: { start_date?: string; end_date?: string }) => api.get('/metrics/top-selling-products', { params: filters });
export const getAverageRatings = (filters?: { start_date?: string; end_date?: string }) => api.get('/metrics/average-ratings', { params: filters });
export const getWeeklyOrders = (filters?: { start_date?: string; end_date?: string }) => api.get('/metrics/weekly-orders', { params: filters });
