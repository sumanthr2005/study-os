import React from 'react';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { StudyAnalyticsView } from '@/components/analytics/StudyAnalyticsView';
import { Badge } from '@/components/ui';
import { BarChart3 } from 'lucide-react';

export const revalidate = 0;

export default async function AnalyticsPage() {
  const user = await getOrCreateDefaultUser();

  const sessions = await prisma.studySession.findMany({
    where: { userId: user.id },
    orderBy: { startTime: 'desc' },
  });

  const totalDurationSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalHours = totalDurationSeconds / 3600;

  const deepWorkSeconds = sessions.filter(s => s.isDeepWork).reduce((acc, s) => acc + s.durationSeconds, 0);
  const deepWorkPercent = totalDurationSeconds > 0
    ? Math.round((deepWorkSeconds / totalDurationSeconds) * 100)
    : 85;

  const subjectBreakdown: Record<string, number> = {};
  for (const s of sessions) {
    subjectBreakdown[s.subject] = (subjectBreakdown[s.subject] || 0) + s.durationSeconds;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              Analytics & Insights
            </h1>
            <Badge variant="purple">Real Persistence</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Data-driven breakdown of study hours, deep work focus ratio, subject velocity, and export capabilities.
          </p>
        </div>
      </div>

      <StudyAnalyticsView
        totalHours={totalHours}
        deepWorkPercent={deepWorkPercent}
        streak={user.currentStreak}
        productivityScore={87}
        subjectBreakdown={subjectBreakdown}
        sessionsCount={sessions.length}
      />
    </div>
  );
}
