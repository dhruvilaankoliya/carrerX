import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { computeReadinessIndex } from '@/lib/scoring/readinessIndex';
import { computeCareerMatches } from '@/lib/scoring/careerMatcher';
import { computeLearningProfile } from '@/lib/scoring/learningProfile';
import { generatePersonalizedRoadmap } from '@/lib/roadmap/roadmapGenerator';
import { StudentProfileData } from '@/lib/scoring/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, profile } = session;
    const body = await req.json();
    const {
      techInterestScores = {}, // { "AI & Data": 85, "Software & Web": 60, ... }
      aptitudeScore = 75,
      problemSolvingScore = 80,
      mindGamesScore = 78,
      rawResponses = [],
    } = body;

    // Save individual raw responses
    for (const r of rawResponses) {
      await db.assessmentResponse.create({
        data: {
          userId: user.id,
          section: r.section || 'ASSESSMENT',
          questionId: r.questionId || 'q',
          rawAnswer: String(r.rawAnswer || ''),
          isCorrect: r.isCorrect ?? null,
          score: r.score ?? 1,
          timeSpentMs: r.timeSpentMs ?? 0,
        },
      });
    }

    // Build Typed Student Profile
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
        techInterest: techInterestScores,
        aptitude: aptitudeScore,
        problemSolving: problemSolvingScore,
        mindGames: mindGamesScore,
      },
      streakDays: profile.streakDays || 1,
    };

    const targetCareerId = profile.targetCareerId || 'ml-engineer';

    // Compute Pure Scores
    const readiness = computeReadinessIndex(studentData, targetCareerId);
    const matches = computeCareerMatches(studentData);
    const learningProfile = computeLearningProfile(studentData);
    const roadmapPhases = generatePersonalizedRoadmap(studentData, targetCareerId);

    // Save Readiness Score
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

    // Save Learning Profile
    await db.learningProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        analyticalPreference: learningProfile.analyticalPreference,
        problemSolvingStyle: learningProfile.problemSolvingStyle,
        technicalInclination: learningProfile.technicalInclination,
        decisionMakingPattern: learningProfile.decisionMakingPattern,
        summary: learningProfile.summary,
      },
      update: {
        analyticalPreference: learningProfile.analyticalPreference,
        problemSolvingStyle: learningProfile.problemSolvingStyle,
        technicalInclination: learningProfile.technicalInclination,
        decisionMakingPattern: learningProfile.decisionMakingPattern,
        summary: learningProfile.summary,
      },
    });

    // Save Career Matches
    await db.careerMatch.deleteMany({ where: { userId: user.id } });
    for (const m of matches) {
      await db.careerMatch.create({
        data: {
          userId: user.id,
          careerId: m.careerId,
          matchScore: m.matchScore,
          whyRecommended: m.whyRecommended,
          whatsMissing: JSON.stringify(m.whatsMissing),
        },
      });
    }

    // Save Personalized Roadmap
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

    // Unlock Career Analysis
    await db.profile.update({
      where: { userId: user.id },
      data: {
        completenessStage: 6, // 6: Unlocked
        completenessPercent: 100,
      },
    });

    return NextResponse.json({
      success: true,
      readiness,
      topMatch: matches[0],
      learningProfile,
      completenessPercent: 100,
    });
  } catch (error: any) {
    console.error('Assessment submit error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit assessment' }, { status: 500 });
  }
}
