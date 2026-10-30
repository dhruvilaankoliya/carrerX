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
    const { partnerId, text } = body;

    if (!partnerId || !text) {
      return NextResponse.json({ error: 'partnerId and text are required' }, { status: 400 });
    }

    const activeConnection = await db.connection.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: partnerId },
          { senderId: partnerId, receiverId: user.id },
        ],
        status: 'accepted',
      },
    });

    if (!activeConnection) {
      return NextResponse.json({ error: 'Accepted connection not found' }, { status: 404 });
    }

    // Create message as if sent by the partner to the current user
    const msg = await db.message.create({
      data: {
        connectionId: activeConnection.id,
        senderId: partnerId,
        receiverId: user.id,
        body: text.trim(),
      },
    });

    return NextResponse.json({ success: true, message: msg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Simulation error' }, { status: 500 });
  }
}
