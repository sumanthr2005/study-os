import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { extractPlaylistId, fetchPlaylistFromYouTube } from '@/lib/youtube';
import { calculatePlaylistMetrics } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const user = await getOrCreateDefaultUser(req);

    const playlists = await prisma.playlist.findMany({
      where: { userId: user.id, isArchived: false },
      include: {
        videos: {
          select: {
            id: true,
            youtubeVideoId: true,
            completed: true,
            durationSeconds: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedPlaylists = playlists.map(pl => {
      const totalVideos = pl.videos.length;
      const completedVideos = pl.videos.filter(v => v.completed).length;
      const totalDurationSeconds = pl.videos.reduce((acc, v) => acc + v.durationSeconds, 0);
      const completedDurationSeconds = pl.videos
        .filter(v => v.completed)
        .reduce((acc, v) => acc + v.durationSeconds, 0);

      const metrics = calculatePlaylistMetrics(
        totalVideos,
        completedVideos,
        totalDurationSeconds,
        completedDurationSeconds,
        pl.targetCompletionDate,
        pl.availableStudyHoursPerDay * 3600
      );

      return {
        ...pl,
        metrics,
      };
    });

    return NextResponse.json(enrichedPlaylists);
  } catch (error: any) {
    console.error('Failed to fetch playlists:', error);
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser(req);
    const body = await req.json();
    const { urlOrId, targetDate, availableHoursPerDay } = body;

    if (!urlOrId) {
      return NextResponse.json({ error: 'Playlist URL or ID is required' }, { status: 400 });
    }

    const playlistId = extractPlaylistId(urlOrId);
    if (!playlistId) {
      return NextResponse.json(
        { error: 'Invalid YouTube playlist URL or ID. Please check the format.' },
        { status: 400 }
      );
    }

    // Check if already imported
    const existing = await prisma.playlist.findFirst({
      where: { userId: user.id, youtubePlaylistId: playlistId },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'This playlist is already in your Study OS roadmap.', playlistId: existing.id },
        { status: 409 }
      );
    }

    // Fetch details from YouTube or catalogue
    const fetched = await fetchPlaylistFromYouTube(playlistId);

    const totalDurationSeconds = fetched.videos.reduce((acc, v) => acc + v.durationSeconds, 0);

    const targetCompletionDate = targetDate ? new Date(targetDate) : undefined;
    const availableStudyHoursPerDay = availableHoursPerDay ? parseFloat(availableHoursPerDay) : 2.0;

    // Create Playlist in DB
    const playlist = await prisma.playlist.create({
      data: {
        userId: user.id,
        youtubePlaylistId: fetched.youtubePlaylistId,
        title: fetched.title,
        description: fetched.description,
        channelTitle: fetched.channelTitle,
        channelId: fetched.channelId,
        thumbnailUrl: fetched.thumbnailUrl,
        targetCompletionDate,
        availableStudyHoursPerDay,
        totalVideos: fetched.videos.length,
        completedVideos: 0,
        totalDurationSeconds,
        completedDurationSeconds: 0,
        lastSyncedAt: new Date(),
      },
    });

    // Create Videos
    if (fetched.videos.length > 0) {
      await prisma.playlistVideo.createMany({
        data: fetched.videos.map(v => ({
          playlistId: playlist.id,
          youtubeVideoId: v.youtubeVideoId,
          title: v.title,
          description: v.description,
          thumbnailUrl: v.thumbnailUrl,
          durationSeconds: v.durationSeconds,
          position: v.position,
          publishedAt: v.publishedAt,
          completed: false,
          status: 'incomplete',
        })),
      });
    }

    // Create default Goal milestone or linked task if desired
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Playlist Imported',
        message: `Imported "${fetched.title}" with ${fetched.videos.length} learning modules.`,
        type: 'SYNC',
        actionUrl: `/playlists`,
      },
    });

    return NextResponse.json({
      success: true,
      playlist,
      message: `Successfully imported playlist with ${fetched.videos.length} videos!`,
    });
  } catch (error: any) {
    console.error('Error importing playlist:', error);
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: error.status || 500 });
  }
}
