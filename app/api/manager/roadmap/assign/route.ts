import { NextRequest, NextResponse } from 'next/server';
import { verifyManager } from '@/lib/managerAuth';
import { db } from '@/lib/db';
import { generatePersonalizedRoadmap } from '@/lib/roadmap/roadmapGenerator';
import { StudentProfileData } from '@/lib/scoring/types';

export async function POST(req: NextRequest) {
  const auth = await verifyManager();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { userId, targetCareerId, deadline } = body;

    if (!userId || !targetCareerId) {
      return NextResponse.json({ error: 'userId and targetCareerId are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true, resumeData: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const prof = user.profile;
    const parsedResume = user.resumeData?.parsedJson ? JSON.parse(user.resumeData.parsedJson) : {};

    const studentProfile: StudentProfileData = {
      userId: user.id,
      name: user.name,
      college: prof?.college || 'University',
      course: prof?.course || 'B.Tech',
      branch: prof?.branch || 'Computer Science',
      currentYear: prof?.currentYear || 3,
      gradYear: prof?.gradYear || 2026,
      cgpa: prof?.cgpa || 8.5,
      programmingLanguages: prof ? JSON.parse(prof.programmingLanguages || '[]') : [],
      technicalSkills: prof ? JSON.parse(prof.technicalSkills || '[]') : [],
      extractedSkills: parsedResume.technicalSkills || [],
      extractedProjects: parsedResume.projects || [],
      extractedCertifications: parsedResume.certifications || [],
      resumeInitialInterests: {},
      assessmentScores: {
        techInterest: {},
        aptitude: 80,
        problemSolving: 80,
        mindGames: 80,
      },
      streakDays: prof?.streakDays || 1,
    };

    const newPhases = generatePersonalizedRoadmap(studentProfile, targetCareerId);

    // Delete previous roadmaps or update targetCareerId in profile
    await db.profile.update({
      where: { userId },
      data: { targetCareerId },
    });

    // Create new roadmap
    const newRoadmap = await db.roadmap.create({
      data: {
        userId,
        targetCareerId,
        totalStages: newPhases.length,
        completedStages: 0,
        progressPercent: 0,
        assignedBy: 'manager',
        deadline: deadline ? new Date(deadline) : null,
        lastActivityAt: new Date(),
      },
    });

    for (const phase of newPhases) {
      await db.roadmapPhase.create({
        data: {
          roadmapId: newRoadmap.id,
          phaseNumber: phase.phaseNumber,
          title: phase.title,
          subtitle: phase.subtitle,
          duration: phase.duration,
          status: phase.status,
          progress: phase.progress,
          topics: JSON.stringify(phase.topics),
          deliverables: JSON.stringify(phase.deliverables),
        },
      });
    }

    await db.activityEvent.create({
      data: {
        userId,
        eventType: 'ROADMAP_ASSIGNED_BY_MANAGER',
        entityType: 'roadmap',
        entityId: newRoadmap.id,
        metadata: JSON.stringify({ targetCareerId, deadline, assignedBy: auth.manager.name }),
      },
    });

    return NextResponse.json({
      success: true,
      roadmapId: newRoadmap.id,
      message: `Roadmap for ${targetCareerId} successfully assigned.`,
    });
  } catch (error: any) {
    console.error('Assign roadmap error:', error);
    return NextResponse.json({ error: error.message || 'Failed to assign roadmap' }, { status: 500 });
  }
}
