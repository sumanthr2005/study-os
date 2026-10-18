import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { formatDateToYYYYMMDD } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const user = await getOrCreateDefaultUser(req);

    const [sessions, tasks, revisions, playlists, goals] = await Promise.all([
      prisma.studySession.findMany({
        where: { userId: user.id },
        select: { id: true, subject: true, startTime: true, durationSeconds: true },
        take: 100,
      }),
      prisma.task.findMany({
        where: { userId: user.id, deadline: { not: null } },
        select: { id: true, title: true, deadline: true, status: true, priority: true },
      }),
      prisma.revision.findMany({
        where: { userId: user.id },
        select: { id: true, title: true, subjectOrTopic: true, scheduledFor: true, completed: true },
      }),
      prisma.playlist.findMany({
        where: { userId: user.id, targetCompletionDate: { not: null } },
        select: { id: true, title: true, targetCompletionDate: true },
      }),
      prisma.goal.findMany({
        where: { userId: user.id },
        select: { id: true, title: true, deadline: true, status: true },
      }),
    ]);

    const events: Array<{
      id: string;
      title: string;
      date: string;
      type: 'SESSION' | 'TASK' | 'REVISION' | 'PLAYLIST_TARGET' | 'GOAL_DEADLINE';
      badgeColor: string;
      details?: string;
    }> = [];

    for (const s of sessions) {
      events.push({
        id: `s-${s.id}`,
        title: `Study: ${s.subject} (${Math.round(s.durationSeconds / 60)}m)`,
        date: formatDateToYYYYMMDD(new Date(s.startTime)),
        type: 'SESSION',
        badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      });
    }

    for (const t of tasks) {
      if (t.deadline) {
        events.push({
          id: `t-${t.id}`,
          title: `Task: ${t.title}`,
          date: formatDateToYYYYMMDD(new Date(t.deadline)),
          type: 'TASK',
          badgeColor: t.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        });
      }
    }

    for (const r of revisions) {
      events.push({
        id: `r-${r.id}`,
        title: `Revision: ${r.title}`,
        date: formatDateToYYYYMMDD(new Date(r.scheduledFor)),
        type: 'REVISION',
        badgeColor: r.completed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        details: r.subjectOrTopic,
      });
    }

    for (const pl of playlists) {
      if (pl.targetCompletionDate) {
        events.push({
          id: `pl-${pl.id}`,
          title: `Target: ${pl.title}`,
          date: formatDateToYYYYMMDD(new Date(pl.targetCompletionDate)),
          type: 'PLAYLIST_TARGET',
          badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        });
      }
    }

    for (const g of goals) {
      events.push({
        id: `g-${g.id}`,
        title: `Goal: ${g.title}`,
        date: formatDateToYYYYMMDD(new Date(g.deadline)),
        type: 'GOAL_DEADLINE',
        badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      });
    }

    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
