import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateMentorResponse } from '@/lib/ai/mentorService';
import { CAREER_TAXONOMY } from '@/lib/taxonomy/careerTaxonomy';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await db.mentorMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    const activeProvider = process.env.GEMINI_API_KEY
      ? 'Google Gemini'
      : process.env.GROQ_API_KEY
      ? 'Groq Llama-3'
      : process.env.OPENROUTER_API_KEY
      ? 'OpenRouter'
      : process.env.OPENAI_API_KEY
      ? 'OpenAI'
      : 'CareerX Knowledge Engine';

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender as 'USER' | 'AI',
        text: m.messageText,
        timestamp: m.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })),
      activeProvider,
      isLlmConnected: Boolean(
        process.env.GEMINI_API_KEY ||
        process.env.GROQ_API_KEY ||
        process.env.OPENROUTER_API_KEY ||
        process.env.OPENAI_API_KEY
      ),
    });
  } catch (error: any) {
    console.error('Fetch mentor history error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, profile } = session;
    const body = await req.json().catch(() => ({}));
    const message = (body.message || body.query || '').trim();
    const customApiKey = (body.apiKey || body.customApiKey || req.headers.get('x-api-key') || '').trim();

    if (!message || message.length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const targetCareer =
      CAREER_TAXONOMY[profile.targetCareerId || 'ml-engineer'] || CAREER_TAXONOMY['ml-engineer'];
    const knownSkills = JSON.parse(profile.technicalSkills || '[]');
    const latestScore = user.readinessScores?.[0];
    const overallScore = latestScore?.overallScore || 0;

    const criticalGaps = targetCareer.requiredSkills.filter(
      (s) => !knownSkills.some((k: string) => k.toLowerCase().includes(s.toLowerCase()))
    );

    const activePhase =
      user.roadmaps?.[0]?.phases?.find((p: any) => p.status === 'IN_PROGRESS')?.title ||
      'Foundation Stage';

    // Fetch previous conversation history for multi-turn reasoning (last 8 messages)
    const rawHistory = await db.mentorMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    const history = rawHistory.reverse().map((m) => ({
      sender: m.sender as 'USER' | 'AI',
      text: m.messageText,
    }));

    const result = await generateMentorResponse({
      userMessage: message,
      studentContext: {
        name: user.name,
        college: profile.college,
        branch: profile.branch,
        currentYear: profile.currentYear,
        targetCareer: targetCareer.title,
        overallScore,
        readinessTier:
          overallScore >= 82
            ? 'Tier 1: Job-Ready Contender'
            : overallScore >= 65
            ? 'Tier 2: Advanced Competency'
            : 'Tier 3: Foundation Building',
        knownSkills,
        criticalGaps,
        activeRoadmapPhase: activePhase,
      },
      history,
      customApiKey,
    });

    // Save message history to DB
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
        messageText: result.response,
      },
    });

    return NextResponse.json({
      response: result.response,
      provider: result.provider,
      model: result.model,
      isEducational: result.isEducational,
    });
  } catch (error: any) {
    console.error('Mentor chat error:', error);
    return NextResponse.json({ error: 'Failed to generate mentor response' }, { status: 500 });
  }
}
