import React from 'react';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { Card, Badge } from '@/components/ui';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Bookmark } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export const revalidate = 0;

export default async function CalendarPage() {
  const user = await getOrCreateDefaultUser();

  const sessions = await prisma.studySession.findMany({
    where: { userId: user.id },
    orderBy: { startTime: 'desc' },
    take: 50,
  });

  const tasks = await prisma.task.findMany({
    where: { userId: user.id, deadline: { not: null } },
    take: 30,
  });

  const revisions = await prisma.revision.findMany({
    where: { userId: user.id },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              Study Calendar & Deadlines
            </h1>
            <Badge variant="purple">Unified Timeline</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Aggregated timeline of study sessions, task deadlines, spaced revisions, and course target dates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Deadlines & Upcoming */}
        <Card className="md:col-span-2 p-6 border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Upcoming Milestones & Deadlines</h3>
          <div className="space-y-2.5">
            {tasks.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5">
                  <Bookmark className="h-4 w-4 text-amber-400" />
                  <span className="font-semibold text-white">{t.title}</span>
                </div>
                {t.deadline && (
                  <Badge variant="warning">{format(new Date(t.deadline), 'MMM d, yyyy')}</Badge>
                )}
              </div>
            ))}

            {revisions.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="font-semibold text-white">Revision: {r.title}</span>
                </div>
                <Badge variant="purple">{format(new Date(r.scheduledFor), 'MMM d, yyyy')}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Study Activity Log */}
        <Card className="p-6 border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Recent Study Blocks</h3>
          <div className="space-y-2 text-xs">
            {sessions.slice(0, 8).map(s => (
              <div key={s.id} className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">{s.subject}</div>
                  <div className="text-[10px] text-slate-500">{format(new Date(s.startTime), 'MMM d, h:mm a')}</div>
                </div>
                <span className="font-mono text-emerald-400 font-bold">{Math.round(s.durationSeconds / 60)}m</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
