import { StudentProfileData, LearningProfileOutput } from './types';

export function computeLearningProfile(profile: StudentProfileData): LearningProfileOutput {
  const { aptitude, problemSolving, mindGames } = profile.assessmentScores;

  let analyticalPreference = 'Intuitive & Heuristic Explorer';
  if (aptitude >= 75) {
    analyticalPreference = 'Structured First-Principles & Mathematical Modeler';
  } else if (aptitude >= 50) {
    analyticalPreference = 'Pattern-Driven Practical Analyst';
  }

  let problemSolvingStyle = 'Iterative Debugger & Prototyper';
  if (problemSolving >= 80) {
    problemSolvingStyle = 'Algorithmic Optimization & System Architect';
  } else if (problemSolving >= 60) {
    problemSolvingStyle = 'Pragmatic Builder with Rapid Execution';
  }

  let technicalInclination = 'Full-Spectrum Engineering';
  const topInterestCategory = Object.entries(profile.assessmentScores.techInterest).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (topInterestCategory) {
    technicalInclination = `Deep Specialization in ${topInterestCategory[0]}`;
  }

  let decisionMakingPattern = 'Data-Backed & Evidence Driven';
  if (mindGames >= 75) {
    decisionMakingPattern = 'High-Speed Strategic Decider under Time Constraints';
  } else if (mindGames >= 50) {
    decisionMakingPattern = 'Careful & Risk-Calibrated Evaluator';
  }

  const summary = `Demonstrates ${analyticalPreference.toLowerCase()} characteristics with a strong focus on ${problemSolvingStyle.toLowerCase()}. Excels at decomposing complex engineering challenges into testable milestones.`;

  return {
    analyticalPreference,
    problemSolvingStyle,
    technicalInclination,
    decisionMakingPattern,
    summary,
  };
}
