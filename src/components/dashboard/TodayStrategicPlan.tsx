'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  PlaySquare,
  Repeat,
  Briefcase,
  Plus,
  ArrowRight,
} from 'lucide-react';

export interface StrategicItem {
  id: string;
  title: string;
  category: 'TASK' | 'REVISION' | 'ROADMAP' | 'PLACEMENT';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes?: number;
  subtitle?: string;
  actionUrl: string;
  isCompleted?: boolean;
}

interface TodayStrategicPlanProps {
  items: StrategicItem[];
}

export function TodayStrategicPlan({ items = [] }: TodayStrategicPlanProps) {
  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-[#0c1220]/90 via-[#0a0e1a]/90 to-[#070b14]/90 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Today&apos;s Strategic Flight Plan</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
              Prioritized by Deadlines
            </span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Automated queue merging high-leverage tasks, spaced revisions, and playlist milestones
          </p>
        </div>

        <Link
          href="/tasks"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>All Tasks</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="pt-4 space-y-2.5">
        {items.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800/80">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-xs font-semibold text-slate-200">Flight plan clear for today!</h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              No pressing deadlines or overdue revisions. Add a new high-leverage task or continue your roadmap.
            </p>
            <Link
              href="/tasks"
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Strategic Task</span>
            </Link>
          </div>
        ) : (
          items.map(item => {
            const isHighPriority = item.priority === 'URGENT' || item.priority === 'HIGH';

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="mt-0.5">
                    {item.category === 'REVISION' && (
                      <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                        <Repeat className="h-3.5 w-3.5" />
                      </div>
                    )}
                    {item.category === 'ROADMAP' && (
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        <PlaySquare className="h-3.5 w-3.5" />
                      </div>
                    )}
                    {item.category === 'PLACEMENT' && (
                      <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        <Briefcase className="h-3.5 w-3.5" />
                      </div>
                    )}
                    {item.category === 'TASK' && (
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Circle className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {item.estimatedMinutes && (
                    <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="h-3 w-3" />
                      {item.estimatedMinutes}m
                    </span>
                  )}

                  {isHighPriority && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25">
                      {item.priority}
                    </span>
                  )}

                  <Link
                    href={item.actionUrl}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
