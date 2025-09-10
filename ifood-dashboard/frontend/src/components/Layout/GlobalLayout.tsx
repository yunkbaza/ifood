// src/components/Layout/GlobalLayout.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Props = { children: React.ReactNode };

export const GlobalLayout = ({ children }: Props) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    // carrega preferência do tema (padrão: dark)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      setDark(stored ? stored === 'dark' : true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    }
  }, [dark]);

  const containerBg = dark ? 'bg-slate-900' : 'bg-ifood-gray-100';
  const textMain = dark ? 'text-slate-100' : 'text-ifood-black';
  const cardBg = dark ? 'bg-slate-800' : 'bg-white';
  const borderCol = dark ? 'border-slate-700' : 'border-ifood-gray-200';

  const navItems = useMemo(
    () => [
      { href: '/mensal', label: 'Dashboard Mensal', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 13h8V3H3v10zM13 21h8v-6h-8v6zM13 3v6h8V3h-8zM3 21h8v-6H3v6z"/></svg>
      )},
      { href: '/diario', label: 'Dashboard Diário', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
      )},
      { href: '/insights', label: 'Insights de Marketing', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 3.4l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .68.39 1.29 1 1.51H21a2 2 0 1 1 0 4h-.09c-.68.22-1.21.83-1.51 1z"/></svg>
      )},
    ], []);

  return (
    <div className={`min-h-screen ${containerBg} ${textMain} flex`}>      
      {/* Sidebar */}
      <aside className={`fixed z-30 inset-y-0 left-0 transform transition-transform duration-200 ease-in-out w-64 ${cardBg} ${borderCol} border-r shadow-sm ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center gap-3 px-4 border-b">
          <Image src="/ifood-logo.svg" alt="iFood Logo" width={80} height={40} priority />
          <span className="font-semibold tracking-wide">Painel do Parceiro</span>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${active ? 'bg-ifood-red text-white' : 'hover:bg-ifood-gray-100 text-inherit'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={active ? 'text-white' : 'text-ifood-red'}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-slate-900 text-slate-100 border-b border-slate-800">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                aria-label="Abrir menu"
                className="md:hidden inline-flex items-center justify-center p-2 rounded hover:bg-white/10"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
              </button>
              <span className="text-sm opacity-90 hidden sm:inline">{pathname || '/'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Alternar tema"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15"
                onClick={() => setDark((v) => !v)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  {dark ? (
                    <path d="M21.64 13a9 9 0 1 1-10.63-10.6 1 1 0 0 1 1.11 1.45A7 7 0 1 0 20.19 12a1 1 0 0 1 1.45 1.11z"/>
                  ) : (
                    <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.8 1.79 1.79-1.79zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm8.84-19.83l-1.79-1.79-1.79 1.79 1.79 1.79 1.79-1.79zM20 11v2h3v-2h-3zM6.76 19.16l-1.79 1.79 1.79 1.79 1.79-1.79-1.79-1.79zM17.24 19.16l-1.79 1.79 1.79 1.79 1.79-1.79-1.79-1.79zM11 1h2V-2h-2V1z"/>
                  )}
                </svg>
                <span className="text-sm">{dark ? 'Dark' : 'Light'}</span>
              </button>
              {user && (
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
                  <span className="text-sm">Sair</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className={`flex-1 p-4 md:p-6 ${cardBg}`}>
          <div className={`mx-auto max-w-7xl ${cardBg}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
