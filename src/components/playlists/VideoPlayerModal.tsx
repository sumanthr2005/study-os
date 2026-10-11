'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Timer, BookOpen, Repeat, Save, ExternalLink } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: any;
  playlistTitle?: string;
  onToggleComplete?: (videoId: string, currentCompleted: boolean) => void;
  onMarkComplete?: (video: any) => void;
  onNotesSaved?: () => void;
}

export function VideoPlayerModal({
  isOpen,
  onClose,
  video,
  playlistTitle = 'Playlist Roadmap',
  onToggleComplete,
  onMarkComplete,
  onNotesSaved,
}: VideoPlayerModalProps) {
  const { startTimer, showToast } = useApp();
  const [notes, setNotes] = useState(video?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [revisionDays, setRevisionDays] = useState('3');
  const [isSchedulingRev, setIsSchedulingRev] = useState(false);

  if (!isOpen || !video) return null;

  const handleStartTimerForVideo = () => {
    startTimer({
      subject: 'DSA',
      playlistId: video.playlistId,
      playlistTitle,
      playlistVideoId: video.id,
      playlistVideoTitle: video.title,
      mode: 'pomodoro',
      secondsRemaining: 25 * 60,
      totalDurationSeconds: 25 * 60,
    });
    showToast('Study Timer Launched', `Tracking study session for "${video.title}"`, 'info');
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/playlist-videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        showToast('Notes Saved', 'Your markdown notes have been updated.', 'success');
        onNotesSaved?.();
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleScheduleRevision = async () => {
    setIsSchedulingRev(true);
    try {
      const res = await fetch('/api/revisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: video.title,
          subjectOrTopic: playlistTitle,
          intervalDays: parseInt(revisionDays, 10),
          referenceType: 'VIDEO',
          referenceId: video.id,
          notes,
        }),
      });
      if (res.ok) {
        showToast('Revision Scheduled!', `Spaced repetition set for +${revisionDays} days.`, 'success');
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    } finally {
      setIsSchedulingRev(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 sm:p-6 text-slate-100 my-auto light:bg-white light:border-slate-200 light:text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 pr-4">
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
              {playlistTitle} • Lesson {video.position}
            </span>
            <h3 className="font-bold text-base sm:text-lg text-slate-100 light:text-slate-900 line-clamp-1">
              {video.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Embed Player */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black mb-4 border border-slate-800">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeVideoId}?autoplay=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mb-5 light:bg-slate-50 light:border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onToggleComplete) onToggleComplete(video.id, video.completed);
                else if (onMarkComplete) onMarkComplete(video);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                video.completed
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{video.completed ? 'Completed ✅' : 'Mark Completed'}</span>
            </button>

            <button
              onClick={handleStartTimerForVideo}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-all"
            >
              <Timer className="h-4 w-4 text-indigo-400" />
              <span>Study with Timer</span>
            </button>

            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              {formatDuration(video.durationSeconds)}
            </span>
          </div>

          {/* Spaced Revision dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 hidden sm:inline">Revise in:</span>
            <select
              value={revisionDays}
              onChange={e => setRevisionDays(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              <option value="1">Tomorrow (+1d)</option>
              <option value="3">3 Days</option>
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
            </select>
            <button
              onClick={handleScheduleRevision}
              disabled={isSchedulingRev}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20"
            >
              <Repeat className="h-3.5 w-3.5" />
              <span>Schedule</span>
            </button>
          </div>
        </div>

        {/* Video Notes Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 light:text-slate-700 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              Lecture Notes (Markdown Supported)
            </label>
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
            </button>
          </div>
          <textarea
            rows={4}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Write key takeaways, edge cases, formulas, or code snippets..."
            className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-indigo-500 focus:outline-none text-xs font-mono text-slate-200 placeholder:text-slate-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900"
          />
        </div>
      </div>
    </div>
  );
}
