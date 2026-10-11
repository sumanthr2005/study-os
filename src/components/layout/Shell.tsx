'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Shell({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useApp();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 transition-colors light:bg-slate-50 light:text-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md animate-fade-in ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 light:bg-white light:border-emerald-500 light:text-slate-900'
                : toast.type === 'warning'
                ? 'bg-slate-900/95 border-amber-500/40 text-slate-100 light:bg-white light:border-amber-500 light:text-slate-900'
                : toast.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/40 text-slate-100 light:bg-white light:border-rose-500 light:text-slate-900'
                : 'bg-slate-900/95 border-indigo-500/40 text-slate-100 light:bg-white light:border-indigo-500 light:text-slate-900'
            }`}
          >
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {toast.type === 'warning' && <AlertCircle className="h-4 w-4 text-amber-400" />}
              {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-400" />}
              {toast.type === 'info' && <Info className="h-4 w-4 text-indigo-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{toast.title}</p>
              {toast.message && <p className="text-[11px] text-slate-400 mt-0.5 light:text-slate-600">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
