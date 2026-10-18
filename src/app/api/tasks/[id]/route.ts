import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json().catch(() => ({}));
    const { title, description, category, priority, deadline, estimatedMinutes, actualMinutes, status, tags } = body;

    const existing = await prisma.task.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (existing.userId !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const isCompletingNow = existing.status !== 'COMPLETED' && status === 'COMPLETED';

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(priority !== undefined && { priority }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(estimatedMinutes !== undefined && { estimatedMinutes: parseInt(estimatedMinutes, 10) }),
        ...(actualMinutes !== undefined && { actualMinutes: parseInt(actualMinutes, 10) }),
        ...(status !== undefined && {
          status,
          completedAt: status === 'COMPLETED' ? new Date() : null,
        }),
        ...(tags !== undefined && { tags }),
      },
    });

    if (isCompletingNow) {
      await prisma.user.update({
        where: { id: user.id },
        data: { totalXp: { increment: 15 } },
      });
    }

    return NextResponse.json({ ...updated, task: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getOrCreateDefaultUser();
    const existing = await prisma.task.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (existing.userId !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

