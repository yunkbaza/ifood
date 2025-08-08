import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--background-light)] flex flex-col">
      <header className="bg-[var(--background-white)] border-b border-[var(--border-color)] shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-[var(--ifood-red)]">iFood</span>
                    <span className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</span>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-sm text-[var(--text-primary)]">{user?.name}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{user?.email}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center justify-center p-2 rounded-full text-[var(--text-secondary)] hover:bg-gray-100 hover:text-[var(--ifood-red)] transition-colors"
                      title="Sair"
                    >
                      <LogOut size={20} />
                    </button>
                </div>
            </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default GlobalLayout;
