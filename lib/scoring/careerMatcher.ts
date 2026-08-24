import { StudentProfileData, CareerMatchOutput } from './types';
import { CAREER_TAXONOMY } from '../taxonomy/careerTaxonomy';

export function computeCareerMatches(profile: StudentProfileData): CareerMatchOutput[] {
  const allUserSkills = Array.from(
    new Set([
      ...profile.programmingLanguages.map((s) => s.toLowerCase()),
      ...profile.technicalSkills.map((s) => s.toLowerCase()),
      ...profile.extractedSkills.map((s) => s.toLowerCase()),
    ])
  );

  const results: CareerMatchOutput[] = Object.values(CAREER_TAXONOMY).map((career) => {
    const matchedSkills: string[] = [];
    const whatsMissing: string[] = [];

    career.requiredSkills.forEach((skill) => {
      const sLower = skill.toLowerCase();
      const isMatched = allUserSkills.some(
        (us) => us === sLower || us.includes(sLower) || sLower.includes(us)
      );
      if (isMatched) {
        matchedSkills.push(skill);
      } else {
        whatsMissing.push(skill);
      }
    });

    const skillRatio = career.requiredSkills.length > 0 ? matchedSkills.length / career.requiredSkills.length : 0.5;

    // Interest alignment score
    const interestScore =
      profile.assessmentScores.techInterest[career.category] ??
      profile.resumeInitialInterests[career.category] ??
      50;

    // Relevant project boost
    const hasRelatedProject = profile.extractedProjects.some((p) =>
      p.domain?.toLowerCase().includes(career.category.toLowerCase()) ||
      p.technologies?.some((t) => matchedSkills.map(m => m.toLowerCase()).includes(t.toLowerCase()))
    );

    const matchRaw =
      skillRatio * 45 +
      (interestScore / 100) * 35 +
      (profile.assessmentScores.problemSolving / 100) * 12 +
      (hasRelatedProject ? 8 : 0);

    const matchScore = Math.min(98, Math.max(35, Math.round(matchRaw)));

    // Generate dynamic "Why recommended" explanation referencing real user skills & background
    let whyRecommended = '';
    if (matchedSkills.length >= 2) {
      whyRecommended = `Strong foundation with ${matchedSkills.slice(0, 3).join(', ')} and demonstrated ${interestScore}% interest in ${career.category}.`;
    } else if (hasRelatedProject) {
      const proj = profile.extractedProjects[0];
      whyRecommended = `Hands-on practical experience from your project "${proj.name}" aligns with core requirements.`;
    } else if (interestScore > 70) {
      whyRecommended = `High interest score (${interestScore}%) and strong problem-solving aptitude (${profile.assessmentScores.problemSolving}%) indicate fast runway.`;
    } else {
      whyRecommended = `Solid general engineering foundation with high growth upside in modern ${career.category} ecosystems.`;
    }

    return {
      careerId: career.id,
      title: career.title,
      category: career.category,
      icon: career.icon,
      matchScore,
      whyRecommended,
      whatsMissing: whatsMissing.slice(0, 4),
      matchedSkills,
    };
  });

  return results.sort((a, b) => b.matchScore - a.matchScore);
}
