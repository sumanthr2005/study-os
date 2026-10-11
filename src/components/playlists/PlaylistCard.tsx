'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatDuration, formatDurationDetailed } from '@/lib/utils';
import {
  Clock,
  CheckCircle2,
  Calendar,
  TrendingUp,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface PlaylistCardProps {
  playlist: any;
  onSync: (id: string, expandScenario?: boolean) => void;
  isSyncing?: boolean;
}

export function PlaylistCard({ playlist, onSync, isSyncing }: PlaylistCardProps) {
  const { showToast } = useApp();
  const metrics = playlist.metrics || {};

  const targetDateFormatted = playlist.targetCompletionDate
    ? new Date(playlist.targetCompletionDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'No target set';

  const lastSyncedFormatted = playlist.lastSyncedAt
    ? formatTimeAgo(new Date(playlist.lastSyncedAt))
    : 'Never';

  function formatTimeAgo(date: Date) {
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const days = Math.floor(diffHours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-5 sm:p-6 card-hover light:bg-white light:border-slate-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-100 light:text-slate-900 line-clamp-1">
              {playlist.title}
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
              {playlist.channelTitle || 'YouTube Course'} • {metrics.totalVideos} videos
            </p>
          </div>
        </div>

        {/* Sync status & button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSync(playlist.id, false)}
            disabled={isSyncing}
            title="Synchronize with YouTube playlist"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 light:bg-slate-100 light:border-slate-300 light:text-slate-700 transition-all active:scale-95"
          >
            <RotateCw className={`h-3.5 w-3.5 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Dual Progress: Videos & Time */}
      <div className="space-y-3.5 mb-5 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60 light:bg-slate-50 light:border-slate-200">
        {/* Video Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-300 light:text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Video Progress: {metrics.completedVideos} / {metrics.totalVideos} videos
            </span>
            <span className="font-bold text-emerald-400">{metrics.videoProgressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 light:bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.videoProgressPercent)}%` }}
            />
          </div>
        </div>

        {/* Time Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-300 light:text-slate-700 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              Time Progress: {formatDuration(metrics.completedDurationSeconds)} /{' '}
              {formatDuration(metrics.totalDurationSeconds)}
            </span>
            <span className="font-bold text-indigo-400">{metrics.timeProgressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 light:bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.timeProgressPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Adaptive Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 light:bg-slate-50 light:border-slate-200">
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
            <Clock className="h-3 w-3 text-amber-400" />
            Remaining
          </span>
          <p className="font-semibold text-slate-200 light:text-slate-900">
            {formatDuration(metrics.remainingDurationSeconds)}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 light:bg-slate-50 light:border-slate-200">
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
            <Calendar className="h-3 w-3 text-purple-400" />
            Target Date
          </span>
          <p className="font-semibold text-slate-200 light:text-slate-900">{targetDateFormatted}</p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 light:bg-slate-50 light:border-slate-200 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
            <TrendingUp className="h-3 w-3 text-cyan-400" />
            Required Pace
          </span>
          <p className="font-semibold text-slate-200 light:text-slate-900">
            {formatDuration(metrics.requiredDailySeconds)}/day
          </p>
        </div>
      </div>

      {/* Pace Alert Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs mb-4 light:bg-slate-100 light:border-slate-300">
        <div className="flex items-center gap-1.5">
          <AlertTriangle
            className={`h-3.5 w-3.5 ${
              metrics.statusLabel.includes('behind') ? 'text-amber-400' : 'text-emerald-400'
            }`}
          />
          <span className="font-medium text-slate-300 light:text-slate-700">
            {metrics.statusLabel}
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Last synced: {lastSyncedFormatted}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/playlists/${playlist.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 active:scale-98"
        >
          <span>Continue Learning</span>
          <ChevronRight className="h-4 w-4" />
        </Link>

        {/* 20 -> 27 Video Detection Test button */}
        <button
          onClick={() => onSync(playlist.id, true)}
          disabled={isSyncing}
          title="Simulate creator uploading 7 new videos to test 20 -> 27 video detection requirement"
          className="px-3 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-all"
        >
          <span className="hidden sm:inline">Test +7 Videos</span>
          <Sparkles className="h-3.5 w-3.5 sm:hidden text-purple-400" />
        </button>
      </div>
    </div>
  );
}
