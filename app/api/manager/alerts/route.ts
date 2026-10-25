import { NextRequest, NextResponse } from 'next/server';
import { verifyManager } from '@/lib/managerAuth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await verifyManager();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Inactive 7+ days learners
    const inactiveStudents = await db.user.findMany({
      where: {
        role: 'user',
        OR: [
          { lastSeenAt: { lt: sevenDaysAgo } },
          { lastSeenAt: null, createdAt: { lt: sevenDaysAgo } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        lastSeenAt: true,
        createdAt: true,
      },
      take: 20,
    });

    // 2. Low assessment score (< 60%)
    const lowScoreAttempts = await db.assessmentAttempt.findMany({
      where: {
        score: { lt: 60 },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // 3. Behind schedule or stuck roadmaps
    const roadmaps = await db.roadmap.findMany({
      where: {
        progressPercent: { lt: 100 },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { lastActivityAt: 'asc' },
    });

    const stuckRoadmaps = roadmaps
      .filter((rm) => rm.lastActivityAt < sevenDaysAgo)
      .map((rm) => ({
        id: rm.id,
        userId: rm.userId,
        userName: rm.user.name,
        userEmail: rm.user.email,
        targetCareerId: rm.targetCareerId,
        progressPercent: rm.progressPercent,
        lastActivityAt: rm.lastActivityAt.toISOString(),
      }));

    return NextResponse.json({
      alerts: {
        inactive: {
          count: inactiveStudents.length,
          items: inactiveStudents.map((s) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            lastSeenAt: s.lastSeenAt ? s.lastSeenAt.toISOString() : s.createdAt.toISOString(),
            daysInactive: Math.round((now.getTime() - new Date(s.lastSeenAt || s.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
          })),
        },
        lowScores: {
          count: lowScoreAttempts.length,
          items: lowScoreAttempts.map((a) => ({
            attemptId: a.id,
            userId: a.userId,
            userName: a.user.name,
            score: a.score,
            assessmentType: a.assessmentType,
            date: a.createdAt.toISOString(),
          })),
        },
        stuckRoadmaps: {
          count: stuckRoadmaps.length,
          items: stuckRoadmaps,
        },
      },
      totalAlertsCount: inactiveStudents.length + lowScoreAttempts.length + stuckRoadmaps.length,
    });
  } catch (error: any) {
    console.error('Manager Alerts error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch manager alerts' }, { status: 500 });
  }
}
