import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetEmail } = body;

    if (!targetEmail) {
      return NextResponse.json({ error: 'targetEmail is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: targetEmail.toLowerCase().trim() },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        college: user.profile?.college,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Auth switch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to switch user' }, { status: 500 });
  }
}
