import React from 'react';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { Card, Button, Badge, Progress } from '@/components/ui';
import { Target, Plus, CheckCircle2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const revalidate = 0;

export default async function GoalsPage() {
  const user = await getOrCreateDefaultUser();

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: { milestones: true },
    orderBy: { deadline: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              Placement & Long-Term Goals
            </h1>
            <Badge variant="purple">{goals.length} Active Goals</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            High-level milestones spanning DSA mastery, study hours, and dream company placement preparedness.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map(goal => {
          const percent = Math.min(
            100,
            Math.round((goal.currentValue / Math.max(1, goal.targetValue)) * 100)
          );

          return (
            <Card key={goal.id} className="p-6 border-slate-800 space-y-4">
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
                <Progress value={percent} />
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  Deadline: {format(new Date(goal.deadline), 'MMM d, yyyy')}
                </span>
                <span>{goal.milestones.length} milestones</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
