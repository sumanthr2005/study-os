import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function GET(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date'); // YYYY-MM-DD
    const subjectParam = url.searchParams.get('subject');

    let whereClause: any = { userId: user.id };

    if (dateParam) {
      const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);
      whereClause.startTime = { gte: startOfDay, lte: endOfDay };
    }

    if (subjectParam) {
      whereClause.subject = subjectParam;
    }

    const sessions = await prisma.studySession.findMany({
      where: whereClause,
      include: {
        playlist: { select: { id: true, title: true } },
        playlistVideo: { select: { id: true, title: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { startTime: 'desc' },
      take: 100,
    });

    // Summary calculations
    const totalDurationSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const deepWorkSeconds = sessions.filter(s => s.isDeepWork).reduce((acc, s) => acc + s.durationSeconds, 0);
    const longestSessionSeconds = sessions.length > 0 ? Math.max(...sessions.map(s => s.durationSeconds)) : 0;
    const averageSessionLengthSeconds = sessions.length > 0 ? Math.round(totalDurationSeconds / sessions.length) : 0;

    // Subject breakdown
    const subjectBreakdown: Record<string, number> = {};
    for (const s of sessions) {
      subjectBreakdown[s.subject] = (subjectBreakdown[s.subject] || 0) + s.durationSeconds;
    }

    return NextResponse.json({
      sessions,
      summary: {
        totalDurationSeconds,
        deepWorkSeconds,
        longestSessionSeconds,
        averageSessionLengthSeconds,
        sessionCount: sessions.length,
        subjectBreakdown,
      },
    });
  } catch (error: any) {
    console.error('Error fetching study sessions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const {
      subject,
      playlistId,
      playlistVideoId,
      taskId,
      mode,
      startTime,
      endTime,
      durationSeconds,
      isDeepWork = true,
      notes,
    } = body;

    if (!subject || !durationSeconds || durationSeconds <= 0) {
      return NextResponse.json(
        { error: 'Subject and valid duration in seconds are required' },
        { status: 400 }
      );
    }

    // Award XP: +20 XP per hour studied
    const hours = durationSeconds / 3600;
    const xpEarned = Math.max(5, Math.round(hours * 20));

    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        subject,
        playlistId: playlistId || null,
        playlistVideoId: playlistVideoId || null,
        taskId: taskId || null,
        mode: mode || 'stopwatch',
        startTime: startTime ? new Date(startTime) : new Date(Date.now() - durationSeconds * 1000),
        endTime: endTime ? new Date(endTime) : new Date(),
        durationSeconds,
        isDeepWork: Boolean(isDeepWork),
        notes: notes || null,
        xpEarned,
      },
    });

    // Update user XP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalXp: { increment: xpEarned },
      },
    });

    // If linked to a task, update task's actualMinutes
    if (taskId) {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          actualMinutes: { increment: Math.round(durationSeconds / 60) },
        },
      });
    }

    return NextResponse.json({
      success: true,
      session,
      xpEarned,
      message: `Logged ${Math.round(durationSeconds / 60)} minutes of ${subject}. +${xpEarned} XP!`,
    });
  } catch (error: any) {
    console.error('Error recording study session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
