import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { formatDateToYYYYMMDD } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const user = await getOrCreateDefaultUser(req);

    // 1. Study Sessions
    const allSessions = await prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { startTime: 'asc' },
    });

    const totalStudySeconds = allSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const longestSessionSeconds = allSessions.length > 0 ? Math.max(...allSessions.map(s => s.durationSeconds)) : 0;

    // Daily study hours map (for heatmap and charts)
    const dailyStudySecondsMap: Record<string, number> = {};
    const subjectStudyMap: Record<string, number> = {};

    let bestDayDate = '';
    let bestDaySeconds = 0;

    for (const s of allSessions) {
      const day = formatDateToYYYYMMDD(new Date(s.startTime));
      dailyStudySecondsMap[day] = (dailyStudySecondsMap[day] || 0) + s.durationSeconds;
      if (dailyStudySecondsMap[day] > bestDaySeconds) {
        bestDaySeconds = dailyStudySecondsMap[day];
        bestDayDate = day;
      }
      subjectStudyMap[s.subject] = (subjectStudyMap[s.subject] || 0) + s.durationSeconds;
    }

    // 2. Playlists & Videos
    const allPlaylists = await prisma.playlist.findMany({
      where: { userId: user.id },
      include: { videos: true },
    });

    const totalVideos = allPlaylists.reduce((acc, pl) => acc + pl.videos.length, 0);
    const completedVideos = allPlaylists.reduce(
      (acc, pl) => acc + pl.videos.filter(v => v.completed).length,
      0
    );
    const totalContentSeconds = allPlaylists.reduce(
      (acc, pl) => acc + pl.videos.reduce((vAcc, v) => vAcc + v.durationSeconds, 0),
      0
    );
    const completedContentSeconds = allPlaylists.reduce(
      (acc, pl) => acc + pl.videos.filter(v => v.completed).reduce((vAcc, v) => vAcc + v.durationSeconds, 0),
      0
    );

    // 3. LeetCode Problems
    const allProblems = await prisma.leetCodeProblem.findMany({
      where: { userId: user.id },
      orderBy: { solvedAt: 'asc' },
    });

    const easyCount = allProblems.filter(p => p.difficulty === 'EASY').length;
    const mediumCount = allProblems.filter(p => p.difficulty === 'MEDIUM').length;
    const hardCount = allProblems.filter(p => p.difficulty === 'HARD').length;

    const dailyCodingMap: Record<string, number> = {};
    for (const p of allProblems) {
      const day = formatDateToYYYYMMDD(new Date(p.solvedAt));
      dailyCodingMap[day] = (dailyCodingMap[day] || 0) + 1;
    }

    // 4. Habits
    const habits = await prisma.habit.findMany({
      where: { userId: user.id },
      include: { completions: true },
    });

    const dailyHabitsMap: Record<string, number> = {};
    for (const h of habits) {
      for (const c of h.completions) {
        if (c.completed) {
          dailyHabitsMap[c.date] = (dailyHabitsMap[c.date] || 0) + 1;
        }
      }
    }

    // Generate 90-day combined heatmap
    const heatmapDays: Array<{
      date: string;
      studyHours: number;
      codingSolved: number;
      habitsDone: number;
      intensity: number; // 0 to 4
    }> = [];

    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = formatDateToYYYYMMDD(d);

      const studySecs = dailyStudySecondsMap[dateStr] || 0;
      const studyHrs = Math.round((studySecs / 3600) * 10) / 10;
      const coding = dailyCodingMap[dateStr] || 0;
      const habitsDone = dailyHabitsMap[dateStr] || 0;

      let intensity = 0;
      const score = (studyHrs >= 4 ? 2 : studyHrs >= 1 ? 1 : 0) + (coding >= 3 ? 1 : 0) + (habitsDone >= 4 ? 1 : 0);
      intensity = Math.min(4, score);

      heatmapDays.push({
        date: dateStr,
        studyHours: studyHrs,
        codingSolved: coding,
        habitsDone,
        intensity,
      });
    }

    return NextResponse.json({
      study: {
        totalStudySeconds,
        longestSessionSeconds,
        bestDay: { date: bestDayDate, seconds: bestDaySeconds },
        dailyStudySecondsMap,
        subjectStudyMap,
      },
      learning: {
        totalPlaylists: allPlaylists.length,
        totalVideos,
        completedVideos,
        totalContentSeconds,
        completedContentSeconds,
        actualStudyVsContentRatio: completedContentSeconds > 0
          ? Math.round((totalStudySeconds / completedContentSeconds) * 10) / 10
          : 1.0,
      },
      coding: {
        totalProblems: allProblems.length,
        easyCount,
        mediumCount,
        hardCount,
        dailyCodingMap,
      },
      habits: {
        totalHabits: habits.length,
        dailyHabitsMap,
      },
      heatmapDays,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
