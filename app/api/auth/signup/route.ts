import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'manager']).optional().default('user'),
  phone: z.string().optional(),
  college: z.string().optional(),
  course: z.string().optional(),
  branch: z.string().optional(),
  currentYear: z.union([z.string(), z.number()]).optional(),
  gradYear: z.union([z.string(), z.number()]).optional(),
  cgpa: z.union([z.string(), z.number()]).optional(),
  preferredField: z.string().optional(),
  programmingLanguages: z.array(z.string()).optional(),
  technicalSkills: z.array(z.string()).optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`signup_${ip}`, { limit: 8, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = signupSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const cleanEmail = data.email.toLowerCase().trim();

    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);
    const now = new Date();

    const role = data.role || 'user';

    const user = await db.user.create({
      data: {
        name: data.name.trim(),
        email: cleanEmail,
        phone: data.phone || null,
        passwordHash,
        role,
        lastLoginAt: now,
        lastSeenAt: now,
        isOnline: true,
        ...(role === 'user' ? {
          profile: {
            create: {
              college: data.college || 'University Student',
              course: data.course || 'B.Tech',
              branch: data.branch || 'Computer Science',
              currentYear: data.currentYear ? Number(data.currentYear) : 1,
              gradYear: data.gradYear ? Number(data.gradYear) : 2027,
              cgpa: data.cgpa ? Number(data.cgpa) : null,
              preferredField: data.preferredField || null,
              programmingLanguages: JSON.stringify(data.programmingLanguages || ['Python', 'SQL']),
              technicalSkills: JSON.stringify(data.technicalSkills || []),
              linkedin: data.linkedin || null,
              github: data.github || null,
              completenessStage: 1,
              completenessPercent: 20,
            },
          },
        } : {}),
        loginLogs: {
          create: [
            {
              loginAt: now,
              ipAddress: ip,
              userAgent: req.headers.get('user-agent') || undefined,
            }
          ]
        }
      },
      include: { profile: true },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const redirectTo = user.role === 'manager' ? '/manager' : '/resume';

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      redirectTo,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
