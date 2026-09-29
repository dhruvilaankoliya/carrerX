/**
 * CareerX Deterministic Study Partner & Skill Matching Engine
 * 
 * Strict deterministic calculations:
 * - Skills Overlap: 70%
 * - Projects Relevance: 15%
 * - Career Goal Alignment: 10%
 * - Technical & Domain Interests: 5%
 * 
 * Rules:
 * - Deterministic, explainable scoring (never represented as an opaque AI score).
 * - "Experienced Learner": availableToHelp === true AND has verified evidence (course, cert, or project) for >= 2 target skills.
 * - "Study Buddy": studyBuddyEnabled === true.
 * - "Peer": everyone else.
 * - No user is ever labeled as "mentor".
 */

export const MATCH_WEIGHTS = {
  SKILLS: 0.70,
  PROJECTS: 0.15,
  CAREER_GOAL: 0.10,
  INTERESTS: 0.05,
} as const;

export const SKILL_ALIASES: Record<string, string> = {
  'k8s': 'Kubernetes',
  'kube': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  'docker': 'Docker',
  'docker containerization': 'Docker',
  'fastapi': 'FastAPI',
  'fast api': 'FastAPI',
  'mlops': 'MLOps',
  'ml ops': 'MLOps',
  'machine learning operations': 'MLOps',
  'vector db': 'Vector DB',
  'vectordb': 'Vector DB',
  'pinecone': 'Vector DB',
  'chromadb': 'Vector DB',
  'qdrant': 'Vector DB',
  'rag': 'Vector DB',
  'rag / vector dbs': 'Vector DB',
  'vector db (pinecone)': 'Vector DB',
  'pytorch': 'PyTorch',
  'torch': 'PyTorch',
  'tf': 'TensorFlow',
  'tensorflow': 'TensorFlow',
  'react': 'React',
  'react.js': 'React',
  'reactjs': 'React',
  'next': 'Next.js',
  'next.js': 'Next.js',
  'nextjs': 'Next.js',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'node': 'Node.js',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'github actions': 'CI/CD',
  'model monitoring': 'Model Monitoring',
  'model drift': 'Model Monitoring',
  'transformers': 'Transformers',
  'huggingface': 'Transformers',
  'system design': 'System Design',
  'sql': 'SQL',
  'nosql': 'NoSQL',
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'gcp': 'GCP',
  'google cloud': 'GCP',
  'terraform': 'Terraform',
  'iac': 'Terraform',
};

/**
 * Normalizes a skill name using alias mappings and casing
 */
export function normalizeSkill(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const cleaned = raw.trim().toLowerCase();
  if (SKILL_ALIASES[cleaned]) {
    return SKILL_ALIASES[cleaned];
  }
  // Generic capitalizer
  return raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1);
}

export interface CandidateUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  college: string;
  course: string;
  currentYear: number;
  gradYear?: number;
  profilePhoto?: string | null;
  careerGoal?: string | null;
  preferredField?: string | null;
  technicalSkills: string[];
  interests?: string[];
  projects?: Array<{
    name: string;
    technologies?: string[];
    domain?: string;
    description?: string;
  }>;
  courses?: Array<{
    name: string;
    provider?: string;
    skills?: string[];
  }>;
  certifications?: Array<{
    name: string;
    platform?: string;
    domain?: string;
  }>;
  availableToHelp: boolean;
  studyBuddyEnabled: boolean;
  profileVisibility: string;
  showEmail?: boolean;
  showPhone?: boolean;
  allowConnectionRequests?: boolean;
  connectionStatus?: 'none' | 'pending' | 'accepted' | 'declined';
  lastActiveAt?: string | Date;
}

export interface TargetUserContext {
  userId: string;
  targetSkills: string[]; // Missing skills + Recommended Study Resources skills
  careerGoal?: string;
  preferredField?: string;
  interests?: string[];
  projects?: Array<{ name: string; technologies?: string[] }>;
}

export interface MatchBreakdown {
  skillsScore: number;       // 0 - 100
  projectsScore: number;     // 0 - 100
  careerGoalScore: number;   // 0 - 100
  interestsScore: number;    // 0 - 100
  weightedTotal: number;     // 0 - 100
}

export interface MatchResult {
  userId: string;
  name: string;
  college: string;
  course: string;
  year: number;
  gradYear?: number;
  profilePhoto?: string | null;
  careerGoal?: string;
  preferredField?: string;
  roleCategory: 'Experienced Learner' | 'Study Buddy' | 'Peer';
  matchPercentage: number;
  scoreBreakdown: MatchBreakdown;
  matchedSkills: string[];
  canHelpWith: string[];
  studiedSkills: string[];
  completedCoursesCount: number;
  projectsCount: number;
  whyExplanation: {
    lookingToLearn: string[];
    experiencedIn: string[];
    summary: string;
  };
  connectionStatus: 'none' | 'pending' | 'accepted' | 'declined';
  availableToHelp: boolean;
  studyBuddyEnabled: boolean;
  profileVisibility: string;
  showEmail: boolean;
  showPhone: boolean;
  lastActiveAt?: string | Date;
}

/**
 * Computes deterministic match between target user and candidate user
 */
export function computeStudentMatch(
  target: TargetUserContext,
  candidate: CandidateUser
): MatchResult | null {
  // Exclude self
  if (target.userId && candidate.id === target.userId) {
    return null;
  }

  // Normalize target skills (unique)
  const normalizedTargetSkills = Array.from(
    new Set(target.targetSkills.map(normalizeSkill).filter(Boolean))
  );

  // Normalize candidate skills
  const candidateSkillsSet = new Set(
    (candidate.technicalSkills || []).map(normalizeSkill).filter(Boolean)
  );

  // Normalize candidate project technologies & names
  const candidateProjectSkills = new Set<string>();
  const candidateProjects = candidate.projects || [];
  candidateProjects.forEach((p) => {
    (p.technologies || []).forEach((t) => candidateProjectSkills.add(normalizeSkill(t)));
    if (p.description) {
      normalizedTargetSkills.forEach((ts) => {
        if (p.description!.toLowerCase().includes(ts.toLowerCase())) {
          candidateProjectSkills.add(ts);
        }
      });
    }
  });

  // Normalize candidate courses skills
  const candidateCourseSkills = new Set<string>();
  (candidate.courses || []).forEach((c) => {
    (c.skills || []).forEach((s) => candidateCourseSkills.add(normalizeSkill(s)));
    if (c.name) {
      normalizedTargetSkills.forEach((ts) => {
        if (c.name.toLowerCase().includes(ts.toLowerCase())) {
          candidateCourseSkills.add(ts);
        }
      });
    }
  });

  // 1. Skills Overlap (70% weight)
  const matchedSkills: string[] = [];
  normalizedTargetSkills.forEach((ts) => {
    if (candidateSkillsSet.has(ts) || candidateProjectSkills.has(ts) || candidateCourseSkills.has(ts)) {
      matchedSkills.push(ts);
    }
  });

  const skillsScore = normalizedTargetSkills.length > 0
    ? Math.round((matchedSkills.length / normalizedTargetSkills.length) * 100)
    : 0;

  // 2. Projects Overlap (15% weight)
  let projectMatchesCount = 0;
  normalizedTargetSkills.forEach((ts) => {
    if (candidateProjectSkills.has(ts)) {
      projectMatchesCount++;
    }
  });
  const projectsScore = normalizedTargetSkills.length > 0
    ? Math.min(100, Math.round((projectMatchesCount / Math.max(1, Math.min(3, normalizedTargetSkills.length))) * 100))
    : (candidateProjects.length > 0 ? 50 : 0);

  // 3. Career Goal Alignment (10% weight)
  let careerGoalScore = 0;
  const targetGoal = (target.careerGoal || target.preferredField || '').toLowerCase();
  const candidateGoal = (candidate.careerGoal || candidate.preferredField || '').toLowerCase();
  if (targetGoal && candidateGoal) {
    if (targetGoal === candidateGoal) {
      careerGoalScore = 100;
    } else if (
      targetGoal.includes('machine learning') && candidateGoal.includes('ai') ||
      targetGoal.includes('ai') && candidateGoal.includes('machine learning') ||
      targetGoal.includes('data') && candidateGoal.includes('ml') ||
      targetGoal.includes('devops') && candidateGoal.includes('cloud') ||
      targetGoal.includes('full stack') && candidateGoal.includes('software')
    ) {
      careerGoalScore = 75;
    } else {
      careerGoalScore = 30;
    }
  } else {
    careerGoalScore = 50;
  }

  // 4. Interests Alignment (5% weight)
  const targetInterests = (target.interests || []).map((i) => i.toLowerCase());
  const candidateInterests = (candidate.interests || []).map((i) => i.toLowerCase());
  let commonInterests = 0;
  targetInterests.forEach((ti) => {
    if (candidateInterests.some((ci) => ci.includes(ti) || ti.includes(ci))) {
      commonInterests++;
    }
  });
  const interestsScore = targetInterests.length > 0
    ? Math.min(100, Math.round((commonInterests / Math.max(1, targetInterests.length)) * 100))
    : (candidateInterests.length > 0 ? 50 : 0);

  // Overall Match Percentage (Strict Weights)
  const weightedTotal = Math.round(
    skillsScore * MATCH_WEIGHTS.SKILLS +
    projectsScore * MATCH_WEIGHTS.PROJECTS +
    careerGoalScore * MATCH_WEIGHTS.CAREER_GOAL +
    interestsScore * MATCH_WEIGHTS.INTERESTS
  );

  // Verified evidence skills for "canHelpWith"
  const verifiedEvidenceSkills: string[] = [];
  matchedSkills.forEach((s) => {
    if (candidateProjectSkills.has(s) || candidateCourseSkills.has(s)) {
      verifiedEvidenceSkills.push(s);
    }
  });

  // Classification Rules:
  // - Experienced Learner: availableToHelp ON and has evidence (course, certification, or project) for at least 2 of target skills
  // - Study Buddy: studyBuddyEnabled ON
  // - Peer: everyone else
  let roleCategory: 'Experienced Learner' | 'Study Buddy' | 'Peer' = 'Peer';
  if (candidate.availableToHelp && verifiedEvidenceSkills.length >= 2) {
    roleCategory = 'Experienced Learner';
  } else if (candidate.studyBuddyEnabled) {
    roleCategory = 'Study Buddy';
  }

  // Explainability summary
  const summaryText = matchedSkills.length > 0
    ? `${candidate.name} has proven hands-on experience with ${matchedSkills.slice(0, 3).join(', ')}${
        matchedSkills.length > 3 ? ` +${matchedSkills.length - 3} more` : ''
      }, which directly aligns with your current skill gaps.`
    : `${candidate.name} is pursuing ${candidate.careerGoal || candidate.preferredField || 'similar technical areas'} at ${candidate.college}.`;

  return {
    userId: candidate.id,
    name: candidate.name,
    college: candidate.college,
    course: candidate.course,
    year: candidate.currentYear,
    gradYear: candidate.gradYear,
    profilePhoto: candidate.profilePhoto,
    careerGoal: candidate.careerGoal || candidate.preferredField || 'Software Engineer',
    preferredField: candidate.preferredField || undefined,
    roleCategory,
    matchPercentage: Math.max(10, Math.min(99, weightedTotal)),
    scoreBreakdown: {
      skillsScore,
      projectsScore,
      careerGoalScore,
      interestsScore,
      weightedTotal,
    },
    matchedSkills,
    canHelpWith: verifiedEvidenceSkills.length > 0 ? verifiedEvidenceSkills : matchedSkills,
    studiedSkills: Array.from(new Set(Array.from(candidateSkillsSet).concat(Array.from(candidateCourseSkills)))),
    completedCoursesCount: (candidate.courses || []).length,
    projectsCount: (candidate.projects || []).length,
    whyExplanation: {
      lookingToLearn: normalizedTargetSkills,
      experiencedIn: Array.from(new Set(matchedSkills.concat(verifiedEvidenceSkills))),
      summary: summaryText,
    },
    connectionStatus: candidate.connectionStatus || 'none',
    availableToHelp: candidate.availableToHelp,
    studyBuddyEnabled: candidate.studyBuddyEnabled,
    profileVisibility: candidate.profileVisibility || 'public',
    showEmail: candidate.showEmail || false,
    showPhone: candidate.showPhone || false,
    lastActiveAt: candidate.lastActiveAt,
  };
}

/**
 * Filter and sort student matches
 */
export function rankAndFilterMatches(
  matches: MatchResult[],
  options: {
    mode?: 'help' | 'study_buddy';
    search?: string;
    skill?: string;
    college?: string;
    course?: string;
    year?: number | string;
    careerGoal?: string;
    hasProjects?: boolean;
    sort?: 'best_skill_match' | 'most_relevant' | 'same_college' | 'same_course' | 'recently_active';
    currentUserCollege?: string;
    currentUserCourse?: string;
  }
): MatchResult[] {
  let list = [...matches];

  // Mode filter
  if (options.mode === 'help') {
    list = list.filter((m) => m.availableToHelp);
  } else if (options.mode === 'study_buddy') {
    list = list.filter((m) => m.studyBuddyEnabled);
  }

  // Search filter
  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.college.toLowerCase().includes(q) ||
        m.course.toLowerCase().includes(q) ||
        (m.careerGoal && m.careerGoal.toLowerCase().includes(q)) ||
        m.matchedSkills.some((s) => s.toLowerCase().includes(q)) ||
        m.studiedSkills.some((s) => s.toLowerCase().includes(q))
    );
  }

  // Skill filter
  if (options.skill && options.skill !== 'all') {
    const norm = normalizeSkill(options.skill).toLowerCase();
    list = list.filter(
      (m) =>
        m.matchedSkills.some((s) => s.toLowerCase() === norm) ||
        m.studiedSkills.some((s) => s.toLowerCase() === norm)
    );
  }

  // College filter
  if (options.college && options.college !== 'all') {
    list = list.filter((m) => m.college.toLowerCase().includes(options.college!.toLowerCase()));
  }

  // Course filter
  if (options.course && options.course !== 'all') {
    list = list.filter((m) => m.course.toLowerCase().includes(options.course!.toLowerCase()));
  }

  // Year filter
  if (options.year && options.year !== 'all') {
    const y = Number(options.year);
    if (!isNaN(y)) {
      list = list.filter((m) => m.year === y);
    }
  }

  // Career Goal filter
  if (options.careerGoal && options.careerGoal !== 'all') {
    list = list.filter((m) =>
      m.careerGoal?.toLowerCase().includes(options.careerGoal!.toLowerCase())
    );
  }

  // Project Experience filter
  if (options.hasProjects) {
    list = list.filter((m) => m.projectsCount > 0);
  }

  // Sorting
  const sortMode = options.sort || 'best_skill_match';
  list.sort((a, b) => {
    if (sortMode === 'best_skill_match') {
      return b.scoreBreakdown.skillsScore - a.scoreBreakdown.skillsScore || b.matchPercentage - a.matchPercentage;
    }
    if (sortMode === 'most_relevant') {
      return b.matchPercentage - a.matchPercentage;
    }
    if (sortMode === 'same_college' && options.currentUserCollege) {
      const aSame = a.college.toLowerCase() === options.currentUserCollege.toLowerCase() ? 1 : 0;
      const bSame = b.college.toLowerCase() === options.currentUserCollege.toLowerCase() ? 1 : 0;
      return bSame - aSame || b.matchPercentage - a.matchPercentage;
    }
    if (sortMode === 'same_course' && options.currentUserCourse) {
      const aSame = a.course.toLowerCase() === options.currentUserCourse.toLowerCase() ? 1 : 0;
      const bSame = b.course.toLowerCase() === options.currentUserCourse.toLowerCase() ? 1 : 0;
      return bSame - aSame || b.matchPercentage - a.matchPercentage;
    }
    if (sortMode === 'recently_active') {
      return b.matchPercentage - a.matchPercentage;
    }
    return b.matchPercentage - a.matchPercentage;
  });

  return list;
}
