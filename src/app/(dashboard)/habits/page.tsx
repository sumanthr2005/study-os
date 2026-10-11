import React from 'react';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { HabitGrid } from '@/components/habits/HabitGrid';
import { Badge } from '@/components/ui';
import { Flame } from 'lucide-react';
import { HabitItem } from '@/types';

export const revalidate = 0;

export default async function HabitsPage() {
  const user = await getOrCreateDefaultUser();

  const habits = await prisma.habit.findMany({
    where: { userId: user.id, isArchived: false },
    include: {
      completions: {
        take: 30,
        orderBy: { date: 'desc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-amber-500 fill-amber-500" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              Habits & Consistency Matrix
            </h1>
            <Badge variant="warning">{user.currentStreak} Day Streak</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build discipline with daily atomic habits across Learning, Fitness, Health, and Digital Focus.
          </p>
        </div>
      </div>

      <HabitGrid initialHabits={habits as unknown as HabitItem[]} />
    </div>
  );
}
