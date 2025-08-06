// frontend/src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'iFood Dashboard',
  description: 'Seu painel de controle para métricas do iFood.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* O AuthProvider envolve toda a aplicação para gerenciar o estado do usuário */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}