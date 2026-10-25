import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { comparePassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`login_${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      const err = parseResult.error as any;
      const msg = err?.issues?.[0]?.message || err?.errors?.[0]?.message || 'Invalid input';
      return NextResponse.json(
        { error: msg },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = parseResult.data;

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const now = new Date();

    // Update presence & last login
    await db.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: now,
        lastSeenAt: now,
        isOnline: true,
      },
    });

    // Create session login log
    await db.loginLog.create({
      data: {
        userId: user.id,
        loginAt: now,
        ipAddress: ip,
        userAgent: req.headers.get('user-agent') || undefined,
      },
    }).catch(() => {});

    // Update profile last active
    if (user.profile) {
      await db.profile.update({
        where: { id: user.profile.id },
        data: { lastActiveAt: now },
      }).catch(() => {});
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
    });

    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
    const redirectTo = user.role === 'manager' ? '/manager' : '/resume';

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        profile: user.profile,
      },
      redirectTo,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
