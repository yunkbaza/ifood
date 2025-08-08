'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getMe } from '../api/api'; // Importamos a nova função getMe
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

  // --- LÓGICA DO USEEFFECT CORRIGIDA ---
  // Efeito que roda ao carregar a aplicação para verificar se existe um token válido.
  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Usa a nova rota /me para validar o token e obter os dados do usuário
          const { data } = await getMe();
          setUser(data);
        } catch (error) {
          // Se o token for inválido (expirado, etc.), a API retornará um erro.
          // Nesse caso, limpamos o token do localStorage.
          console.error("Falha ao validar token, limpando sessão:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      // Finaliza o carregamento inicial
      setLoading(false);
    };

    loadUserFromToken();
  }, []);

  // Função para realizar o login na API e salvar o token (sem alterações)
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await loginApi(email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (err) {
      console.error('Falha no login:', err);
      // Você pode adicionar um tratamento de erro mais visível para o usuário aqui
      throw err; // Lança o erro para que a página de login possa tratá-lo
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer logout (sem alterações)
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