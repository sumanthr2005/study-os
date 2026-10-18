import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const { passwordHash: _, ...safeUser } = user as any;
    return NextResponse.json(safeUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();

    const {
      name,
      dailyStudyTargetMinutes,
      leetcodeDailyTarget,
      waterDailyTargetMl,
      sleepTargetHours,
      studyWeight,
      codingWeight,
      learningWeight,
      habitsWeight,
      healthWeight,
    } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(dailyStudyTargetMinutes !== undefined && { dailyStudyTargetMinutes: parseInt(dailyStudyTargetMinutes, 10) }),
        ...(leetcodeDailyTarget !== undefined && { leetcodeDailyTarget: parseInt(leetcodeDailyTarget, 10) }),
        ...(waterDailyTargetMl !== undefined && { waterDailyTargetMl: parseInt(waterDailyTargetMl, 10) }),
        ...(sleepTargetHours !== undefined && { sleepTargetHours: parseFloat(sleepTargetHours) }),
        ...(studyWeight !== undefined && { studyWeight: parseInt(studyWeight, 10) }),
        ...(codingWeight !== undefined && { codingWeight: parseInt(codingWeight, 10) }),
        ...(learningWeight !== undefined && { learningWeight: parseInt(learningWeight, 10) }),
        ...(habitsWeight !== undefined && { habitsWeight: parseInt(habitsWeight, 10) }),
        ...(healthWeight !== undefined && { healthWeight: parseInt(healthWeight, 10) }),
      },
    });

    const { passwordHash: _, ...safeUpdated } = updated as any;
    return NextResponse.json(safeUpdated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
