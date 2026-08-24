export interface ParsedResumeOutput {
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    gradYear?: string;
    gpa?: string;
  };
  technicalSkills: string[];
  subjects: string[];
  projects: {
    name: string;
    technologies: string[];
    domain: string;
    description: string;
    complexity?: 'Beginner' | 'Intermediate' | 'Advanced';
  }[];
  certifications: {
    name: string;
    platform: string;
    domain?: string;
  }[];
  initialInterestEstimate: {
    'AI & Data': number;
    'Software & Web': number;
    'Cloud & DevOps': number;
    'Cyber & Security': number;
    'Product & Management': number;
  };
}

export interface GeneratedResumeQuestion {
  questionText: string;
  category: string;
  relatedItem: string;
  options: string[];
}

export interface MentorChatRequest {
  userMessage: string;
  studentContext: {
    name: string;
    currentYear: number;
    targetCareer: string;
    overallScore: number;
    readinessTier: string;
    knownSkills: string[];
    criticalGaps: string[];
    activeRoadmapPhase: string;
  };
  history?: { sender: 'USER' | 'AI'; text: string }[];
}
