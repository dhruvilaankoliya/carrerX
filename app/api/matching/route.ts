import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  computeStudentMatch,
  rankAndFilterMatches,
  CandidateUser,
  TargetUserContext,
  normalizeSkill,
} from '@/lib/matching/matchingEngine';

const ROLE_DEFAULT_GAPS: Record<string, string[]> = {
  'ml-engineer': ['Docker', 'Kubernetes', 'FastAPI', 'MLOps', 'Vector DB', 'CI/CD', 'Model Monitoring', 'PyTorch', 'Transformers', 'System Design'],
  'Machine Learning Engineer': ['Docker', 'Kubernetes', 'FastAPI', 'MLOps', 'Vector DB', 'CI/CD', 'Model Monitoring', 'PyTorch', 'Transformers', 'System Design'],
  'fullstack': ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'Redis', 'CI/CD', 'System Design'],
  'Full Stack Architect': ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'Redis', 'CI/CD', 'System Design'],
  'devops': ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Prometheus', 'Grafana', 'Git'],
  'Cloud DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Prometheus', 'Grafana', 'Git'],
  'data-scientist': ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL', 'Statistics', 'Deep Learning', 'PyTorch', 'Model Monitoring'],
  'Data Scientist': ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL', 'Statistics', 'Deep Learning', 'PyTorch', 'Model Monitoring'],
};

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, profile } = session;
    const { searchParams } = new URL(req.url);

    // Query parameters
    const mode = (searchParams.get('mode') || 'all') as 'help' | 'study_buddy' | 'all';
    const search = searchParams.get('search') || '';
    const skill = searchParams.get('skill') || '';
    const college = searchParams.get('college') || '';
    const course = searchParams.get('course') || '';
    const year = searchParams.get('year') || '';
    const careerGoal = searchParams.get('careerGoal') || '';
    const hasProjects = searchParams.get('hasProjects') === 'true';
    const sort = (searchParams.get('sort') || 'best_skill_match') as any;

    // Determine target user's missing and target skills
    const rawTargetSkillsParam = searchParams.get('targetSkills');
    let targetSkills: string[] = [];

    if (rawTargetSkillsParam) {
      try {
        targetSkills = JSON.parse(rawTargetSkillsParam);
      } catch {
        targetSkills = rawTargetSkillsParam.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    // If no targetSkills passed from query, infer from user's parsed resume and target role
    if (targetSkills.length === 0) {
      const targetRole = profile?.targetCareerId || profile?.careerGoal || 'Machine Learning Engineer';
      const requiredSkills = ROLE_DEFAULT_GAPS[targetRole] || ROLE_DEFAULT_GAPS['Machine Learning Engineer'];
      
      let userExistingSkills: string[] = [];
      if (profile?.technicalSkills) {
        try {
          userExistingSkills = JSON.parse(profile.technicalSkills);
        } catch {}
      }
      if (user.resumeData?.parsedJson) {
        try {
          const parsed = JSON.parse(user.resumeData.parsedJson);
          if (Array.isArray(parsed.technicalSkills)) {
            userExistingSkills = Array.from(new Set([...userExistingSkills, ...parsed.technicalSkills]));
          }
        } catch {}
      }

      const normalizedExisting = new Set(userExistingSkills.map(normalizeSkill));
      targetSkills = requiredSkills.filter((reqSkill) => !normalizedExisting.has(normalizeSkill(reqSkill)));
      
      // If student has all skills or gaps are empty, default to key role skills
      if (targetSkills.length === 0) {
        targetSkills = ['Docker', 'Kubernetes', 'FastAPI', 'MLOps', 'Vector DB'];
      }
    }

    const targetContext: TargetUserContext = {
      userId: user.id,
      targetSkills,
      careerGoal: profile?.careerGoal || profile?.preferredField || 'Machine Learning Engineer',
      preferredField: profile?.preferredField || undefined,
      interests: profile?.interests ? JSON.parse(profile.interests) : [],
    };

    // Fetch existing connections involving the current user
    const existingConnections = await db.connection.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
    });

    const connectionMap = new Map<string, { status: 'pending' | 'accepted' | 'declined'; isSender: boolean }>();
    existingConnections.forEach((conn: any) => {
      const partnerId = conn.senderId === user.id ? conn.receiverId : conn.senderId;
      connectionMap.set(partnerId, {
        status: conn.status as any,
        isSender: conn.senderId === user.id,
      });
    });

    // Fetch all eligible candidates (excluding self)
    const candidateUsers = await db.user.findMany({
      where: {
        id: { not: user.id },
      },
      include: {
        profile: true,
        resumeData: true,
      },
    });

    const candidateList: CandidateUser[] = [];

    for (const c of candidateUsers) {
      const p = c.profile;
      if (!p) continue;

      const connInfo = connectionMap.get(c.id);
      const isAcceptedConnection = connInfo?.status === 'accepted';

      // Respect profile visibility: if connections_only and not accepted, skip
      if (p.profileVisibility === 'connections_only' && !isAcceptedConnection) {
        continue;
      }

      // Respect allowConnectionRequests unless already connected
      if (!p.allowConnectionRequests && !isAcceptedConnection) {
        // can still view if public, but note status
      }

      let techSkills: string[] = [];
      let interests: string[] = [];
      let projects: any[] = [];
      let courses: any[] = [];
      let certifications: any[] = [];

      try { techSkills = JSON.parse(p.technicalSkills || '[]'); } catch {}
      try { interests = JSON.parse(p.interests || '[]'); } catch {}
      try { projects = JSON.parse(p.projects || '[]'); } catch {}
      try { courses = JSON.parse(p.courses || '[]'); } catch {}
      try { certifications = JSON.parse(p.certifications || '[]'); } catch {}

      // If user has parsed resume data, also combine projects/courses
      if (c.resumeData?.parsedJson) {
        try {
          const parsed = JSON.parse(c.resumeData.parsedJson);
          if (Array.isArray(parsed.technicalSkills)) {
            techSkills = Array.from(new Set([...techSkills, ...parsed.technicalSkills]));
          }
          if (Array.isArray(parsed.projects) && projects.length === 0) {
            projects = parsed.projects;
          }
          if (Array.isArray(parsed.certifications) && certifications.length === 0) {
            certifications = parsed.certifications;
          }
        } catch {}
      }

      candidateList.push({
        id: c.id,
        name: c.name,
        // PRIVACY ENFORCEMENT: Never attach raw email or phone to matching results
        email: undefined,
        phone: undefined,
        college: p.college || 'Engineering Institute',
        course: p.course || 'B.Tech',
        currentYear: p.currentYear || 3,
        gradYear: p.gradYear || 2026,
        profilePhoto: p.profilePhoto,
        careerGoal: p.careerGoal || p.preferredField || 'Software Engineer',
        preferredField: p.preferredField,
        technicalSkills: techSkills,
        interests,
        projects,
        courses,
        certifications,
        availableToHelp: p.availableToHelp ?? false,
        studyBuddyEnabled: p.studyBuddyEnabled ?? true,
        profileVisibility: p.profileVisibility || 'public',
        showEmail: p.showEmail ?? false,
        showPhone: p.showPhone ?? false,
        allowConnectionRequests: p.allowConnectionRequests ?? true,
        connectionStatus: connInfo ? connInfo.status : 'none',
        lastActiveAt: p.lastActiveAt || p.updatedAt,
      });
    }

    // Compute deterministic match scores
    const computedMatches = candidateList
      .map((cand) => computeStudentMatch(targetContext, cand))
      .filter((m): m is NonNullable<typeof m> => m !== null);

    // Apply ranking and filters
    const filteredMatches = rankAndFilterMatches(computedMatches, {
      mode: mode === 'all' ? undefined : mode,
      search,
      skill,
      college,
      course,
      year,
      careerGoal,
      hasProjects,
      sort,
      currentUserCollege: profile?.college,
      currentUserCourse: profile?.course,
    });

    // Extract available filters for UI chips
    const allColleges = Array.from(new Set(computedMatches.map((m) => m.college))).filter(Boolean);
    const allCourses = Array.from(new Set(computedMatches.map((m) => m.course))).filter(Boolean);
    const allSkills = Array.from(
      new Set(computedMatches.flatMap((m) => [...m.matchedSkills, ...m.canHelpWith]))
    ).filter(Boolean);

    return NextResponse.json({
      success: true,
      totalMatches: filteredMatches.length,
      allPotentialCount: computedMatches.length,
      targetSkills,
      matches: filteredMatches,
      filterOptions: {
        colleges: allColleges,
        courses: allCourses,
        skills: allSkills,
      },
    });
  } catch (error: any) {
    console.error('Matching API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to compute matches' }, { status: 500 });
  }
}
