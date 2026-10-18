'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp, Lightbulb, CheckCircle2, Flame } from 'lucide-react';

interface DayStudyData {
  day: string;
  hours: number;
  isToday?: boolean;
}

interface WeeklyReviewCardProps {
  weeklyData: DayStudyData[];
  totalWeeklyHours: number;
  totalProblemsWeek: number;
  weeklyHabitRate: number;
  heuristicSuggestion: string;
}

export function WeeklyReviewCard({
  weeklyData = [],
  totalWeeklyHours = 0,
  totalProblemsWeek = 0,
  weeklyHabitRate = 0,
  heuristicSuggestion,
}: WeeklyReviewCardProps) {
  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-[#0c1220]/90 to-[#070b14]/90 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Weekly Flight Analysis</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                7-Day Window
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Verified study velocity & problem-solving throughput</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Total Focused</span>
          <p className="text-sm font-bold text-cyan-400">{totalWeeklyHours.toFixed(1)} hrs</p>
        </div>
      </div>

      <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Bar Chart */}
        <div className="lg:col-span-8 h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="day"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                unit="h"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DayStudyData;
                    return (
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs shadow-xl">
                        <p className="font-semibold text-slate-200">{data.day}</p>
                        <p className="text-indigo-400 font-bold">{data.hours} hours studied</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isToday ? '#22d3ee' : '#6366f1'}
                    opacity={entry.isToday ? 1 : 0.75}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Key Stats & Heuristic Recommendation */}
        <div className="lg:col-span-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase">DSA Solved</span>
              <p className="text-xs font-bold text-purple-400">{totalProblemsWeek} Problems</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Habit Cons.</span>
              <p className="text-xs font-bold text-emerald-400">{weeklyHabitRate}% Rate</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/25 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold mb-1">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>Next Orbit Recommendation:</span>
            </div>
            <p className="text-[11px] text-slate-300 light:text-slate-600 leading-relaxed">
              {heuristicSuggestion}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
