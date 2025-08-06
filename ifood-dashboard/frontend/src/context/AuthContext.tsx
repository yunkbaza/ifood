'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '../api/api';
import { User } from '../assets/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Efeito que roda ao carregar a aplicação para verificar o token de autenticação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Simula a validação do token com um usuário de teste por enquanto
      setUser({ id: 1, name: 'Usuário Teste', email: 'teste@email.com' });
    }
    setLoading(false);
  }, []);

  // Função para realizar o login na API e salvar o token
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await loginApi(email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (err) {
      console.error('Falha no login:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer logout e remover o token do armazenamento
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};