'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatSecondsToClock } from '@/lib/utils';
import {
  Flame,
  Droplets,
  Sparkles,
  Sun,
  Moon,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Database,
  Info,
  Clock,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export function Navbar() {
  const {
    theme,
    toggleTheme,
    userSummary,
    timer,
    pauseTimer,
    resumeTimer,
    saveStudySession,
    resetTimer,
    quickAddWater,
    showToast,
    refreshUserSummary,
  } = useApp();

  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isResettingSeed, setIsResettingSeed] = useState(false);

  const prodScore = userSummary?.productivityScore?.totalScore ?? 87;
  const streak = userSummary?.user?.currentStreak ?? 17;
  const levelInfo = userSummary?.levelInfo ?? { level: 6, currentLevelXp: 200, nextLevelXp: 250, progressPercent: 80 };

  const handleResetSeed = async () => {
    if (!confirm('Re-seed Study OS with realistic demo data? (This will refresh playlists, LeetCode logs, habits, and tasks)')) return;
    setIsResettingSeed(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceReset: true }),
      });
      if (res.ok) {
        showToast('Demo Environment Seeded!', 'Full mock data loaded successfully.', 'success');
        await refreshUserSummary();
        window.location.reload();
      }
    } catch (e: any) {
      showToast('Seed Failed', e.message, 'error');
    } finally {
      setIsResettingSeed(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md transition-colors light:bg-white/90 light:border-slate-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent light:from-slate-900 light:to-indigo-600">
                STUDY <span className="text-indigo-400 font-extrabold">OS</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v2.0
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Running Timer status pill */}
        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/60 bg-slate-900/80 light:bg-slate-100 light:border-slate-300 text-xs">
            <div className={`h-2 w-2 rounded-full ${timer.isRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`} />
            <Link href="/timer" className="flex items-center gap-1.5 hover:text-indigo-400 font-medium">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>{timer.subject}:</span>
              <span className="font-mono font-semibold text-slate-200 light:text-slate-900">
                {formatSecondsToClock(timer.mode === 'stopwatch' ? timer.secondsRemaining : timer.secondsRemaining)}
              </span>
            </Link>
            <div className="flex items-center gap-1 pl-1 border-l border-slate-700 light:border-slate-300">
              {timer.isRunning ? (
                <button
                  onClick={pauseTimer}
                  title="Pause Timer"
                  className="p-1 hover:text-amber-400 text-slate-400 transition-colors"
                >
                  <Pause className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  title="Resume Timer"
                  className="p-1 hover:text-emerald-400 text-slate-400 transition-colors"
                >
                  <Play className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={saveStudySession}
                title="Save Study Session"
                className="p-1 hover:text-indigo-400 text-slate-400 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Gamification, Score, Quick Hydration, Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          <div
            title={`${streak} day study streak!`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold"
          >
            <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span>{streak}d</span>
          </div>

          {/* Productivity Score Pill */}
          <button
            onClick={() => setShowScoreModal(!showScoreModal)}
            className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/20 transition-colors text-xs font-semibold"
          >
            <span>Score:</span>
            <span className="font-bold text-white light:text-indigo-900">{prodScore}</span>
            <span className="text-[10px] text-indigo-400/80">/100</span>
          </button>

          {/* Level & XP */}
          <div className="hidden lg:flex flex-col text-[11px] items-end justify-center">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-300 light:text-slate-700">Lvl {levelInfo.level}</span>
              <span className="text-[10px] text-slate-500">({levelInfo.currentLevelXp}/{levelInfo.nextLevelXp} XP)</span>
            </div>
            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Water Button */}
          <button
            onClick={() => quickAddWater(250)}
            title="Drink 250ml Water"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all text-xs font-medium active:scale-95"
          >
            <Droplets className="h-3.5 w-3.5 fill-cyan-400" />
            <span className="hidden sm:inline">+250ml</span>
          </button>

          {/* Seed Demo Data Button */}
          <button
            onClick={handleResetSeed}
            disabled={isResettingSeed}
            title="Reset to Demo Data (Playlists, LeetCode, Tasks, Habits)"
            className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 bg-slate-900/60 light:bg-slate-100 light:border-slate-300 light:hover:border-slate-400 transition-all"
          >
            <Database className="h-3.5 w-3.5 text-purple-400" />
            <span>{isResettingSeed ? 'Seeding...' : 'Demo Data'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 light:hover:bg-slate-100 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">
                {userSummary?.user?.name || 'Explorer'}
              </span>
              {userSummary?.user?.isDemo && (
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Demo Mode</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Productivity Score Explanation Popover */}
      {showScoreModal && userSummary?.productivityScore && (
        <div className="absolute right-4 top-16 w-80 p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 animate-fade-in light:bg-white light:border-slate-200 light:shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-100 light:text-slate-900 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-indigo-400" />
              Daily Productivity Score: {prodScore}/100
            </h4>
            <button
              onClick={() => setShowScoreModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3 light:text-slate-600">
            Calculated transparently from your configured priorities (Study 40%, Coding 20%, Learning 15%, Habits 15%, Health 10%):
          </p>
          <div className="space-y-1.5 text-xs">
            {userSummary.productivityScore.explanation.map((exp: string, idx: number) => (
              <div key={idx} className="p-1.5 rounded bg-slate-800/60 light:bg-slate-50 text-slate-300 light:text-slate-700 flex items-center justify-between">
                <span>{exp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
