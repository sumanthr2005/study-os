import { NextResponse } from 'next/server';
import { getOrCreateDemoUser } from '@/lib/user';
import { createSession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const demoUser = await getOrCreateDemoUser();
    const { token, expiresAt } = await createSession(demoUser.id);

    const response = NextResponse.json({
      success: true,
      message: 'Logged in as Demo User (Alex Vance)',
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        avatar: demoUser.avatar,
        isDemo: true,
      },
      token,
    });

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
    console.error('Demo login error:', error);
    return NextResponse.json({ error: error.message || 'Demo login failed' }, { status: 500 });
  }
}
