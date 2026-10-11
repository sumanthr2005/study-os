'use client';

import React from 'react';
import { X, CheckCircle2, AlertTriangle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface SyncResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result?: any;
  syncResult?: any;
  playlistTitle?: string;
}

export function SyncResultModal({
  isOpen,
  onClose,
  result,
  syncResult,
  playlistTitle = 'Playlist Roadmap',
}: SyncResultModalProps) {
  const activeResult = result || syncResult;
  if (!isOpen || !activeResult) return null;

  const {
    new_videos = 0,
    removed_videos = 0,
    updated_videos = 0,
    total_videos = 0,
    completed_videos = 0,
  } = activeResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 light:bg-white light:border-slate-200 light:text-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Playlist Sync Summary</h3>
              <p className="text-xs text-slate-400">{playlistTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="mb-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 light:bg-slate-50 light:border-slate-200">
          {new_videos > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>{new_videos} New Videos Detected & Synced!</span>
              </div>
              <p className="text-xs text-slate-300 light:text-slate-600">
                The creator added new content. New videos have been added to your learning roadmap as incomplete tasks. Previous completion progress was strictly preserved.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300 light:text-slate-700 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Playlist is fully synchronized with YouTube. No new videos found.</span>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 light:bg-slate-50 light:border-slate-200">
            <span className="text-[11px] text-slate-400 block mb-0.5">New Videos Added</span>
            <span className="font-bold text-emerald-400 text-lg">+{new_videos}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 light:bg-slate-50 light:border-slate-200">
            <span className="text-[11px] text-slate-400 block mb-0.5">Total Videos Now</span>
            <span className="font-bold text-slate-200 light:text-slate-800 text-lg">{total_videos}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 light:bg-slate-50 light:border-slate-200">
            <span className="text-[11px] text-slate-400 block mb-0.5">Completed Preserved</span>
            <span className="font-bold text-indigo-400 text-lg">{completed_videos}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 light:bg-slate-50 light:border-slate-200">
            <span className="text-[11px] text-slate-400 block mb-0.5">Removed/Unavailable</span>
            <span className="font-bold text-amber-400 text-lg">{removed_videos}</span>
          </div>
        </div>

        {/* Data Integrity Assurance */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs mb-5">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Historical study sessions and notes were fully preserved.</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30"
        >
          Done
        </button>
      </div>
    </div>
  );
}
