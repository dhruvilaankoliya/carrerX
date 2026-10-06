/**
 * CareerX Student Connect & Peer Learning Service
 * 
 * Provides dynamic data structures, realistic mock & persistent storage,
 * dynamic 5-star rating aggregations, community discussions, and intelligent matching.
 */

export interface StudentReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerCollege?: string;
  studentId: string;
  resourceTopic: string;
  rating: number; // 1 to 5
  reviewText: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ResourceDiscussion {
  id: string;
  resourceTopic: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorCollege: string;
  upvotes: number;
  hasUpvoted?: boolean;
  repliesCount: number;
  createdAt: string;
  replies: Array<{
    id: string;
    authorName: string;
    authorCollege: string;
    content: string;
    createdAt: string;
  }>;
}

export interface StudentProfileData {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  profilePhoto?: string | null;
  college: string;
  course: string;
  branch: string;
  currentYear: number;
  gradYear: number;
  careerGoal: string;
  preferredField: string;
  bio: string;
  technicalSkills: string[];
  studiedResource: string;
  completionPercent: number; // 0 - 100
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  availableToHelp: boolean;
  isOnline: boolean;
  lastActiveAt: string;
  completedResources: string[];
  currentlyLearning: string[];
  achievements: string[];
  ratingsSummary: {
    averageRating: number;
    totalReviews: number;
    distribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  reviews: StudentReview[];
  matchScore?: number;
  matchReasons?: string[];
}

// Global In-Memory Persistent Store across hot-reloads
const globalStore = globalThis as unknown as {
  __careerx_reviews?: Record<string, StudentReview[]>;
  __careerx_discussions?: Record<string, ResourceDiscussion[]>;
  __careerx_connections?: Record<string, 'pending' | 'accepted' | 'declined'>;
};

if (!globalStore.__careerx_reviews) {
  globalStore.__careerx_reviews = {};
}
if (!globalStore.__careerx_discussions) {
  globalStore.__careerx_discussions = {};
}
if (!globalStore.__careerx_connections) {
  globalStore.__careerx_connections = {};
}

// Master Seed of Realistically Structured Students
const MASTER_STUDENTS: Omit<StudentProfileData, 'ratingsSummary' | 'reviews'>[] = [
  {
    id: 'std_dhruv_p',
    name: 'Dhruv Patel',
    initials: 'DP',
    avatarColor: 'from-cyan-500 to-blue-600',
    college: 'Adani University',
    course: 'B.Tech CSE (AI-ML)',
    branch: 'AI & Data Science',
    currentYear: 3,
    gradYear: 2027,
    careerGoal: 'Machine Learning Infrastructure Engineer',
    preferredField: 'AI / Cloud Infrastructure',
    bio: 'Interested in ML infrastructure, distributed container orchestration, and deploying scalable PyTorch models on Kubernetes clusters.',
    technicalSkills: ['Python', 'Kubernetes', 'Docker', 'FastAPI', 'MLOps', 'PyTorch', 'AWS', 'Linux'],
    studiedResource: 'Kubernetes',
    completionPercent: 88,
    experienceLevel: 'Advanced',
    availableToHelp: true,
    isOnline: true,
    lastActiveAt: '10 mins ago',
    completedResources: ['Kubernetes for Beginners', 'Docker Masterclass', 'FastAPI Async APIs', 'PyTorch Deep Learning'],
    currentlyLearning: ['MLOps on KubeFlow', 'TensorRT-LLM', 'Ray Cluster Scheduling'],
    achievements: ['Won 1st place in National AI Infra Hackathon', 'Maintained 99.9% uptime on university GPU cluster'],
  },
  {
    id: 'std_rahul_s',
    name: 'Rahul Shah',
    initials: 'RS',
    avatarColor: 'from-purple-500 to-indigo-600',
    college: 'IIT Bombay',
    course: 'B.Tech Computer Science',
    branch: 'Computer Science & Engineering',
    currentYear: 4,
    gradYear: 2026,
    careerGoal: 'Production MLOps Engineer',
    preferredField: 'MLOps & Platform Engineering',
    bio: 'Built end-to-end automated retraining pipelines with MLflow and Docker. Passionate about helping peers set up zero-downtime canary deployments.',
    technicalSkills: ['MLOps', 'Docker', 'Kubernetes', 'MLflow', 'CI/CD', 'Python', 'Prometheus'],
    studiedResource: 'MLOps',
    completionPercent: 95,
    experienceLevel: 'Advanced',
    availableToHelp: true,
    isOnline: true,
    lastActiveAt: 'Just now',
    completedResources: ['Made With ML Production MLOps', 'Kubernetes Core Concepts', 'GitHub Actions CI/CD'],
    currentlyLearning: ['Feast Feature Store', 'Argo Workflows'],
    achievements: ['Published paper on Model Drift Detection', 'Ex-Intern @ Swiggy ML Platform'],
  },
  {
    id: 'std_aisha_m',
    name: 'Aisha Mehta',
    initials: 'AM',
    avatarColor: 'from-pink-500 to-rose-600',
    college: 'Dharmsinh Desai University',
    course: 'B.Tech IT',
    branch: 'Information Technology',
    currentYear: 3,
    gradYear: 2027,
    careerGoal: 'Full Stack & AI Backend Developer',
    preferredField: 'Async Web & AI Systems',
    bio: 'Developing high-throughput REST & SSE streaming APIs using FastAPI and Pinecone Vector DB for Generative AI applications.',
    technicalSkills: ['FastAPI', 'Python', 'Vector DB', 'Docker', 'Redis', 'PostgreSQL', 'LangChain'],
    studiedResource: 'FastAPI',
    completionPercent: 90,
    experienceLevel: 'Intermediate',
    availableToHelp: true,
    isOnline: false,
    lastActiveAt: '2 hours ago',
    completedResources: ['FastAPI Official Tutorial', 'Pinecone Vector Search Masterclass', 'Docker for Python'],
    currentlyLearning: ['Transformers & HuggingFace', 'vLLM Inference'],
    achievements: ['Built university AI chatbot serving 5,000+ queries/day', 'Open-source contributor to FastAPI extensions'],
  },
  {
    id: 'std_rohit_v',
    name: 'Rohit Verma',
    initials: 'RV',
    avatarColor: 'from-emerald-500 to-teal-600',
    college: 'BITS Pilani',
    course: 'B.E. Computer Science',
    branch: 'Computer Science',
    currentYear: 3,
    gradYear: 2027,
    careerGoal: 'Generative AI & LLM Systems Researcher',
    preferredField: 'Deep Learning & NLP',
    bio: 'Deep diving into Attention mechanisms, Transformer tokenizers, and parameter-efficient fine-tuning (LoRA / QLoRA) on PyTorch.',
    technicalSkills: ['Transformers', 'PyTorch', 'Python', 'Vector DB', 'HuggingFace', 'FastAPI'],
    studiedResource: 'Transformers',
    completionPercent: 82,
    experienceLevel: 'Intermediate',
    availableToHelp: true,
    isOnline: true,
    lastActiveAt: '25 mins ago',
    completedResources: ['HuggingFace NLP Course', 'Attention Is All You Need Deep Dive', 'PyTorch Neural Networks'],
    currentlyLearning: ['DeepSeek & Llama Architecture', 'Multi-Head Latent Attention'],
    achievements: ['Fine-tuned open-source medical diagnosis LLM with 91% benchmark accuracy'],
  },
  {
    id: 'std_priya_k',
    name: 'Priya Kulkarni',
    initials: 'PK',
    avatarColor: 'from-amber-500 to-orange-600',
    college: 'Adani University',
    course: 'B.Tech CSE (AI-ML)',
    branch: 'AI & Data Science',
    currentYear: 2,
    gradYear: 2028,
    careerGoal: 'Cloud DevOps & SRE Engineer',
    preferredField: 'Cloud & Infrastructure',
    bio: 'Containerizing full-stack microservices, writing declarative Dockerfiles, and setting up automated GitHub Actions CI/CD pipelines.',
    technicalSkills: ['Docker', 'CI/CD', 'Linux', 'Git', 'AWS', 'Python'],
    studiedResource: 'Docker',
    completionPercent: 78,
    experienceLevel: 'Intermediate',
    availableToHelp: true,
    isOnline: false,
    lastActiveAt: '1 day ago',
    completedResources: ['Docker Containerization Guide', 'GitHub Actions Quickstart', 'Linux Shell Scripting'],
    currentlyLearning: ['Kubernetes Pod Architecture', 'Terraform Cloud'],
    achievements: ['Automated zero-downtime CI/CD build scripts for college robotics club'],
  },
  {
    id: 'std_ananya_g',
    name: 'Ananya Gupta',
    initials: 'AG',
    avatarColor: 'from-fuchsia-500 to-purple-600',
    college: 'Stanford AI Lab Alum / IIT Delhi',
    course: 'M.Tech AI & Data Engineering',
    branch: 'Artificial Intelligence',
    currentYear: 4,
    gradYear: 2026,
    careerGoal: 'AI Research & RAG Architect',
    preferredField: 'Vector Retrieval & Knowledge Graphs',
    bio: 'Specializing in dense vector embedding indexing (HNSW, IVF), hybrid keyword-vector search, and low-latency RAG grounding.',
    technicalSkills: ['Vector DB', 'PyTorch', 'Transformers', 'FastAPI', 'Python', 'Docker'],
    studiedResource: 'Vector DB',
    completionPercent: 96,
    experienceLevel: 'Advanced',
    availableToHelp: true,
    isOnline: true,
    lastActiveAt: '5 mins ago',
    completedResources: ['Pinecone Vector Masterclass', 'Building Production RAG', 'LangChain Advanced Retrieval'],
    currentlyLearning: ['ColBERT & Dense Passage Retrieval', 'GraphRAG'],
    achievements: ['Published top-tier NLP paper on dense embedding quantization', 'Gave workshop on Vector Databases'],
  },
  {
    id: 'std_vikram_m',
    name: 'Vikram Mehta',
    initials: 'VM',
    avatarColor: 'from-blue-600 to-indigo-700',
    college: 'Gujarat Technological University',
    course: 'B.Tech Computer Engineering',
    branch: 'Computer Engineering',
    currentYear: 4,
    gradYear: 2026,
    careerGoal: 'Cloud Automation Architect',
    preferredField: 'CI/CD & Cloud Infrastructure',
    bio: 'Configuring multi-stage CI/CD pipelines, automated vulnerability scanning, and containerized deployment gates.',
    technicalSkills: ['CI/CD', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'Python'],
    studiedResource: 'CI/CD',
    completionPercent: 85,
    experienceLevel: 'Intermediate',
    availableToHelp: true,
    isOnline: true,
    lastActiveAt: '40 mins ago',
    completedResources: ['GitHub Actions Masterclass', 'CML Continuous ML', 'Docker in Production'],
    currentlyLearning: ['Kubernetes GitOps with ArgoCD', 'Helm Charts'],
    achievements: ['Reduced CI build time from 25 minutes to 4 minutes using Docker layer caching'],
  },
  {
    id: 'std_karan_s',
    name: 'Karan Singhal',
    initials: 'KS',
    avatarColor: 'from-teal-500 to-cyan-700',
    college: 'Dharmsinh Desai University',
    course: 'B.Tech Computer Science',
    branch: 'Computer Science',
    currentYear: 3,
    gradYear: 2027,
    careerGoal: 'Distributed Systems Architect',
    preferredField: 'High-Scale Backend & System Design',
    bio: 'Architecting distributed caching, message queues (Kafka/RabbitMQ), and database sharding patterns for 100k+ QPS systems.',
    technicalSkills: ['System Design', 'SQL', 'FastAPI', 'Docker', 'Redis', 'PostgreSQL'],
    studiedResource: 'System Design',
    completionPercent: 92,
    experienceLevel: 'Advanced',
    availableToHelp: true,
    isOnline: false,
    lastActiveAt: '3 hours ago',
    completedResources: ['Designing Data-Intensive Applications', 'Microservice Architecture Patterns', 'PostgreSQL Optimization'],
    currentlyLearning: ['Distributed Consensus (Raft/Paxos)', 'gRPC Inter-service Mesh'],
    achievements: ['Ranked top 1% in Global Algorithmic System Design Olympiad'],
  },
  {
    id: 'std_tanvi_j',
    name: 'Tanvi Joshi',
    initials: 'TJ',
    avatarColor: 'from-rose-500 to-amber-600',
    college: 'Adani University',
    course: 'B.Tech CSE (AI-ML)',
    branch: 'AI & Data Science',
    currentYear: 2,
    gradYear: 2028,
    careerGoal: 'Data Engineer & Analytics Specialist',
    preferredField: 'Data Warehousing & SQL',
    bio: 'Writing complex analytical window functions, query execution plan optimizations, and database indexing for high-scale ETL.',
    technicalSkills: ['SQL', 'Python', 'PostgreSQL', 'FastAPI', 'Docker', 'Pandas'],
    studiedResource: 'SQL',
    completionPercent: 84,
    experienceLevel: 'Intermediate',
    availableToHelp: true,
    isOnline: true,
    lastActiveAt: '15 mins ago',
    completedResources: ['Advanced SQL for Data Engineers', 'PostgreSQL Indexing & Optimization'],
    currentlyLearning: ['Snowflake & BigQuery Data Warehousing', 'dbt Data Modeling'],
    achievements: ['Built high-speed financial analytics aggregator for hackathon final'],
  },
  {
    id: 'std_samir_r',
    name: 'Samir Roy',
    initials: 'SR',
    avatarColor: 'from-indigo-600 to-blue-500',
    college: 'IIT Roorkee',
    course: 'B.Tech Computer Science',
    branch: 'Computer Science',
    currentYear: 3,
    gradYear: 2027,
    careerGoal: 'Production ML Monitoring & Reliability Engineer',
    preferredField: 'Model Observability & Telemetry',
    bio: 'Setting up real-time telemetry dashboards for data drift, prediction latency, and Prometheus / Grafana metrics on live inference traffic.',
    technicalSkills: ['Model Monitoring', 'MLOps', 'Docker', 'Python', 'FastAPI', 'Prometheus'],
    studiedResource: 'Model Monitoring',
    completionPercent: 86,
    experienceLevel: 'Intermediate',
    availableToHelp: true,
    isOnline: true,
    lastActiveAt: '1 hour ago',
    completedResources: ['Evidently AI Drift Monitoring', 'Prometheus & Grafana ML Metrics', 'FastAPI Production'],
    currentlyLearning: ['OpenTelemetry for ML Services', 'Shadow Deployment Architectures'],
    achievements: ['Configured live model drift alerts for real-time sensor network'],
  },
];

// Initial Seed Reviews
const INITIAL_REVIEWS_SEED: Record<string, StudentReview[]> = {
  std_dhruv_p: [
    {
      id: 'rev_dp_1',
      reviewerId: 'std_aisha_m',
      reviewerName: 'Aisha Mehta',
      reviewerCollege: 'Dharmsinh Desai University',
      studentId: 'std_dhruv_p',
      resourceTopic: 'Kubernetes',
      rating: 5,
      reviewText: 'Very helpful in explaining Kubernetes concepts and how pods communicate across namespaces!',
      helpfulCount: 14,
      createdAt: '2 days ago',
    },
    {
      id: 'rev_dp_2',
      reviewerId: 'std_priya_k',
      reviewerName: 'Priya Kulkarni',
      reviewerCollege: 'Adani University',
      studentId: 'std_dhruv_p',
      resourceTopic: 'Kubernetes',
      rating: 5,
      reviewText: 'Helped me understand Kubernetes deployment manifests and GPU passthrough configuration.',
      helpfulCount: 9,
      createdAt: '1 week ago',
    },
    {
      id: 'rev_dp_3',
      reviewerId: 'std_rohit_v',
      reviewerName: 'Rohit Verma',
      reviewerCollege: 'BITS Pilani',
      studentId: 'std_dhruv_p',
      resourceTopic: 'Kubernetes',
      rating: 4,
      reviewText: 'Great practical insights on autoscaling pods with HPA during high inference traffic spikes.',
      helpfulCount: 6,
      createdAt: '2 weeks ago',
    },
  ],
  std_rahul_s: [
    {
      id: 'rev_rs_1',
      reviewerId: 'std_dhruv_p',
      reviewerName: 'Dhruv Patel',
      reviewerCollege: 'Adani University',
      studentId: 'std_rahul_s',
      resourceTopic: 'MLOps',
      rating: 5,
      reviewText: 'Clear explanation of MLflow tracking server setup and automated model registry staging.',
      helpfulCount: 18,
      createdAt: '3 days ago',
    },
    {
      id: 'rev_rs_2',
      reviewerId: 'std_samir_r',
      reviewerName: 'Samir Roy',
      reviewerCollege: 'IIT Roorkee',
      studentId: 'std_rahul_s',
      resourceTopic: 'MLOps',
      rating: 5,
      reviewText: 'Super knowledgeable about CI/CD for continuous model training and reproducibility.',
      helpfulCount: 11,
      createdAt: '1 week ago',
    },
  ],
  std_aisha_m: [
    {
      id: 'rev_am_1',
      reviewerId: 'std_ananya_g',
      reviewerName: 'Ananya Gupta',
      reviewerCollege: 'Stanford AI Lab Alum',
      studentId: 'std_aisha_m',
      resourceTopic: 'FastAPI',
      rating: 5,
      reviewText: 'Aisha gave great advice on asynchronous endpoints and structuring Pydantic v2 schemas!',
      helpfulCount: 12,
      createdAt: '4 days ago',
    },
    {
      id: 'rev_am_2',
      reviewerId: 'std_karan_s',
      reviewerName: 'Karan Singhal',
      reviewerCollege: 'Dharmsinh Desai University',
      studentId: 'std_aisha_m',
      resourceTopic: 'FastAPI',
      rating: 4,
      reviewText: 'Very responsive study partner. We built a streaming SSE prototype in just 2 hours.',
      helpfulCount: 7,
      createdAt: '2 weeks ago',
    },
  ],
  std_rohit_v: [
    {
      id: 'rev_rv_1',
      reviewerId: 'std_ananya_g',
      reviewerName: 'Ananya Gupta',
      reviewerCollege: 'Stanford AI Lab Alum',
      studentId: 'std_rohit_v',
      resourceTopic: 'Transformers',
      rating: 5,
      reviewText: 'Helped explain Multi-Head Attention equations and matrix multiplication step-by-step.',
      helpfulCount: 15,
      createdAt: '5 days ago',
    },
  ],
  std_priya_k: [
    {
      id: 'rev_pk_1',
      reviewerId: 'std_dhruv_p',
      reviewerName: 'Dhruv Patel',
      reviewerCollege: 'Adani University',
      studentId: 'std_priya_k',
      resourceTopic: 'Docker',
      rating: 5,
      reviewText: 'Great tips on multi-stage build optimization and reducing image sizes from 3GB to 400MB!',
      helpfulCount: 8,
      createdAt: '1 week ago',
    },
  ],
  std_ananya_g: [
    {
      id: 'rev_ag_1',
      reviewerId: 'std_aisha_m',
      reviewerName: 'Aisha Mehta',
      reviewerCollege: 'Dharmsinh Desai University',
      studentId: 'std_ananya_g',
      resourceTopic: 'Vector DB',
      rating: 5,
      reviewText: 'Incredible depth on HNSW vs IVF indexing trade-offs for semantic search in RAG pipelines.',
      helpfulCount: 22,
      createdAt: '3 days ago',
    },
  ],
};

// Initial Seed Discussions for Resources
const INITIAL_DISCUSSIONS_SEED: Record<string, ResourceDiscussion[]> = {
  kubernetes: [
    {
      id: 'disc_k8s_1',
      resourceTopic: 'Kubernetes',
      title: 'How do I deploy a model on Kubernetes with GPU support?',
      content: 'I have containerized a PyTorch ResNet model with Docker. How do I configure NVIDIA device plugins in the Kubernetes deployment yaml to allocate 1 GPU per pod?',
      authorId: 'std_priya_k',
      authorName: 'Priya Kulkarni',
      authorCollege: 'Adani University',
      upvotes: 24,
      repliesCount: 4,
      createdAt: 'Yesterday',
      replies: [
        {
          id: 'rep_1',
          authorName: 'Dhruv Patel',
          authorCollege: 'Adani University',
          content: 'You need to set resources.limits: nvidia.com/gpu: 1 in your Pod container spec and ensure the nvidia-container-toolkit is installed on your worker nodes.',
          createdAt: '18 hours ago',
        },
        {
          id: 'rep_2',
          authorName: 'Rahul Shah',
          authorCollege: 'IIT Bombay',
          content: 'Check out KServe or Triton Inference Server as well if you want automated request batching and GPU scaling.',
          createdAt: '12 hours ago',
        },
      ],
    },
    {
      id: 'disc_k8s_2',
      resourceTopic: 'Kubernetes',
      title: 'Kubernetes vs Docker: When should a student switch to K8s?',
      content: 'Is Docker Compose enough for portfolio projects, or is hands-on Kubernetes experience mandatory for entry-level ML Engineer roles?',
      authorId: 'std_tanvi_j',
      authorName: 'Tanvi Joshi',
      authorCollege: 'Adani University',
      upvotes: 38,
      repliesCount: 3,
      createdAt: '3 days ago',
      replies: [
        {
          id: 'rep_3',
          authorName: 'Dhruv Patel',
          authorCollege: 'Adani University',
          content: 'Docker Compose is great for development, but knowing Kubernetes Pods, Deployments, and Services will make your resume stand out significantly.',
          createdAt: '2 days ago',
        },
      ],
    },
    {
      id: 'disc_k8s_3',
      resourceTopic: 'Kubernetes',
      title: 'Best Kubernetes resources for absolute beginners?',
      content: 'What is the most effective hands-on path to master K8s without having to pay for expensive cloud cluster hours?',
      authorId: 'std_rohit_v',
      authorName: 'Rohit Verma',
      authorCollege: 'BITS Pilani',
      upvotes: 19,
      repliesCount: 2,
      createdAt: '5 days ago',
      replies: [
        {
          id: 'rep_4',
          authorName: 'Vikram Mehta',
          authorCollege: 'Gujarat Technological University',
          content: 'Start with Minikube or Kind (Kubernetes in Docker) locally on your laptop! It is 100% free and teaches all core concepts.',
          createdAt: '4 days ago',
        },
      ],
    },
  ],
  fastapi: [
    {
      id: 'disc_fastapi_1',
      resourceTopic: 'FastAPI',
      title: 'Serving PyTorch & HuggingFace Models with FastAPI: Best Practices',
      content: 'Should we load model weights at startup with lifespan context managers or per-request? How to prevent blocking the async event loop during inference?',
      authorId: 'std_dhruv_p',
      authorName: 'Dhruv Patel',
      authorCollege: 'Adani University',
      upvotes: 31,
      repliesCount: 3,
      createdAt: '2 days ago',
      replies: [
        {
          id: 'rep_fa_1',
          authorName: 'Aisha Mehta',
          authorCollege: 'Dharmsinh Desai University',
          content: 'Always load model weights inside the @asynccontextmanager lifespan handler at startup. For heavy inference, run in a separate threadpool using run_in_threadpool or Ray.',
          createdAt: '1 day ago',
        },
      ],
    },
  ],
  mlops: [
    {
      id: 'disc_mlops_1',
      resourceTopic: 'MLOps',
      title: 'MLflow vs DVC: How do they complement each other in production?',
      content: 'Do we use MLflow for metric tracking and DVC for large dataset versioning?',
      authorId: 'std_samir_r',
      authorName: 'Samir Roy',
      authorCollege: 'IIT Roorkee',
      upvotes: 27,
      repliesCount: 2,
      createdAt: '4 days ago',
      replies: [
        {
          id: 'rep_ml_1',
          authorName: 'Rahul Shah',
          authorCollege: 'IIT Bombay',
          content: 'Exactly! DVC versions your heavy S3/GCS data artifacts via Git pointers, while MLflow tracks hyperparameter runs and registers model binaries.',
          createdAt: '3 days ago',
        },
      ],
    },
  ],
  transformers: [
    {
      id: 'disc_tf_1',
      resourceTopic: 'Transformers',
      title: 'Understanding FlashAttention and KV Cache optimization',
      content: 'How does KV Cache reduce computational complexity from O(N^2) to O(N) during autoregressive token generation in LLMs?',
      authorId: 'std_ananya_g',
      authorName: 'Ananya Gupta',
      authorCollege: 'Stanford AI Lab Alum',
      upvotes: 42,
      repliesCount: 2,
      createdAt: '1 day ago',
      replies: [
        {
          id: 'rep_tf_1',
          authorName: 'Rohit Verma',
          authorCollege: 'BITS Pilani',
          content: 'By storing previously computed Key and Value projection matrices in GPU memory, subsequent token decodes only calculate attention for the newest token against the cached history!',
          createdAt: '14 hours ago',
        },
      ],
    },
  ],
};

// Initialize seeds in global store if empty
Object.keys(INITIAL_REVIEWS_SEED).forEach((studentId) => {
  if (!globalStore.__careerx_reviews![studentId]) {
    globalStore.__careerx_reviews![studentId] = [...INITIAL_REVIEWS_SEED[studentId]];
  }
});

Object.keys(INITIAL_DISCUSSIONS_SEED).forEach((topic) => {
  if (!globalStore.__careerx_discussions![topic]) {
    globalStore.__careerx_discussions![topic] = [...INITIAL_DISCUSSIONS_SEED[topic]];
  }
});

/**
 * Calculates dynamic ratings summary (Average, Total, 5-tier distribution)
 */
export function calculateRatingsSummary(reviews: StudentReview[]) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 4.8, // default realistic benchmark
      totalReviews: 0,
      distribution: { 5: 18, 4: 4, 3: 1, 2: 0, 1: 0 },
    };
  }

  let totalScore = 0;
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[star] = (distribution[star] || 0) + 1;
    totalScore += r.rating;
  });

  const avg = Number((totalScore / reviews.length).toFixed(1));
  return {
    averageRating: avg,
    totalReviews: reviews.length,
    distribution,
  };
}

/**
 * Normalizes a topic/skill keyword (e.g. 'k8s' -> 'Kubernetes')
 */
export function normalizeResourceTopic(raw: string): string {
  if (!raw) return 'General';
  const clean = raw.toLowerCase().trim();
  if (clean.includes('k8s') || clean.includes('kubern')) return 'Kubernetes';
  if (clean.includes('docker')) return 'Docker';
  if (clean.includes('fastapi')) return 'FastAPI';
  if (clean.includes('mlops') || clean.includes('mlflow')) return 'MLOps';
  if (clean.includes('vector') || clean.includes('pinecone') || clean.includes('rag')) return 'Vector DB';
  if (clean.includes('ci/cd') || clean.includes('cicd') || clean.includes('action')) return 'CI/CD';
  if (clean.includes('monitor') || clean.includes('drift')) return 'Model Monitoring';
  if (clean.includes('pytorch') || clean.includes('torch')) return 'PyTorch';
  if (clean.includes('transformer') || clean.includes('llm') || clean.includes('hugging')) return 'Transformers';
  if (clean.includes('design') || clean.includes('system')) return 'System Design';
  if (clean.includes('sql') || clean.includes('postgres')) return 'SQL';
  return raw.trim();
}

/**
 * Generates dynamic dynamic student matching rationale
 */
export function computeMatchData(student: Omit<StudentProfileData, 'ratingsSummary' | 'reviews'>, targetSkill: string) {
  const normTarget = normalizeResourceTopic(targetSkill).toLowerCase();
  const hasCompleted = student.studiedResource.toLowerCase() === normTarget ||
    student.completedResources.some((c) => c.toLowerCase().includes(normTarget));

  const reasons: string[] = [];
  let matchScore = 75;

  if (hasCompleted) {
    reasons.push(`Completed ${normalizeResourceTopic(targetSkill)} roadmap`);
    matchScore += 15;
  }

  if (student.experienceLevel === 'Advanced') {
    reasons.push('Advanced engineering experience');
    matchScore += 5;
  }

  if (student.technicalSkills.some((s) => ['Docker', 'Kubernetes', 'FastAPI', 'MLOps'].includes(s))) {
    reasons.push(`Strong ${student.technicalSkills[0]} & ${student.technicalSkills[1] || 'Cloud'} skills`);
  }

  if (student.availableToHelp) {
    reasons.push('Available for peer study & code review');
    matchScore += 4;
  }

  matchScore = Math.min(98, matchScore);

  return {
    matchScore,
    matchReasons: reasons.slice(0, 3),
  };
}

/**
 * Gets students who studied a specific resource or topic with full filters & sorting
 */
export function getStudentsForResource(params: {
  resourceId?: string;
  skillName?: string;
  search?: string;
  college?: string;
  course?: string;
  year?: string;
  experienceLevel?: string;
  minRating?: number;
  minProgress?: number;
  sortBy?: 'relevant' | 'highest_rated' | 'experienced' | 'helpful' | 'recent';
}): {
  resourceTopic: string;
  totalStudents: number;
  students: StudentProfileData[];
} {
  const topic = normalizeResourceTopic(params.skillName || params.resourceId || 'Kubernetes');
  const normTopic = topic.toLowerCase();

  // 1. Build complete dynamic student profiles
  let list: StudentProfileData[] = MASTER_STUDENTS.map((s) => {
    // Check custom assigned topic or adapt dynamically
    const currentStudied = s.studiedResource.toLowerCase() === normTopic
      ? s.studiedResource
      : s.completedResources.find((c) => c.toLowerCase().includes(normTopic))
      ? topic
      : s.studiedResource;

    const reviews = globalStore.__careerx_reviews![s.id] || [];
    const ratingsSummary = calculateRatingsSummary(reviews);
    const { matchScore, matchReasons } = computeMatchData(s, topic);

    return {
      ...s,
      studiedResource: currentStudied,
      ratingsSummary,
      reviews,
      matchScore,
      matchReasons,
    };
  });

  // 2. Search query filter
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.college.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q) ||
      s.careerGoal.toLowerCase().includes(q) ||
      s.bio.toLowerCase().includes(q) ||
      s.technicalSkills.some((sk) => sk.toLowerCase().includes(q))
    );
  }

  // 3. College filter
  if (params.college && params.college !== 'all') {
    list = list.filter((s) => s.college.toLowerCase() === params.college!.toLowerCase());
  }

  // 4. Course filter
  if (params.course && params.course !== 'all') {
    list = list.filter((s) => s.course.toLowerCase().includes(params.course!.toLowerCase()));
  }

  // 5. Year filter
  if (params.year && params.year !== 'all') {
    const y = parseInt(params.year, 10);
    if (!isNaN(y)) {
      list = list.filter((s) => s.currentYear === y);
    }
  }

  // 6. Experience Level filter
  if (params.experienceLevel && params.experienceLevel !== 'all') {
    list = list.filter((s) => s.experienceLevel.toLowerCase() === params.experienceLevel!.toLowerCase());
  }

  // 7. Progress filter
  if (params.minProgress && params.minProgress > 0) {
    list = list.filter((s) => s.completionPercent >= params.minProgress!);
  }

  // 8. Min rating filter
  if (params.minRating && params.minRating > 0) {
    list = list.filter((s) => s.ratingsSummary.averageRating >= params.minRating!);
  }

  // 9. Sorting
  const sortBy = params.sortBy || 'relevant';
  list.sort((a, b) => {
    if (sortBy === 'highest_rated') {
      return b.ratingsSummary.averageRating - a.ratingsSummary.averageRating || b.ratingsSummary.totalReviews - a.ratingsSummary.totalReviews;
    }
    if (sortBy === 'experienced') {
      const rank = { Advanced: 3, Intermediate: 2, Beginner: 1 };
      return (rank[b.experienceLevel] || 0) - (rank[a.experienceLevel] || 0) || b.completionPercent - a.completionPercent;
    }
    if (sortBy === 'helpful') {
      return b.ratingsSummary.totalReviews - a.ratingsSummary.totalReviews || b.ratingsSummary.averageRating - a.ratingsSummary.averageRating;
    }
    if (sortBy === 'recent') {
      return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
    }
    // Default: 'relevant' (Intelligent prioritization: matching target skill + high score + active)
    const aTopicMatch = a.studiedResource.toLowerCase() === normTopic ? 20 : 0;
    const bTopicMatch = b.studiedResource.toLowerCase() === normTopic ? 20 : 0;
    const aScore = (a.matchScore || 80) + aTopicMatch + (a.isOnline ? 5 : 0);
    const bScore = (b.matchScore || 80) + bTopicMatch + (b.isOnline ? 5 : 0);
    return bScore - aScore;
  });

  return {
    resourceTopic: topic,
    totalStudents: list.length,
    students: list,
  };
}

/**
 * Gets a single student's complete profile
 */
export function getStudentProfileById(studentId: string): StudentProfileData | null {
  const found = MASTER_STUDENTS.find((s) => s.id === studentId);
  if (!found) return null;

  const reviews = globalStore.__careerx_reviews![studentId] || [];
  const ratingsSummary = calculateRatingsSummary(reviews);
  const { matchScore, matchReasons } = computeMatchData(found, found.studiedResource);

  return {
    ...found,
    ratingsSummary,
    reviews,
    matchScore,
    matchReasons,
  };
}

/**
 * Submits or updates a 5-star rating and review for a student
 */
export function submitStudentReview(payload: {
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerCollege?: string;
  studentId: string;
  resourceTopic: string;
  rating: number;
  reviewText: string;
}): {
  success: boolean;
  message: string;
  updatedSummary: ReturnType<typeof calculateRatingsSummary>;
  review: StudentReview;
} {
  const { reviewerId, reviewerName, studentId, resourceTopic, rating, reviewText } = payload;
  if (!studentId || !rating) {
    throw new Error('Student ID and rating are required');
  }

  const cleanRating = Math.min(5, Math.max(1, Math.round(rating)));
  const existingReviews = globalStore.__careerx_reviews![studentId] || [];

  // Check if this reviewer already reviewed this student
  const existingIndex = existingReviews.findIndex((r) => r.reviewerId === reviewerId);

  let newReview: StudentReview;
  if (existingIndex >= 0) {
    // Update existing review
    newReview = {
      ...existingReviews[existingIndex],
      rating: cleanRating,
      reviewText: reviewText.trim() || existingReviews[existingIndex].reviewText,
      resourceTopic: resourceTopic || existingReviews[existingIndex].resourceTopic,
      updatedAt: 'Just now',
    };
    existingReviews[existingIndex] = newReview;
  } else {
    // Create new review
    newReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reviewerId,
      reviewerName: reviewerName || 'Verified Student Learner',
      reviewerAvatar: payload.reviewerAvatar,
      reviewerCollege: payload.reviewerCollege || 'CareerX Peer Learning Network',
      studentId,
      resourceTopic: resourceTopic || 'Engineering Topics',
      rating: cleanRating,
      reviewText: reviewText.trim() || 'Great peer interaction and helpful explanations.',
      helpfulCount: 1,
      createdAt: 'Just now',
    };
    existingReviews.unshift(newReview);
  }

  globalStore.__careerx_reviews![studentId] = existingReviews;
  const updatedSummary = calculateRatingsSummary(existingReviews);

  return {
    success: true,
    message: existingIndex >= 0 ? 'Your review was updated successfully!' : 'Thank you! Your review has been submitted.',
    updatedSummary,
    review: newReview,
  };
}

/**
 * Gets community discussions for a resource topic
 */
export function getDiscussionsForTopic(topic: string): ResourceDiscussion[] {
  const norm = normalizeResourceTopic(topic).toLowerCase();
  const discussions = globalStore.__careerx_discussions![norm] || globalStore.__careerx_discussions!['kubernetes'] || [];
  return discussions;
}

/**
 * Creates a new community discussion question
 */
export function createDiscussionQuestion(payload: {
  resourceTopic: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorCollege?: string;
}): ResourceDiscussion {
  const norm = normalizeResourceTopic(payload.resourceTopic).toLowerCase();
  if (!globalStore.__careerx_discussions![norm]) {
    globalStore.__careerx_discussions![norm] = [];
  }

  const newDisc: ResourceDiscussion = {
    id: `disc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    resourceTopic: normalizeResourceTopic(payload.resourceTopic),
    title: payload.title.trim(),
    content: payload.content.trim(),
    authorId: payload.authorId,
    authorName: payload.authorName,
    authorCollege: payload.authorCollege || 'CareerX Student',
    upvotes: 1,
    hasUpvoted: true,
    repliesCount: 0,
    createdAt: 'Just now',
    replies: [],
  };

  globalStore.__careerx_discussions![norm].unshift(newDisc);
  return newDisc;
}

/**
 * Adds a reply to a discussion thread
 */
export function addDiscussionReply(payload: {
  discussionId: string;
  resourceTopic: string;
  authorName: string;
  authorCollege?: string;
  content: string;
}): { success: boolean; discussion: ResourceDiscussion } {
  const norm = normalizeResourceTopic(payload.resourceTopic).toLowerCase();
  const list = globalStore.__careerx_discussions![norm] || [];
  const disc = list.find((d) => d.id === payload.discussionId);

  if (!disc) {
    throw new Error('Discussion thread not found');
  }

  const reply = {
    id: `rep_${Date.now()}`,
    authorName: payload.authorName,
    authorCollege: payload.authorCollege || 'CareerX Student',
    content: payload.content.trim(),
    createdAt: 'Just now',
  };

  disc.replies.push(reply);
  disc.repliesCount = disc.replies.length;

  return {
    success: true,
    discussion: disc,
  };
}
