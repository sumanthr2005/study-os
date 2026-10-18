import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { formatDateToYYYYMMDD } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const user = await getOrCreateDefaultUser(req);
    const todayStr = formatDateToYYYYMMDD(new Date());

    // Calculate start date 90 days ago for heatmap
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoStr = formatDateToYYYYMMDD(ninetyDaysAgo);

    const habits = await prisma.habit.findMany({
      where: { userId: user.id, isArchived: false },
      include: {
        completions: {
          where: {
            date: { gte: ninetyDaysAgoStr },
          },
          select: {
            date: true,
            completed: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Enrich habits with isCompletedToday, 30-day completion rate, and heatmap dictionary
    const enriched = habits.map(h => {
      const isCompletedToday = h.completions.some(c => c.date === todayStr && c.completed);
      const totalCompletions = h.completions.filter(c => c.completed).length;
      const completionRate = Math.min(100, Math.round((totalCompletions / 30) * 100));

      const completionMap: Record<string, boolean> = {};
      for (const c of h.completions) {
        completionMap[c.date] = c.completed;
      }

      return {
        ...h,
        isCompletedToday,
        totalCompletions,
        completionRate,
        completionMap,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser(req);
    const body = await req.json();
    const { name, description, category = 'Health', icon = 'CheckCircle', color = '#10B981' } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Habit name is required' }, { status: 400 });
    }

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description,
        category,
        icon,
        color,
      },
    });

    return NextResponse.json({ ...habit, habit }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
