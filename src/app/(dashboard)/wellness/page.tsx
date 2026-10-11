'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { HeartPulse, Moon, Dumbbell, BookOpen, Save } from 'lucide-react';

export default function WellnessPage() {
  const { showToast } = useApp();
  const [sleepHours, setSleepHours] = useState('7.5');
  const [workoutMinutes, setWorkoutMinutes] = useState('45');
  const [readingMinutes, setReadingMinutes] = useState('30');
  const [saving, setSaving] = useState(false);

  const handleSaveWellness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sleepHours: Number(sleepHours),
          workoutMinutes: Number(workoutMinutes),
          readingMinutes: Number(readingMinutes),
        }),
      });
      if (res.ok) {
        showToast('Wellness Logged! 🌿', 'Rest, workout, and reading metrics saved.', 'success');
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-rose-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              Wellness & Recovery
            </h1>
            <Badge variant="danger">Health 10% Weight</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track restorative sleep, physical fitness, and non-screen reading to prevent burnout during placement prep.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveWellness} className="space-y-4">
        <Card className="p-6 border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Moon className="h-4 w-4 text-indigo-400" />
                Sleep Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="16"
                value={sleepHours}
                onChange={e => setSleepHours(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Dumbbell className="h-4 w-4 text-emerald-400" />
                Workout (Minutes)
              </label>
              <input
                type="number"
                step="5"
                min="0"
                max="240"
                value={workoutMinutes}
                onChange={e => setWorkoutMinutes(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-purple-400" />
                Book Reading (Minutes)
              </label>
              <input
                type="number"
                step="5"
                min="0"
                max="180"
                value={readingMinutes}
                onChange={e => setReadingMinutes(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" icon={Save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Daily Wellness'}
          </Button>
        </div>
      </form>
    </div>
  );
}
