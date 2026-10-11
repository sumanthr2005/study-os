import { getOrCreateDefaultUser } from './user';
import { prisma } from './db';

/**
 * Authentication helper for Study OS.
 * For local single-user mode, automatically returns or provisions the primary user.
 */
export async function getCurrentUser() {
  return await getOrCreateDefaultUser();
}

export async function getAuthSession() {
  const user = await getCurrentUser();
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
}

export { getOrCreateDefaultUser };
