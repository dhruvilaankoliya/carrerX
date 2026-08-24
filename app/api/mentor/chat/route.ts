import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateMentorResponse } from '@/lib/ai/mentorService';
import { CAREER_TAXONOMY } from '@/lib/taxonomy/careerTaxonomy';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, profile } = session;
    const { message } = await req.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const targetCareer = CAREER_TAXONOMY[profile.targetCareerId || 'ml-engineer'] || CAREER_TAXONOMY['ml-engineer'];
    const knownSkills = JSON.parse(profile.technicalSkills || '[]');
    const latestScore = user.readinessScores?.[0];
    const overallScore = latestScore?.overallScore || 0;

    const criticalGaps = targetCareer.requiredSkills.filter(
      (s) => !knownSkills.some((k: string) => k.toLowerCase().includes(s.toLowerCase()))
    );

    const activePhase = user.roadmaps?.[0]?.phases?.find((p: any) => p.status === 'IN_PROGRESS')?.title || 'Foundation Stage';

    const responseText = await generateMentorResponse({
      userMessage: message,
      studentContext: {
        name: user.name,
        currentYear: profile.currentYear,
        targetCareer: targetCareer.title,
        overallScore,
        readinessTier: overallScore >= 82 ? 'Tier 1: Job-Ready Contender' : overallScore >= 65 ? 'Tier 2: Advanced Competency' : 'Tier 3: Foundation Building',
        knownSkills,
        criticalGaps,
        activeRoadmapPhase: activePhase,
      },
    });

    // Save message history
    await db.mentorMessage.create({
      data: {
        userId: user.id,
        sender: 'USER',
        messageText: message,
      },
    });

    await db.mentorMessage.create({
      data: {
        userId: user.id,
        sender: 'AI',
        messageText: responseText,
      },
    });

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error('Mentor chat error:', error);
    return NextResponse.json({ error: 'Failed to generate mentor response' }, { status: 500 });
  }
}
