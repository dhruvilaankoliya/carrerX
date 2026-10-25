import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyManager } from '@/lib/managerAuth';
import { isUserOnline } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { errorResponse } = await verifyManager();
  if (errorResponse) return errorResponse;

  try {
    const totalUsers = await db.user.count();
    const studentUsers = await db.user.count({ where: { role: 'user' } });
    const managerUsers = await db.user.count({ where: { role: 'manager' } });

    // Fetch users to count online and active today
    const users = await db.user.findMany({
      select: {
        id: true,
        isOnline: true,
        lastSeenAt: true,
        lastLoginAt: true,
      },
    });

    const onlineUsers = users.filter((u) => isUserOnline(u)).length;

    // Active today: seen or logged in within last 24 hours
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const activeToday = users.filter((u) => {
      const seenTime = u.lastSeenAt ? new Date(u.lastSeenAt).getTime() : 0;
      const loginTime = u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0;
      return seenTime >= startOfToday.getTime() || loginTime >= startOfToday.getTime();
    }).length;

    // Total resources completed
    const totalResourcesCompleted = await db.studyProgress.count();

    // Feedback statistics
    const feedbacks = await db.feedback.findMany({
      select: { rating: true },
    });

    const totalFeedbackCount = feedbacks.length;
    const averageRating =
      totalFeedbackCount > 0
        ? Number((feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbackCount).toFixed(1))
        : 0;

    // Total study hours
    const completedWithDuration = await db.studyProgress.findMany({
      include: {
        resource: {
          select: { durationHrs: true },
        },
      },
    });

    const totalStudyHours = Number(
      completedWithDuration.reduce((sum, p) => sum + (p.resource?.durationHrs || 1), 0).toFixed(1)
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        studentUsers,
        managerUsers,
        onlineUsers,
        activeToday,
        totalResourcesCompleted,
        averageRating,
        totalFeedbackCount,
        totalStudyHours,
      },
    });
  } catch (error: any) {
    console.error('GET /api/manager/stats error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
