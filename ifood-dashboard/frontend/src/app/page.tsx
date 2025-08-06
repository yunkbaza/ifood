// frontend/src/app/page.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redireciona para o dashboard se estiver autenticado
        router.push('/dashboard');
      } else {
        // Redireciona para o login se não estiver autenticado
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center mt-10">Carregando...</div>;
  }

  return null; // Retorna null enquanto aguarda o redirecionamento
}