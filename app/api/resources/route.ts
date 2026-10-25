import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const currentUserId = session?.user?.id || null;

    // Fetch all skills and their resources from DB
    const skills = await db.skill.findMany({
      include: {
        resources: {
          include: {
            studyProgresses: true,
            feedbacks: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
              orderBy: { updatedAt: 'desc' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // If database skills are empty, trigger fallback or return empty
    // Fetch all user study progress for current user
    const userProgress = currentUserId
      ? await db.studyProgress.findMany({
          where: { userId: currentUserId },
          include: {
            resource: {
              include: { skill: true },
            },
          },
          orderBy: { studiedAt: 'desc' },
        })
      : [];

    const userFeedbacks = currentUserId
      ? await db.feedback.findMany({
          where: { userId: currentUserId },
        })
      : [];

    const userFeedbackMap = new Map<string, { rating: number; comment: string | null; updatedAt: Date }>();
    userFeedbacks.forEach((f) => {
      userFeedbackMap.set(f.resourceId, {
        rating: f.rating,
        comment: f.comment,
        updatedAt: f.updatedAt,
      });
    });

    const userStudiedSet = new Set(userProgress.map((p) => p.resourceId));

    // Calculate user's average rating given
    const userRatings = userFeedbacks.map((f) => f.rating);
    const myAvgRating =
      userRatings.length > 0
        ? Number((userRatings.reduce((a, b) => a + b, 0) / userRatings.length).toFixed(1))
        : 0;

    // Map skills & resources with aggregated metrics
    const skillsWithData = skills.map((skill) => {
      const resources = skill.resources.map((res) => {
        const ratings = res.feedbacks.map((f) => f.rating);
        const avgRating =
          ratings.length > 0
            ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
            : 0;

        return {
          id: res.id,
          skillId: res.skillId,
          skillName: skill.name,
          title: res.title,
          type: res.type,
          provider: res.provider,
          durationHrs: res.durationHrs,
          durationText: res.durationText || `${res.durationHrs} hrs`,
          url: res.url,
          badge: res.badge,
          studiedCount: res.studyProgresses.length,
          avgRating,
          ratingsCount: ratings.length,
          isStudied: userStudiedSet.has(res.id),
          myFeedback: userFeedbackMap.get(res.id) || null,
          recentFeedbacks: res.feedbacks.slice(0, 3).map((f) => ({
            id: f.id,
            rating: f.rating,
            comment: f.comment,
            userName: f.user.name,
            updatedAt: f.updatedAt,
          })),
        };
      });

      const totalResources = resources.length;
      const studiedInSkill = resources.filter((r) => r.isStudied).length;

      return {
        id: skill.id,
        name: skill.name,
        whyItMatters: skill.whyItMatters,
        estimatedHours: skill.estimatedHours,
        totalResources,
        studiedResourcesCount: studiedInSkill,
        isCompleted: totalResources > 0 && studiedInSkill === totalResources,
        resources,
      };
    });

    // Form user's study history
    const studyHistory = userProgress.map((p) => {
      const feedback = userFeedbackMap.get(p.resourceId);
      return {
        progressId: p.id,
        resourceId: p.resourceId,
        title: p.resource.title,
        skillName: p.resource.skill.name,
        type: p.resource.type,
        provider: p.resource.provider,
        durationHrs: p.resource.durationHrs,
        durationText: p.resource.durationText || `${p.resource.durationHrs} hrs`,
        url: p.resource.url,
        studiedAt: p.studiedAt,
        rating: feedback?.rating || null,
        comment: feedback?.comment || null,
      };
    });

    return NextResponse.json({
      success: true,
      skills: skillsWithData,
      userMetrics: {
        totalStudied: userStudiedSet.size,
        totalHours: userProgress.reduce((sum, p) => sum + (p.resource.durationHrs || 1), 0),
        myAvgRating,
        totalRatingsGiven: userRatings.length,
      },
      studyHistory,
    });
  } catch (error: any) {
    console.error('GET /api/resources error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch resources' }, { status: 500 });
  }
}
