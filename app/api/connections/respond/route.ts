import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await req.json();
    const { connectionId, action } = body; // action: 'accept' | 'decline'

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId is required' }, { status: 400 });
    }

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Valid action ("accept" or "decline") is required' }, { status: 400 });
    }

    const connection = await db.connection.findUnique({
      where: { id: connectionId },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection request not found' }, { status: 404 });
    }

    // Verify user is the intended receiver
    if (connection.receiverId !== user.id) {
      return NextResponse.json({ error: 'Only the recipient can respond to this request' }, { status: 403 });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    const updated = await db.connection.update({
      where: { id: connectionId },
      data: {
        status: newStatus,
        respondedAt: new Date(),
      },
    });

    if (action === 'accept') {
      // Notify sender that their request was accepted
      await db.notification.create({
        data: {
          userId: connection.senderId,
          type: 'CONNECTION_ACCEPTED',
          actorId: user.id,
          actorName: user.name,
          message: `${user.name} accepted your study connection request! You can now chat and collaborate.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      message: action === 'accept' ? 'Connection accepted! You can now message each other.' : 'Connection request declined.',
      connection: updated,
    });
  } catch (error: any) {
    console.error('Connection respond error:', error);
    return NextResponse.json({ error: error.message || 'Failed to respond to connection request' }, { status: 500 });
  }
}
