import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyManager } from '@/lib/managerAuth';
import { isUserOnline } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { errorResponse } = await verifyManager();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const roleFilter = searchParams.get('role') || 'all';
    const statusFilter = searchParams.get('status') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));

    // Fetch all users with profile and study data to compute metrics accurately
    const users = await db.user.findMany({
      include: {
        profile: true,
        studyProgresses: {
          include: {
            resource: {
              select: { durationHrs: true },
            },
          },
        },
        feedbacks: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform and compute presence + progress
    let transformed = users.map((u) => {
      const online = isUserOnline(u);
      const totalHours = u.studyProgresses.reduce(
        (sum, p) => sum + (p.resource?.durationHrs || 1),
        0
      );
      const ratings = u.feedbacks.map((f) => f.rating);
      const avgRating =
        ratings.length > 0
          ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
          : null;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role || 'user',
        isOnline: online,
        lastLoginAt: u.lastLoginAt,
        lastSeenAt: u.lastSeenAt,
        createdAt: u.createdAt,
        college: u.profile?.college || 'N/A',
        course: u.profile?.course || 'B.Tech',
        branch: u.profile?.branch || 'N/A',
        currentYear: u.profile?.currentYear || 1,
        cgpa: u.profile?.cgpa || null,
        targetRole: u.profile?.careerGoal || 'Software Engineer',
        completedResourcesCount: u.studyProgresses.length,
        totalStudyHours: Number(totalHours.toFixed(1)),
        avgRatingGiven: avgRating,
        totalFeedbacksGiven: u.feedbacks.length,
      };
    });

    // Filter by query (name, email, college)
    if (q) {
      transformed = transformed.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.college.toLowerCase().includes(q) ||
          u.targetRole.toLowerCase().includes(q)
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      transformed = transformed.filter((u) => u.role === roleFilter);
    }

    // Filter by status (online / offline)
    if (statusFilter === 'online') {
      transformed = transformed.filter((u) => u.isOnline);
    } else if (statusFilter === 'offline') {
      transformed = transformed.filter((u) => !u.isOnline);
    }

    const total = transformed.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedUsers = transformed.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      users: paginatedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('GET /api/manager/users error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
