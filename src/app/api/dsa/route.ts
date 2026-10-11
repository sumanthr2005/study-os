import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { DSA_TOPICS } from '@/lib/constants';

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    let topics = await prisma.dsaTopic.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    // If empty, initialize 20 topics from constants
    if (topics.length === 0) {
      for (const t of DSA_TOPICS) {
        await prisma.dsaTopic.create({
          data: {
            userId: user.id,
            topicKey: t.key,
            name: t.name,
            totalProblemsTarget: t.defaultTarget,
            progressPercent: 0,
            problemsSolved: 0,
            confidence: 50,
          },
        });
      }
      topics = await prisma.dsaTopic.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });
    }

    const totalProblemsSolved = topics.reduce((acc, t) => acc + t.problemsSolved, 0);
    const overallProgress = Math.round(
      topics.reduce((acc, t) => acc + t.progressPercent, 0) / (topics.length || 1)
    );
    const masteredCount = topics.filter(t => t.revisionStatus === 'MASTERED' || t.progressPercent >= 90).length;

    return NextResponse.json({
      topics,
      summary: {
        totalTopics: topics.length,
        totalProblemsSolved,
        overallProgress,
        masteredCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, progressPercent, problemsSolved, confidence, revisionStatus, notes } = body;

    if (!id) return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });

    const updated = await prisma.dsaTopic.update({
      where: { id },
      data: {
        ...(progressPercent !== undefined && { progressPercent: Math.min(100, Math.max(0, parseInt(progressPercent, 10))) }),
        ...(problemsSolved !== undefined && { problemsSolved: Math.max(0, parseInt(problemsSolved, 10)) }),
        ...(confidence !== undefined && { confidence: Math.min(100, Math.max(0, parseInt(confidence, 10))) }),
        ...(revisionStatus !== undefined && { revisionStatus }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
