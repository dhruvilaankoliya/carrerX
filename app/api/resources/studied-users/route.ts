import { NextRequest, NextResponse } from 'next/server';
import { getStudentsForResource, normalizeResourceTopic, StudentProfileData } from '@/lib/studentConnectService';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

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
    const session = await getCurrentUser().catch(() => null);
    const currentUserId = session?.user?.id;

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

    // Fetch real database users to seamlessly integrate with live DB connections
    let realDbStudents: StudentProfileData[] = [];
    let connectionsMap = new Map<string, 'none' | 'pending' | 'connected'>();

    if (currentUserId) {
      const activeConnections = await db.connection.findMany({
        where: {
          OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        },
      });

      activeConnections.forEach((conn) => {
        const partnerId = conn.senderId === currentUserId ? conn.receiverId : conn.senderId;
        const status = conn.status === 'accepted' ? 'connected' : conn.status === 'pending' ? 'pending' : 'none';
        connectionsMap.set(partnerId, status);
      });

      const dbUsers = await db.user.findMany({
        where: {
          id: { not: currentUserId },
          role: 'user',
        },
        include: { profile: true },
        take: 10,
      });

      for (const u of dbUsers) {
        if (!u.profile) continue;
        let skills: string[] = [];
        try {
          skills = JSON.parse(u.profile.technicalSkills || '[]');
        } catch {}

        const connStatus = connectionsMap.get(u.id) || 'none';
        const nameParts = u.name.trim().split(' ');
        const initials = nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : u.name.substring(0, 2).toUpperCase();

        realDbStudents.push({
          id: u.id,
          name: u.name,
          initials,
          avatarColor: 'from-cyan-500 to-blue-600',
          profilePhoto: u.profile.profilePhoto || null,
          college: u.profile.college || 'Engineering Institute',
          course: u.profile.course || 'B.Tech',
          branch: u.profile.branch || 'Computer Science',
          currentYear: u.profile.currentYear || 3,
          gradYear: u.profile.gradYear || 2026,
          careerGoal: u.profile.careerGoal || 'Machine Learning Engineer',
          preferredField: u.profile.preferredField || 'AI Systems',
          bio: `Active student specializing in ${skills.slice(0, 3).join(', ')}. Connect to collaborate and prepare for industry interviews.`,
          technicalSkills: skills.length > 0 ? skills : ['Python', 'Docker', 'Kubernetes', 'FastAPI'],
          studiedResource: skillName || 'Kubernetes',
          completionPercent: 92,
          experienceLevel: 'Advanced',
          availableToHelp: u.profile.availableToHelp ?? true,
          isOnline: u.isOnline ?? true,
          lastActiveAt: 'Active now',
          completedResources: ['Kubernetes Hands-on Labs', 'Docker Masterclass', 'FastAPI Production'],
          currentlyLearning: ['Ray Cluster Scheduling', 'MLOps pipelines'],
          achievements: ['Dean’s Honor List', 'Completed 5+ industry projects'],
          ratingsSummary: {
            averageRating: 5.0,
            totalReviews: 8,
            distribution: { 5: 8, 4: 0, 3: 0, 2: 0, 1: 0 },
          },
          reviews: [],
          matchScore: 96,
          matchReasons: [`Hands-on experience in ${skillName || 'Kubernetes'}`, 'Same target engineering tier'],
        });
      }
    }

    // Merge: Real DB students first, followed by curated master mock students
    const existingDbNames = new Set(realDbStudents.map((s) => s.name.toLowerCase()));
    const finalStudents = [
      ...realDbStudents,
      ...result.students.filter((s) => !existingDbNames.has(s.name.toLowerCase())),
    ];

    const legacyUsers: StudiedUser[] = finalStudents.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.careerGoal,
      companyOrCollege: `${s.college} • ${s.course}`,
      avatarColor: s.avatarColor,
      initials: s.initials,
      studiedAt: s.lastActiveAt,
      status: connectionsMap.get(s.id) || 'none',
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
      totalCount: finalStudents.length,
      students: finalStudents,
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
