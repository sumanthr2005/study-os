import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { calculateLevel, calculateProductivityScore, formatDateToYYYYMMDD } from '@/lib/utils';
import { calculateRankAndLevel } from '@/lib/gamification';


export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const todayStr = formatDateToYYYYMMDD(new Date());

    // Gather today's stats for productivity score & dashboard summary
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [studySessionsToday, leetcodeToday, videosToday, habits, completionsToday, waterEntriesToday] =
      await Promise.all([
        prisma.studySession.findMany({
          where: { userId: user.id, startTime: { gte: todayStart } },
        }),
        prisma.leetCodeProblem.findMany({
          where: { userId: user.id, solvedAt: { gte: todayStart } },
        }),
        prisma.playlistVideo.findMany({
          where: {
            playlist: { userId: user.id },
            completed: true,
            completedAt: { gte: todayStart },
          },
        }),
        prisma.habit.findMany({
          where: { userId: user.id, isArchived: false },
        }),
        prisma.habitCompletion.findMany({
          where: {
            habit: { userId: user.id },
            date: todayStr,
            completed: true,
          },
        }),
        prisma.waterEntry.findMany({
          where: { userId: user.id, date: todayStr },
        }),
      ]);

    const actualStudySeconds = studySessionsToday.reduce((acc, s) => acc + s.durationSeconds, 0);
    const actualStudyMinutes = Math.round(actualStudySeconds / 60);
    const waterDrankMl = waterEntriesToday.reduce((acc, w) => acc + w.amountMl, 0);

    const scoreResult = calculateProductivityScore(
      {
        actualStudyMinutes,
        studyGoalMinutes: user.dailyStudyTargetMinutes,
        leetcodeSolvedToday: leetcodeToday.length,
        leetcodeGoalToday: user.leetcodeDailyTarget,
        videosCompletedToday: videosToday.length,
        videosGoalToday: 4,
        habitsCompletedToday: completionsToday.length,
        totalHabitsToday: habits.length || 1,
        waterDrankMl,
        waterGoalMl: user.waterDailyTargetMl,
      },
      {
        study: user.studyWeight,
        coding: user.codingWeight,
        learning: user.learningWeight,
        habits: user.habitsWeight,
        health: user.healthWeight,
      }
    );

    const levelInfo = calculateLevel(user.totalXp);
    const rankInfo = calculateRankAndLevel(user.totalXp);

    return NextResponse.json({
      user,
      todaySummary: {
        actualStudySeconds,
        actualStudyMinutes,
        studyGoalMinutes: user.dailyStudyTargetMinutes,
        studyProgressPercent: Math.min(100, Math.round((actualStudyMinutes / user.dailyStudyTargetMinutes) * 100)),
        leetcodeSolved: leetcodeToday.length,
        leetcodeGoal: user.leetcodeDailyTarget,
        videosCompleted: videosToday.length,
        videosGoal: 4,
        waterDrankMl,
        waterGoalMl: user.waterDailyTargetMl,
        habitsCompleted: completionsToday.length,
        totalHabits: habits.length,
      },
      productivityScore: scoreResult,
      levelInfo,
      rankInfo,
    });

  } catch (error: any) {
    console.error('Error fetching user summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
