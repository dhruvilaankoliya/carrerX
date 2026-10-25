import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyManager } from '@/lib/managerAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { errorResponse } = await verifyManager();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const skillFilter = searchParams.get('skill') || 'all';
    const ratingFilter = searchParams.get('rating') || 'all';
    const q = (searchParams.get('q') || '').trim().toLowerCase();

    const feedbacks = await db.feedback.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                college: true,
                profilePhoto: true,
              },
            },
          },
        },
        resource: {
          include: {
            skill: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    let transformed = feedbacks.map((f) => ({
      id: f.id,
      rating: f.rating,
      comment: f.comment,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      user: {
        id: f.user.id,
        name: f.user.name,
        email: f.user.email,
        college: f.user.profile?.college || 'Student',
        avatar: f.user.profile?.profilePhoto || null,
      },
      resource: {
        id: f.resource.id,
        title: f.resource.title,
        type: f.resource.type,
        provider: f.resource.provider,
        url: f.resource.url,
      },
      skillName: f.resource.skill.name,
    }));

    // Filter by skill
    if (skillFilter !== 'all') {
      transformed = transformed.filter(
        (f) => f.skillName.toLowerCase() === skillFilter.toLowerCase()
      );
    }

    // Filter by rating
    if (ratingFilter !== 'all') {
      const numRating = parseInt(ratingFilter, 10);
      transformed = transformed.filter((f) => f.rating === numRating);
    }

    // Filter by search query
    if (q) {
      transformed = transformed.filter(
        (f) =>
          (f.comment && f.comment.toLowerCase().includes(q)) ||
          f.user.name.toLowerCase().includes(q) ||
          f.user.email.toLowerCase().includes(q) ||
          f.resource.title.toLowerCase().includes(q) ||
          f.skillName.toLowerCase().includes(q)
      );
    }

    // Get distinct skills for dropdown
    const allSkills = await db.skill.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      total: transformed.length,
      feedbacks: transformed,
      availableSkills: allSkills.map((s) => s.name),
    });
  } catch (error: any) {
    console.error('GET /api/manager/feedback error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
