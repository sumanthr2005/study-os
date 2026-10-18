'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Demo login failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 mb-4">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          STUDY <span className="text-cyan-400">OS</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Sign in to access your personal learning & placement command center.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-2xl">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-slate-300 text-xs font-semibold block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="developer@studyos.dev"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-xs font-semibold block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading || demoLoading}
            className="w-full justify-center bg-gradient-to-r from-indigo-500 to-cyan-500 border-none font-bold py-2.5 text-xs shadow-lg shadow-cyan-500/15"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="h-4 w-4 ml-1.5" />}
          </Button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative px-3 bg-slate-900 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Or Instant Evaluation
          </span>
        </div>

        {/* 1-Click Demo Profile Option */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading || demoLoading}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-700 hover:border-cyan-500/50 bg-slate-950/50 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold transition-all group"
        >
          <UserCheck className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>{demoLoading ? 'Loading Demo Workspace...' : 'Explore Live Demo Mode (Alex Vance)'}</span>
        </button>

        <div className="text-center mt-6 text-xs text-slate-400">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4">
            Create an Account
          </Link>
        </div>
      </Card>
    </div>
  );
}
