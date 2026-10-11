import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { formatDateToYYYYMMDD } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const url = new URL(req.url);
    const date = url.searchParams.get('date') || formatDateToYYYYMMDD(new Date());

    const entries = await prisma.waterEntry.findMany({
      where: { userId: user.id, date },
      orderBy: { timestamp: 'desc' },
    });

    const totalDrankMl = entries.reduce((acc, e) => acc + e.amountMl, 0);
    const targetMl = user.waterDailyTargetMl;
    const progressPercent = Math.min(100, Math.round((totalDrankMl / targetMl) * 100));

    // Last 7 days history
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const historyEntries = await prisma.waterEntry.findMany({
      where: {
        userId: user.id,
        date: { gte: formatDateToYYYYMMDD(sevenDaysAgo) },
      },
    });

    const dailyHistoryMap: Record<string, number> = {};
    for (const h of historyEntries) {
      dailyHistoryMap[h.date] = (dailyHistoryMap[h.date] || 0) + h.amountMl;
    }

    return NextResponse.json({
      date,
      totalDrankMl,
      todayTotalMl: totalDrankMl,
      targetMl,
      progressPercent,
      entries,
      dailyHistoryMap,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const amountMl = parseInt(body.amountMl, 10);
    const date = body.date || formatDateToYYYYMMDD(new Date());

    if (!amountMl || amountMl <= 0) {
      return NextResponse.json({ error: 'Valid amountMl is required' }, { status: 400 });
    }

    const entry = await prisma.waterEntry.create({
      data: {
        userId: user.id,
        amountMl,
        date,
      },
    });

    // Check if target reached to award XP
    const allToday = await prisma.waterEntry.findMany({
      where: { userId: user.id, date },
    });
    const totalNow = allToday.reduce((acc, e) => acc + e.amountMl, 0);
    let xpAwarded = 0;
    if (totalNow >= user.waterDailyTargetMl && totalNow - amountMl < user.waterDailyTargetMl) {
      xpAwarded = 15;
      await prisma.user.update({
        where: { id: user.id },
        data: { totalXp: { increment: 15 } },
      });
    }

    return NextResponse.json({
      success: true,
      entry,
      totalDrankMl: totalNow,
      xpAwarded,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
