import { NextRequest, NextResponse } from 'next/server';
import { getStudentsForResource, normalizeResourceTopic } from '@/lib/studentConnectService';

export interface StudiedUser {
  id: string;
  name: string;
  role: string;
  companyOrCollege: string;
  avatarColor: string;
  initials: string;
  studiedAt: string;
  status: 'none' | 'pending' | 'connected';
  mutualSkills: string[];
  bio: string;
  isOnline: boolean;
  rating?: number;
  totalReviews?: number;
  completionPercent?: number;
  experienceLevel?: string;
  matchScore?: number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get('resourceId') || '';
    const skillName = searchParams.get('skillName') || '';
    const search = searchParams.get('search') || '';
    const college = searchParams.get('college') || 'all';
    const course = searchParams.get('course') || 'all';
    const year = searchParams.get('year') || 'all';
    const experienceLevel = searchParams.get('experienceLevel') || 'all';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const minProgress = parseInt(searchParams.get('minProgress') || '0', 10);
    const sortBy = (searchParams.get('sortBy') || 'relevant') as any;

    const result = getStudentsForResource({
      resourceId,
      skillName,
      search,
      college,
      course,
      year,
      experienceLevel,
      minRating: isNaN(minRating) ? 0 : minRating,
      minProgress: isNaN(minProgress) ? 0 : minProgress,
      sortBy,
    });

    const legacyUsers: StudiedUser[] = result.students.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.careerGoal,
      companyOrCollege: `${s.college} • ${s.course}`,
      avatarColor: s.avatarColor,
      initials: s.initials,
      studiedAt: s.lastActiveAt,
      status: 'none',
      mutualSkills: s.technicalSkills.slice(0, 4),
      bio: s.bio,
      isOnline: s.isOnline,
      rating: s.ratingsSummary.averageRating,
      totalReviews: s.ratingsSummary.totalReviews,
      completionPercent: s.completionPercent,
      experienceLevel: s.experienceLevel,
      matchScore: s.matchScore,
    }));

    return NextResponse.json({
      success: true,
      resourceTopic: result.resourceTopic,
      totalCount: result.totalStudents,
      students: result.students,
      users: legacyUsers,
    });
  } catch (error: any) {
    console.error('Studied users GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
