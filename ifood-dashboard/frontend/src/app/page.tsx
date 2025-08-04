// frontend/src/app/page.tsx

'use client'; // Necessário para usar hooks do React

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardPage from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center mt-10">Carregando...</div>;
  }

  if (user) {
    return <DashboardPage />;
  }

  return <LoginPage />;
}