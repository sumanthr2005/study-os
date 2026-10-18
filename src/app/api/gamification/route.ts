import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import {
  calculateRankAndLevel,
  ACHIEVEMENT_DEFINITIONS,
  getLiveDailyQuests,
  checkAndUnlockAchievements,
} from '@/lib/gamification';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getOrCreateDefaultUser(req);

    // Trigger check for any newly met achievement criteria
    await checkAndUnlockAchievements(user.id);

    const [unlockedRecords, xpLedgerEntries, dailyQuests] = await Promise.all([
      prisma.achievementUnlock.findMany({
        where: { userId: user.id },
        orderBy: { unlockedAt: 'desc' },
      }),
      prisma.xpLedger.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      getLiveDailyQuests(user.id),
    ]);

    const unlockedMap = new Map(unlockedRecords.map(u => [u.achievementId, u.unlockedAt]));

    const achievements = ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      unlocked: unlockedMap.has(def.id),
      unlockedAt: unlockedMap.get(def.id) || null,
    }));

    const rankInfo = calculateRankAndLevel(user.totalXp);

    return NextResponse.json({
      rankInfo,
      dailyQuests,
      achievements,
      recentXpLedger: xpLedgerEntries,
      stats: {
        totalXp: user.totalXp,
        level: rankInfo.level,
        rankTitle: rankInfo.title,
        streak: user.currentStreak,
        unlockedAchievementsCount: unlockedRecords.length,
        totalAchievementsCount: ACHIEVEMENT_DEFINITIONS.length,
      },
    });
  } catch (error: any) {
    console.error('Gamification API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
