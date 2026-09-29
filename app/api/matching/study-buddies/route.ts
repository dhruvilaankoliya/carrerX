import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { normalizeSkill } from '@/lib/matching/matchingEngine';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(req.url);
    const skillParam = searchParams.get('skill') || '';
    const level = (searchParams.get('level') || 'all').toLowerCase(); // beginner | intermediate | advanced | all
    const statusFilter = (searchParams.get('status') || 'all').toLowerCase(); // currently_learning | completed | willing_to_help | all

    const normalizedTargetSkill = skillParam ? normalizeSkill(skillParam) : '';

    const candidates = await db.user.findMany({
      where: {
        id: { not: user.id },
        profile: {
          studyBuddyEnabled: true,
        },
      },
      include: {
        profile: true,
      },
    });

    const results = [];

    for (const c of candidates) {
      const p = c.profile;
      if (!p) continue;

      let techSkills: string[] = [];
      let courses: any[] = [];
      let projects: any[] = [];
      try { techSkills = JSON.parse(p.technicalSkills || '[]'); } catch {}
      try { courses = JSON.parse(p.courses || '[]'); } catch {}
      try { projects = JSON.parse(p.projects || '[]'); } catch {}

      const normSkills = techSkills.map(normalizeSkill);
      const hasTargetSkill = normalizedTargetSkill
        ? normSkills.includes(normalizedTargetSkill)
        : true;

      if (!hasTargetSkill) continue;

      // Determine level heuristic:
      // Beginner: < 2 projects and <= 2nd year
      // Intermediate: 2-3 projects or 3rd year
      // Advanced: 4+ projects or 4th year / graduated or completed courses
      let calculatedLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
      if ((p.currentYear || 1) <= 2 && projects.length <= 1) {
        calculatedLevel = 'beginner';
      } else if ((p.currentYear || 3) >= 4 || projects.length >= 3 || courses.length >= 2) {
        calculatedLevel = 'advanced';
      }

      if (level !== 'all' && calculatedLevel !== level) {
        continue;
      }

      // Status: willing_to_help, completed, currently_learning
      let status: 'willing_to_help' | 'completed' | 'currently_learning' = 'currently_learning';
      if (p.availableToHelp) {
        status = 'willing_to_help';
      } else if (courses.some((crs: any) => (crs.skills || []).map(normalizeSkill).includes(normalizedTargetSkill))) {
        status = 'completed';
      }

      if (statusFilter !== 'all' && status !== statusFilter) {
        continue;
      }

      results.push({
        id: c.id,
        name: c.name,
        college: p.college,
        course: p.course,
        year: p.currentYear,
        profilePhoto: p.profilePhoto,
        careerGoal: p.careerGoal || p.preferredField,
        skill: normalizedTargetSkill || normSkills[0] || 'Software Engineering',
        level: calculatedLevel,
        status,
        availableToHelp: p.availableToHelp,
        projectsCount: projects.length,
        coursesCount: courses.length,
      });
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      buddies: results,
    });
  } catch (error: any) {
    console.error('Study buddies API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch study buddies' }, { status: 500 });
  }
}
