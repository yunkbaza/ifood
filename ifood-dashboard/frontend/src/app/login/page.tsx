'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import bcrypt from 'bcryptjs';
import { useAuth } from '@/context/AuthContext';
import { loginApi } from '@/services/auth';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const { login } = useAuth();
  const [tab, setTab] = useState<Tab>('login');

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  // Register form
  const [rName, setRName] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPwd, setRPwd] = useState('');
  const [rPwd2, setRPwd2] = useState('');
  const [rUnit, setRUnit] = useState<string>('');
  const [rError, setRError] = useState('');
  const [rOk, setROk] = useState('');
  const [rShowPwd, setRShowPwd] = useState(false);

  // Admin hash generator
  const [newPwd, setNewPwd] = useState('');
  const [newHash, setNewHash] = useState('');

  useEffect(() => {
    setError('');
    setRError('');
    setROk('');
  }, [tab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await loginApi(email, password);
      const { access_token } = data;
      if (access_token) {
        const minimalUser = { id: 0, name: email.split('@')[0] || email, email } as any;
        login(access_token, minimalUser);
        return;
      }
      setError('Não foi possível obter o token.');
    } catch (err: any) {
      console.error('Falha no login:', err);
      setError('E-mail ou senha inválidos. Tente novamente.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRError('');
    setROk('');
    if (!rName || !rEmail || !rPwd) {
      setRError('Preencha nome, e-mail e senha.');
      return;
    }
    if (rPwd !== rPwd2) {
      setRError('As senhas não coincidem.');
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL não configurada');
      await axios.post(`${apiUrl}/auth/register`, {
        name: rName,
        email: rEmail,
        password: rPwd,
        id_unidade: rUnit ? Number(rUnit) : undefined,
      });
      setROk('Cadastro realizado! Faça login na aba Entrar.');
      setTab('login');
    } catch (err: any) {
      console.error(err);
      setRError(err?.response?.data?.detail || 'Erro ao registrar.');
    }
  };

  const generateHash = async () => {
    if (!newPwd || newPwd.length < 6) {
      setNewHash('Senha deve ter pelo menos 6 caracteres.');
      return;
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPwd, salt);
    setNewHash(hash);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-14">
        <div className="flex justify-center mb-6">
          <Image src="/ifood-logo.svg" alt="iFood Logo" width={120} height={60} />
        </div>
        <h1 className="text-3xl font-extrabold text-center mb-8">Dashboard Gerencial</h1>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-700 mb-6 justify-center">
          <button
            className={`pb-3 text-sm ${tab==='login' ? 'text-ifood-red border-b-2 border-ifood-red' : 'text-slate-300'}`}
            onClick={() => setTab('login')}
          >
            Entrar
          </button>
          <button
            className={`pb-3 text-sm ${tab==='register' ? 'text-ifood-red border-b-2 border-ifood-red' : 'text-slate-300'}`}
            onClick={() => setTab('register')}
          >
            Registrar
          </button>
        </div>

        {/* Card */}
        <div className="max-w-xl mx-auto bg-slate-800 border border-slate-700 rounded-lg p-5">
          {tab === 'login' ? (
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="text-sm font-semibold text-slate-300">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 mt-1 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:ring-ifood-red focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-semibold text-slate-300">Senha</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 mt-1 bg-slate-700/50 border border-slate-600 rounded-md pr-10 focus:ring-2 focus:ring-ifood-red focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-300">
                    {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="submit" className="px-4 py-2 bg-ifood-red rounded-md font-bold hover:opacity-90">Entrar</button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleRegister}>
              <div>
                <label className="text-sm font-semibold text-slate-300">Nome completo</label>
                <input className="w-full px-3 py-2 mt-1 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:ring-ifood-red focus:outline-none" value={rName} onChange={(e)=>setRName(e.target.value)} required/>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-300">E-mail</label>
                <input type="email" className="w-full px-3 py-2 mt-1 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:ring-ifood-red focus:outline-none" value={rEmail} onChange={(e)=>setREmail(e.target.value)} required/>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-300">Senha</label>
                <div className="relative">
                  <input type={rShowPwd ? 'text' : 'password'} className="w-full px-3 py-2 mt-1 bg-slate-700/50 border border-slate-600 rounded-md pr-10 focus:ring-2 focus:ring-ifood-red focus:outline-none" value={rPwd} onChange={(e)=>setRPwd(e.target.value)} required/>
                  <button type="button" onClick={() => setRShowPwd((v)=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-300">{rShowPwd ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-300">Confirmar senha</label>
                <input type={rShowPwd ? 'text' : 'password'} className="w-full px-3 py-2 mt-1 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:ring-ifood-red focus:outline-none" value={rPwd2} onChange={(e)=>setRPwd2(e.target.value)} required/>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-300">ID da Unidade (opcional)</label>
                <input type="number" className="w-full px-3 py-2 mt-1 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:ring-ifood-red focus:outline-none" value={rUnit} onChange={(e)=>setRUnit(e.target.value)} placeholder="ex.: 1"/>
              </div>
              {rError && <p className="text-sm text-red-400">{rError}</p>}
              {rOk && <p className="text-sm text-accent-green">{rOk}</p>}
              <button type="submit" className="px-4 py-2 bg-ifood-red rounded-md font-bold hover:opacity-90">Registrar</button>
            </form>
          )}
        </div>

        {/* Admin: hash generator */}
        <details className="max-w-xl mx-auto mt-5 bg-slate-800 border border-slate-700 rounded-lg">
          <summary className="cursor-pointer px-4 py-3 text-sm">Criar nova senha (Apenas para Admin)</summary>
          <div className="p-4 space-y-3">
            <input type="password" className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:ring-ifood-red focus:outline-none" placeholder="Nova senha" value={newPwd} onChange={(e)=>setNewPwd(e.target.value)} />
            <button type="button" onClick={generateHash} className="px-3 py-2 bg-ifood-red rounded-md font-bold hover:opacity-90">Gerar Hash</button>
            {newHash && (
              <pre className="mt-2 bg-slate-900 border border-slate-700 rounded p-3 text-xs overflow-auto select-all">{newHash}</pre>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
