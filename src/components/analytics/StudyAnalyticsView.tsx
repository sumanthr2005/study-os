'use client';

import React from 'react';
import { Card, Button, Badge, Progress } from '@/components/ui';
import { BarChart3, Download, Clock, Brain, Flame, Target, Award } from 'lucide-react';

interface AnalyticsProps {
  totalHours: number;
  deepWorkPercent: number;
  streak: number;
  productivityScore: number;
  subjectBreakdown: Record<string, number>; // in seconds
  sessionsCount: number;
}

export function StudyAnalyticsView({
  totalHours,
  deepWorkPercent,
  streak,
  productivityScore,
  subjectBreakdown = {},
  sessionsCount,
}: AnalyticsProps) {
  const handleExportJson = () => {
    window.open('/api/export?format=json', '_blank');
  };

  const handleExportCsv = () => {
    window.open('/api/export?format=csv', '_blank');
  };

  const totalSubjectSeconds = Object.values(subjectBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Top metrics summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-indigo-500/20">
          <p className="text-xs font-semibold text-slate-400">Total Hours Studied</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-extrabold text-white">{totalHours.toFixed(1)}h</h3>
            <span className="text-xs text-indigo-400 font-semibold">{sessionsCount} sessions</span>
          </div>
        </Card>

        <Card className="border-purple-500/20">
          <p className="text-xs font-semibold text-slate-400">Deep Work Ratio</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-extrabold text-purple-400">{deepWorkPercent}%</h3>
            <span className="text-xs text-slate-400">Distraction-free</span>
          </div>
        </Card>

        <Card className="border-amber-500/20">
          <p className="text-xs font-semibold text-slate-400">Active Study Streak</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-extrabold text-amber-400">{streak} Days</h3>
            <Flame className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
        </Card>

        <Card className="border-emerald-500/20">
          <p className="text-xs font-semibold text-slate-400">Productivity Rating</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-extrabold text-emerald-400">{productivityScore}/100</h3>
            <Award className="h-5 w-5 text-emerald-400" />
          </div>
        </Card>
      </div>

      {/* Subject Distribution Breakdown */}
      <Card className="border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white light:text-slate-900">
              Subject Time Distribution
            </h3>
          </div>
          <span className="text-xs text-slate-400">Actual logged study time</span>
        </div>

        <div className="space-y-3">
          {Object.entries(subjectBreakdown).map(([subject, seconds]) => {
            const hours = (seconds / 3600).toFixed(1);
            const percent = totalSubjectSeconds > 0
              ? Math.round((seconds / totalSubjectSeconds) * 100)
              : 0;

            return (
              <div key={subject} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200 light:text-slate-800">
                    {subject}
                  </span>
                  <span className="text-slate-400">
                    {hours}h ({percent}%)
                  </span>
                </div>
                <Progress value={percent} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Data Export & Backup Actions */}
      <Card className="border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white light:text-slate-900">
            Export Your Study OS Data
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Full export of study sessions, playlist progress, LeetCode records, habits, and tasks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportJson}>
            Export JSON
          </Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCsv}>
            Export Sessions CSV
          </Button>
        </div>
      </Card>
    </div>
  );
}
