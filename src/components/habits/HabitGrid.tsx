'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { HabitItem } from '@/types';
import { Flame, Check, Plus, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';

export function HabitGrid({
  initialHabits = [],
  onHabitToggled,
}: {
  initialHabits: HabitItem[];
  onHabitToggled?: () => void;
}) {
  const [habits, setHabits] = useState<HabitItem[]>(initialHabits);
  const [newHabitName, setNewHabitName] = useState('');
  const [newCategory, setNewCategory] = useState('Learning');

  // Last 7 days headers
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    return {
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE'),
      dayNum: format(d, 'd'),
      isToday: i === 6,
    };
  });

  const handleToggle = async (habitId: string, dateStr: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr }),
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(prev =>
          prev.map(h => {
            if (h.id !== habitId) return h;
            const completions = h.completions || [];
            const exists = completions.some(c => c.date === dateStr);
            const nextCompletions = exists
              ? completions.filter(c => c.date !== dateStr)
              : [...completions, { id: 'temp', date: dateStr, completed: true }];
            return {
              ...h,
              currentStreak: data.currentStreak !== undefined ? data.currentStreak : h.currentStreak,
              completions: nextCompletions,
            };
          })
        );
        onHabitToggled?.();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHabitName.trim(),
          category: newCategory,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(prev => [...prev, data.habit]);
        setNewHabitName('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Add Habit */}
      <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 to-[#0c1220]">
        <form onSubmit={handleCreateHabit} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="New habit (e.g. Read 20 pages CS literature, Wake up at 6 AM, No social media)..."
            value={newHabitName}
            onChange={e => setNewHabitName(e.target.value)}
            className="flex-1 min-w-[240px] rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 light:bg-slate-50 light:text-slate-900"
          />

          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 light:bg-slate-50 light:text-slate-900"
          >
            <option value="Learning">Learning</option>
            <option value="Health">Health</option>
            <option value="Fitness">Fitness</option>
            <option value="Focus">Focus</option>
          </select>

          <Button type="submit" variant="primary" size="sm" icon={Plus}>
            Add Habit
          </Button>
        </form>
      </Card>

      {/* Habit Matrix Table */}
      <Card className="overflow-x-auto p-0 border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
              <th className="p-4 font-semibold">Habit</th>
              <th className="p-4 font-semibold text-center w-24">Streak</th>
              {days.map(d => (
                <th
                  key={d.dateStr}
                  className={`p-3 text-center w-14 font-semibold ${
                    d.isToday ? 'bg-indigo-600/10 text-indigo-400 font-bold' : ''
                  }`}
                >
                  <div>{d.dayName}</div>
                  <div className="text-[10px] text-slate-500">{d.dayNum}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {habits.map(habit => {
              const completedDates = new Set((habit.completions || []).map(c => c.date));

              return (
                <tr key={habit.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-100 light:text-slate-900">
                      {habit.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{habit.category}</div>
                  </td>

                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Flame className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {habit.currentStreak}d
                    </span>
                  </td>

                  {days.map(d => {
                    const isDone = completedDates.has(d.dateStr);

                    return (
                      <td
                        key={d.dateStr}
                        className={`p-2 text-center ${d.isToday ? 'bg-indigo-600/5' : ''}`}
                      >
                        <button
                          onClick={() => handleToggle(habit.id, d.dateStr)}
                          className={`h-8 w-8 mx-auto rounded-xl flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 scale-105'
                              : 'bg-slate-900/80 border border-slate-700/60 text-transparent hover:border-slate-500 hover:text-slate-500'
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
