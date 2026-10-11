'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { formatSecondsToClock } from '@/lib/utils';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Flame,
  Brain,
  Layers,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlaylistOption {
  id: string;
  title: string;
  videos?: Array<{ id: string; title: string }>;
}

export function StudyTimer({
  playlists = [],
  recentTasks = [],
}: {
  playlists?: PlaylistOption[];
  recentTasks?: Array<{ id: string; title: string }>;
}) {
  const {
    timer,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    saveStudySession,
    showToast,
  } = useApp();

  const [subject, setSubject] = useState(timer.subject || 'DSA');
  const [mode, setMode] = useState<'stopwatch' | 'pomodoro' | 'custom'>(timer.mode === 'stopwatch' ? 'stopwatch' : 'pomodoro');
  const [customMinutes, setCustomMinutes] = useState(45);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(timer.playlistId || '');
  const [selectedVideoId, setSelectedVideoId] = useState<string>(timer.playlistVideoId || '');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(timer.taskId || '');
  const [isDeepWork, setIsDeepWork] = useState(timer.isDeepWork);
  const [sessionNotes, setSessionNotes] = useState(timer.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  const handleStart = () => {
    let durationSec = 25 * 60;
    if (mode === 'stopwatch') durationSec = 0;
    else if (mode === 'pomodoro') durationSec = 25 * 60;
    else if (mode === 'custom') durationSec = customMinutes * 60;

    startTimer({
      mode,
      subject,
      secondsRemaining: durationSec,
      totalDurationSeconds: durationSec,
      playlistId: selectedPlaylistId || undefined,
      playlistVideoId: selectedVideoId || undefined,
      taskId: selectedTaskId || undefined,
      isDeepWork,
      notes: sessionNotes,
    });

    showToast('Timer Started', `Focused ${mode} session for ${subject} initiated.`, 'info');
  };

  const handleFinishAndSave = async () => {
    setIsSaving(true);
    try {
      await saveStudySession();
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    } finally {
      setIsSaving(false);
    }
  };

  const displayTime = formatSecondsToClock(timer.secondsRemaining);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Timer Display */}
      <Card className="lg:col-span-2 flex flex-col items-center justify-center p-8 sm:p-12 border-indigo-500/30 bg-gradient-to-b from-[#0e1629] via-[#0b1120] to-[#090d16] text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Status Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <Badge variant={timer.isRunning ? 'success' : 'default'}>
            {timer.isRunning ? 'Session Active' : 'Timer Ready'}
          </Badge>
          <Badge variant="purple" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            {isDeepWork ? 'Deep Work Focus (+20% XP)' : 'Standard Focus'}
          </Badge>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            {timer.subject}
          </span>
        </div>

        {/* Big Digital Display */}
        <div className="relative my-6 select-none">
          <div className="text-7xl sm:text-8xl md:text-9xl font-mono font-black tracking-tight text-white drop-shadow-[0_0_35px_rgba(99,102,241,0.25)] light:text-slate-900">
            {displayTime}
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-2">
            Mode: {timer.mode.toUpperCase()}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {!timer.isRunning ? (
            <Button
              variant="primary"
              size="lg"
              onClick={timer.secondsRemaining > 0 && timer.secondsRemaining !== timer.totalDurationSeconds ? resumeTimer : handleStart}
              icon={Play}
              className="px-8 shadow-indigo-600/30 text-lg"
            >
              {timer.secondsRemaining > 0 && timer.secondsRemaining !== timer.totalDurationSeconds ? 'Resume Session' : 'Start Focus'}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              onClick={pauseTimer}
              icon={Pause}
              className="px-8 text-lg"
            >
              Pause
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={resetTimer}
            icon={RotateCcw}
            title="Reset timer to start"
          >
            Reset
          </Button>

          <Button
            variant="success"
            size="lg"
            onClick={handleFinishAndSave}
            disabled={isSaving}
            icon={CheckCircle2}
            className="shadow-emerald-600/30"
          >
            {isSaving ? 'Saving...' : 'Finish & Save XP'}
          </Button>
        </div>
      </Card>

      {/* Session Configuration Panel */}
      <Card className="space-y-4 p-6 border-slate-800">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 light:text-slate-800 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          Session Setup
        </h4>

        {/* Mode selector */}
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Timer Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {(['pomodoro', 'stopwatch', 'custom'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  mode === m
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {m === 'pomodoro' ? 'Pomodoro (25m)' : m}
              </button>
            ))}
          </div>
        </div>

        {/* Custom duration slider if custom */}
        {mode === 'custom' && (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Duration:</span>
              <strong className="text-indigo-400">{customMinutes} minutes</strong>
            </div>
            <input
              type="range"
              min={5}
              max={180}
              step={5}
              value={customMinutes}
              onChange={e => setCustomMinutes(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        )}

        {/* Subject selector */}
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Study Subject</label>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 light:bg-slate-50 light:text-slate-900"
          >
            <option value="DSA">DSA (Data Structures & Algorithms)</option>
            <option value="LeetCode Practice">LeetCode Problem Solving</option>
            <option value="System Design">System Design (HLD / LLD)</option>
            <option value="DBMS">Database Management (DBMS)</option>
            <option value="Operating Systems">Operating Systems (OS)</option>
            <option value="Computer Networks">Computer Networks (CN)</option>
            <option value="Full-Stack Project">Full-Stack Project Development</option>
            <option value="Revision">Spaced Repetition Review</option>
            <option value="Mock Interview">Mock Interview / Assessment</option>
          </select>
        </div>

        {/* Associated Playlist Roadmap */}
        {playlists.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
              Link to Playlist Course
            </label>
            <select
              value={selectedPlaylistId}
              onChange={e => {
                setSelectedPlaylistId(e.target.value);
                setSelectedVideoId('');
              }}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 light:bg-slate-50 light:text-slate-900"
            >
              <option value="">-- None (Standalone Session) --</option>
              {playlists.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Associated Video inside Playlist */}
        {selectedPlaylist && selectedPlaylist.videos && selectedPlaylist.videos.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
              Specific Video Lecture
            </label>
            <select
              value={selectedVideoId}
              onChange={e => setSelectedVideoId(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 light:bg-slate-50 light:text-slate-900"
            >
              <option value="">-- General Playlist Study --</option>
              {selectedPlaylist.videos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Deep Work Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-200 light:text-slate-800">Deep Work Mode</span>
          </div>
          <input
            type="checkbox"
            checked={isDeepWork}
            onChange={e => setIsDeepWork(e.target.checked)}
            className="h-4 w-4 accent-indigo-500 rounded cursor-pointer"
          />
        </div>

        {/* Session notes */}
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Session Notes</label>
          <textarea
            value={sessionNotes}
            onChange={e => setSessionNotes(e.target.value)}
            placeholder="Key concepts reviewed, theorems proved, bugs squashed..."
            rows={2}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 light:bg-slate-50 light:text-slate-900"
          />
        </div>
      </Card>
    </div>
  );
}
