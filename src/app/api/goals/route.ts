import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      include: {
        milestones: {
          orderBy: { targetValue: 'asc' },
        },
      },
      orderBy: { deadline: 'asc' },
    });

    const enriched = goals.map(g => {
      const progressPercent = g.targetValue > 0
        ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100))
        : 0;

      const completedMilestones = g.milestones.filter(m => m.completed).length;

      return {
        ...g,
        progressPercent,
        completedMilestones,
        totalMilestones: g.milestones.length,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { title, description, category = 'LEARNING', targetValue, unit = 'items', deadline, milestones = [] } = body;

    if (!title || !targetValue) {
      return NextResponse.json({ error: 'Title and targetValue are required' }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description,
        category,
        targetValue: parseFloat(targetValue),
        unit,
        deadline: new Date(deadline || Date.now() + 30 * 86400000),
      },
    });

    if (Array.isArray(milestones) && milestones.length > 0) {
      await prisma.goalMilestone.createMany({
        data: milestones.map((m: any) => ({
          goalId: goal.id,
          title: m.title,
          targetValue: parseFloat(m.targetValue),
          completed: false,
        })),
      });
    }

    return NextResponse.json(goal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, currentValue, status, title } = body;

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        ...(currentValue !== undefined && { currentValue: parseFloat(currentValue) }),
        ...(status !== undefined && { status }),
        ...(title !== undefined && { title }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
