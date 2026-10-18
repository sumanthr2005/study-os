'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { DailyQuestItem } from '@/lib/gamification';
import { CheckCircle2, Circle, Zap, Award, Trophy, ChevronRight, Sparkles, Shield } from 'lucide-react';

interface DailyQuestsWidgetProps {
  quests: DailyQuestItem[];
  achievementsCount: number;
  totalAchievements: number;
}

export function DailyQuestsWidget({
  quests = [],
  achievementsCount = 0,
  totalAchievements = 10,
}: DailyQuestsWidgetProps) {
  const [activeTab, setActiveTab] = useState<'quests' | 'achievements'>('quests');
  const completedCount = quests.filter(q => q.completed).length;

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-[#0c1220]/90 to-[#070b14]/90 overflow-hidden shadow-xl">
      {/* Header with Tab switcher */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Mission Ops & Quests</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                {completedCount}/{quests.length} Done
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Validated daily learning objectives</p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('quests')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeTab === 'quests'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily Quests
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeTab === 'achievements'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Achievements ({achievementsCount})
          </button>
        </div>
      </div>

      {activeTab === 'quests' ? (
        <div className="space-y-3 pt-4">
          {quests.map(quest => {
            const progressPercent = Math.min(
              100,
              quest.target > 0 ? Math.round((quest.current / quest.target) * 100) : 0
            );

            return (
              <div
                key={quest.id}
                className={`p-3 rounded-xl border transition-all ${
                  quest.completed
                    ? 'bg-emerald-950/15 border-emerald-500/30 text-slate-200'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {quest.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                    <span className="text-xs font-semibold truncate">{quest.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono font-medium text-slate-400">
                      {quest.current}/{quest.target} {quest.unit}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        quest.completed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      +{quest.rewardXp} XP
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      quest.completed
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3 pt-4">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Achievement Hall</h4>
                <p className="text-[11px] text-slate-400">
                  {achievementsCount} of {totalAchievements} milestones unlocked
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-amber-400">
                {Math.round((achievementsCount / (totalAchievements || 1)) * 100)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              <span className="text-slate-300 truncate">Deep Work Protocol</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-300 truncate">Century Solver</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-slate-300 truncate">Iron Will Streak</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-slate-300 truncate">Roadmap Finisher</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
