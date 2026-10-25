import { NextRequest, NextResponse } from 'next/server';
import { verifyManager } from '@/lib/managerAuth';
import { db } from '@/lib/db';
import { CAREER_TAXONOMY } from '@/lib/taxonomy/careerTaxonomy';
import { buildSkillRelationshipGraph } from '@/lib/graph/graphBuilder';
import { StudentProfileData } from '@/lib/scoring/types';

export async function GET(req: NextRequest) {
  const auth = await verifyManager();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const selectedUserId = searchParams.get('userId');
    const compareUserId = searchParams.get('compareUserId');

    // 1. Fetch all student users with profiles, resumeData, readinessScores
    const students = await db.user.findMany({
      where: { role: 'user' },
      include: {
        profile: true,
        resumeData: true,
        readinessScores: {
          orderBy: { computedAt: 'desc' },
          take: 5,
        },
        assessmentAttempts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { name: 'asc' },
    });

    // Curated standard skill catalog across domains
    const standardSkills = [
      { name: 'Python', category: 'Programming' },
      { name: 'Data Structures & Algorithms', category: 'Programming' },
      { name: 'Git & GitHub', category: 'Programming' },
      { name: 'TypeScript / JavaScript', category: 'Software & Web' },
      { name: 'React & Next.js', category: 'Software & Web' },
      { name: 'REST & GraphQL APIs', category: 'Software & Web' },
      { name: 'Database Management', category: 'Software & Web' },
      { name: 'PyTorch', category: 'AI & ML' },
      { name: 'Deep Learning', category: 'AI & ML' },
      { name: 'RAG & Vector DBs', category: 'AI & ML' },
      { name: 'Scikit-Learn', category: 'AI & ML' },
      { name: 'Docker Containers', category: 'Cloud & DevOps' },
      { name: 'Kubernetes Orchestration', category: 'Cloud & DevOps' },
      { name: 'CI/CD Pipelines', category: 'Cloud & DevOps' },
      { name: 'Linux Command Line', category: 'Cloud & DevOps' },
      { name: 'OWASP Security Top 10', category: 'Cybersecurity' },
    ];

    // Compute user skills and strength score (0 to 100)
    const userSkillMatrix: Record<string, Record<string, number>> = {};
    const teamSkillSums: Record<string, { total: number; count: number; category: string }> = {};

    standardSkills.forEach((s) => {
      teamSkillSums[s.name] = { total: 0, count: 0, category: s.category };
    });

    students.forEach((s) => {
      userSkillMatrix[s.id] = {};
      const p = s.profile;
      const parsedResume = s.resumeData?.parsedJson ? JSON.parse(s.resumeData.parsedJson) : {};
      const userSkillsSet = new Set(
        [
          ...(p ? JSON.parse(p.programmingLanguages || '[]') : []),
          ...(p ? JSON.parse(p.technicalSkills || '[]') : []),
          ...(parsedResume.technicalSkills || []),
        ].map((item: string) => item.toLowerCase())
      );

      const readinessOverall = s.readinessScores[0]?.overallScore || 65;
      const techScore = s.readinessScores[0]?.techScore || 70;

      standardSkills.forEach((skill) => {
        const sLower = skill.name.toLowerCase();
        const hasSkill = Array.from(userSkillsSet).some(
          (us) => us.includes(sLower) || sLower.includes(us)
        );

        let score = 0;
        if (hasSkill) {
          // Strong or intermediate based on readiness
          score = Math.min(100, Math.round(techScore + (Math.random() * 10 - 5)));
        } else {
          // Developing or gap
          score = Math.max(15, Math.round(readinessOverall * 0.45 + (Math.random() * 12 - 6)));
        }

        userSkillMatrix[s.id][skill.name] = score;
        teamSkillSums[skill.name].total += score;
        teamSkillSums[skill.name].count += 1;
      });
    });

    const studentCount = Math.max(1, students.length);
    const teamAverageSkills = standardSkills.map((s) => {
      const avg = Math.round(teamSkillSums[s.name].total / studentCount);
      return {
        skill: s.name,
        category: s.category,
        avgScore: avg,
        studentCount,
      };
    }).sort((a, b) => b.avgScore - a.avgScore);

    // Top 5 weak skills across team
    const topWeakSkills = [...teamAverageSkills]
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5);

    // Users x Skills Heatmap data
    const usersSkillsHeatmap = students.map((s) => ({
      userId: s.id,
      userName: s.name,
      email: s.email,
      targetCareerId: s.profile?.targetCareerId || 'ml-engineer',
      skills: userSkillMatrix[s.id] || {},
    }));

    // Historical skill trend simulation over past 4 weeks
    const trendWeeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4 (Current)'];
    const skillTrends = trendWeeks.map((week, idx) => {
      const growthFactor = (idx - 3) * 3; // -9, -6, -3, 0
      const weekData: Record<string, any> = { week };
      topWeakSkills.slice(0, 4).forEach((ws) => {
        weekData[ws.skill] = Math.max(20, Math.min(100, ws.avgScore + growthFactor));
      });
      weekData['Team Overall'] = Math.max(30, Math.round(
        teamAverageSkills.reduce((acc, curr) => acc + curr.avgScore, 0) / teamAverageSkills.length + growthFactor
      ));
      return weekData;
    });

    // Detailed User Graph & Comparison if userId is specified
    let selectedUserData = null;
    let compareUserData = null;
    let targetRoleBenchmark = null;

    const targetUser = students.find((s) => s.id === (selectedUserId || students[0]?.id));
    if (targetUser) {
      const prof = targetUser.profile;
      const parsedResume = targetUser.resumeData?.parsedJson ? JSON.parse(targetUser.resumeData.parsedJson) : {};
      const targetRoleKey = prof?.targetCareerId || 'ml-engineer';
      const roleDef = CAREER_TAXONOMY[targetRoleKey] || CAREER_TAXONOMY['ml-engineer'];

      const studentProfile: StudentProfileData = {
        userId: targetUser.id,
        name: targetUser.name,
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
          aptitude: 85,
          problemSolving: 80,
          mindGames: 80,
        },
        streakDays: prof?.streakDays || 1,
      };

      const forceGraph = buildSkillRelationshipGraph(studentProfile);

      // Radar dimensions vs Target Role Benchmark
      const roleRadar = roleDef.radarDimensions || [
        { name: 'Python & Algos', benchmark: 90 },
        { name: 'Deep Learning', benchmark: 85 },
        { name: 'MLOps & Docker', benchmark: 80 },
        { name: 'Cloud & K8s', benchmark: 75 },
        { name: 'Vector DBs & RAG', benchmark: 80 },
        { name: 'Data Eng & SQL', benchmark: 80 },
      ];

      const userScores = userSkillMatrix[targetUser.id] || {};

      const radarComparison = roleRadar.map((dim) => {
        // Map dimension to approximate skill score
        let matchedScore = 65;
        if (dim.name.includes('Python')) matchedScore = userScores['Python'] || 80;
        else if (dim.name.includes('Deep Learning')) matchedScore = userScores['Deep Learning'] || 70;
        else if (dim.name.includes('Docker')) matchedScore = userScores['Docker Containers'] || 60;
        else if (dim.name.includes('K8s') || dim.name.includes('Cloud')) matchedScore = userScores['Kubernetes Orchestration'] || 50;
        else if (dim.name.includes('Vector') || dim.name.includes('RAG')) matchedScore = userScores['RAG & Vector DBs'] || 55;
        else if (dim.name.includes('Data') || dim.name.includes('SQL')) matchedScore = userScores['Database Management'] || 75;

        return {
          dimension: dim.name,
          benchmark: dim.benchmark,
          userScore: matchedScore,
        };
      });

      selectedUserData = {
        user: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          targetCareer: roleDef.title,
          targetCareerId: targetRoleKey,
        },
        forceGraph,
        radarComparison,
      };

      targetRoleBenchmark = {
        roleId: targetRoleKey,
        roleTitle: roleDef.title,
        requiredSkills: roleDef.requiredSkills,
      };
    }

    if (compareUserId) {
      const secondUser = students.find((s) => s.id === compareUserId);
      if (secondUser && selectedUserData) {
        const user2Scores = userSkillMatrix[secondUser.id] || {};
        const combinedRadar = selectedUserData.radarComparison.map((r: any) => {
          let u2Score = 60;
          if (r.dimension.includes('Python')) u2Score = user2Scores['Python'] || 75;
          else if (r.dimension.includes('Deep Learning')) u2Score = user2Scores['Deep Learning'] || 65;
          else if (r.dimension.includes('Docker')) u2Score = user2Scores['Docker Containers'] || 70;
          else if (r.dimension.includes('K8s') || r.dimension.includes('Cloud')) u2Score = user2Scores['Kubernetes Orchestration'] || 60;
          else if (r.dimension.includes('Vector') || r.dimension.includes('RAG')) u2Score = user2Scores['RAG & Vector DBs'] || 50;
          else if (r.dimension.includes('Data') || r.dimension.includes('SQL')) u2Score = user2Scores['Database Management'] || 80;

          return {
            ...r,
            peerScore: u2Score,
            peerName: secondUser.name,
          };
        });

        compareUserData = {
          user: {
            id: secondUser.id,
            name: secondUser.name,
            email: secondUser.email,
          },
          radarComparison: combinedRadar,
        };
      }
    }

    return NextResponse.json({
      teamAverageSkills,
      usersSkillsHeatmap,
      topWeakSkills,
      skillTrends,
      standardSkills: standardSkills.map((s) => s.name),
      studentsList: students.map((s) => ({ id: s.id, name: s.name, email: s.email })),
      selectedUserData,
      compareUserData,
      targetRoleBenchmark,
    });
  } catch (error: any) {
    console.error('Manager Skill Graph error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load skill graph analytics' }, { status: 500 });
  }
}
