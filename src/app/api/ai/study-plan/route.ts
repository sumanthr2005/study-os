import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { getAIProvider } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json().catch(() => ({}));
    const availableMinutes = parseInt(body.availableMinutes, 10) || 180; // default 3 hours

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [tasks, revisions, playlistVideos, dsaTopics, leetcodeToday] = await Promise.all([
      prisma.task.findMany({
        where: { userId: user.id, status: { in: ['TODO', 'IN_PROGRESS'] } },
        orderBy: [{ priority: 'desc' }, { deadline: 'asc' }],
        take: 10,
      }),
      prisma.revision.findMany({
        where: { userId: user.id, completed: false },
        orderBy: { scheduledFor: 'asc' },
        take: 5,
      }),
      prisma.playlistVideo.findMany({
        where: {
          playlist: { userId: user.id },
          completed: false,
          isUnavailable: false,
        },
        include: { playlist: { select: { title: true } } },
        orderBy: { position: 'asc' },
        take: 5,
      }),
      prisma.dsaTopic.findMany({
        where: { userId: user.id },
        orderBy: { confidence: 'asc' },
        take: 5,
      }),
      prisma.leetCodeProblem.findMany({
        where: { userId: user.id, solvedAt: { gte: todayStart } },
      }),
    ]);

    const provider = getAIProvider();

    const plan = await provider.generateStudyPlan({
      availableMinutes,
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        deadline: t.deadline,
        estimatedMinutes: t.estimatedMinutes,
        isRevision: t.isRevision,
      })),
      revisionsDue: revisions.map(r => ({
        id: r.id,
        title: r.title,
        subjectOrTopic: r.subjectOrTopic,
      })),
      playlistVideosDue: playlistVideos.map(v => ({
        id: v.id,
        title: v.title,
        durationSeconds: v.durationSeconds,
        playlistTitle: v.playlist.title,
      })),
      weakDSATopics: dsaTopics.map(d => ({
        name: d.name,
        confidence: d.confidence,
        problemsSolved: d.problemsSolved,
      })),
      leetcodeTargetDaily: user.leetcodeDailyTarget,
      leetcodeSolvedToday: leetcodeToday.length,
    });

    return NextResponse.json({
      success: true,
      provider: provider.name,
      plan,
    });
  } catch (error: any) {
    console.error('Error generating AI study plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
