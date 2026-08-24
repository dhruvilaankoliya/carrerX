import { StudentProfileData, ReadinessScoreOutput } from './types';
import { CAREER_TAXONOMY } from '../taxonomy/careerTaxonomy';

export function computeReadinessIndex(
  profile: StudentProfileData,
  targetCareerId: string
): ReadinessScoreOutput {
  const career = CAREER_TAXONOMY[targetCareerId] || CAREER_TAXONOMY['ml-engineer'];
  const allUserSkills = Array.from(
    new Set([
      ...profile.programmingLanguages.map((s) => s.toLowerCase()),
      ...profile.technicalSkills.map((s) => s.toLowerCase()),
      ...profile.extractedSkills.map((s) => s.toLowerCase()),
    ])
  );

  // 1. Technical Skills Subscore (0 - 100)
  const requiredSkills = career.requiredSkills.map((s) => s.toLowerCase());
  let matchedCount = 0;
  requiredSkills.forEach((req) => {
    if (allUserSkills.some((us) => us.includes(req) || req.includes(us))) {
      matchedCount++;
    }
  });
  const skillMatchRatio = requiredSkills.length > 0 ? matchedCount / requiredSkills.length : 0.5;
  const techSkillsScore = Math.min(100, Math.round(skillMatchRatio * 85 + (profile.assessmentScores.techInterest[career.category] || 50) * 0.15));

  // 2. Projects Subscore (0 - 100)
  const relevantProjects = profile.extractedProjects.filter((p) => {
    const domainMatch = p.domain?.toLowerCase().includes(career.category.toLowerCase()) || false;
    const techMatch = p.technologies?.some((t) => requiredSkills.some((rs) => rs.includes(t.toLowerCase()))) || false;
    return domainMatch || techMatch;
  });
  const projectScore = Math.min(
    100,
    Math.round(
      Math.min(3, relevantProjects.length) * 28 +
        (profile.extractedProjects.length > 0 ? 16 : 0)
    )
  );

  // 3. Resume Quality Subscore (0 - 100)
  const resumeKeywordDensity = Math.min(1, allUserSkills.length / 8);
  const certBonus = Math.min(20, profile.extractedCertifications.length * 10);
  const resumeScore = Math.min(100, Math.round(resumeKeywordDensity * 60 + certBonus + 20));

  // 4. Problem Solving & Aptitude Subscore (0 - 100)
  const problemSolvingScore = Math.round(
    (profile.assessmentScores.problemSolving * 0.4) +
    (profile.assessmentScores.aptitude * 0.35) +
    (profile.assessmentScores.mindGames * 0.25)
  );

  // 5. Interest Alignment Subscore (0 - 100)
  const interestVal = profile.assessmentScores.techInterest[career.category] ?? 
                      profile.resumeInitialInterests[career.category] ?? 
                      60;
  const interestScore = Math.min(100, Math.max(20, interestVal));

  // 6. Learning Consistency Subscore (0 - 100)
  const consistencyScore = Math.min(100, Math.max(30, profile.streakDays * 12 + 40));

  // Weights dependent on academic year (de-emphasize projects for 1st-2nd year students)
  const isEarlyYear = profile.currentYear <= 2;
  const weights = isEarlyYear
    ? {
        techSkills: 0.35,
        problemSolving: 0.25,
        interestAlignment: 0.20,
        learningConsistency: 0.10,
        projects: 0.05,
        resume: 0.05,
      }
    : {
        techSkills: 0.30,
        projects: 0.20,
        problemSolving: 0.15,
        interestAlignment: 0.15,
        resume: 0.10,
        learningConsistency: 0.10,
      };

  const overallScore = Math.min(
    99,
    Math.max(
      15,
      Math.round(
        techSkillsScore * weights.techSkills +
          projectScore * weights.projects +
          resumeScore * weights.resume +
          problemSolvingScore * weights.problemSolving +
          interestScore * weights.interestAlignment +
          consistencyScore * weights.learningConsistency
      )
    )
  );

  let readinessTier = 'Tier 3: Foundation Building';
  if (overallScore >= 82) {
    readinessTier = 'Tier 1: Job-Ready Contender';
  } else if (overallScore >= 65) {
    readinessTier = 'Tier 2: Advanced Competency';
  }

  return {
    overallScore,
    readinessTier,
    subscores: {
      techSkills: techSkillsScore,
      projects: projectScore,
      resume: resumeScore,
      problemSolving: problemSolvingScore,
      interestAlignment: interestScore,
      learningConsistency: consistencyScore,
    },
    weights: {
      techSkills: Math.round(weights.techSkills * 100),
      projects: Math.round(weights.projects * 100),
      resume: Math.round(weights.resume * 100),
      problemSolving: Math.round(weights.problemSolving * 100),
      interestAlignment: Math.round(weights.interestAlignment * 100),
      learningConsistency: Math.round(weights.learningConsistency * 100),
    },
  };
}
