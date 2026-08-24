import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const { user, profile } = session;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile,
        resumeData: user.resumeData ? {
          fileName: user.resumeData.fileName,
          uploadedAt: user.resumeData.uploadedAt,
          parsed: JSON.parse(user.resumeData.parsedJson || '{}'),
          initialInterests: JSON.parse(user.resumeData.initialInterests || '{}'),
        } : null,
        learningProfile: user.learningProfile,
        latestReadinessScore: user.readinessScores?.[0] || null,
        careerMatches: user.careerMatches || [],
        latestRoadmap: user.roadmaps?.[0] || null,
      },
    });
  } catch (error: any) {
    console.error('Auth /me error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
