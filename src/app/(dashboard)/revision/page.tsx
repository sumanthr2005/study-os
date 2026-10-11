'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { Repeat, CheckCircle2, Clock, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export default function RevisionPage() {
  const { showToast } = useApp();
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevisions = async () => {
    try {
      const res = await fetch('/api/revisions');
      if (res.ok) {
        const data = await res.json();
        setRevisions(data.revisions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, []);

  const handleCompleteRevision = async (id: string) => {
    try {
      const res = await fetch(`/api/revisions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
      if (res.ok) {
        showToast('Revision Completed! 🧠', 'Memory retention schedule updated.', 'success');
        await fetchRevisions();
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
            <Repeat className="h-6 w-6 text-rose-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              Spaced Repetition Engine
            </h1>
            <Badge variant="danger">Ebbinghaus Curve</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Systematic spaced revision (Day 1, 3, 7, 14, 30) ensuring lifelong concept retention for tech interviews.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {revisions.map(rev => (
          <Card
            key={rev.id}
            className="flex items-center justify-between gap-4 p-4 border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                onClick={() => handleCompleteRevision(rev.id)}
                disabled={rev.completed}
                className={`p-1 transition-colors ${
                  rev.completed
                    ? 'text-emerald-400'
                    : 'text-slate-500 hover:text-emerald-400'
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-white truncate">{rev.title}</h4>
                  <Badge variant="purple">Interval: {rev.intervalDays}d</Badge>
                  <Badge variant="default">Rep #{rev.repetitionNumber}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Topic: {rev.subjectOrTopic} • Scheduled:{' '}
                  {format(new Date(rev.scheduledFor), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            <Button
              variant={rev.completed ? 'ghost' : 'primary'}
              size="sm"
              disabled={rev.completed}
              onClick={() => handleCompleteRevision(rev.id)}
            >
              {rev.completed ? 'Revised' : 'Mark Revised'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
