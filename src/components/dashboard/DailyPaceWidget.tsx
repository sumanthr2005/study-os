import React from 'react';
import { Card, Progress, Badge } from '@/components/ui';
import { Target, Clock, Code2, Droplets, Flame, CheckCircle } from 'lucide-react';

interface DailyPaceProps {
  todayStudySeconds: number;
  dailyTargetMinutes: number;
  leetcodeToday: number;
  leetcodeDailyTarget: number;
  waterTodayMl: number;
  waterDailyTargetMl: number;
  habitsTodayDone: number;
  habitsTotal: number;
}

export function DailyPaceWidget({
  todayStudySeconds,
  dailyTargetMinutes,
  leetcodeToday,
  leetcodeDailyTarget,
  waterTodayMl,
  waterDailyTargetMl,
  habitsTodayDone,
  habitsTotal,
}: DailyPaceProps) {
  const todayStudyMinutes = Math.round(todayStudySeconds / 60);
  const studyProgress = Math.min(100, Math.round((todayStudyMinutes / Math.max(1, dailyTargetMinutes)) * 100));
  const leetcodeProgress = Math.min(100, Math.round((leetcodeToday / Math.max(1, leetcodeDailyTarget)) * 100));
  const waterProgress = Math.min(100, Math.round((waterTodayMl / Math.max(1, waterDailyTargetMl)) * 100));
  const habitProgress = habitsTotal > 0 ? Math.min(100, Math.round((habitsTodayDone / habitsTotal) * 100)) : 100;

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-[#0c1220]/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white light:text-slate-900">
            Today&apos;s Target Velocity
          </h3>
        </div>
        <Badge variant={studyProgress >= 100 ? 'success' : studyProgress >= 60 ? 'info' : 'warning'}>
          {studyProgress >= 100 ? 'Target Achieved 🎉' : `${studyProgress}% of Daily Goals`}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Study Time Target */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 light:text-slate-700 font-medium">
              <Clock className="h-4 w-4 text-indigo-400" />
              Study Time
            </span>
            <span className="font-semibold text-slate-200 light:text-slate-800">
              {(todayStudyMinutes / 60).toFixed(1)}h / {(dailyTargetMinutes / 60).toFixed(1)}h
            </span>
          </div>
          <Progress value={studyProgress} />
        </div>

        {/* LeetCode Target */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 light:text-slate-700 font-medium">
              <Code2 className="h-4 w-4 text-emerald-400" />
              LeetCode
            </span>
            <span className="font-semibold text-slate-200 light:text-slate-800">
              {leetcodeToday} / {leetcodeDailyTarget} solved
            </span>
          </div>
          <Progress value={leetcodeProgress} barClassName="bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>

        {/* Water Hydration Target */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 light:text-slate-700 font-medium">
              <Droplets className="h-4 w-4 text-cyan-400" />
              Hydration
            </span>
            <span className="font-semibold text-slate-200 light:text-slate-800">
              {waterTodayMl}ml / {waterDailyTargetMl}ml
            </span>
          </div>
          <Progress value={waterProgress} barClassName="bg-gradient-to-r from-cyan-500 to-blue-400" />
        </div>

        {/* Habits Done Target */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 light:text-slate-700 font-medium">
              <Flame className="h-4 w-4 text-amber-400" />
              Daily Habits
            </span>
            <span className="font-semibold text-slate-200 light:text-slate-800">
              {habitsTodayDone} / {habitsTotal} completed
            </span>
          </div>
          <Progress value={habitProgress} barClassName="bg-gradient-to-r from-amber-500 to-rose-400" />
        </div>
      </div>
    </Card>
  );
}
