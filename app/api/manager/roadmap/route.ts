import { NextRequest, NextResponse } from 'next/server';
import { verifyManager } from '@/lib/managerAuth';
import { db } from '@/lib/db';
import { CAREER_TAXONOMY } from '@/lib/taxonomy/careerTaxonomy';

export async function GET(req: NextRequest) {
  const auth = await verifyManager();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all | stuck | behind | completed

    // Fetch all student users and their latest roadmap
    const students = await db.user.findMany({
      where: { role: 'user' },
      include: {
        profile: true,
        roadmaps: {
          include: {
            phases: {
              orderBy: { phaseNumber: 'asc' },
            },
          },
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    const rows = students.map((s) => {
      const rm = s.roadmaps[0] || null;
      const targetCareerId = rm?.targetCareerId || s.profile?.targetCareerId || 'ml-engineer';
      const careerDef = CAREER_TAXONOMY[targetCareerId] || CAREER_TAXONOMY['ml-engineer'];

      let currentMilestone = 'Not Started';
      let currentPhaseNumber = 1;
      let totalPhases = rm?.phases?.length || 5;

      if (rm?.phases && rm.phases.length > 0) {
        const inProgressPhase = rm.phases.find((p) => p.status === 'IN_PROGRESS');
        const notStartedPhase = rm.phases.find((p) => p.status === 'NOT_STARTED');
        const active = inProgressPhase || notStartedPhase || rm.phases[rm.phases.length - 1];
        currentMilestone = active ? `Phase ${active.phaseNumber}: ${active.title}` : 'Completed';
        currentPhaseNumber = active ? active.phaseNumber : totalPhases;
      }

      const lastActive = rm?.lastActivityAt ? new Date(rm.lastActivityAt) : new Date(s.lastSeenAt || s.createdAt);
      const isStuck = now.getTime() - lastActive.getTime() > sevenDaysMs && (rm?.progressPercent || 0) < 100;

      // Expected vs actual date estimation
      const deadline = rm?.deadline ? new Date(rm.deadline) : null;
      let isBehind = false;
      if (deadline) {
        const totalDuration = deadline.getTime() - (rm?.generatedAt ? new Date(rm.generatedAt).getTime() : now.getTime());
        const timeElapsed = now.getTime() - (rm?.generatedAt ? new Date(rm.generatedAt).getTime() : now.getTime());
        const expectedProgress = totalDuration > 0 ? Math.min(100, Math.round((timeElapsed / totalDuration) * 100)) : 50;
        if ((rm?.progressPercent || 0) < expectedProgress - 15) {
          isBehind = true;
        }
      }

      return {
        userId: s.id,
        userName: s.name,
        userEmail: s.email,
        roadmapId: rm?.id || null,
        targetCareerId,
        careerTitle: careerDef.title,
        progressPercent: rm?.progressPercent || 0,
        completedStages: rm?.completedStages || 0,
        totalStages: rm?.totalStages || totalPhases,
        currentMilestone,
        currentPhaseNumber,
        assignedBy: rm?.assignedBy || 'system',
        deadline: deadline ? deadline.toISOString() : null,
        lastActivityAt: lastActive.toISOString(),
        isStuck,
        isBehind,
        phases: rm?.phases || [],
      };
    });

    let filteredRows = rows;
    if (filter === 'stuck') {
      filteredRows = rows.filter((r) => r.isStuck);
    } else if (filter === 'behind') {
      filteredRows = rows.filter((r) => r.isBehind);
    } else if (filter === 'completed') {
      filteredRows = rows.filter((r) => r.progressPercent === 100);
    }

    const availableCareers = Object.values(CAREER_TAXONOMY).map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
    }));

    return NextResponse.json({
      roadmaps: filteredRows,
      stats: {
        totalLearners: rows.length,
        stuckCount: rows.filter((r) => r.isStuck).length,
        behindCount: rows.filter((r) => r.isBehind).length,
        avgProgress: Math.round(rows.reduce((acc, r) => acc + r.progressPercent, 0) / Math.max(1, rows.length)),
      },
      availableCareers,
    });
  } catch (error: any) {
    console.error('Manager Roadmaps error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch roadmaps' }, { status: 500 });
  }
}
