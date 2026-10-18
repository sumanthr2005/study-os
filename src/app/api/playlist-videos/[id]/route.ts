import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { awardServerXp } from '@/lib/gamification';


export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { completed, notes, difficulty, priority, status } = body;

    const currentVideo = await prisma.playlistVideo.findUnique({
      where: { id: params.id },
      include: { playlist: true },
    });

    if (!currentVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (currentVideo.playlist.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const wasCompleted = currentVideo.completed;
    const isNowCompleted = completed !== undefined ? Boolean(completed) : wasCompleted;

    const updatedVideo = await prisma.playlistVideo.update({
      where: { id: params.id },
      data: {
        ...(completed !== undefined && {
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date() : null,
          status: isNowCompleted ? 'completed' : 'incomplete',
        }),
        ...(notes !== undefined && { notes }),
        ...(difficulty !== undefined && { difficulty }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
      },
    });

    // Recalculate parent playlist
    const allVideos = await prisma.playlistVideo.findMany({
      where: { playlistId: currentVideo.playlistId },
    });

    const completedVideos = allVideos.filter(v => v.completed).length;
    const completedDurationSeconds = allVideos
      .filter(v => v.completed)
      .reduce((acc, v) => acc + v.durationSeconds, 0);

    await prisma.playlist.update({
      where: { id: currentVideo.playlistId },
      data: {
        completedVideos,
        completedDurationSeconds,
      },
    });

    // If just completed, award 10 XP to user via idempotent ledger!
    let xpAwarded = 0;
    if (!wasCompleted && isNowCompleted) {
      const xpRes = await awardServerXp({
        userId: user.id,
        actionType: 'VIDEO_COMPLETION',
        amount: 10,
        description: `Completed roadmap module "${currentVideo.title}"`,
        eventKey: `video:${currentVideo.youtubeVideoId}`,
      });
      xpAwarded = xpRes.awarded ? xpRes.amount : 0;
    }


    return NextResponse.json({
      success: true,
      video: updatedVideo,
      xpAwarded: !wasCompleted && isNowCompleted ? 10 : 0,
    });
  } catch (error: any) {
    console.error('Error updating video:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
