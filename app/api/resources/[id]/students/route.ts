import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, isUserOnline } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getCurrentUser();
    const currentUserId = session?.user?.id || '';

    const resolvedParams = await params;
    const resourceId = resolvedParams.id;

    if (!resourceId) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const resource = await db.resource.findUnique({
      where: { id: resourceId },
      include: {
        skill: true,
        studyProgresses: {
          include: {
            user: {
              include: { profile: true },
            },
          },
          orderBy: { studiedAt: 'desc' },
        },
      },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Direct students who studied this specific resource
    const directStudentIds = new Set<string>();
    const studentsList: any[] = [];

    for (const p of resource.studyProgresses) {
      if (p.user.id === currentUserId) continue; // exclude self
      directStudentIds.add(p.user.id);

      const profile = p.user.profile;
      const skillsArr: string[] = profile ? JSON.parse(profile.technicalSkills || '[]') : [];
      const hasSkill = skillsArr.some((s) => s.toLowerCase() === resource.skill.name.toLowerCase());

      studentsList.push({
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
        college: profile?.college || 'Engineering College',
        course: profile?.course || 'B.Tech',
        branch: profile?.branch || 'Computer Science',
        currentYear: profile?.currentYear || 3,
        cgpa: profile?.cgpa || 8.5,
        targetRole: profile?.careerGoal || 'Software Engineer',
        skillStrength: hasSkill ? 'Advanced (92%)' : 'Intermediate (78%)',
        studiedAt: p.studiedAt,
        hasStudiedThisResource: true,
        isOnline: isUserOnline(p.user),
        avatar: profile?.profilePhoto || null,
        streakDays: profile?.streakDays || 5,
      });
    }

    // Also find other students who studied the same skill or list it in profile
    const peerUsers = await db.user.findMany({
      where: {
        id: { notIn: [currentUserId, ...Array.from(directStudentIds)] },
        role: 'user',
      },
      include: { profile: true },
      take: 10,
    });

    for (const u of peerUsers) {
      const profile = u.profile;
      if (!profile) continue;

      const skillsArr: string[] = JSON.parse(profile.technicalSkills || '[]');
      const matchesSkill = skillsArr.some(
        (s) =>
          s.toLowerCase() === resource.skill.name.toLowerCase() ||
          s.toLowerCase().includes(resource.skill.name.toLowerCase())
      );

      if (matchesSkill || studentsList.length < 5) {
        studentsList.push({
          id: u.id,
          name: u.name,
          email: u.email,
          college: profile.college || 'Engineering College',
          course: profile.course || 'B.Tech',
          branch: profile.branch || 'Computer Science',
          currentYear: profile.currentYear || 3,
          cgpa: profile.cgpa || 8.4,
          targetRole: profile.careerGoal || 'Software Engineer',
          skillStrength: matchesSkill ? 'Advanced (88%)' : 'Practitioner (70%)',
          studiedAt: null,
          hasStudiedThisResource: false,
          isOnline: isUserOnline(u),
          avatar: profile.profilePhoto || null,
          streakDays: profile.streakDays || 3,
        });
      }
    }

    return NextResponse.json({
      success: true,
      resourceTitle: resource.title,
      skillName: resource.skill.name,
      totalCount: studentsList.length,
      students: studentsList,
    });
  } catch (error: any) {
    console.error('GET /api/resources/[id]/students error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch students' }, { status: 500 });
  }
}
