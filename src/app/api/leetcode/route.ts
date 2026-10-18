import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { formatDateToYYYYMMDD } from '@/lib/utils';
import { awardServerXp } from '@/lib/gamification';


export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);

    const allProblems = await prisma.leetCodeProblem.findMany({
      where: { userId: user.id },
      orderBy: { solvedAt: 'desc' },
    });

    const easyCount = allProblems.filter(p => p.difficulty === 'EASY').length;
    const mediumCount = allProblems.filter(p => p.difficulty === 'MEDIUM').length;
    const hardCount = allProblems.filter(p => p.difficulty === 'HARD').length;
    const totalCount = allProblems.length;

    const solvedToday = allProblems.filter(p => new Date(p.solvedAt) >= todayStart).length;
    const solvedThisWeek = allProblems.filter(p => new Date(p.solvedAt) >= weekStart).length;
    const solvedThisMonth = allProblems.filter(p => new Date(p.solvedAt) >= monthStart).length;

    // Topic distribution
    const topicDistribution: Record<string, number> = {};
    for (const p of allProblems) {
      topicDistribution[p.topic] = (topicDistribution[p.topic] || 0) + 1;
    }

    return NextResponse.json({
      summary: {
        totalCount,
        easyCount,
        mediumCount,
        hardCount,
        solvedToday,
        dailyGoal: user.leetcodeDailyTarget,
        solvedThisWeek,
        solvedThisMonth,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
      topicDistribution,
      problems: allProblems.slice(0, 50),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { problemNumber, title, difficulty = 'MEDIUM', topic = 'Arrays', notes, solutionUrl, timeTakenMinutes } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Problem title is required' }, { status: 400 });
    }

    const xpEarned = difficulty === 'HARD' ? 40 : difficulty === 'MEDIUM' ? 20 : 10;

    const problem = await prisma.leetCodeProblem.create({
      data: {
        userId: user.id,
        problemNumber: problemNumber ? parseInt(problemNumber, 10) : null,
        title: title.trim(),
        difficulty,
        topic,
        notes,
        solutionUrl,
        timeTakenMinutes: timeTakenMinutes ? parseInt(timeTakenMinutes, 10) : null,
        xpEarned,
      },
    });

    // Update DSA topic problem count if matching topic exists
    const matchingDsa = await prisma.dsaTopic.findFirst({
      where: {
        userId: user.id,
        name: { contains: topic },
      },
    });

    if (matchingDsa) {
      await prisma.dsaTopic.update({
        where: { id: matchingDsa.id },
        data: {
          problemsSolved: { increment: 1 },
          progressPercent: Math.min(100, Math.round(((matchingDsa.problemsSolved + 1) / matchingDsa.totalProblemsTarget) * 100)),
        },
      });
    }

    const xpToAward = difficulty === 'HARD' ? 35 : difficulty === 'MEDIUM' ? 20 : 10;

    // Award XP through server-authoritative ledger with idempotency
    const xpResult = await awardServerXp({
      userId: user.id,
      actionType: `LEETCODE_${difficulty}`,
      amount: xpToAward,
      description: `Solved ${difficulty} DSA problem: "${title}"`,
      eventKey: `problem:${problem.id}`,
    });


    return NextResponse.json({
      success: true,
      problem,
      xpEarned,
      message: `Solved ${difficulty} problem "${title}". +${xpEarned} XP!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
