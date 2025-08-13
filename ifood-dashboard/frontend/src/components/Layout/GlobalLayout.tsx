// src/components/Layout/GlobalLayout.tsx

import React from 'react';
import Image from 'next/image'; // 1. Importe o componente Image
import { useAuth } from '@/context/AuthContext';

export const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ifood-gray-100 flex flex-col font-sans">
      <header className="bg-ifood-red shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* 2. Use o componente Image para carregar o SVG da pasta public */}
          <Image
            src="/ifood-logo.svg" // O caminho começa com "/"
            alt="iFood Logo"
            width={80}  // Defina a largura
            height={40} // Defina a altura
            priority    // Ajuda a carregar o logo mais rápido
          />
          <div className="border-l border-white/50 h-8"></div>
          <h1 className="text-xl font-semibold text-white tracking-wider">
            Painel do Parceiro
          </h1>
        </div>

        {/* ... o resto do seu componente ... */}
      </header>
      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
};