import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePlaylistMetrics } from '@/lib/utils';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
      include: {
        videos: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const totalVideos = playlist.videos.length;
    const completedVideos = playlist.videos.filter(v => v.completed).length;
    const totalDurationSeconds = playlist.videos.reduce((acc, v) => acc + v.durationSeconds, 0);
    const completedDurationSeconds = playlist.videos
      .filter(v => v.completed)
      .reduce((acc, v) => acc + v.durationSeconds, 0);

    const metrics = calculatePlaylistMetrics(
      totalVideos,
      completedVideos,
      totalDurationSeconds,
      completedDurationSeconds,
      playlist.targetCompletionDate,
      playlist.availableStudyHoursPerDay * 3600
    );

    return NextResponse.json({
      ...playlist,
      metrics,
    });
  } catch (error: any) {
    console.error('Error fetching playlist:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { targetCompletionDate, availableStudyHoursPerDay, title, syncFrequency } = body;

    const updated = await prisma.playlist.update({
      where: { id: params.id },
      data: {
        ...(targetCompletionDate !== undefined && {
          targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate) : null,
        }),
        ...(availableStudyHoursPerDay !== undefined && {
          availableStudyHoursPerDay: parseFloat(availableStudyHoursPerDay),
        }),
        ...(title && { title }),
        ...(syncFrequency && { syncFrequency }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.playlist.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
