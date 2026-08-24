import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const questions = await db.resumeQuestion.findMany({
      where: { userId: user.id },
    });

    const formatted = questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      category: q.category,
      relatedItem: q.relatedItem,
      options: JSON.parse(q.options || '[]'),
      selectedAnswer: q.selectedAnswer,
    }));

    return NextResponse.json({ questions: formatted });
  } catch (error: any) {
    console.error('Fetch resume questions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
