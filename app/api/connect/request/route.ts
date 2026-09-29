import { NextRequest, NextResponse } from 'next/server';

interface ConnectionRequest {
  id: string;
  targetUserId: string;
  targetUserName: string;
  resourceId?: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// In-memory persistent connection storage
const connectionRequests: ConnectionRequest[] = [
  {
    id: 'req_init_1',
    targetUserId: 'usr_rohit_3',
    targetUserName: 'Rohit Verma',
    resourceId: 'res_fastapi_1',
    message: 'Hey Rohit! Saw you completed the FastAPI tutorial. Want to collaborate on an ML project?',
    status: 'accepted',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'req_init_2',
    targetUserId: 'usr_vikram_5',
    targetUserName: 'Vikram Mehta',
    resourceId: 'res_docker_2',
    message: 'Hi Vikram, loved your work on Kubernetes. Would love some tips on containerizing PyTorch!',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    requests: connectionRequests,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUserId, targetUserName, resourceId, message } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    // Check if request already exists
    const existing = connectionRequests.find((r) => r.targetUserId === targetUserId);
    if (existing) {
      existing.message = message || existing.message;
      existing.status = 'pending';
      return NextResponse.json({
        success: true,
        request: existing,
        message: `Connection request updated for ${targetUserName || 'user'}`,
      });
    }

    const newReq: ConnectionRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      targetUserId,
      targetUserName: targetUserName || 'Learner',
      resourceId,
      message: message || 'Hey! Saw you studied this resource on CareerX and would love to connect!',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    connectionRequests.push(newReq);

    return NextResponse.json({
      success: true,
      request: newReq,
      message: `Connection request sent to ${targetUserName || 'user'}!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send connection request' }, { status: 500 });
  }
}
