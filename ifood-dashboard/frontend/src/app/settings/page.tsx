'use client';

import React from 'react';
import { GlobalLayout } from '@/components/Layout/GlobalLayout';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <GlobalLayout>
      <h2 className="text-3xl font-bold text-ifood-black mb-6">Configurações da Conta</h2>
      {user && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-ifood-gray-400">Nome</h3>
            <p className="text-ifood-black">{user.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ifood-gray-400">E-mail</h3>
            <p className="text-ifood-black">{user.email}</p>
          </div>
        </div>
      )}
      <div className="mt-8">
        <button
          onClick={logout}
          className="px-4 py-2 bg-ifood-red text-white rounded-md hover:opacity-90"
        >
          Sair
        </button>
      </div>
      <div className="mt-12">
        <h3 className="text-xl font-bold text-ifood-black mb-2">Gestão de Usuários</h3>
        <p className="text-ifood-gray-400">Funcionalidade em desenvolvimento.</p>
      </div>
    </GlobalLayout>
  );
}

