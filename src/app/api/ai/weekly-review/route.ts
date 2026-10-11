import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { getAIProvider } from '@/lib/ai';

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [studySessions, leetcodeProblems, playlistVideos, habits, dsaTopics] = await Promise.all([
      prisma.studySession.findMany({
        where: { userId: user.id, startTime: { gte: sevenDaysAgo } },
      }),
      prisma.leetCodeProblem.findMany({
        where: { userId: user.id, solvedAt: { gte: sevenDaysAgo } },
      }),
      prisma.playlistVideo.findMany({
        where: {
          playlist: { userId: user.id },
          completed: true,
          completedAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.habit.findMany({
        where: { userId: user.id },
        include: {
          completions: {
            where: { createdAt: { gte: sevenDaysAgo } },
          },
        },
      }),
      prisma.dsaTopic.findMany({
        where: { userId: user.id },
      }),
    ]);

    const totalPossibleHabits = (habits.length || 1) * 7;
    const completedHabits = habits.reduce((acc, h) => acc + h.completions.length, 0);
    const habitsCompletedPercent = Math.min(100, Math.round((completedHabits / totalPossibleHabits) * 100));

    const provider = getAIProvider();

    const review = await provider.analyzeWeeklyProgress({
      studySessions: studySessions.map(s => ({
        subject: s.subject,
        durationSeconds: s.durationSeconds,
      })),
      leetcodeCount: leetcodeProblems.length,
      videosCompletedCount: playlistVideos.length,
      habitsCompletedPercent,
      dsaTopics: dsaTopics.map(d => ({
        name: d.name,
        confidence: d.confidence,
      })),
    });

    return NextResponse.json({
      success: true,
      provider: provider.name,
      review,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
