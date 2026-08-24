import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, profile } = session;
    const { answers } = await req.json(); // { [questionId: string]: string }

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    for (const [qId, ans] of Object.entries(answers)) {
      await db.resumeQuestion.update({
        where: { id: qId },
        data: {
          selectedAnswer: String(ans),
          answeredAt: new Date(),
        },
      });
    }

    // Update completeness
    const newStage = Math.max(profile.completenessStage || 1, 3);
    const newPercent = Math.max(profile.completenessPercent || 40, 60);

    await db.profile.update({
      where: { userId: user.id },
      data: {
        completenessStage: newStage,
        completenessPercent: newPercent,
      },
    });

    return NextResponse.json({ success: true, completenessPercent: newPercent });
  } catch (error: any) {
    console.error('Submit resume questions error:', error);
    return NextResponse.json({ error: 'Failed to submit answers' }, { status: 500 });
  }
}
