// src/components/Layout/GlobalLayout.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ifood-gray-100 flex flex-col font-sans">
      <header className="bg-ifood-red shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Image
            src="/ifood-logo.svg"
            alt="iFood Logo"
            width={80}
            height={40}
            priority
          />
          <div className="border-l border-white/50 h-8"></div>
          <h1 className="text-xl font-semibold text-white tracking-wider">
            Painel do Parceiro
          </h1>
        </div>

        <nav className="flex items-center space-x-4 text-white">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/pedidos" className="hover:underline">
            Pedidos
          </Link>
          <Link href="/settings" className="hover:underline">
            Configurações
          </Link>
          {user && (
            <button onClick={logout} className="hover:underline">
              Sair
            </button>
          )}
        </nav>
      </header>
      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
};
