import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import { prisma } from './prisma';
import { User } from '@prisma/client';

export const SESSION_COOKIE_NAME = 'study_os_session';
export const SESSION_EXPIRY_DAYS = 30;

/**
 * Hash password securely with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  return await bcrypt.hash(password, 12);
}

/**
 * Verify password against bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return await bcrypt.compare(password, hash);
}

/**
 * Create a new database-backed session for a user
 */
export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

/**
 * Destroy a session by token
 */
export async function destroySession(token: string): Promise<void> {
  try {
    await prisma.session.delete({
      where: { token },
    });
  } catch (error) {
    // Session may already be deleted or non-existent
  }
}

/**
 * Extract session token from request or next/headers
 */
export function extractSessionToken(req?: Request): string | null {
  // 1. Try Authorization header: Bearer <token>
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`));
      if (match) return decodeURIComponent(match[1]);
    }
  }

  // 2. Try next/headers cookies() (for App Router Server Components / Actions)
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (tokenCookie?.value) {
      return tokenCookie.value;
    }
  } catch {
    // In contexts where cookies() is unavailable
  }

  // 3. Try next/headers headers()
  try {
    const headerStore = headers();
    const authHeader = headerStore.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
  } catch {
    // In contexts where headers() is unavailable
  }

  return null;
}

/**
 * Resolves the authenticated user from the request session.
 * Returns null if no valid, non-expired session exists.
 */
export async function getAuthenticatedUser(req?: Request): Promise<User | null> {
  const token = extractSessionToken(req);
  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) return null;

    // Check expiration
    if (new Date() > session.expiresAt) {
      // Clean up expired session asynchronously
      prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Strict authentication guard. Throws an error if not authenticated.
 */
export async function requireUser(req?: Request): Promise<User> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    const err: any = new Error('Unauthorized: Authentication required');
    err.status = 401;
    throw err;
  }
  return user;
}

/**
 * Backward compatibility alias
 */
export async function getCurrentUser(req?: Request): Promise<User | null> {
  return await getAuthenticatedUser(req);
}

export async function getAuthSession(req?: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) return { user: null };
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
}
