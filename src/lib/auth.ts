import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

/**
 * Generates a random state parameter for OAuth flow
 * This helps prevent CSRF attacks by ensuring the response
 * comes from the same request that initiated the flow
 */
export function generateState(): string {
  return randomBytes(32).toString('hex');
}

export async function getServerSession() {
  const cookieStore = await cookies(); // Await the Promise
  const userCookie = cookieStore.get('user')?.value;
  if (!userCookie) return null;
  try {
    return JSON.parse(userCookie);
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
}