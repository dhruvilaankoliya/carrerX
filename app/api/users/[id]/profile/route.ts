import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user: currentUser } = session;
    const { id: targetUserId } = await params;

    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      include: {
        profile: true,
        resumeData: true,
      },
    });

    if (!targetUser || !targetUser.profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const p = targetUser.profile;
    const isSelf = currentUser.id === targetUser.id;

    // Check connection status between currentUser and targetUser
    let isAcceptedConnection = false;
    let connectionStatus: 'none' | 'pending' | 'accepted' | 'declined' = 'none';

    if (!isSelf) {
      const conn = await db.connection.findFirst({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: targetUser.id },
            { senderId: targetUser.id, receiverId: currentUser.id },
          ],
        },
      });
      if (conn) {
        connectionStatus = conn.status as any;
        isAcceptedConnection = conn.status === 'accepted';
      }
    } else {
      isAcceptedConnection = true;
      connectionStatus = 'accepted';
    }

    // Server-Side Privacy Check for "connections_only"
    if (!isSelf && p.profileVisibility === 'connections_only' && !isAcceptedConnection) {
      return NextResponse.json({
        id: targetUser.id,
        name: targetUser.name,
        college: p.college,
        course: p.course,
        currentYear: p.currentYear,
        profileVisibility: 'connections_only',
        connectionStatus,
        isRestricted: true,
        message: 'This profile is visible only to accepted connections.',
      });
    }

    // SERVER-SIDE PRIVACY FILTER:
    // Email is ONLY included if:
    // 1. It is the user's own profile, OR
    // 2. The target user enabled showEmail AND requester is an accepted connection.
    const safeEmail = (isSelf || (p.showEmail && isAcceptedConnection)) ? targetUser.email : null;

    // Phone is ONLY included if:
    // 1. It is the user's own profile, OR
    // 2. The target user enabled showPhone AND requester is an accepted connection.
    const safePhone = (isSelf || (p.showPhone && isAcceptedConnection)) ? targetUser.phone : null;

    let technicalSkills: string[] = [];
    let interests: string[] = [];
    let projects: any[] = [];
    let courses: any[] = [];
    let certifications: any[] = [];

    try { technicalSkills = JSON.parse(p.technicalSkills || '[]'); } catch {}
    try { interests = JSON.parse(p.interests || '[]'); } catch {}
    try { projects = JSON.parse(p.projects || '[]'); } catch {}
    try { courses = JSON.parse(p.courses || '[]'); } catch {}
    try { certifications = JSON.parse(p.certifications || '[]'); } catch {}

    // Combine with resume data if available
    if (targetUser.resumeData?.parsedJson) {
      try {
        const parsed = JSON.parse(targetUser.resumeData.parsedJson);
        if (Array.isArray(parsed.technicalSkills)) {
          technicalSkills = Array.from(new Set([...technicalSkills, ...parsed.technicalSkills]));
        }
        if (Array.isArray(parsed.projects) && projects.length === 0) {
          projects = parsed.projects;
        }
        if (Array.isArray(parsed.certifications) && certifications.length === 0) {
          certifications = parsed.certifications;
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: targetUser.id,
        name: targetUser.name,
        email: safeEmail,
        phone: safePhone,
        college: p.college,
        course: p.course,
        branch: p.branch,
        currentYear: p.currentYear,
        gradYear: p.gradYear,
        cgpa: p.cgpa,
        profilePhoto: p.profilePhoto,
        careerGoal: p.careerGoal || p.preferredField,
        preferredField: p.preferredField,
        technicalSkills,
        interests,
        projects,
        courses,
        certifications,
        linkedin: p.linkedin,
        github: p.github,
        availableToHelp: p.availableToHelp,
        studyBuddyEnabled: p.studyBuddyEnabled,
        profileVisibility: p.profileVisibility,
        showEmail: p.showEmail,
        showPhone: p.showPhone,
        allowConnectionRequests: p.allowConnectionRequests,
        connectionStatus,
        isAcceptedConnection,
        isSelf,
        lastActiveAt: p.lastActiveAt || p.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('User profile API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch user profile' }, { status: 500 });
  }
}
