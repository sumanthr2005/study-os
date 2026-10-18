import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { awardServerXp } from '@/lib/gamification';


export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const revisions = await prisma.revision.findMany({
      where: { userId: user.id },
      orderBy: { scheduledFor: 'asc' },
    });

    const dueToday = revisions.filter(r => !r.completed && new Date(r.scheduledFor) <= endOfToday);
    const upcoming = revisions.filter(r => !r.completed && new Date(r.scheduledFor) > endOfToday);
    const completedList = revisions.filter(r => r.completed);

    return NextResponse.json({
      dueToday,
      upcoming,
      completed: completedList,
      totalDueTodayCount: dueToday.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { title, subjectOrTopic, intervalDays = 3, notes, referenceType = 'TOPIC', referenceId } = body;

    if (!title || !subjectOrTopic) {
      return NextResponse.json({ error: 'Title and Subject/Topic are required' }, { status: 400 });
    }

    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + parseInt(intervalDays, 10));

    const revision = await prisma.revision.create({
      data: {
        userId: user.id,
        title: title.trim(),
        subjectOrTopic: subjectOrTopic.trim(),
        intervalDays: parseInt(intervalDays, 10),
        scheduledFor,
        notes,
        referenceType,
        referenceId,
      },
    });

    // Also optionally create a linked task
    await prisma.task.create({
      data: {
        userId: user.id,
        title: `Revise: ${title} (${subjectOrTopic})`,
        category: 'Revision',
        priority: 'HIGH',
        deadline: scheduledFor,
        estimatedMinutes: 30,
        isRevision: true,
      },
    });

    return NextResponse.json({
      success: true,
      revision,
      message: `Revision scheduled for ${scheduledFor.toLocaleDateString()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { id, completed = true, scheduleNextIntervalDays } = body;

    const existing = await prisma.revision.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Revision not found' }, { status: 404 });

    const updated = await prisma.revision.update({
      where: { id },
      data: {
        completed: Boolean(completed),
        completedAt: completed ? new Date() : null,
      },
    });

    // If user asked to schedule next spaced interval (e.g. 7 days or 14 days)
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
          scheduledFor: nextDate,
          repetitionNumber: existing.repetitionNumber + 1,
          notes: existing.notes,
        },
      });
    }

    let xpEarned = 0;
    if (completed) {
      const xpRes = await awardServerXp({
        userId: user.id,
        actionType: 'REVISION_COMPLETED',
        amount: 20,
        description: `Completed revision: "${existing.title}"`,
        eventKey: `revision:${existing.id}:${existing.repetitionNumber}`,
      });
      xpEarned = xpRes.awarded ? xpRes.amount : 0;
    }


    return NextResponse.json({
      success: true,
      revision: updated,
      nextRevision,
      xpEarned: 20,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
