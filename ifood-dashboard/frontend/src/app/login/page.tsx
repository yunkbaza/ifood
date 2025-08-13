'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { loginApi } from '@/api/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores
    
    try {
      // 1. Chama a API para tentar fazer o login
      const response = await loginApi(email, password);
      const { token, user } = response.data;
      
      // 2. Se o login for bem-sucedido, chama a função do contexto
      if (token && user) {
        login(token, user); // O contexto vai salvar e redirecionar
      }
    } catch (err: any) {
      console.error('Falha no login:', err);
      // Mostra uma mensagem de erro para o usuário
      setError('E-mail ou senha inválidos. Tente novamente.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-ifood-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
            <Image src="/ifood-logo.svg" alt="iFood Logo" width={100} height={50} />
        </div>
        <h2 className="text-2xl font-bold text-center text-ifood-black">
          Acesse o Painel do Parceiro
        </h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="text-sm font-bold text-ifood-gray-400">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-ifood-gray-200 rounded-md focus:ring-2 focus:ring-ifood-red focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-bold text-ifood-gray-400"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-ifood-gray-200 rounded-md focus:ring-2 focus:ring-ifood-red focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-center text-ifood-red">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full py-3 font-bold text-white bg-ifood-red rounded-md hover:opacity-90 transition-opacity"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
