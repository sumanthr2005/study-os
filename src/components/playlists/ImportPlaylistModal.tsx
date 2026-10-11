'use client';

import React, { useState } from 'react';
import { X, Youtube, Sparkles, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ImportPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export function ImportPlaylistModal({ isOpen, onClose, onImportSuccess }: ImportPlaylistModalProps) {
  const { showToast } = useApp();
  const [urlOrId, setUrlOrId] = useState('');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 20);
    return d.toISOString().split('T')[0];
  });
  const [availableHours, setAvailableHours] = useState('2.5');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlOrId.trim()) {
      setErrorMsg('Please enter a YouTube playlist URL or ID.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlOrId: urlOrId.trim(),
          targetDate,
          availableHoursPerDay: availableHours,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import playlist');
      }

      showToast('Roadmap Created! 🎉', data.message || 'Playlist successfully imported!', 'success');
      onImportSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error importing playlist. Verify URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const setSampleStriver = () => {
    setUrlOrId('https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_st8');
  };

  const setSampleCS50 = () => {
    setUrlOrId('https://www.youtube.com/playlist?list=PLhQjrBD2T382_RPoAz-zfYGFiPW42TzRQ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 light:bg-white light:border-slate-200 light:text-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Youtube className="h-5 w-5 fill-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Import YouTube Roadmap</h3>
              <p className="text-xs text-slate-400">Transform any playlist into trackable learning tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 light:hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              YouTube Playlist URL or ID
            </label>
            <input
              type="text"
              value={urlOrId}
              onChange={e => setUrlOrId(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=PLgUwDviB..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-indigo-500 focus:outline-none text-sm placeholder:text-slate-500 light:bg-slate-50 light:border-slate-300"
              required
            />
            {/* Quick Presets */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400">Quick fill:</span>
              <button
                type="button"
                onClick={setSampleStriver}
                className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
              >
                Striver A2Z DSA
              </button>
              <button
                type="button"
                onClick={setSampleCS50}
                className="text-[11px] px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20"
              >
                CS50 Intro
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-purple-400" />
                Target Completion Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-indigo-500 focus:outline-none text-xs light:bg-slate-50 light:border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                Available Study (Hours/Day)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={availableHours}
                onChange={e => setAvailableHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-indigo-500 focus:outline-none text-xs light:bg-slate-50 light:border-slate-300"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-slate-400">
            <span className="text-indigo-300 font-semibold flex items-center gap-1 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              Dynamic Pacing Engine
            </span>
            Study OS calculates exact video durations, required daily study pace, and automatically tracks your completion progress over time.
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Importing & Calculating...</span>
                </>
              ) : (
                <span>Import Playlist</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
