import { api } from '@/api/api';

export const loginApi = (email: string, password: string) =>
  api.post('/auth/login', { email, password });
