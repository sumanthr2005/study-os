import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession, SESSION_COOKIE_NAME, SESSION_EXPIRY_DAYS } from '@/lib/auth';
import { initializeNewUserDefaults } from '@/lib/user';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, name } = body;

    // 1. Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }
    const cleanEmail = email.trim().toLowerCase();

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }
    const cleanName = name.trim();

    // 2. Check existing user
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // 3. Hash password & create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        passwordHash,
        isDemo: false,
        dailyStudyTargetMinutes: 360,
        leetcodeDailyTarget: 5,
        waterDailyTargetMl: 3000,
        sleepTargetHours: 7.5,
        currentStreak: 0,
        longestStreak: 0,
        totalXp: 0,
        level: 1,
        studyWeight: 40,
        codingWeight: 20,
        learningWeight: 15,
        habitsWeight: 15,
        healthWeight: 10,
      },
    });

    // 4. Initialize starter roadmaps (e.g. 20 DSA topics)
    await initializeNewUserDefaults(user.id);

    // 5. Create database session
    const { token, expiresAt } = await createSession(user.id);

    // 6. Set HTTP-only secure cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        token,
      },
      { status: 201 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
