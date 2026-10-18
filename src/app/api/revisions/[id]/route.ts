import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { awardServerXp } from '@/lib/gamification';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json().catch(() => ({}));
    const { completed = true, scheduleNextIntervalDays } = body;

    const existing = await prisma.revision.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    if (existing.userId !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const updated = await prisma.revision.update({
      where: { id: params.id },
      data: {
        completed: Boolean(completed),
        completedAt: completed ? new Date() : null,
      },
    });

    if (completed && !existing.completed) {
      await awardServerXp({
        userId: user.id,
        actionType: 'REVISION_COMPLETED',
        amount: 15,
        description: `Completed revision: ${existing.title}`,
        eventKey: `revision:${existing.id}:${existing.repetitionNumber}`,
      });
    }

    let nextRevision = null;
    if (completed && scheduleNextIntervalDays) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + parseInt(scheduleNextIntervalDays, 10));

      nextRevision = await prisma.revision.create({
        data: {
          userId: user.id,
          title: existing.title,
          subjectOrTopic: existing.subjectOrTopic,
          referenceType: existing.referenceType,
          referenceId: existing.referenceId,
          intervalDays: parseInt(scheduleNextIntervalDays, 10),
          repetitionNumber: existing.repetitionNumber + 1,
          scheduledFor: nextDate,
        },
      });
    }

    return NextResponse.json({
      success: true,
      revision: updated,
      nextRevision,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
