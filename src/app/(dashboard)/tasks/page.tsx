import React from 'react';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { Badge } from '@/components/ui';
import { CheckSquare } from 'lucide-react';
import { TaskItem } from '@/types';

export const revalidate = 0;

export default async function TasksPage() {
  const user = await getOrCreateDefaultUser();

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              Task Backlog & Priorities
            </h1>
            <Badge variant="info">Priority Sorted</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize high-leverage study goals, LeetCode targets, project milestones, and placement applications.
          </p>
        </div>
      </div>

      <TaskBoard initialTasks={tasks as unknown as TaskItem[]} />
    </div>
  );
}
