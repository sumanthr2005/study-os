'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { PlaylistCard } from '@/components/playlists/PlaylistCard';
import { ImportPlaylistModal } from '@/components/playlists/ImportPlaylistModal';
import { SyncResultModal } from '@/components/playlists/SyncResultModal';
import { PlaySquare, Plus, RefreshCw, Sparkles, Filter } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function PlaylistsPage() {
  const { showToast } = useApp();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<any | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch('/api/playlists');
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data.playlists || []);
      }
    } catch (e) {
      console.error('Failed to load playlists', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleSync = async (playlistId: string, expandScenario: boolean = false) => {
    setSyncingId(playlistId);
    try {
      const res = await fetch(`/api/playlists/${playlistId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testScenario: expandScenario }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync playlist');
      }

      setSyncResult(data.syncResult);
      setIsSyncModalOpen(true);
      showToast(
        'Playlist Synchronized!',
        `Identified ${data.syncResult?.new_videos || 0} new videos and preserved all completion progress.`,
        'success'
      );

      await fetchPlaylists();
    } catch (err: any) {
      showToast('Sync Failed', err.message, 'error');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <PlaySquare className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              YouTube Playlist Roadmaps
            </h1>
            <Badge variant="purple">Live Sync Engine</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Turn YouTube courses into trackable study curriculums with completion timestamps, remaining hours, and required daily pace.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsImportModalOpen(true)}
          >
            Import Playlist
          </Button>
        </div>
      </div>

      {/* Playlist Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse h-64 bg-slate-900/40 border-slate-800">
              <div className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <Card className="text-center py-16 border-dashed border-slate-800">
          <PlaySquare className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white light:text-slate-900">No Roadmaps Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Import any YouTube playlist (DSA, System Design, Web Development) to calculate dynamic completion dates and study schedules.
          </p>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsImportModalOpen(true)}
          >
            Import Your First Playlist
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {playlists.map(playlist => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onSync={handleSync}
              isSyncing={syncingId === playlist.id}
            />
          ))}
        </div>
      )}

      {/* Import Modal */}
      <ImportPlaylistModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchPlaylists}
      />

      {/* Sync Result Details Modal */}
      <SyncResultModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncResult={syncResult}
      />
    </div>
  );
}
