'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { BookOpen, Plus, Pin, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';

export default function NotesPage() {
  const { showToast } = useApp();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('DSA');

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          tags: newTag,
        }),
      });
      if (res.ok) {
        showToast('Note Saved! 📝', 'Study note stored permanently.', 'success');
        setNewTitle('');
        setNewContent('');
        await fetchNotes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              Study Notes & Key Concept Log
            </h1>
            <Badge variant="purple">{notes.length} Notes</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Capture essential proofs, interview tricks, cheat-sheets, and architecture patterns.
          </p>
        </div>
      </div>

      {/* Quick Add Note Card */}
      <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 to-[#0c1220]">
        <form onSubmit={handleCreateNote} className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Note Title (e.g. Kadane's Algorithm Edge Cases, 2PC vs SAGA pattern)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="flex-1 min-w-[240px] rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Tags (e.g. Arrays, SystemDesign, OS)"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              className="w-48 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <textarea
            placeholder="Write markdown notes, code snippets, or takeaways..."
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            rows={3}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />

          <Button type="submit" variant="primary" size="sm" icon={Plus}>
            Save Study Note
          </Button>
        </form>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map(note => (
          <Card key={note.id} className="p-5 border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm text-white">{note.title}</h3>
              {note.isPinned && <Pin className="h-4 w-4 text-amber-400" />}
            </div>

            <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap line-clamp-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {note.content}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-indigo-400" />
                {note.tags || 'General'}
              </span>
              <span>{format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
