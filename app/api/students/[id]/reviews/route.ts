import { NextRequest, NextResponse } from 'next/server';
import { getStudentProfileById, submitStudentReview } from '@/lib/studentConnectService';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = getStudentProfileById(id);

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ratingsSummary: profile.ratingsSummary,
      reviews: profile.reviews,
    });
  } catch (error: any) {
    console.error('Student reviews GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { rating, reviewText, resourceTopic, reviewerName, reviewerCollege } = body;

    let reviewerId = 'usr_guest_learner';
    let reviewerDisplayName = reviewerName || 'Verified Peer Learner';
    let reviewerDisplayCollege = reviewerCollege || 'CareerX Peer Learning Network';

    try {
      const session = await getCurrentUser();
      if (session?.user) {
        reviewerId = session.user.id;
        reviewerDisplayName = session.user.name;
        reviewerDisplayCollege = session.user.profile?.college || reviewerDisplayCollege;
      }
    } catch {}

    const result = submitStudentReview({
      reviewerId,
      reviewerName: reviewerDisplayName,
      reviewerCollege: reviewerDisplayCollege,
      studentId: id,
      resourceTopic: resourceTopic || 'Engineering Practice',
      rating: parseFloat(rating),
      reviewText: reviewText || 'Very helpful in explaining core technical concepts.',
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      ratingsSummary: result.updatedSummary,
      review: result.review,
    });
  } catch (error: any) {
    console.error('Student reviews POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit rating' }, { status: 400 });
  }
}
