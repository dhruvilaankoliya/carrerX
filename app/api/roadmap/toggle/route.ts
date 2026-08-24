import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phaseId, deliverableIndex, done } = await req.json();

    const phase = await db.roadmapPhase.findUnique({
      where: { id: phaseId },
    });

    if (!phase) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }

    const deliverables = JSON.parse(phase.deliverables || '[]');
    if (deliverables[deliverableIndex]) {
      deliverables[deliverableIndex].status = done ? 'done' : 'in-progress';
    }

    const doneCount = deliverables.filter((d: any) => d.status === 'done').length;
    const progress = Math.round((doneCount / deliverables.length) * 100);
    const newStatus = progress === 100 ? 'COMPLETED' : progress > 0 ? 'IN_PROGRESS' : phase.status;

    await db.roadmapPhase.update({
      where: { id: phaseId },
      data: {
        deliverables: JSON.stringify(deliverables),
        progress,
        status: newStatus,
      },
    });

    return NextResponse.json({ success: true, progress, status: newStatus });
  } catch (error: any) {
    console.error('Roadmap toggle error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
