'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge, Progress, Button } from '@/components/ui';
import { PlaySquare, Calendar, Clock, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface PlaylistWidgetProps {
  playlists: Array<{
    id: string;
    youtubePlaylistId: string;
    title: string;
    thumbnailUrl?: string | null;
    channelTitle?: string | null;
    targetCompletionDate?: Date | string | null;
    totalVideos: number;
    completedVideos: number;
    totalDurationSeconds: number;
    completedDurationSeconds: number;
    availableStudyHoursPerDay: number;
  }>;
  onSyncPlaylist?: (id: string) => void;
  isSyncing?: boolean;
}

export function PlaylistProgressWidget({
  playlists,
  onSyncPlaylist,
  isSyncing = false,
}: PlaylistWidgetProps) {
  if (!playlists || playlists.length === 0) {
    return (
      <Card className="text-center py-10">
        <PlaySquare className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-200 light:text-slate-800">No Roadmaps Imported Yet</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          Import your YouTube study playlists (Striver DSA, CS50, System Design) to calculate completion targets and daily study requirements.
        </p>
        <Link href="/playlists">
          <Button variant="primary" size="sm">
            Import YouTube Playlist
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlaySquare className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white light:text-slate-900">
            Active YouTube Playlist Roadmaps
          </h3>
        </div>
        <Link
          href="/playlists"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          View All ({playlists.length})
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playlists.slice(0, 2).map(playlist => {
          const videoProgress = playlist.totalVideos > 0
            ? Math.round((playlist.completedVideos / playlist.totalVideos) * 100)
            : 0;

          const durationProgress = playlist.totalDurationSeconds > 0
            ? Math.round((playlist.completedDurationSeconds / playlist.totalDurationSeconds) * 100)
            : 0;

          const remainingSeconds = Math.max(0, playlist.totalDurationSeconds - playlist.completedDurationSeconds);
          const remainingHours = (remainingSeconds / 3600).toFixed(1);

          let targetFormatted = 'None';
          let requiredDailyHours = 'N/A';
          if (playlist.targetCompletionDate) {
            const target = new Date(playlist.targetCompletionDate);
            targetFormatted = format(target, 'MMM d, yyyy');
            const diffDays = Math.max(1, Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            const req = (remainingSeconds / 3600) / diffDays;
            requiredDailyHours = `${req.toFixed(1)}h/day`;
          }

          return (
            <Card key={playlist.id} className="relative group border-slate-800/90 hover:border-indigo-500/40">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white light:text-slate-900 truncate group-hover:text-indigo-400 transition-colors">
                    {playlist.title}
                  </h4>
                  <p className="text-xs text-slate-400 light:text-slate-500 truncate">
                    {playlist.channelTitle || 'Course Roadmap'}
                  </p>
                </div>
                {onSyncPlaylist && (
                  <button
                    onClick={() => onSyncPlaylist(playlist.id)}
                    disabled={isSyncing}
                    title="Synchronize playlist with YouTube"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-xs"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>

              {/* Progress bars: video-count & duration */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Video Progress:</span>
                    <span className="font-semibold text-slate-200 light:text-slate-800">
                      {playlist.completedVideos} / {playlist.totalVideos} videos ({videoProgress}%)
                    </span>
                  </div>
                  <Progress value={videoProgress} />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Duration Progress:</span>
                    <span className="font-semibold text-emerald-400">
                      {(playlist.completedDurationSeconds / 3600).toFixed(1)}h / {(playlist.totalDurationSeconds / 3600).toFixed(1)}h ({durationProgress}%)
                    </span>
                  </div>
                  <Progress value={durationProgress} barClassName="bg-gradient-to-r from-emerald-500 to-cyan-400" />
                </div>
              </div>

              {/* Metrics footer */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/60 light:bg-slate-100 text-xs border border-slate-800/60">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Remaining: <strong className="text-slate-200 light:text-slate-800">{remainingHours}h</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Target: <strong className="text-slate-200 light:text-slate-800">{targetFormatted}</strong></span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Required Study Pace: <strong className="text-indigo-400">{requiredDailyHours}</strong>
                </span>
                <Link
                  href="/playlists"
                  className="font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Continue Course →
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
