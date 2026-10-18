import React from 'react';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { TasksHubClient } from '@/components/tasks/TasksHubClient';
import { TaskItem, HabitItem } from '@/types';

export const revalidate = 0;

export default async function TasksPage() {
  const user = await getOrCreateDefaultUser();

  const [tasks, habits, goals] = await Promise.all([
    prisma.task.findMany({
      where: { userId: user.id },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.habit.findMany({
      where: { userId: user.id, isArchived: false },
      include: {
        completions: {
          take: 30,
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.goal.findMany({
      where: { userId: user.id },
      include: { milestones: true },
      orderBy: { deadline: 'asc' },
    }),
  ]);

  return (
    <TasksHubClient
      initialTasks={tasks as unknown as TaskItem[]}
      initialHabits={habits as unknown as HabitItem[]}
      initialGoals={goals}
      currentStreak={user.currentStreak || 0}
    />
  );
}
