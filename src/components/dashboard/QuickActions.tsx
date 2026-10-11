'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { Timer, PlaySquare, Code2, CheckSquare, Droplets, Sparkles, BookOpen } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function QuickActions({
  onOpenImportModal,
}: {
  onOpenImportModal?: () => void;
}) {
  const { quickAddWater, startTimer } = useApp();

  return (
    <Card className="border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 light:text-slate-700">
          Quick Actions
        </h4>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Link href="/timer">
          <Button variant="primary" size="sm" icon={Timer}>
            Start Study Timer
          </Button>
        </Link>

        {onOpenImportModal ? (
          <Button variant="secondary" size="sm" icon={PlaySquare} onClick={onOpenImportModal}>
            Import Playlist
          </Button>
        ) : (
          <Link href="/playlists">
            <Button variant="secondary" size="sm" icon={PlaySquare}>
              Import Playlist
            </Button>
          </Link>
        )}

        <Link href="/leetcode">
          <Button variant="secondary" size="sm" icon={Code2}>
            Log Problem
          </Button>
        </Link>

        <Link href="/tasks">
          <Button variant="secondary" size="sm" icon={CheckSquare}>
            New Task
          </Button>
        </Link>

        <button
          onClick={() => quickAddWater(250)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all active:scale-95"
        >
          <Droplets className="h-3.5 w-3.5" />
          +250ml Water
        </button>

        <Link href="/notes">
          <Button variant="ghost" size="sm" icon={BookOpen}>
            Quick Note
          </Button>
        </Link>
      </div>
    </Card>
  );
}
