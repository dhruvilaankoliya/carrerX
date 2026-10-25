import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'careerx_default_jwt_secret_dev_2026';
export const AUTH_COOKIE_NAME = 'careerx_token';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

export function isUserOnline(user: { isOnline?: boolean | null; lastSeenAt?: Date | string | null }): boolean {
  if (!user || !user.isOnline || !user.lastSeenAt) return false;
  const lastSeenMs = new Date(user.lastSeenAt).getTime();
  return Date.now() - lastSeenMs < 2 * 60 * 1000; // 2 minutes threshold
}

export async function getSessionToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(): Promise<any | null> {
  try {
    const token = await getSessionToken();
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded?.userId) return null;

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        resumeData: true,
        learningProfile: true,
        readinessScores: { orderBy: { computedAt: 'desc' }, take: 1 },
        careerMatches: { orderBy: { matchScore: 'desc' } },
        roadmaps: {
          include: { phases: { orderBy: { phaseNumber: 'asc' } } },
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (user) {
      // Touch lastSeenAt and online status in background (non-blocking)
      db.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date(), isOnline: true },
      }).catch(() => {});
    }

    return user;
  } catch (error) {
    console.error('getAuthenticatedUser error:', error);
    return null;
  }
}

export async function getCurrentUser(): Promise<{ user: any; profile: any } | null> {
  try {
    const authUser = await getAuthenticatedUser();
    if (authUser) {
      return { user: authUser, profile: authUser.profile };
    }

    // Default student user fallback if not logged in (strictly user role, never manager)
    const fallbackUser = await db.user.findFirst({
      where: { role: 'user' },
      include: {
        profile: true,
        resumeData: true,
        learningProfile: true,
        readinessScores: { orderBy: { computedAt: 'desc' }, take: 1 },
        careerMatches: { orderBy: { matchScore: 'desc' } },
        roadmaps: {
          include: { phases: { orderBy: { phaseNumber: 'asc' } } },
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!fallbackUser) return null;
    return { user: fallbackUser, profile: fallbackUser.profile };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}
