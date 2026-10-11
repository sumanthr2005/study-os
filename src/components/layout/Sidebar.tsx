'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlaySquare,
  Timer,
  Code2,
  GitFork,
  CheckSquare,
  Flame,
  Target,
  Repeat,
  Briefcase,
  Bot,
  BarChart3,
  Calendar,
  HeartPulse,
  Settings,
  BookOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Playlists', href: '/playlists', icon: PlaySquare, badge: 'Live Sync' },
  { label: 'Study Timer', href: '/timer', icon: Timer },
  { label: 'LeetCode', href: '/leetcode', icon: Code2 },
  { label: 'DSA Roadmap', href: '/dsa', icon: GitFork },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Habits', href: '/habits', icon: Flame },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Revisions', href: '/revisions', icon: Repeat, badgeColor: 'bg-rose-500/20 text-rose-300' },
  { label: 'Placement Prep', href: '/placement', icon: Briefcase },
  { label: 'AI Assistant', href: '/ai-planner', icon: Bot, badge: 'Smart' },
  { label: 'Notes', href: '/notes', icon: BookOpen },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Wellness', href: '/wellness', icon: HeartPulse },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800 bg-[#070b13] p-3 text-slate-300 light:bg-slate-50 light:border-slate-200 light:text-slate-700 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold light:bg-indigo-50 light:text-indigo-600 light:border-indigo-200'
                    : 'hover:bg-slate-800/60 hover:text-white light:hover:bg-slate-200/70 light:hover:text-slate-900 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-indigo-400 light:text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      item.badgeColor || 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom user profile card */}
        <div className="mt-auto pt-4 border-t border-slate-800/80 light:border-slate-200">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
              AV
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate light:text-slate-900">Alex Vance</p>
              <p className="text-[10px] text-slate-400 truncate">Placement Ready • Oct 2026</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-slate-800 bg-[#090d16]/95 backdrop-blur-lg flex items-center justify-around px-2 light:bg-white/95 light:border-slate-200">
        {[
          { label: 'Home', href: '/', icon: LayoutDashboard },
          { label: 'Playlists', href: '/playlists', icon: PlaySquare },
          { label: 'Timer', href: '/timer', icon: Timer },
          { label: 'LeetCode', href: '/leetcode', icon: Code2 },
          { label: 'DSA', href: '/dsa', icon: GitFork },
          { label: 'More', href: '/settings', icon: Settings },
        ].map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-indigo-400 light:text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
