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

export async function getCurrentUser(): Promise<{ user: any; profile: any } | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;

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

    if (!user) return null;
    return { user, profile: user.profile };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}
