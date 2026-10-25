import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

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

    // Verify resource exists
    const resource = await db.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const userId = session.user.id;

    // Check existing progress
    const existing = await db.studyProgress.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    });

    let isStudied = false;

    if (existing) {
      // Toggle off / undo
      await db.studyProgress.delete({
        where: { id: existing.id },
      });
      isStudied = false;
    } else {
      // Toggle on / mark studied
      await db.studyProgress.create({
        data: {
          userId,
          resourceId,
          studiedAt: new Date(),
        },
      });
      isStudied = true;
    }

    // Fetch updated total studied count for this resource
    const studiedCount = await db.studyProgress.count({
      where: { resourceId },
    });

    return NextResponse.json({
      success: true,
      resourceId,
      isStudied,
      studiedCount,
    });
  } catch (error: any) {
    console.error('Toggle studied error:', error);
    return NextResponse.json({ error: error.message || 'Failed to toggle studied status' }, { status: 500 });
  }
}
