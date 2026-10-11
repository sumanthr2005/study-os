'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge, Progress } from '@/components/ui';
import { VideoPlayerModal } from '@/components/playlists/VideoPlayerModal';
import { SyncResultModal } from '@/components/playlists/SyncResultModal';
import { formatSecondsToClock, formatDuration } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import {
  PlaySquare,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  RotateCw,
  Play,
  ArrowLeft,
  Timer,
  AlertTriangle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { startTimer, showToast } = useApp();
  const playlistId = params.id as string;

  const [playlist, setPlaylist] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const fetchPlaylistDetail = async () => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}`);
      if (res.ok) {
        const data = await res.json();
        setPlaylist(data.playlist);
      } else {
        router.push('/playlists');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (playlistId) fetchPlaylistDetail();
  }, [playlistId]);

  const handleToggleVideo = async (video: any) => {
    const nextCompleted = !video.completed;
    try {
      const res = await fetch(`/api/playlist-videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: nextCompleted }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.xpAwarded) {
          showToast('Lesson Completed! 🚀', `Marked "${video.title}" done. +${data.xpAwarded} XP!`, 'success');
        }
        await fetchPlaylistDetail();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSync = async (testScenario: boolean = false) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/playlists/${playlistId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testScenario }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSyncResult(data.syncResult);
      setIsSyncModalOpen(true);
      showToast('Sync Successful', 'Roadmap up to date with YouTube.', 'success');
      await fetchPlaylistDetail();
    } catch (err: any) {
      showToast('Sync Error', err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartTimerWithVideo = (video: any) => {
    startTimer({
      subject: playlist?.title ? `${playlist.title.slice(0, 20)}...` : 'DSA',
      playlistId: playlist?.id,
      playlistTitle: playlist?.title,
      playlistVideoId: video.id,
      playlistVideoTitle: video.title,
      secondsRemaining: video.durationSeconds || 25 * 60,
      totalDurationSeconds: video.durationSeconds || 25 * 60,
    });
    router.push('/timer');
  };

  if (loading || !playlist) {
    return <div className="p-8 text-center text-slate-400">Loading roadmap details...</div>;
  }

  const videos: any[] = playlist.videos || [];
  const totalVideos = videos.length;
  const completedVideos = videos.filter(v => v.completed).length;
  const totalDuration = videos.reduce((acc, v) => acc + v.durationSeconds, 0);
  const completedDuration = videos.filter(v => v.completed).reduce((acc, v) => acc + v.durationSeconds, 0);
  const remainingDuration = Math.max(0, totalDuration - completedDuration);

  const videoProgress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  const durationProgress = totalDuration > 0 ? Math.round((completedDuration / totalDuration) * 100) : 0;

  const filteredVideos = videos.filter(v => {
    if (filter === 'pending') return !v.completed;
    if (filter === 'completed') return v.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Back button & top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/playlists')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Playlists
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCw}
            disabled={isSyncing}
            onClick={() => handleSync(false)}
          >
            {isSyncing ? 'Syncing...' : 'Sync Playlist'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Sparkles}
            disabled={isSyncing}
            onClick={() => handleSync(true)}
            title="Simulate 7 newly uploaded lectures"
          >
            Test +7 New Videos
          </Button>
        </div>
      </div>

      {/* Playlist Overview Header Card */}
      <Card className="border-indigo-500/30 bg-gradient-to-r from-[#0d1527] via-[#0c1220] to-[#090d16] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="purple">{playlist.channelTitle || 'Course Roadmap'}</Badge>
              {playlist.targetCompletionDate && (
                <Badge variant="info">
                  Target: {format(new Date(playlist.targetCompletionDate), 'MMM d, yyyy')}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">{playlist.title}</h1>
            {playlist.description && (
              <p className="text-xs text-slate-300 max-w-2xl line-clamp-2">{playlist.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs shrink-0">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">Videos</span>
              <strong className="text-base text-white">{completedVideos} / {totalVideos}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">Time Done</span>
              <strong className="text-base text-emerald-400">{(completedDuration / 3600).toFixed(1)}h</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] block">Remaining</span>
              <strong className="text-base text-amber-400">{(remainingDuration / 3600).toFixed(1)}h</strong>
            </div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-800">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Video Progress:</span>
              <span className="font-semibold text-white">{videoProgress}% ({completedVideos}/{totalVideos})</span>
            </div>
            <Progress value={videoProgress} />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Duration Progress:</span>
              <span className="font-semibold text-emerald-400">{durationProgress}%</span>
            </div>
            <Progress value={durationProgress} barClassName="bg-gradient-to-r from-emerald-500 to-cyan-400" />
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {(['all', 'pending', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                filter === tab ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab} ({tab === 'all' ? totalVideos : tab === 'pending' ? totalVideos - completedVideos : completedVideos})
            </button>
          ))}
        </div>
      </div>

      {/* Video Item Cards */}
      <div className="space-y-2.5">
        {filteredVideos.map(video => (
          <div
            key={video.id}
            className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
              video.completed
                ? 'bg-slate-900/30 border-slate-800/50 opacity-75'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => handleToggleVideo(video)}
                className={`p-1 transition-colors ${video.completed ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'}`}
              >
                {video.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </button>

              <div className="text-xs font-mono text-slate-500 w-6">#{video.position}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4
                    onClick={() => setSelectedVideo(video)}
                    className={`text-xs sm:text-sm font-semibold truncate cursor-pointer hover:text-indigo-400 transition-colors ${
                      video.completed ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {video.title}
                  </h4>
                  {video.isNew && <Badge variant="purple">NEW</Badge>}
                  {video.isUnavailable && <Badge variant="danger">Unavailable on YouTube</Badge>}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3 text-slate-500" />
                    {formatSecondsToClock(video.durationSeconds)}
                  </span>
                  {video.completedAt && (
                    <span className="text-emerald-400/80">
                      ✓ Done {format(new Date(video.completedAt), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={Timer}
                onClick={() => handleStartTimerWithVideo(video)}
                title="Launch Study Timer on this video"
              >
                Study
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Play}
                onClick={() => setSelectedVideo(video)}
              >
                Watch
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player */}
      <VideoPlayerModal
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        video={selectedVideo}
        playlistTitle={playlist.title}
        onMarkComplete={handleToggleVideo}
      />

      {/* Sync Result Details */}
      <SyncResultModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncResult={syncResult}
      />
    </div>
  );
}
