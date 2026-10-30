import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

interface ChannelMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderCollege: string;
  senderRole?: string;
  senderPhoto?: string | null;
  text: string;
  createdAt: string;
}

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const CHANNELS_FILE = path.join(DATA_DIR, 'careerx_channels.json');
const SEED_FILE = path.join(process.cwd(), 'data', 'channel_messages.json');

const INITIAL_CHANNEL_MESSAGES: Record<string, ChannelMessage[]> = {
  'ml-engineering': [
    {
      id: 'msg_seed_1',
      channelId: 'ml-engineering',
      senderId: 'seed_aarav',
      senderName: 'Aarav Sharma',
      senderCollege: 'IIT Bombay',
      senderRole: 'ML Infrastructure',
      senderPhoto: null,
      text: 'Welcome to the ML Engineering study channel! Discussing model serving with Triton and Docker containerization.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'msg_seed_2',
      channelId: 'ml-engineering',
      senderId: 'seed_dhruvila',
      senderName: 'Dhruvila',
      senderCollege: 'Dharmsinh Desai University',
      senderRole: 'ML Engineer',
      senderPhoto: null,
      text: 'Hey everyone! Currently optimizing Kubernetes deployment manifests for ML inference pipelines. Anyone working on this?',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
  'kubernetes-devops': [
    {
      id: 'msg_seed_3',
      channelId: 'kubernetes-devops',
      senderId: 'seed_aarav',
      senderName: 'Aarav Sharma',
      senderCollege: 'IIT Bombay',
      senderRole: 'Cloud DevOps',
      senderPhoto: null,
      text: 'Tip for Kubernetes cluster setup: verify your ingress controller and cert-manager configuration before scaling nodes.',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  'fullstack-architect': [
    {
      id: 'msg_seed_4',
      channelId: 'fullstack-architect',
      senderId: 'seed_neha',
      senderName: 'Neha Patel',
      senderCollege: 'BITS Pilani',
      senderRole: 'Full Stack Architect',
      senderPhoto: null,
      text: 'Check out the Next.js App Router server actions pattern for low-latency database queries with Prisma.',
      createdAt: new Date(Date.now() - 5400000).toISOString(),
    },
  ],
  'interview-prep': [
    {
      id: 'msg_seed_5',
      channelId: 'interview-prep',
      senderId: 'seed_rohan',
      senderName: 'Rohan Verma',
      senderCollege: 'Delhi Technological University',
      senderRole: 'Data Scientist',
      senderPhoto: null,
      text: 'Daily DSA practice: Two Pointers and Sliding Window patterns are key for FAANG ML/backend screening rounds.',
      createdAt: new Date(Date.now() - 9000000).toISOString(),
    },
  ],
};

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CHANNELS_FILE)) {
      if (fs.existsSync(SEED_FILE)) {
        try {
          fs.copyFileSync(SEED_FILE, CHANNELS_FILE);
          return;
        } catch {}
      }
      fs.writeFileSync(CHANNELS_FILE, JSON.stringify(INITIAL_CHANNEL_MESSAGES, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error('ensureDataFile error:', e);
  }
}

function loadMessages(): Record<string, ChannelMessage[]> {
  try {
    ensureDataFile();
    if (fs.existsSync(CHANNELS_FILE)) {
      const raw = fs.readFileSync(CHANNELS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
    return INITIAL_CHANNEL_MESSAGES;
  } catch {
    return INITIAL_CHANNEL_MESSAGES;
  }
}

function saveMessages(data: Record<string, ChannelMessage[]>) {
  try {
    ensureDataFile();
    fs.writeFileSync(CHANNELS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save channel messages:', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId') || 'ml-engineering';

    const allMessages = loadMessages();
    const channelMsgs = allMessages[channelId] || [];

    return NextResponse.json({
      success: true,
      channelId,
      messages: channelMsgs.map((m) => ({
        ...m,
        isSelf: m.senderId === session.user.id,
      })),
    });
  } catch (error: any) {
    console.error('Channel GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch channel messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, profile } = session;
    const body = await req.json();
    const { channelId, text } = body;

    if (!channelId || !text || !text.trim()) {
      return NextResponse.json({ error: 'channelId and text are required' }, { status: 400 });
    }

    const allMessages = loadMessages();
    if (!allMessages[channelId]) {
      allMessages[channelId] = [];
    }

    const newMsg: ChannelMessage = {
      id: 'cmsg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      channelId,
      senderId: user.id,
      senderName: user.name,
      senderCollege: profile?.college || 'CareerX Peer',
      senderRole: profile?.careerGoal || profile?.preferredField || 'Student',
      senderPhoto: profile?.profilePhoto || null,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    allMessages[channelId].push(newMsg);
    saveMessages(allMessages);

    return NextResponse.json({
      success: true,
      message: {
        ...newMsg,
        isSelf: true,
      },
    });
  } catch (error: any) {
    console.error('Channel POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to post message' }, { status: 500 });
  }
}
