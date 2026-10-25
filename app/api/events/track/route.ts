import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json().catch(() => ({}));
    const { eventType, entityType, entityId, metadata } = body;

    if (!eventType || typeof eventType !== 'string') {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 });
    }

    const event = await db.activityEvent.create({
      data: {
        userId: user?.id || null,
        eventType: eventType.toUpperCase().trim(),
        entityType: entityType ? String(entityType) : null,
        entityId: entityId ? String(entityId) : null,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null,
      },
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error: any) {
    console.error('Track event error:', error);
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }
}
