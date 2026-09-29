import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('targetUserId');
    const connectionId = searchParams.get('connectionId');

    if (!targetUserId && !connectionId) {
      return NextResponse.json({ error: 'targetUserId or connectionId is required' }, { status: 400 });
    }

    // Verify accepted connection
    let activeConnection = null;
    if (connectionId) {
      activeConnection = await db.connection.findUnique({
        where: { id: connectionId },
      });
    } else if (targetUserId) {
      activeConnection = await db.connection.findFirst({
        where: {
          OR: [
            { senderId: user.id, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: user.id },
          ],
        },
      });
    }

    if (!activeConnection || activeConnection.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Messages are only accessible between accepted study connections' },
        { status: 403 }
      );
    }

    const partnerId = activeConnection.senderId === user.id ? activeConnection.receiverId : activeConnection.senderId;

    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: partnerId },
          { senderId: partnerId, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages as read
    await db.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: user.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    const partnerUser = await db.user.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        name: true,
        profile: {
          select: {
            profilePhoto: true,
            college: true,
            course: true,
            careerGoal: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      connectionId: activeConnection.id,
      partner: {
        id: partnerUser?.id,
        name: partnerUser?.name,
        profilePhoto: partnerUser?.profile?.profilePhoto,
        college: partnerUser?.profile?.college,
        course: partnerUser?.profile?.course,
      },
      messages: messages.map((m: any) => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        body: m.body,
        createdAt: m.createdAt,
        isSelf: m.senderId === user.id,
      })),
    });
  } catch (error: any) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await req.json();
    const { targetUserId, connectionId, messageBody } = body;

    if (!messageBody || !messageBody.trim()) {
      return NextResponse.json({ error: 'Message body cannot be empty' }, { status: 400 });
    }

    // Verify accepted connection
    let activeConnection = null;
    if (connectionId) {
      activeConnection = await db.connection.findUnique({
        where: { id: connectionId },
      });
    } else if (targetUserId) {
      activeConnection = await db.connection.findFirst({
        where: {
          OR: [
            { senderId: user.id, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: user.id },
          ],
        },
      });
    }

    if (!activeConnection || activeConnection.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Cannot send messages unless connection is accepted' },
        { status: 403 }
      );
    }

    const partnerId = activeConnection.senderId === user.id ? activeConnection.receiverId : activeConnection.senderId;

    const newMessage = await db.message.create({
      data: {
        connectionId: activeConnection.id,
        senderId: user.id,
        receiverId: partnerId,
        body: messageBody.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        body: newMessage.body,
        createdAt: newMessage.createdAt,
        isSelf: true,
      },
    });
  } catch (error: any) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  }
}
