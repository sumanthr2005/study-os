import { prisma } from './prisma';

export async function getOrCreateDefaultUser() {
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'alex@studyos.dev',
        name: 'Alex Vance',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        dailyStudyTargetMinutes: 480, // 8 hours as requested in prompt example
        leetcodeDailyTarget: 5,
        waterDailyTargetMl: 3000,
        sleepTargetHours: 8.0,
        currentStreak: 17,
        longestStreak: 24,
        totalXp: 1450,
        level: 6,
        studyWeight: 40,
        codingWeight: 20,
        learningWeight: 15,
        habitsWeight: 15,
        healthWeight: 10,
      },
    });
  }

  return user;
}
