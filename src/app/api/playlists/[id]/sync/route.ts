import { NextResponse } from 'next/server';
import { syncPlaylistWithDatabase } from '@/lib/youtube';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getOrCreateDefaultUser(req);
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    if (playlist.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { expandScenario } = body;

    const result = await syncPlaylistWithDatabase(params.id, Boolean(expandScenario));

    return NextResponse.json({
      success: true,
      syncResult: result,
      message: result.new_videos > 0 
        ? `${result.new_videos} new videos detected and added to roadmap!`
        : `Playlist is already up to date. (Last synced just now)`,
    });
  } catch (error: any) {
    console.error('Playlist sync error:', error);
    return NextResponse.json({ error: error.message || 'Sync failed' }, { status: error.status || 500 });
  }
}
