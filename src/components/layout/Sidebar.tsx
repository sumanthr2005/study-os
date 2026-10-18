'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  PlaySquare,
  Timer,
  Code2,
  CheckSquare,
  Briefcase,
  Settings,
  Sparkles,
  Shield,
  Flame,
  Award,
} from 'lucide-react';

export const PRIMARY_NAV_ITEMS = [
  { label: 'Command Center', href: '/', icon: LayoutDashboard },
  { label: 'Learn', href: '/playlists', icon: PlaySquare, badge: 'Roadmap' },
  { label: 'Practice', href: '/practice', icon: Code2, badge: 'DSA & Rev' },
  { label: 'Focus', href: '/timer', icon: Timer },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Placement HQ', href: '/placement', icon: Briefcase, badge: 'SDE Ready' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userSummary } = useApp();

  const rankTitle = userSummary?.rankInfo?.title || 'Problem Solver';
  const level = userSummary?.rankInfo?.level || userSummary?.user?.level || 6;
  const currentStreak = userSummary?.user?.currentStreak || 17;

  return (
    <>
      {/* Desktop Sidebar — 6 Primary Destinations */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800/80 bg-[#070b13]/95 backdrop-blur-md p-3.5 text-slate-300 light:bg-slate-50 light:border-slate-200 light:text-slate-700 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        <div className="mb-3 px-3 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Flight Control</span>
          <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE
          </span>
        </div>

        <nav className="space-y-1.5" aria-label="Main Navigation">
          {PRIMARY_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/' || pathname === '/dashboard'
                : pathname.startsWith(item.href) ||
                  (item.href === '/practice' && (pathname.startsWith('/leetcode') || pathname.startsWith('/dsa') || pathname.startsWith('/revisions') || pathname.startsWith('/revision'))) ||
                  (item.href === '/playlists' && (pathname.startsWith('/playlists') || pathname.startsWith('/notes')));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 via-indigo-600/10 to-transparent text-indigo-300 border border-indigo-500/35 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:border-slate-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1 rounded-lg transition-transform group-hover:scale-110 ${
                      isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Tactical Status & Settings Card */}
        <div className="mt-auto pt-4 border-t border-slate-800/80 space-y-2">
          <Link
            href="/settings"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-500/20 shrink-0">
                L{level}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-200 group-hover:text-white truncate">
                  Alex Vance
                </p>
                <p className="text-[10px] text-cyan-400 truncate flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  <span>{rankTitle}</span>
                </p>
              </div>
            </div>

            <Settings className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 group-hover:rotate-45 transition-all" />
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (6 Primary Items touch-friendly) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-slate-800 bg-[#090d16]/95 backdrop-blur-lg flex items-center justify-around px-2 light:bg-white/95 light:border-slate-200"
        aria-label="Mobile Navigation"
      >
        {PRIMARY_NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/' || pathname === '/dashboard'
              : pathname.startsWith(item.href) ||
                (item.href === '/practice' && (pathname.startsWith('/leetcode') || pathname.startsWith('/dsa') || pathname.startsWith('/revisions') || pathname.startsWith('/revision')));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors flex-1 py-1 ${
                isActive ? 'text-indigo-400 light:text-indigo-600' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate max-w-[56px] text-center">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
