import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { formatDateToYYYYMMDD } from '@/lib/utils';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getOrCreateDefaultUser();
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

    // Award +5 XP on completion
    if (completed) {
      await prisma.user.update({
        where: { id: user.id },
        data: { totalXp: { increment: 5 } },
      });
    }

    return NextResponse.json({ success: true, completed, date });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
