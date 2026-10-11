const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data directly...');
  // Let's check user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'alex@studyos.dev',
        name: 'Alex Vance',
        dailyStudyTargetMinutes: 480,
        leetcodeDailyTarget: 5,
        waterDailyTargetMl: 3000,
        sleepTargetHours: 8.0,
        currentStreak: 17,
        longestStreak: 24,
        totalXp: 1450,
        level: 6,
      },
    });
    console.log('Created user:', user.name);
  } else {
    console.log('User already exists:', user.name);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
