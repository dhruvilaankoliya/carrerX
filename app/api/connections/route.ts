import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET my connections & incoming/outgoing requests
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;

    const connections = await db.connection.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                college: true,
                course: true,
                currentYear: true,
                profilePhoto: true,
                careerGoal: true,
                preferredField: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                college: true,
                course: true,
                currentYear: true,
                profilePhoto: true,
                careerGoal: true,
                preferredField: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const accepted = [];
    const incomingPending = [];
    const outgoingPending = [];

    for (const c of connections) {
      const isSender = c.senderId === user.id;
      const partner = isSender ? c.receiver : c.sender;

      const formatted = {
        id: c.id,
        partnerId: partner.id,
        partnerName: partner.name,
        partnerCollege: partner.profile?.college,
        partnerCourse: partner.profile?.course,
        partnerYear: partner.profile?.currentYear,
        partnerPhoto: partner.profile?.profilePhoto,
        partnerRole: partner.profile?.careerGoal || partner.profile?.preferredField,
        status: c.status,
        message: c.message,
        createdAt: c.createdAt,
        respondedAt: c.respondedAt,
        isSender,
      };

      if (c.status === 'accepted') {
        accepted.push(formatted);
      } else if (c.status === 'pending') {
        if (isSender) {
          outgoingPending.push(formatted);
        } else {
          incomingPending.push(formatted);
        }
      }
    }

    return NextResponse.json({
      success: true,
      connections: accepted,
      incomingRequests: incomingPending,
      outgoingRequests: outgoingPending,
    });
  } catch (error: any) {
    console.error('Connections GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch connections' }, { status: 500 });
  }
}

// POST new connection request
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await req.json();
    const { targetUserId, message } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: 'Cannot connect with yourself' }, { status: 400 });
    }

    // Check target user existence and permissions
    const target = await db.user.findUnique({
      where: { id: targetUserId },
      include: { profile: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'Target student not found' }, { status: 404 });
    }

    if (target.profile && !target.profile.allowConnectionRequests) {
      return NextResponse.json({ error: 'This user is currently not accepting connection requests' }, { status: 403 });
    }

    // Check existing connection in either direction
    const existing = await db.connection.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return NextResponse.json({
          success: true,
          status: 'accepted',
          message: `You are already connected with ${target.name}!`,
          connection: existing,
        });
      }

      if (existing.status === 'pending') {
        if (existing.senderId === user.id) {
          return NextResponse.json({
            success: true,
            status: 'pending',
            message: `Connection request already pending for ${target.name}.`,
            connection: existing,
          });
        } else {
          // If the other user already requested us, auto-accept!
          const updated = await db.connection.update({
            where: { id: existing.id },
            data: { status: 'accepted', respondedAt: new Date() },
          });

          await db.notification.create({
            data: {
              userId: targetUserId,
              type: 'CONNECTION_ACCEPTED',
              actorId: user.id,
              actorName: user.name,
              message: `${user.name} accepted your study connection request!`,
            },
          });

          return NextResponse.json({
            success: true,
            status: 'accepted',
            message: `Mutual request! You and ${target.name} are now connected!`,
            connection: updated,
          });
        }
      }

      // If declined previously, allow re-request
      const updated = await db.connection.update({
        where: { id: existing.id },
        data: {
          senderId: user.id,
          receiverId: targetUserId,
          status: 'pending',
          message: message || `Hey ${target.name}! Saw we are studying similar topics on CareerX and would love to connect.`,
          createdAt: new Date(),
          respondedAt: null,
        },
      });

      await db.notification.create({
        data: {
          userId: targetUserId,
          type: 'CONNECTION_REQUEST',
          actorId: user.id,
          actorName: user.name,
          message: `${user.name} sent you a study connection request.`,
        },
      });

      return NextResponse.json({
        success: true,
        status: 'pending',
        message: `Connection request sent to ${target.name}!`,
        connection: updated,
      });
    }

    // Create new connection
    const newConn = await db.connection.create({
      data: {
        senderId: user.id,
        receiverId: targetUserId,
        status: 'pending',
        message: message || `Hey ${target.name}! Saw we are studying similar topics on CareerX and would love to connect.`,
      },
    });

    // Create notification entry for the receiver
    await db.notification.create({
      data: {
        userId: targetUserId,
        type: 'CONNECTION_REQUEST',
        actorId: user.id,
        actorName: user.name,
        message: `${user.name} sent you a study connection request.`,
      },
    });

    return NextResponse.json({
      success: true,
      status: 'pending',
      message: `Connection request sent to ${target.name}!`,
      connection: newConn,
    });
  } catch (error: any) {
    console.error('Connections POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send connection request' }, { status: 500 });
  }
}
