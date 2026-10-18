import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function GET(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const url = new URL(req.url);
    const relatedType = url.searchParams.get('relatedType');
    const relatedId = url.searchParams.get('relatedId');

    let whereClause: any = { userId: user.id };
    if (relatedType) whereClause.relatedType = relatedType;
    if (relatedId) whereClause.relatedId = relatedId;

    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { title, content, tags, relatedType = 'GENERAL', relatedId, isPinned = false } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: title.trim(),
        content,
        tags,
        relatedType,
        relatedId: relatedId || null,
        isPinned: Boolean(isPinned),
      },
    });

    return NextResponse.json(note);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { id, title, content, tags, isPinned } = body;

    if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    if (existing.userId !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const updated = await prisma.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
        ...(isPinned !== undefined && { isPinned }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    if (existing.userId !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    await prisma.note.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
