import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyManager } from '@/lib/managerAuth';
import { isUserOnline } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { errorResponse } = await verifyManager();
  if (errorResponse) return errorResponse;

  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        resumeData: true,
        readinessScores: { orderBy: { computedAt: 'desc' }, take: 1 },
        studyProgresses: {
          include: {
            resource: {
              include: { skill: true },
            },
          },
          orderBy: { studiedAt: 'desc' },
        },
        feedbacks: {
          include: {
            resource: {
              include: { skill: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        loginLogs: {
          orderBy: { loginAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch all skills to compute gaps & completion status
    const allSkills = await db.skill.findMany({
      include: {
        resources: true,
      },
    });

    const userCompletedResourceIds = new Set(user.studyProgresses.map((p) => p.resourceId));

    const skillGaps = allSkills.map((skill) => {
      const totalInSkill = skill.resources.length;
      const completedInSkill = skill.resources.filter((r) =>
        userCompletedResourceIds.has(r.id)
      ).length;

      return {
        id: skill.id,
        skillName: skill.name,
        whyItMatters: skill.whyItMatters,
        estimatedHours: skill.estimatedHours,
        totalResources: totalInSkill,
        completedResources: completedInSkill,
        isCompleted: totalInSkill > 0 && completedInSkill === totalInSkill,
        percent: totalInSkill > 0 ? Math.round((completedInSkill / totalInSkill) * 100) : 0,
      };
    });

    // Feedback lookup map
    const feedbackMap = new Map<string, { rating: number; comment: string | null; updatedAt: Date }>();
    user.feedbacks.forEach((f) => {
      feedbackMap.set(f.resourceId, {
        rating: f.rating,
        comment: f.comment,
        updatedAt: f.updatedAt,
      });
    });

    // Completed resources list
    const completedResources = user.studyProgresses.map((p) => {
      const fb = feedbackMap.get(p.resourceId);
      return {
        id: p.resource.id,
        title: p.resource.title,
        skillName: p.resource.skill.name,
        type: p.resource.type,
        provider: p.resource.provider,
        durationHrs: p.resource.durationHrs,
        durationText: p.resource.durationText || `${p.resource.durationHrs} hrs`,
        url: p.resource.url,
        completedAt: p.studiedAt,
        rating: fb?.rating || null,
        comment: fb?.comment || null,
      };
    });

    const totalStudyHours = completedResources.reduce(
      (sum, r) => sum + (r.durationHrs || 1),
      0
    );

    // Feedbacks given list
    const feedbacksGiven = user.feedbacks.map((f) => ({
      id: f.id,
      resourceId: f.resourceId,
      resourceTitle: f.resource.title,
      skillName: f.resource.skill.name,
      rating: f.rating,
      comment: f.comment,
      updatedAt: f.updatedAt,
      createdAt: f.createdAt,
    }));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isOnline: isUserOnline(user),
        lastLoginAt: user.lastLoginAt,
        lastSeenAt: user.lastSeenAt,
        createdAt: user.createdAt,
        profile: user.profile,
        readinessScore: user.readinessScores[0]?.overallScore || null,
        loginLogs: user.loginLogs,
      },
      stats: {
        totalStudyHours: Number(totalStudyHours.toFixed(1)),
        totalResourcesCompleted: completedResources.length,
        totalFeedbacksGiven: feedbacksGiven.length,
        gapsClosedCount: skillGaps.filter((s) => s.isCompleted).length,
        totalGapsCount: skillGaps.length,
      },
      skillGaps,
      completedResources,
      feedbacksGiven,
    });
  } catch (error: any) {
    console.error('GET /api/manager/users/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
