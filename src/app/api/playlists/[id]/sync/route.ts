import { NextResponse } from 'next/server';
import { syncPlaylistWithDatabase } from '@/lib/youtube';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
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
    return NextResponse.json({ error: error.message || 'Sync failed' }, { status: 500 });
  }
}
