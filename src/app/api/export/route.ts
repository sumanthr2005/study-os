import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function GET(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json';

    const [studySessions, tasks, habits, playlists, leetcodeProblems, goals] = await Promise.all([
      prisma.studySession.findMany({ where: { userId: user.id } }),
      prisma.task.findMany({ where: { userId: user.id } }),
      prisma.habit.findMany({ where: { userId: user.id }, include: { completions: true } }),
      prisma.playlist.findMany({ where: { userId: user.id }, include: { videos: true } }),
      prisma.leetCodeProblem.findMany({ where: { userId: user.id } }),
      prisma.goal.findMany({ where: { userId: user.id }, include: { milestones: true } }),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        level: user.level,
        totalXp: user.totalXp,
        streak: user.currentStreak,
      },
      studySessions,
      tasks,
      habits,
      playlists,
      leetcodeProblems,
      goals,
    };

    if (format === 'csv') {
      // Export study sessions as CSV
      const headers = ['ID', 'Subject', 'Mode', 'DurationMinutes', 'StartTime', 'DeepWork', 'Notes'];
      const rows = studySessions.map(s => [
        s.id,
        `"${s.subject}"`,
        s.mode,
        Math.round(s.durationSeconds / 60),
        new Date(s.startTime).toISOString(),
        s.isDeepWork ? 'Yes' : 'No',
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="study_os_sessions.csv"',
        },
      });
    }

    return NextResponse.json(exportData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
