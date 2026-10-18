'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Flame, Timer, Award, CheckCircle2, Sparkles, Zap, Shield, Play } from 'lucide-react';

interface HolographicCoreProps {
  level: number;
  rankTitle: string;
  totalXp: number;
  todayStudySeconds: number;
  dailyTargetMinutes: number;
  currentStreak: number;
  completedQuests: number;
  totalQuests: number;
  productivityScore: number;
}

export function HolographicCore({
  level,
  rankTitle,
  totalXp,
  todayStudySeconds,
  dailyTargetMinutes,
  currentStreak,
  completedQuests,
  totalQuests,
  productivityScore,
}: HolographicCoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -14; // Max tilt 14deg
    const rotateY = ((x - centerX) / centerX) * 14;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const todayStudyHours = (todayStudySeconds / 3600).toFixed(1);
  const targetStudyHours = (dailyTargetMinutes / 60).toFixed(0);
  const studyProgressPercent = Math.min(
    100,
    dailyTargetMinutes > 0 ? Math.round((todayStudySeconds / (dailyTargetMinutes * 60)) * 100) : 0
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-[#0c1222] via-[#090d18] to-[#070a12] p-6 lg:p-8 overflow-hidden shadow-2xl transition-all duration-300"
      style={{ perspective: '1000px' }}
      aria-label={`Study OS Command Core: Rank ${rankTitle}, Level ${level}, ${todayStudyHours} hours studied today, ${currentStreak} day streak, ${completedQuests} of ${totalQuests} quests completed.`}
    >
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Command Info & CTA */}
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            <span>Autonomous Command Core</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Station Status:</span>
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Active Focus
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 mt-1 max-w-md">
              Holographic telemetry syncing real-time focus sessions, playlist roadmaps, and DSA mastery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/timer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Launch Focus Session</span>
            </Link>

            <Link
              href="/playlists"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm transition-all"
            >
              <span>View Roadmap</span>
            </Link>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Rank Title</span>
              <p className="text-xs font-bold text-indigo-300 truncate">{rankTitle}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Productivity</span>
              <p className="text-xs font-bold text-emerald-400">{productivityScore}/100</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Active XP</span>
              <p className="text-xs font-bold text-cyan-400">{totalXp.toLocaleString()} XP</p>
            </div>
          </div>
        </div>

        {/* Right: 3D Holographic Core Scene */}
        <div className="lg:col-span-7 flex items-center justify-center min-h-[300px] sm:min-h-[340px] relative select-none">
          <div
            className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center transition-transform duration-200 ease-out"
            style={{
              transform: prefersReducedMotion
                ? 'none'
                : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Outer Concentric Hologram Rings (CSS 3D) */}
            <div
              className="absolute inset-0 rounded-full border border-cyan-500/20 border-dashed animate-spin"
              style={{
                animationDuration: '30s',
                transform: 'translateZ(10px)',
              }}
            />
            <div
              className="absolute inset-4 rounded-full border border-indigo-500/30 border-t-cyan-400/80 border-b-purple-400/80 animate-spin"
              style={{
                animationDuration: '18s',
                animationDirection: 'reverse',
                transform: 'translateZ(20px)',
              }}
            />
            <div
              className="absolute inset-8 rounded-full border border-purple-500/20 animate-pulse"
              style={{
                transform: 'translateZ(30px)',
              }}
            />

            {/* Central Holographic Planet / Core Sphere */}
            <div
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-300"
              style={{
                background:
                  'radial-gradient(circle at 35% 35%, #818cf8 0%, #4338ca 45%, #1e1b4b 80%, #030712 100%)',
                boxShadow: isHovered
                  ? '0 0 50px rgba(99, 102, 241, 0.6), inset 0 0 25px rgba(165, 180, 252, 0.8)'
                  : '0 0 35px rgba(99, 102, 241, 0.4), inset 0 0 15px rgba(165, 180, 252, 0.6)',
                transform: 'translateZ(60px)',
              }}
            >
              <div className="absolute inset-1 rounded-full border border-white/20 pointer-events-none" />
              <Zap className="h-6 w-6 text-cyan-200 animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-white mt-0.5">
                Level {level}
              </span>
              <span className="text-[9px] font-semibold text-cyan-200/90 tracking-tight">
                {rankTitle}
              </span>
            </div>

            {/* Orbiting Satellite Node 1: Study Velocity (Top) */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-white shadow-lg backdrop-blur-md transition-transform"
              style={{ transform: 'translateZ(75px)' }}
            >
              <Timer className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <div className="text-left">
                <div className="text-[9px] text-slate-400 font-medium">Daily Velocity</div>
                <div className="text-xs font-bold text-indigo-300">
                  {todayStudyHours}h / {targetStudyHours}h ({studyProgressPercent}%)
                </div>
              </div>
            </div>

            {/* Orbiting Satellite Node 2: Flame Streak (Right) */}
            <div
              className="absolute right-[-18px] top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/40 text-white shadow-lg backdrop-blur-md transition-transform"
              style={{ transform: 'translateZ(85px)' }}
            >
              <Flame className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="text-[9px] text-slate-400 font-medium">Streak</div>
                <div className="text-xs font-bold text-amber-300">{currentStreak} Days</div>
              </div>
            </div>

            {/* Orbiting Satellite Node 3: Daily Quests (Bottom) */}
            <div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-white shadow-lg backdrop-blur-md transition-transform"
              style={{ transform: 'translateZ(75px)' }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <div className="text-left">
                <div className="text-[9px] text-slate-400 font-medium">Daily Quests</div>
                <div className="text-xs font-bold text-cyan-300">
                  {completedQuests} / {totalQuests} Complete
                </div>
              </div>
            </div>

            {/* Orbiting Satellite Node 4: Milestone Rank (Left) */}
            <div
              className="absolute left-[-18px] top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-purple-500/40 text-white shadow-lg backdrop-blur-md transition-transform"
              style={{ transform: 'translateZ(85px)' }}
            >
              <Award className="h-4 w-4 text-purple-400 shrink-0" />
              <div className="text-left">
                <div className="text-[9px] text-slate-400 font-medium">Rank XP</div>
                <div className="text-xs font-bold text-purple-300">{totalXp} XP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
