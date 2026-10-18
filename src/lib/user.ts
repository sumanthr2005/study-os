import { prisma } from './prisma';
import { getAuthenticatedUser } from './auth';
import { User } from '@prisma/client';
import { DSA_TOPICS } from './constants';

export const DEMO_USER_EMAIL = 'alex@studyos.dev';

/**
 * Provisions or retrieves the isolated demo user for live testing and preview mode.
 */
export async function getOrCreateDemoUser(): Promise<User> {
  let demoUser = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: DEMO_USER_EMAIL,
        name: 'Alex Vance (Demo)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        isDemo: true,
        dailyStudyTargetMinutes: 480,
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

  return demoUser;
}

/**
 * Initializes starter content for a newly registered user (e.g. DSA topics roadmap).
 */
export async function initializeNewUserDefaults(userId: string): Promise<void> {
  try {
    // Populate the 20 core DSA topics
    const existingTopics = await prisma.dsaTopic.count({ where: { userId } });
    if (existingTopics === 0 && Array.isArray(DSA_TOPICS)) {
      for (const t of DSA_TOPICS) {
        await prisma.dsaTopic.create({
          data: {
            userId,
            topicKey: t.key,
            name: t.name,
            totalProblemsTarget: t.defaultTarget,
            progressPercent: 0,
            problemsSolved: 0,
            confidence: 50,
          },
        });
      }
    }
  } catch (error) {
    console.error('Failed to initialize user defaults:', error);
  }
}

/**
 * Resolves the authenticated user for API handlers and Server Components.
 * - In production: strictly requires a valid session.
 * - In development / testing: checks session first; falls back to demo profile if unauthenticated.
 */
export async function getOrCreateDefaultUser(req?: Request): Promise<User> {
  // If in an HTTP request context, strictly resolve session
  if (req) {
    const authUser = await getAuthenticatedUser(req);
    if (authUser) {
      return authUser;
    }
    if (process.env.ALLOW_DEV_FALLBACK === 'true') {
      return await getOrCreateDemoUser();
    }
    const err: any = new Error('Unauthorized: Authentication required');
    err.status = 401;
    throw err;
  }

  // If in Server Component context, try cookies() / headers()
  const authUser = await getAuthenticatedUser();
  if (authUser) {
    return authUser;
  }

  // In production, reject unauthenticated access
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_FALLBACK !== 'true') {
    const err: any = new Error('Unauthorized: Authentication required');
    err.status = 401;
    throw err;
  }

  // Standalone development script fallback (e.g. test-regression, test-sync)
  return await getOrCreateDemoUser();
}
