import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { computeReadinessIndex } from '@/lib/scoring/readinessIndex';
import { generatePersonalizedRoadmap } from '@/lib/roadmap/roadmapGenerator';
import { StudentProfileData } from '@/lib/scoring/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, profile } = session;
    const { targetCareerId } = await req.json();

    if (!targetCareerId) {
      return NextResponse.json({ error: 'targetCareerId is required' }, { status: 400 });
    }

    await db.profile.update({
      where: { userId: user.id },
      data: { targetCareerId },
    });

    const parsedResume = user.resumeData ? JSON.parse(user.resumeData.parsedJson || '{}') : {};
    const initialInterests = user.resumeData ? JSON.parse(user.resumeData.initialInterests || '{}') : {};

    const studentData: StudentProfileData = {
      userId: user.id,
      name: user.name,
      college: profile.college,
      course: profile.course,
      branch: profile.branch,
      currentYear: profile.currentYear,
      gradYear: profile.gradYear,
      cgpa: profile.cgpa,
      programmingLanguages: JSON.parse(profile.programmingLanguages || '[]'),
      technicalSkills: JSON.parse(profile.technicalSkills || '[]'),
      extractedSkills: parsedResume.technicalSkills || [],
      extractedProjects: parsedResume.projects || [],
      extractedCertifications: parsedResume.certifications || [],
      resumeInitialInterests: initialInterests,
      assessmentScores: {
        techInterest: initialInterests,
        aptitude: 75,
        problemSolving: 75,
        mindGames: 75,
      },
      streakDays: profile.streakDays || 1,
    };

    const readiness = computeReadinessIndex(studentData, targetCareerId);
    const roadmapPhases = generatePersonalizedRoadmap(studentData, targetCareerId);

    // Update Readiness Score
    await db.readinessScore.create({
      data: {
        userId: user.id,
        targetCareerId,
        overallScore: readiness.overallScore,
        techScore: readiness.subscores.techSkills,
        projectsScore: readiness.subscores.projects,
        resumeScore: readiness.subscores.resume,
        problemSolvingScore: readiness.subscores.problemSolving,
        interestScore: readiness.subscores.interestAlignment,
        consistencyScore: readiness.subscores.learningConsistency,
      },
    });

    // Update Roadmap
    await db.roadmap.deleteMany({ where: { userId: user.id } });
    const newRoadmap = await db.roadmap.create({
      data: {
        userId: user.id,
        targetCareerId,
        totalStages: roadmapPhases.length,
        completedStages: roadmapPhases.filter((p) => p.status === 'COMPLETED').length,
        progressPercent: Math.round(
          (roadmapPhases.filter((p) => p.status === 'COMPLETED').length / roadmapPhases.length) * 100
        ),
      },
    });

    for (const phase of roadmapPhases) {
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

    return NextResponse.json({ success: true, targetCareerId, readiness });
  } catch (error: any) {
    console.error('Target update error:', error);
    return NextResponse.json({ error: 'Failed to update target career' }, { status: 500 });
  }
}
