import { NextRequest, NextResponse } from 'next/server';

export interface StudiedUser {
  id: string;
  name: string;
  role: string;
  companyOrCollege: string;
  avatarColor: string;
  initials: string;
  studiedAt: string;
  status: 'none' | 'pending' | 'connected';
  mutualSkills: string[];
  bio: string;
  isOnline: boolean;
}

const PEER_USERS_POOL: Record<string, StudiedUser[]> = {
  default: [
    {
      id: 'usr_arav_1',
      name: 'Aarav Sharma',
      role: 'ML Engineer Intern',
      companyOrCollege: 'IIT Bombay • AI Lab',
      avatarColor: 'from-cyan-500 to-blue-600',
      initials: 'AS',
      studiedAt: '2 hours ago',
      status: 'none',
      mutualSkills: ['Docker', 'PyTorch', 'FastAPI'],
      bio: 'Working on low-latency LLM inference pipelines & container orchestration.',
      isOnline: true,
    },
    {
      id: 'usr_priya_2',
      name: 'Priya Patel',
      role: 'Associate Data Scientist',
      companyOrCollege: 'Swiggy ML Platform',
      avatarColor: 'from-purple-500 to-pink-600',
      initials: 'PP',
      studiedAt: 'Yesterday',
      status: 'none',
      mutualSkills: ['MLOps', 'Kubernetes', 'Python'],
      bio: 'Optimizing real-time dispatch models and automated feature store deployments.',
      isOnline: false,
    },
    {
      id: 'usr_rohit_3',
      name: 'Rohit Verma',
      role: 'B.Tech CS Senior',
      companyOrCollege: 'Dharmsinh Desai University',
      avatarColor: 'from-emerald-500 to-teal-600',
      initials: 'RV',
      studiedAt: '3 days ago',
      status: 'connected',
      mutualSkills: ['FastAPI', 'Docker', 'SQL'],
      bio: 'Targeting Tier-1 AI/ML campus placements. Building full-stack RAG applications.',
      isOnline: true,
    },
    {
      id: 'usr_neha_4',
      name: 'Neha Kulkarni',
      role: 'AI Infrastructure Engineer',
      companyOrCollege: 'NVIDIA (Inference Team)',
      avatarColor: 'from-amber-500 to-orange-600',
      initials: 'NK',
      studiedAt: '4 days ago',
      status: 'none',
      mutualSkills: ['Kubernetes', 'CUDA', 'Docker'],
      bio: 'Benchmarking TensorRT-LLM and multi-GPU cluster scheduling.',
      isOnline: false,
    },
    {
      id: 'usr_vikram_5',
      name: 'Vikram Mehta',
      role: 'Cloud DevOps Architect',
      companyOrCollege: 'Microsoft Cloud Solutions',
      avatarColor: 'from-blue-600 to-indigo-700',
      initials: 'VM',
      studiedAt: '5 days ago',
      status: 'pending',
      mutualSkills: ['CI/CD', 'Docker', 'Kubernetes'],
      bio: 'Automating multi-region Kubernetes deployments & GitHub Actions runners.',
      isOnline: true,
    },
    {
      id: 'usr_ananya_6',
      name: 'Ananya Gupta',
      role: 'Generative AI Researcher',
      companyOrCollege: 'Stanford AI Lab Alum',
      avatarColor: 'from-fuchsia-500 to-rose-600',
      initials: 'AG',
      studiedAt: '1 week ago',
      status: 'none',
      mutualSkills: ['Vector DB', 'PyTorch', 'Transformers'],
      bio: 'Publishing research on dense vector retrieval and multi-hop reasoning.',
      isOnline: false,
    },
    {
      id: 'usr_karan_7',
      name: 'Karan Singhal',
      role: 'Backend & ML Systems Engineer',
      companyOrCollege: 'Zomato AI Core',
      avatarColor: 'from-cyan-600 to-teal-700',
      initials: 'KS',
      studiedAt: '1 week ago',
      status: 'none',
      mutualSkills: ['FastAPI', 'Redis', 'Docker'],
      bio: 'Building async recommendation microservices handling 50k+ QPS.',
      isOnline: true,
    },
  ],
  docker: [
    {
      id: 'usr_arav_1',
      name: 'Aarav Sharma',
      role: 'ML Engineer Intern',
      companyOrCollege: 'IIT Bombay • AI Lab',
      avatarColor: 'from-cyan-500 to-blue-600',
      initials: 'AS',
      studiedAt: '2 hours ago',
      status: 'none',
      mutualSkills: ['Docker', 'PyTorch', 'FastAPI'],
      bio: 'Containerized PyTorch inference with multi-stage Docker builds.',
      isOnline: true,
    },
    {
      id: 'usr_vikram_5',
      name: 'Vikram Mehta',
      role: 'Cloud DevOps Architect',
      companyOrCollege: 'Microsoft Cloud Solutions',
      avatarColor: 'from-blue-600 to-indigo-700',
      initials: 'VM',
      studiedAt: '1 day ago',
      status: 'pending',
      mutualSkills: ['Docker', 'CI/CD', 'Kubernetes'],
      bio: 'Mastered production Docker multi-architecture builds for ARM & x86.',
      isOnline: true,
    },
    {
      id: 'usr_rohit_3',
      name: 'Rohit Verma',
      role: 'B.Tech CS Senior',
      companyOrCollege: 'Dharmsinh Desai University',
      avatarColor: 'from-emerald-500 to-teal-600',
      initials: 'RV',
      studiedAt: '3 days ago',
      status: 'connected',
      mutualSkills: ['FastAPI', 'Docker', 'SQL'],
      bio: 'Dockerized microservice deployment for university capstone project.',
      isOnline: true,
    },
    {
      id: 'usr_neha_4',
      name: 'Neha Kulkarni',
      role: 'AI Infrastructure Engineer',
      companyOrCollege: 'NVIDIA (Inference Team)',
      avatarColor: 'from-amber-500 to-orange-600',
      initials: 'NK',
      studiedAt: '5 days ago',
      status: 'none',
      mutualSkills: ['Docker', 'CUDA', 'Kubernetes'],
      bio: 'Benchmarking GPU passthrough containers with NVIDIA Container Toolkit.',
      isOnline: false,
    },
  ],
  fastapi: [
    {
      id: 'usr_karan_7',
      name: 'Karan Singhal',
      role: 'Backend & ML Systems Engineer',
      companyOrCollege: 'Zomato AI Core',
      avatarColor: 'from-cyan-600 to-teal-700',
      initials: 'KS',
      studiedAt: '1 hour ago',
      status: 'none',
      mutualSkills: ['FastAPI', 'Redis', 'Python'],
      bio: 'Serving async PyTorch embeddings via FastAPI with Pydantic v2 schemas.',
      isOnline: true,
    },
    {
      id: 'usr_arav_1',
      name: 'Aarav Sharma',
      role: 'ML Engineer Intern',
      companyOrCollege: 'IIT Bombay • AI Lab',
      avatarColor: 'from-cyan-500 to-blue-600',
      initials: 'AS',
      studiedAt: 'Yesterday',
      status: 'none',
      mutualSkills: ['FastAPI', 'PyTorch', 'Docker'],
      bio: 'Built streaming Server-Sent Events (SSE) FastAPI endpoints for LLM chat.',
      isOnline: true,
    },
    {
      id: 'usr_rohit_3',
      name: 'Rohit Verma',
      role: 'B.Tech CS Senior',
      companyOrCollege: 'Dharmsinh Desai University',
      avatarColor: 'from-emerald-500 to-teal-600',
      initials: 'RV',
      studiedAt: '4 days ago',
      status: 'connected',
      mutualSkills: ['FastAPI', 'Docker', 'SQL'],
      bio: 'Created high-speed RESTful authentication & rate limiting middleware.',
      isOnline: true,
    },
  ],
  k8s: [
    {
      id: 'usr_vikram_5',
      name: 'Vikram Mehta',
      role: 'Cloud DevOps Architect',
      companyOrCollege: 'Microsoft Cloud Solutions',
      avatarColor: 'from-blue-600 to-indigo-700',
      initials: 'VM',
      studiedAt: '3 hours ago',
      status: 'pending',
      mutualSkills: ['Kubernetes', 'Docker', 'Helm'],
      bio: 'Architected automated Horizontal Pod Autoscaling (HPA) for GPU clusters.',
      isOnline: true,
    },
    {
      id: 'usr_neha_4',
      name: 'Neha Kulkarni',
      role: 'AI Infrastructure Engineer',
      companyOrCollege: 'NVIDIA (Inference Team)',
      avatarColor: 'from-amber-500 to-orange-600',
      initials: 'NK',
      studiedAt: 'Yesterday',
      status: 'none',
      mutualSkills: ['Kubernetes', 'KServe', 'Ray'],
      bio: 'Deploying KServe and Ray Operator on multi-node Kubernetes clusters.',
      isOnline: false,
    },
    {
      id: 'usr_priya_2',
      name: 'Priya Patel',
      role: 'Associate Data Scientist',
      companyOrCollege: 'Swiggy ML Platform',
      avatarColor: 'from-purple-500 to-pink-600',
      initials: 'PP',
      studiedAt: '2 days ago',
      status: 'none',
      mutualSkills: ['Kubernetes', 'MLOps', 'Python'],
      bio: 'Configured zero-downtime model rollouts using Istio service mesh on K8s.',
      isOnline: true,
    },
  ],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resourceId = (searchParams.get('resourceId') || '').toLowerCase();
  const skillName = (searchParams.get('skillName') || '').toLowerCase();

  let pool: StudiedUser[] = PEER_USERS_POOL.default;

  if (resourceId.includes('docker') || skillName.includes('docker')) {
    pool = PEER_USERS_POOL.docker || PEER_USERS_POOL.default;
  } else if (resourceId.includes('fastapi') || skillName.includes('fastapi')) {
    pool = PEER_USERS_POOL.fastapi || PEER_USERS_POOL.default;
  } else if (resourceId.includes('k8s') || resourceId.includes('kubern') || skillName.includes('kubern')) {
    pool = PEER_USERS_POOL.k8s || PEER_USERS_POOL.default;
  }

  return NextResponse.json({
    success: true,
    resourceId,
    skillName,
    totalStudied: pool.length,
    users: pool,
  });
}
