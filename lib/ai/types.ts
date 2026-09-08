export interface ParsedResumeOutput {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
  };
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    gradYear?: string;
    gpa?: string;
  };
  technicalSkills: string[];
  categorizedSkills?: Record<string, string[]>;
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
    college?: string;
    branch?: string;
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

export interface MentorChatResult {
  response: string;
  provider: 'gemini' | 'groq' | 'openrouter' | 'openai' | 'heuristic';
  model?: string;
  isEducational: boolean;
}

