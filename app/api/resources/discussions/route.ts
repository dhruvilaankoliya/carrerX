import { NextRequest, NextResponse } from 'next/server';
import {
  getDiscussionsForTopic,
  createDiscussionQuestion,
  addDiscussionReply,
} from '@/lib/studentConnectService';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic') || 'Kubernetes';

    const discussions = getDiscussionsForTopic(topic);

    return NextResponse.json({
      success: true,
      topic,
      discussions,
    });
  } catch (error: any) {
    console.error('Discussions GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, topic, title, content, discussionId, authorName, authorCollege } = body;

    let authorId = 'usr_guest_learner';
    let authorDisplayName = authorName || 'CareerX Student';
    let authorDisplayCollege = authorCollege || 'CareerX Community';

    try {
      const session = await getCurrentUser();
      if (session?.user) {
        authorId = session.user.id;
        authorDisplayName = session.user.name;
        authorDisplayCollege = session.user.profile?.college || authorDisplayCollege;
      }
    } catch {}

    if (action === 'reply') {
      if (!discussionId || !content) {
        return NextResponse.json({ error: 'discussionId and content are required' }, { status: 400 });
      }
      const result = addDiscussionReply({
        discussionId,
        resourceTopic: topic || 'Kubernetes',
        authorName: authorDisplayName,
        authorCollege: authorDisplayCollege,
        content,
      });
      return NextResponse.json(result);
    } else {
      // Create new discussion thread
      if (!title || !content) {
        return NextResponse.json({ error: 'title and content are required' }, { status: 400 });
      }
      const newDisc = createDiscussionQuestion({
        resourceTopic: topic || 'Kubernetes',
        title,
        content,
        authorId,
        authorName: authorDisplayName,
        authorCollege: authorDisplayCollege,
      });
      return NextResponse.json({ success: true, discussion: newDisc });
    }
  } catch (error: any) {
    console.error('Discussions POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to process discussion' }, { status: 400 });
  }
}
