import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const feedbackSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(500, 'Comment must not exceed 500 characters').optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const resolvedParams = await params;
    const resourceId = resolvedParams.id;

    if (!resourceId) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const parseResult = feedbackSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid feedback data' },
        { status: 400 }
      );
    }

    const { rating, comment } = parseResult.data;
    const userId = session.user.id;

    // Verify resource exists
    const resource = await db.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Upsert feedback
    const feedback = await db.feedback.upsert({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
      update: {
        rating,
        comment: comment?.trim() || null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        resourceId,
        rating,
        comment: comment?.trim() || null,
      },
    });

    // Also ensure resource is marked studied if user is reviewing it
    await db.studyProgress.upsert({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
      update: {},
      create: {
        userId,
        resourceId,
        studiedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        rating: feedback.rating,
        comment: feedback.comment,
        updatedAt: feedback.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Submit feedback error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit feedback' }, { status: 500 });
  }
}
