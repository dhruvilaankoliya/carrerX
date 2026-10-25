import { NextRequest, NextResponse } from 'next/server';
import { verifyManager } from '@/lib/managerAuth';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const auth = await verifyManager();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const resolvedParams = await params;
    const attemptId = resolvedParams.id;
    const body = await req.json();
    const { allowRetake } = body;

    const attempt = await db.assessmentAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Assessment attempt not found' }, { status: 404 });
    }

    const updated = await db.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        allowRetake: typeof allowRetake === 'boolean' ? allowRetake : !attempt.allowRetake,
      },
    });

    return NextResponse.json({
      success: true,
      id: updated.id,
      allowRetake: updated.allowRetake,
      message: `Retake ${updated.allowRetake ? 'allowed' : 'blocked'} successfully`,
    });
  } catch (error: any) {
    console.error('Toggle retake error:', error);
    return NextResponse.json({ error: error.message || 'Failed to toggle retake permission' }, { status: 500 });
  }
}
