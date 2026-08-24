import { StudentProfileData } from '../scoring/types';
import { CAREER_TAXONOMY } from '../taxonomy/careerTaxonomy';

export interface GeneratedRoadmapPhase {
  phaseNumber: number;
  title: string;
  subtitle: string;
  duration: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
  progress: number;
  topics: string[];
  deliverables: { type: string; name: string; status: 'done' | 'in-progress' | 'pending' | 'locked' }[];
}

export function generatePersonalizedRoadmap(
  profile: StudentProfileData,
  targetCareerId: string
): GeneratedRoadmapPhase[] {
  const career = CAREER_TAXONOMY[targetCareerId] || CAREER_TAXONOMY['ml-engineer'];
  const allUserSkills = Array.from(
    new Set([
      ...profile.programmingLanguages.map((s) => s.toLowerCase()),
      ...profile.technicalSkills.map((s) => s.toLowerCase()),
      ...profile.extractedSkills.map((s) => s.toLowerCase()),
    ])
  );

  const hasPython = allUserSkills.includes('python');
  const hasGit = allUserSkills.includes('git');
  const hasDocker = allUserSkills.includes('docker');
  const hasML = allUserSkills.includes('pytorch') || allUserSkills.includes('machine learning');

  // Phase 1: Core Mathematical & Programming Foundations
  const phase1Complete = (hasPython || allUserSkills.length >= 2) && profile.currentYear >= 2;
  const phase1: GeneratedRoadmapPhase = {
    phaseNumber: 1,
    title: 'Core Foundations & Mathematical Intuition',
    subtitle: 'Algorithmic efficiency, linear algebra for vectors, and system architecture basics',
    duration: '3 Weeks',
    status: phase1Complete ? 'COMPLETED' : 'IN_PROGRESS',
    progress: phase1Complete ? 100 : 60,
    topics: [
      'Asymptotic Complexity (Big-O) & Memory Optimization',
      'Linear Algebra: Matrices, Eigenvalues & Tensor Computations',
      'Advanced OOP & Modular Scripting in ' + (profile.programmingLanguages[0] || 'Python'),
      'Git Version Control & Branching Workflows',
    ],
    deliverables: [
      { type: 'Course', name: 'MIT 18.06 Computational Foundations', status: phase1Complete ? 'done' : 'in-progress' },
      { type: 'Code', name: 'Optimized Matrix Operations & Data Structures Benchmarks', status: phase1Complete ? 'done' : 'in-progress' },
      { type: 'Quiz', name: 'Algorithmic Complexity & Vector Calculus Mastery Exam', status: phase1Complete ? 'done' : 'pending' },
    ],
  };

  // Phase 2: Core Domain Specialization
  const phase2Complete = hasML && profile.extractedProjects.length > 0;
  const phase2: GeneratedRoadmapPhase = {
    phaseNumber: 2,
    title: `${career.category} Core Engineering`,
    subtitle: `Deep dive into primary frameworks, data pipelines, and architecture patterns for ${career.title}`,
    duration: '4 Weeks',
    status: phase1Complete ? (phase2Complete ? 'COMPLETED' : 'IN_PROGRESS') : 'LOCKED',
    progress: phase2Complete ? 100 : (phase1Complete ? 65 : 0),
    topics: [
      `${career.topTools.slice(0, 2).join(' & ')} In-Depth Architecture`,
      'Data Modeling, SQL Indexing, and Feature Normalization',
      'REST & Async API Development with Error Handling',
      'Unit Testing, Mocking, and Code Verification',
    ],
    deliverables: [
      { type: 'Project', name: `${career.category} Interactive Domain Showcase`, status: phase2Complete ? 'done' : (phase1Complete ? 'in-progress' : 'locked') },
      { type: 'Course', name: career.recommendedCourse.title, status: phase2Complete ? 'done' : (phase1Complete ? 'pending' : 'locked') },
      { type: 'Lab', name: 'End-to-End Pipeline Optimization Challenge', status: phase2Complete ? 'done' : (phase1Complete ? 'pending' : 'locked') },
    ],
  };

  // Phase 3: Advanced Architectures & Next-Gen Systems
  const phase3: GeneratedRoadmapPhase = {
    phaseNumber: 3,
    title: 'Advanced System Architecture & Scalability',
    subtitle: 'High-throughput concurrency, vector embeddings, and distributed computing',
    duration: '4 Weeks',
    status: phase2Complete ? 'IN_PROGRESS' : 'LOCKED',
    progress: phase2Complete ? 40 : 0,
    topics: [
      'Microservice Decomposition & Inter-Service Messaging',
      'High-Performance Caching with Redis & In-Memory Stores',
      'Vector Search & Approximate Nearest Neighbor Algorithms',
      'Fault Tolerance, Rate Limiting & Latency Reduction',
    ],
    deliverables: [
      { type: 'Project', name: 'Distributed Scalable Service with Real-Time Streaming', status: phase2Complete ? 'in-progress' : 'locked' },
      { type: 'Lab', name: 'Database Sharding & Query Optimization Benchmark', status: phase2Complete ? 'pending' : 'locked' },
      { type: 'Quiz', name: 'Distributed Consensus & Concurrency Evaluation', status: phase2Complete ? 'pending' : 'locked' },
    ],
  };

  // Phase 4: Production MLOps, Cloud & Containerization
  const phase4: GeneratedRoadmapPhase = {
    phaseNumber: 4,
    title: 'Cloud Deployment, MLOps & CI/CD Infrastructure',
    subtitle: 'Packaging software as enterprise-ready cloud services with monitoring and automated canary releases',
    duration: '3 Weeks',
    status: 'LOCKED',
    progress: 0,
    topics: [
      'Multi-Stage Docker Containerization & Image Size Optimization',
      'Kubernetes Pod Orchestration, ConfigMaps & Ingress Controllers',
      'Automated GitHub Actions CI/CD with Test Coverage Gates',
      'Prometheus Metrics, Grafana Dashboards & Alerting',
    ],
    deliverables: [
      { type: 'Capstone Prep', name: career.recommendedProject.title, status: 'locked' },
      { type: 'Pipeline', name: 'Automated CI/CD Deployment with Smoke Testing', status: 'locked' },
      { type: 'Cert Prep', name: 'Cloud Engineering Verified Benchmark Examination', status: 'locked' },
    ],
  };

  // Phase 5: Industry Placement Launchpad & Mock FAANG Interviews
  const phase5: GeneratedRoadmapPhase = {
    phaseNumber: 5,
    title: 'Placement Showcase, ATS Optimization & Mock Interviews',
    subtitle: 'Final recruiter-ready portfolio packaging, line-by-line STAR resume audits, and live mock interview practice',
    duration: '2 Weeks',
    status: 'LOCKED',
    progress: 0,
    topics: [
      'Recruiter ATS Keyword Matching & Line-by-Line Impact Metrics',
      'System Design Technical Whiteboarding (10M+ Users Scale)',
      'STAR Method Behavioral Case Studies for Top Tech Companies',
      'Live Coding Time-Constrained Debugging Simulations',
    ],
    deliverables: [
      { type: 'Portfolio', name: 'Production GitHub Repository with Benchmarks & Demo URL', status: 'locked' },
      { type: 'ATS Audit', name: 'Verified 85+ ATS Score on Tier-1 Role Filters', status: 'locked' },
      { type: 'Interview', name: '45-Min Technical Mock Interview with Instant AI Feedback', status: 'locked' },
    ],
  };

  return [phase1, phase2, phase3, phase4, phase5];
}
