import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function GET(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const url = new URL(req.url);
    const statusParam = url.searchParams.get('status');

    let whereClause: any = { userId: user.id };
    if (statusParam) {
      whereClause.status = statusParam;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        playlist: { select: { id: true, title: true } },
        playlistVideo: { select: { id: true, title: true } },
        goal: { select: { id: true, title: true } },
      },
      orderBy: [{ priority: 'desc' }, { deadline: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
      title,
      description,
      category = 'Study',
      priority = 'MEDIUM',
      deadline,
      estimatedMinutes = 30,
      tags,
      playlistId,
      playlistVideoId,
      goalId,
      isRevision = false,
      status = 'TODO',
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Task title is required and cannot be empty' }, { status: 400 });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 255) {
      return NextResponse.json({ error: 'Task title cannot exceed 255 characters' }, { status: 400 });
    }

    const VALID_CATEGORIES = ['Study', 'Coding', 'Revision', 'Placement', 'Project', 'General'];
    const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'];

    const cleanCategory = VALID_CATEGORIES.includes(category) ? category : 'Study';
    const cleanPriority = VALID_PRIORITIES.includes(priority) ? priority : 'MEDIUM';
    const cleanStatus = VALID_STATUSES.includes(status) ? status : 'TODO';

    let parsedMinutes = parseInt(String(estimatedMinutes), 10);
    if (isNaN(parsedMinutes) || parsedMinutes <= 0) {
      parsedMinutes = 30;
    } else if (parsedMinutes > 1440) {
      parsedMinutes = 1440;
    }

    let parsedDeadline: Date | null = null;
    if (deadline) {
      const d = new Date(deadline);
      if (!isNaN(d.getTime())) {
        parsedDeadline = d;
      }
    }

    // Verify foreign key relations if supplied and ensure user ownership
    let validPlaylistId: string | null = null;
    if (playlistId) {
      const exists = await prisma.playlist.findUnique({ where: { id: playlistId } });
      if (exists && exists.userId === user.id) validPlaylistId = playlistId;
    }

    let validPlaylistVideoId: string | null = null;
    if (playlistVideoId) {
      const exists = await prisma.playlistVideo.findUnique({ where: { id: playlistVideoId }, include: { playlist: true } });
      if (exists && exists.playlist.userId === user.id) validPlaylistVideoId = playlistVideoId;
    }

    let validGoalId: string | null = null;
    if (goalId) {
      const exists = await prisma.goal.findUnique({ where: { id: goalId } });
      if (exists && exists.userId === user.id) validGoalId = goalId;
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: trimmedTitle,
        description: description ? String(description).trim() : null,
        category: cleanCategory,
        priority: cleanPriority,
        status: cleanStatus,
        deadline: parsedDeadline,
        estimatedMinutes: parsedMinutes,
        actualMinutes: 0,
        tags: tags ? String(tags).trim() : null,
        playlistId: validPlaylistId,
        playlistVideoId: validPlaylistVideoId,
        goalId: validGoalId,
        isRevision: Boolean(isRevision),
      },
    });

    // Return both flat task fields and nested { task } so all consumers work seamlessly
    return NextResponse.json({ ...task, task }, { status: 201 });
  } catch (error: any) {
    console.error('Task creation failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error creating task' }, { status: 500 });
  }
}
