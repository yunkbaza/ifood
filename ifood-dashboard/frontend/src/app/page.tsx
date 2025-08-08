'use client'; // Indica que este é um componente do lado do cliente
// frontend/src/app/page.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardPage } from '@/app/dashboard/page';
import LoginPage  from '@/app/login/page';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redireciona o usuário para a página de login se não estiver autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user) {
      // Redireciona para o dashboard se estiver autenticado
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center mt-10">Carregando...</div>;
  }

  // Renderiza o Dashboard se o usuário estiver autenticado
  if (user) {
    return <DashboardPage />;
  }

  // Renderiza a página de Login se não houver usuário
  return <LoginPage />;
  return null; // Retorna null enquanto aguarda o redirecionamento
};

