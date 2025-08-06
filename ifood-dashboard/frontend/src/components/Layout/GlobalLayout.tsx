// frontend/src/components/Layout/GlobalLayout.tsx

import React from 'react';
import { useAuth } from '@/context/AuthContext';

const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Cabeçalho do Dashboard com o nome do usuário e o botão de sair */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard iFood | {user?.name}
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
        >
          Sair
        </button>
      </header>

      {/* Área principal de conteúdo */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default GlobalLayout;