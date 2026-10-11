import React from 'react';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { StudyTimer } from '@/components/timer/StudyTimer';
import { Card, Badge } from '@/components/ui';
import { formatSecondsToClock } from '@/lib/utils';
import { Timer, Brain, Clock, Award, History } from 'lucide-react';
import { format } from 'date-fns';

export const revalidate = 0;

export default async function TimerPage() {
  const user = await getOrCreateDefaultUser();

  // Load playlists for session selection
  const playlists = await prisma.playlist.findMany({
    where: { userId: user.id },
    include: {
      videos: {
        select: { id: true, title: true },
        orderBy: { position: 'asc' },
      },
    },
  });

  // Load recent tasks
  const recentTasks = await prisma.task.findMany({
    where: { userId: user.id, status: { not: 'COMPLETED' } },
    select: { id: true, title: true },
    take: 10,
  });

  // Load recent study sessions
  const recentSessions = await prisma.studySession.findMany({
    where: { userId: user.id },
    include: {
      playlist: { select: { title: true } },
      playlistVideo: { select: { title: true } },
    },
    orderBy: { startTime: 'desc' },
    take: 8,
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaySessions = recentSessions.filter(s => new Date(s.startTime) >= todayStart);
  const todaySeconds = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              Deep Work Study Timer
            </h1>
            <Badge variant="purple">XP Gamified</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Focus stopwatch and Pomodoro timer. Every session automatically saves to your study history and earns level XP.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Today Studied</div>
            <div className="text-lg font-bold text-emerald-400">{(todaySeconds / 3600).toFixed(1)} Hours</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Timer */}
      <StudyTimer
        playlists={playlists.map(p => ({ id: p.id, title: p.title, videos: p.videos }))}
        recentTasks={recentTasks}
      />

      {/* Recent Sessions History */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 light:text-slate-700">
            Recent Study Sessions
          </h3>
        </div>

        {recentSessions.length === 0 ? (
          <Card className="text-center py-8 text-slate-400 text-xs">
            No study sessions logged yet. Hit "Start Focus" above to begin your first deep work block!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentSessions.map(session => (
              <Card
                key={session.id}
                className="flex items-center justify-between p-4 border-slate-800/80 bg-slate-900/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-white truncate">
                        {session.subject}
                      </span>
                      {session.isDeepWork && <Badge variant="purple">Deep Work</Badge>}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {session.playlistVideo?.title || session.playlist?.title || session.mode} •{' '}
                      {format(new Date(session.startTime), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-xs sm:text-sm text-emerald-400">
                    {formatSecondsToClock(session.durationSeconds)}
                  </div>
                  <div className="text-[10px] text-indigo-400 font-semibold mt-0.5">
                    +{session.xpEarned} XP
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
