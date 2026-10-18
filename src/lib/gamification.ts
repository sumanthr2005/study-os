import { prisma } from './prisma';

export interface RankInfo {
  level: number;
  title: string;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  levelXpEarned: number;
  levelXpRequired: number;
  progressPercent: number;
}

export const RANK_TIERS = [
  { level: 1, title: 'Novice', minXp: 0 },
  { level: 2, title: 'Apprentice', minXp: 250 },
  { level: 3, title: 'Explorer', minXp: 600 },
  { level: 4, title: 'Builder', minXp: 1100 },
  { level: 5, title: 'Problem Solver', minXp: 1800 },
  { level: 6, title: 'Specialist', minXp: 2700 },
  { level: 7, title: 'Strategist', minXp: 3800 },
  { level: 8, title: 'Expert', minXp: 5100 },
  { level: 9, title: 'Elite', minXp: 6600 },
  { level: 10, title: 'Master', minXp: 8400 },
];

export function calculateRankAndLevel(totalXp: number): RankInfo {
  const xp = Math.max(0, totalXp || 0);

  let currentTierIndex = 0;
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (xp >= RANK_TIERS[i].minXp) {
      currentTierIndex = i;
      break;
    }
  }

  const currentTier = RANK_TIERS[currentTierIndex];

  // If beyond level 10, calculate dynamically
  if (xp >= 8400) {
    const excessXp = xp - 8400;
    const additionalLevels = Math.floor(excessXp / 2000);
    const level = 10 + additionalLevels;
    const currentLevelXp = 8400 + additionalLevels * 2000;
    const nextLevelXp = currentLevelXp + 2000;
    const levelXpEarned = xp - currentLevelXp;
    const progressPercent = Math.min(100, Math.round((levelXpEarned / 2000) * 100));

    return {
      level,
      title: 'Grandmaster',
      totalXp: xp,
      currentLevelXp,
      nextLevelXp,
      levelXpEarned,
      levelXpRequired: 2000,
      progressPercent,
    };
  }

  const nextTier = RANK_TIERS[currentTierIndex + 1];
  const currentLevelXp = currentTier.minXp;
  const nextLevelXp = nextTier ? nextTier.minXp : currentTier.minXp + 1000;
  const levelXpRequired = nextLevelXp - currentLevelXp;
  const levelXpEarned = xp - currentLevelXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((levelXpEarned / (levelXpRequired || 1)) * 100)));

  return {
    level: currentTier.level,
    title: currentTier.title,
    totalXp: xp,
    currentLevelXp,
    nextLevelXp,
    levelXpEarned,
    levelXpRequired,
    progressPercent,
  };
}

export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_session',
    title: 'First Deep Work Session',
    description: 'Completed and recorded your first verified study session.',
    icon: 'Timer',
    category: 'FOCUS',
    rewardXp: 20,
  },
  {
    id: 'sessions_10',
    title: 'Focus Vanguard',
    description: 'Completed 10 deep-work study sessions.',
    icon: 'Brain',
    category: 'FOCUS',
    rewardXp: 50,
  },
  {
    id: 'first_dsa',
    title: 'First Problem Solved',
    description: 'Logged your first solved LeetCode problem.',
    icon: 'Code2',
    category: 'ALGORITHMS',
    rewardXp: 25,
  },
  {
    id: 'dsa_25',
    title: 'Algorithm Explorer',
    description: 'Solved 25 computer science algorithmic problems.',
    icon: 'GitBranch',
    category: 'ALGORITHMS',
    rewardXp: 75,
  },
  {
    id: 'dsa_100',
    title: 'Century Solver',
    description: 'Mastered 100 coding interview problems.',
    icon: 'Award',
    category: 'ALGORITHMS',
    rewardXp: 150,
  },
  {
    id: 'streak_7',
    title: 'Week of Iron Will',
    description: 'Maintained an unbroken 7-day learning streak.',
    icon: 'Flame',
    category: 'CONSISTENCY',
    rewardXp: 50,
  },
  {
    id: 'streak_30',
    title: 'Unstoppable Momentum',
    description: 'Maintained an unbroken 30-day learning streak.',
    icon: 'Zap',
    category: 'CONSISTENCY',
    rewardXp: 200,
  },
  {
    id: 'playlist_first_5',
    title: 'Roadmap Pioneer',
    description: 'Completed the first 5 modules of a structured learning roadmap.',
    icon: 'PlaySquare',
    category: 'LEARNING',
    rewardXp: 30,
  },
  {
    id: 'study_hours_10',
    title: 'Dedicated Scholar',
    description: 'Accumulated 10 hours of verified study time.',
    icon: 'Clock',
    category: 'FOCUS',
    rewardXp: 60,
  },
  {
    id: 'placement_first_company',
    title: 'Pipeline Opened',
    description: 'Added your first dream company to Placement HQ.',
    icon: 'Briefcase',
    category: 'CAREER',
    rewardXp: 25,
  },
];

export interface AwardXpResult {
  awarded: boolean;
  amount: number;
  actionType: string;
  totalXp: number;
  levelInfo: RankInfo;
  newAchievements: Array<{ id: string; title: string; rewardXp: number }>;
}

/**
 * Server-authoritative, idempotent XP award function.
 * Uses unique eventKey in XpLedger table to prevent duplicate rewards.
 */
export async function awardServerXp(params: {
  userId: string;
  actionType: string;
  amount: number;
  description: string;
  eventKey: string;
}): Promise<AwardXpResult> {
  const { userId, actionType, amount, description, eventKey } = params;

  // 1. Verify idempotency: check if this eventKey has already been recorded
  const existingLedger = await prisma.xpLedger.findUnique({
    where: {
      userId_eventKey: {
        userId,
        eventKey,
      },
    },
  });

  if (existingLedger) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const levelInfo = calculateRankAndLevel(user?.totalXp || 0);
    return {
      awarded: false,
      amount: 0,
      actionType,
      totalXp: user?.totalXp || 0,
      levelInfo,
      newAchievements: [],
    };
  }

  // 2. Validate amount boundary (guard against corrupt or negative inputs)
  const safeAmount = Math.max(1, Math.min(500, Math.round(amount)));

  // 3. Record in ledger and increment user XP atomically in a transaction
  const [createdLedger, updatedUser] = await prisma.$transaction([
    prisma.xpLedger.create({
      data: {
        userId,
        amount: safeAmount,
        actionType,
        description,
        eventKey,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        totalXp: { increment: safeAmount },
      },
    }),
  ]);

  const levelInfo = calculateRankAndLevel(updatedUser.totalXp);

  // Update level in User table if changed
  if (levelInfo.level !== updatedUser.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: levelInfo.level },
    });
  }

  // 4. Check achievements
  const newAchievements = await checkAndUnlockAchievements(userId);

  return {
    awarded: true,
    amount: safeAmount,
    actionType,
    totalXp: updatedUser.totalXp,
    levelInfo,
    newAchievements,
  };
}

/**
 * Checks all real database statistics and unlocks eligible achievements idempotently.
 */
export async function checkAndUnlockAchievements(userId: string) {
  const existingUnlocks = await prisma.achievementUnlock.findMany({
    where: { userId },
  });
  const unlockedSet = new Set(existingUnlocks.map(u => u.achievementId));
  const newlyUnlocked: Array<{ id: string; title: string; rewardXp: number }> = [];

  // Gather actual counts
  const [sessionCount, problemCount, completedVideosCount, totalStudySeconds, companyCount, user] =
    await Promise.all([
      prisma.studySession.count({ where: { userId } }),
      prisma.leetCodeProblem.count({ where: { userId } }),
      prisma.playlistVideo.count({ where: { playlist: { userId }, completed: true } }),
      prisma.studySession.aggregate({ where: { userId }, _sum: { durationSeconds: true } }),
      prisma.placementCompany.count({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

  const studyHours = (totalStudySeconds._sum.durationSeconds || 0) / 3600;
  const streak = user?.currentStreak || 0;

  async function grant(achId: string) {
    if (unlockedSet.has(achId)) return;
    const def = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achId);
    if (!def) return;

    try {
      await prisma.achievementUnlock.create({
        data: {
          userId,
          achievementId: achId,
        },
      });
      unlockedSet.add(achId);
      newlyUnlocked.push({ id: def.id, title: def.title, rewardXp: def.rewardXp });
    } catch {
      // Unique constraint safe
    }
  }

  if (sessionCount >= 1) await grant('first_session');
  if (sessionCount >= 10) await grant('sessions_10');
  if (problemCount >= 1) await grant('first_dsa');
  if (problemCount >= 25) await grant('dsa_25');
  if (problemCount >= 100) await grant('dsa_100');
  if (streak >= 7) await grant('streak_7');
  if (streak >= 30) await grant('streak_30');
  if (completedVideosCount >= 5) await grant('playlist_first_5');
  if (studyHours >= 10) await grant('study_hours_10');
  if (companyCount >= 1) await grant('placement_first_company');

  return newlyUnlocked;
}

export interface DailyQuestItem {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
  rewardXp: number;
}

/**
 * Generates today's real dynamic quests based on live database state.
 */
export async function getLiveDailyQuests(userId: string): Promise<DailyQuestItem[]> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todaySessions, todayLeetcode, todayVideos, habits] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId, startTime: { gte: todayStart } },
    }),
    prisma.leetCodeProblem.findMany({
      where: { userId, solvedAt: { gte: todayStart } },
    }),
    prisma.playlistVideo.findMany({
      where: { playlist: { userId }, completed: true, completedAt: { gte: todayStart } },
    }),
    prisma.habit.findMany({
      where: { userId, isArchived: false },
      include: {
        completions: {
          where: { date: new Date().toISOString().split('T')[0] },
        },
      },
    }),
  ]);

  const habitsDone = habits.filter(h => h.completions.length > 0 && h.completions[0].completed).length;

  return [
    {
      id: 'quest_focus_session',
      title: 'Deep Work Pioneer',
      description: 'Complete at least 1 focused study session today.',
      target: 1,
      current: todaySessions.length,
      unit: 'sessions',
      completed: todaySessions.length >= 1,
      rewardXp: 30,
    },
    {
      id: 'quest_dsa_solve',
      title: 'Algorithm Drill',
      description: 'Solve at least 1 LeetCode or DSA problem today.',
      target: 1,
      current: todayLeetcode.length,
      unit: 'problems',
      completed: todayLeetcode.length >= 1,
      rewardXp: 25,
    },
    {
      id: 'quest_roadmap_video',
      title: 'Roadmap Progression',
      description: 'Complete at least 1 course module or video.',
      target: 1,
      current: todayVideos.length,
      unit: 'videos',
      completed: todayVideos.length >= 1,
      rewardXp: 20,
    },
    {
      id: 'quest_habits_consistency',
      title: 'Daily Discipline',
      description: 'Complete all scheduled daily atomic habits.',
      target: habits.length || 1,
      current: habitsDone,
      unit: 'habits',
      completed: habits.length > 0 && habitsDone >= habits.length,
      rewardXp: 25,
    },
  ];
}
