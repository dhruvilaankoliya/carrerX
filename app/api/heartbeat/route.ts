import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const now = new Date();
    await db.user.update({
      where: { id: user.id },
      data: {
        lastSeenAt: now,
        isOnline: true,
      },
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      userId: user.id,
      role: user.role,
      lastSeenAt: now.toISOString(),
      isOnline: true,
    });
  } catch (error: any) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
