export interface StudentProfileData {
  userId: string;
  name: string;
  college: string;
  course: string;
  branch: string;
  currentYear: number;
  gradYear: number;
  cgpa?: number | null;
  programmingLanguages: string[];
  technicalSkills: string[];
  extractedSkills: string[];
  extractedProjects: { name: string; technologies: string[]; domain: string; complexity?: string }[];
  extractedCertifications: { name: string; platform: string; domain?: string }[];
  resumeInitialInterests: Record<string, number>;
  assessmentScores: {
    techInterest: Record<string, number>;
    aptitude: number; // 0 - 100
    problemSolving: number; // 0 - 100
    mindGames: number; // 0 - 100
  };
  streakDays: number;
}

export interface ReadinessScoreOutput {
  overallScore: number;
  readinessTier: string;
  subscores: {
    techSkills: number;
    projects: number;
    resume: number;
    problemSolving: number;
    interestAlignment: number;
    learningConsistency: number;
  };
  weights: {
    techSkills: number;
    projects: number;
    resume: number;
    problemSolving: number;
    interestAlignment: number;
    learningConsistency: number;
  };
}

export interface CareerMatchOutput {
  careerId: string;
  title: string;
  category: string;
  icon: string;
  matchScore: number;
  whyRecommended: string;
  whatsMissing: string[];
  matchedSkills: string[];
}

export interface LearningProfileOutput {
  analyticalPreference: string;
  problemSolvingStyle: string;
  technicalInclination: string;
  decisionMakingPattern: string;
  summary: string;
}
