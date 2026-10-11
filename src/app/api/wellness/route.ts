import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { formatDateToYYYYMMDD } from '@/lib/utils';

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const todayStr = formatDateToYYYYMMDD(new Date());

    const todayEntry = await prisma.wellnessEntry.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: todayStr,
        },
      },
    });

    const recentEntries = await prisma.wellnessEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 14,
    });

    return NextResponse.json({
      todayEntry,
      sleepTarget: user.sleepTargetHours,
      recentEntries,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const todayStr = formatDateToYYYYMMDD(new Date());

    const { sleepHours, sleepQuality, workoutMinutes, workoutType, readingMinutes, readingBook, readingPages } = body;

    const entry = await prisma.wellnessEntry.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: todayStr,
        },
      },
      update: {
        ...(sleepHours !== undefined && { sleepHours: parseFloat(sleepHours) }),
        ...(sleepQuality !== undefined && { sleepQuality: parseInt(sleepQuality, 10) }),
        ...(workoutMinutes !== undefined && { workoutMinutes: parseInt(workoutMinutes, 10) }),
        ...(workoutType !== undefined && { workoutType }),
        ...(readingMinutes !== undefined && { readingMinutes: parseInt(readingMinutes, 10) }),
        ...(readingBook !== undefined && { readingBook }),
        ...(readingPages !== undefined && { readingPages: parseInt(readingPages, 10) }),
      },
      create: {
        userId: user.id,
        date: todayStr,
        sleepHours: sleepHours ? parseFloat(sleepHours) : null,
        sleepQuality: sleepQuality ? parseInt(sleepQuality, 10) : null,
        workoutMinutes: workoutMinutes ? parseInt(workoutMinutes, 10) : null,
        workoutType: workoutType || null,
        readingMinutes: readingMinutes ? parseInt(readingMinutes, 10) : null,
        readingBook: readingBook || null,
        readingPages: readingPages ? parseInt(readingPages, 10) : null,
      },
    });

    return NextResponse.json(entry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
