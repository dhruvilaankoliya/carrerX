import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (user) {
      const now = new Date();
      await db.user.update({
        where: { id: user.id },
        data: {
          isOnline: false,
          lastSeenAt: now,
        },
      }).catch(() => {});

      // Close open login log
      const openLog = await db.loginLog.findFirst({
        where: { userId: user.id, logoutAt: null },
        orderBy: { loginAt: 'desc' },
      });

      if (openLog) {
        await db.loginLog.update({
          where: { id: openLog.id },
          data: { logoutAt: now },
        }).catch(() => {});
      }
    }
  } catch (error) {
    console.error('Logout presence error:', error);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
