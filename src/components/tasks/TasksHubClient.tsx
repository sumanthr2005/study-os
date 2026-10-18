'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { HabitGrid } from '@/components/habits/HabitGrid';
import { Card, Badge, Progress, Button } from '@/components/ui';
import { CheckSquare, Flame, Target, Calendar, CheckCircle2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { TaskItem, HabitItem } from '@/types';

type TabType = 'tasks' | 'habits' | 'goals';

interface TasksHubClientProps {
  initialTasks: TaskItem[];
  initialHabits: HabitItem[];
  initialGoals: any[];
  currentStreak: number;
}

function TasksHubInner({
  initialTasks,
  initialHabits,
  initialGoals,
  currentStreak,
}: TasksHubClientProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'tasks';
  const [activeTab, setActiveTab] = useState<TabType>(
    ['tasks', 'habits', 'goals'].includes(initialTab) ? initialTab : 'tasks'
  );

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && ['tasks', 'habits', 'goals'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const pendingTasksCount = initialTasks.filter(t => t.status !== 'COMPLETED').length;
  const completedGoalsCount = initialGoals.filter(g => g.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Tasks, Habits & Goals
                </h1>
                <Badge variant="info">Action Center</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Organize daily study tasks, maintain consistent atomic habits, and track milestone goals.
              </p>
            </div>
          </div>
        </div>

        {/* Telemetry Chips */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Pending Tasks</span>
            <span className="text-lg font-black text-indigo-400">{pendingTasksCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Active Streak</span>
            <span className="text-lg font-black text-amber-400">{currentStreak}d</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Goals Done</span>
            <span className="text-lg font-black text-emerald-400">{completedGoalsCount}/{initialGoals.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl w-full sm:w-auto overflow-x-auto">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          <span>Task Priorities</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400 font-bold">
            {initialTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('habits')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'habits'
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>Habits Matrix</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-400 font-bold">
            {initialHabits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'goals'
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>Placement Goals</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
            {initialGoals.length}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <TaskBoard initialTasks={initialTasks} />
        </div>
      )}

      {activeTab === 'habits' && (
        <div className="space-y-4">
          <HabitGrid initialHabits={initialHabits} />
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {initialGoals.map(goal => {
              const percent = Math.min(
                100,
                Math.round((goal.currentValue / Math.max(1, goal.targetValue)) * 100)
              );

              return (
                <Card key={goal.id} className="p-6 border-slate-800 bg-slate-900/50 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="info" className="mb-2">{goal.category}</Badge>
                      <h3 className="text-base font-bold text-white">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-xs text-slate-400 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <Badge variant={goal.status === 'COMPLETED' ? 'success' : 'default'}>
                      {goal.status}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Progress:</span>
                      <span className="font-semibold text-emerald-400">
                        {goal.currentValue} / {goal.targetValue} {goal.unit} ({percent}%)
                      </span>
                    </div>
                    <Progress value={percent} barClassName={percent >= 100 ? 'bg-emerald-500' : 'bg-cyan-500'} />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                      Deadline: {format(new Date(goal.deadline), 'MMM d, yyyy')}
                    </span>
                    <span>{goal.milestones?.length || 0} milestones</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function TasksHubClient(props: TasksHubClientProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Tasks Hub...</div>}>
      <TasksHubInner {...props} />
    </Suspense>
  );
}
