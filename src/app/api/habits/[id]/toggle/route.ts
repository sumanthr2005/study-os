import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { formatDateToYYYYMMDD } from '@/lib/utils';
import { awardServerXp } from '@/lib/gamification';


export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getOrCreateDefaultUser(req);
    const body = await req.json().catch(() => ({}));
    const date = body.date || formatDateToYYYYMMDD(new Date());

    const habit = await prisma.habit.findUnique({ where: { id: params.id } });
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }
    if (habit.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const existing = await prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId: params.id,
          date,
        },
      },
    });


    let completed = true;
    if (existing) {
      completed = !existing.completed;
      await prisma.habitCompletion.update({
        where: { id: existing.id },
        data: { completed },
      });
    } else {
      await prisma.habitCompletion.create({
        data: {
          habitId: params.id,
          date,
          completed: true,
        },
      });
      completed = true;
    }

    // Award +5 XP on completion via idempotent ledger (keyed by habitId and date)
    let xpAwarded = 0;
    if (completed) {
      const xpRes = await awardServerXp({
        userId: user.id,
        actionType: 'HABIT_COMPLETED',
        amount: 5,
        description: `Completed habit "${habit.name}" for ${date}`,
        eventKey: `habit:${params.id}:${date}`,
      });
      xpAwarded = xpRes.awarded ? xpRes.amount : 0;
    }


    return NextResponse.json({ success: true, completed, date });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
