export interface CareerDefinition {
  id: string;
  title: string;
  category: 'AI & Data' | 'Software & Web' | 'Cloud & DevOps' | 'Cyber & Security' | 'Product & Management';
  icon: string;
  tagline: string;
  description: string;
  demandLevel: 'Critical' | 'Very High' | 'High' | 'Moderate';
  growthRate: string;
  salary: {
    entryLPA: number;
    midLPA: number;
    highLPA: number;
    avgLPA: number;
  };
  requiredSkills: string[];
  topTools: string[];
  radarDimensions: { name: string; benchmark: number }[];
  recommendedProject: {
    title: string;
    desc: string;
    xp: number;
    readinessBoost: string;
  };
  recommendedCourse: {
    title: string;
    provider: string;
    duration: string;
    rating: string;
    why: string;
  };
  growthPath: { role: string; salaryLPA: string; timeline: string }[];
}

export const CAREER_TAXONOMY: Record<string, CareerDefinition> = {
  'ml-engineer': {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    category: 'AI & Data',
    icon: '🤖',
    tagline: 'Design and deploy production-scale neural networks & LLM pipelines',
    description: 'Bridges machine learning research and high-scale production systems. Builds training pipelines, optimizes inference, and deploys intelligent models.',
    demandLevel: 'Very High',
    growthRate: '+38% YoY (High Demand)',
    salary: { entryLPA: 9.5, midLPA: 18.5, highLPA: 42.0, avgLPA: 16.2 },
    requiredSkills: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'Kubernetes', 'MLflow', 'RAG / Vector DBs', 'Transformers', 'Math & Statistics', 'System Design'],
    topTools: ['PyTorch', 'HuggingFace', 'Docker', 'Ray', 'Pinecone', 'Weights & Biases', 'AWS SageMaker'],
    radarDimensions: [
      { name: 'Python & Algos', benchmark: 95 },
      { name: 'Deep Learning', benchmark: 90 },
      { name: 'MLOps & Docker', benchmark: 85 },
      { name: 'Cloud & K8s', benchmark: 80 },
      { name: 'Vector DBs & RAG', benchmark: 85 },
      { name: 'Data Eng & SQL', benchmark: 80 },
      { name: 'System Design', benchmark: 85 },
      { name: 'Math & Stats', benchmark: 90 },
    ],
    recommendedProject: {
      title: 'Multimodal RAG Agent with Docker & FastAPI',
      desc: 'Build an autonomous research assistant with document vectorization, reranking, and live low-latency FastAPI deployment.',
      xp: 450,
      readinessBoost: '+4.5% Readiness',
    },
    recommendedCourse: {
      title: 'Production Machine Learning with Docker & Kubernetes',
      provider: 'DeepLearning.AI & Stanford Online',
      duration: '4 Weeks (12 hrs total)',
      rating: '4.9 ★',
      why: 'Directly addresses your primary gap in MLOps containerization and inference optimization.',
    },
    growthPath: [
      { role: 'Junior ML Engineer', salaryLPA: '₹8 - ₹14 LPA', timeline: '0 - 2 yrs' },
      { role: 'Senior AI/ML Engineer', salaryLPA: '₹18 - ₹32 LPA', timeline: '2 - 5 yrs' },
      { role: 'Principal AI Architect / Staff Scientist', salaryLPA: '₹35 - ₹65+ LPA', timeline: '5+ yrs' },
    ],
  },

  'fullstack-architect': {
    id: 'fullstack-architect',
    title: 'Full Stack Systems Architect',
    category: 'Software & Web',
    icon: '⚡',
    tagline: 'Architect resilient web applications, distributed APIs & microservices',
    description: 'Spearheads end-to-end software architecture from fluid frontend design systems down to distributed databases, edge caching, and scalable microservices.',
    demandLevel: 'High',
    growthRate: '+26% YoY (Steady Demand)',
    salary: { entryLPA: 8.0, midLPA: 16.0, highLPA: 36.0, avgLPA: 14.5 },
    requiredSkills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'GraphQL', 'System Design', 'CI/CD'],
    topTools: ['Next.js', 'Tailwind', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'GraphQL'],
    radarDimensions: [
      { name: 'Python & Algos', benchmark: 85 },
      { name: 'Deep Learning', benchmark: 30 },
      { name: 'MLOps & Docker', benchmark: 75 },
      { name: 'Cloud & K8s', benchmark: 85 },
      { name: 'Vector DBs & RAG', benchmark: 40 },
      { name: 'Data Eng & SQL', benchmark: 90 },
      { name: 'System Design', benchmark: 92 },
      { name: 'Math & Stats', benchmark: 60 },
    ],
    recommendedProject: {
      title: 'High-Concurrency Real-time Collaborative Canvas',
      desc: 'Build a distributed whiteboard with WebSockets, CRDT synchronization, and Redis Streams.',
      xp: 400,
      readinessBoost: '+4.0% Readiness',
    },
    recommendedCourse: {
      title: 'Advanced Distributed Systems & Microservices',
      provider: 'MIT Distributed Lab & Educative',
      duration: '5 Weeks',
      rating: '4.8 ★',
      why: 'Builds enterprise-grade system design intuition required for senior frontend/backend architect positions.',
    },
    growthPath: [
      { role: 'Full Stack Developer', salaryLPA: '₹6 - ₹12 LPA', timeline: '0 - 2 yrs' },
      { role: 'Senior Software Engineer', salaryLPA: '₹15 - ₹28 LPA', timeline: '2 - 5 yrs' },
      { role: 'Lead Architect / VP Engineering', salaryLPA: '₹30 - ₹55+ LPA', timeline: '5+ yrs' },
    ],
  },

  'cloud-devops': {
    id: 'cloud-devops',
    title: 'Cloud DevOps & Platform Engineer',
    category: 'Cloud & DevOps',
    icon: '☁️',
    tagline: 'Automate infrastructure, CI/CD pipelines, and cloud reliability',
    description: 'Designs zero-downtime infrastructure as code, manages multi-region cloud clusters, and secures automated deployment pipelines.',
    demandLevel: 'Very High',
    growthRate: '+32% YoY',
    salary: { entryLPA: 8.5, midLPA: 17.0, highLPA: 38.0, avgLPA: 15.0 },
    requiredSkills: ['Terraform', 'Kubernetes', 'Docker', 'AWS', 'CI/CD (GitHub Actions)', 'Linux Shell', 'Prometheus', 'Grafana', 'Security'],
    topTools: ['Kubernetes', 'Terraform', 'Docker', 'ArgoCD', 'Prometheus', 'AWS', 'Helm'],
    radarDimensions: [
      { name: 'Python & Algos', benchmark: 75 },
      { name: 'Deep Learning', benchmark: 20 },
      { name: 'MLOps & Docker', benchmark: 95 },
      { name: 'Cloud & K8s', benchmark: 95 },
      { name: 'Vector DBs & RAG', benchmark: 30 },
      { name: 'Data Eng & SQL', benchmark: 70 },
      { name: 'System Design', benchmark: 88 },
      { name: 'Math & Stats', benchmark: 50 },
    ],
    recommendedProject: {
      title: 'Multi-Cluster GitOps Infrastructure with Terraform',
      desc: 'Provision scalable Kubernetes clusters with automated canary deployments and observability dashboards.',
      xp: 380,
      readinessBoost: '+5.0% Readiness',
    },
    recommendedCourse: {
      title: 'Certified Kubernetes Administrator (CKA) Blueprint',
      provider: 'Linux Foundation',
      duration: '6 Weeks',
      rating: '4.9 ★',
      why: 'Cloud & DevOps roles prioritize verified credentials and hands-on Kubernetes orchestration.',
    },
    growthPath: [
      { role: 'DevOps / SRE Associate', salaryLPA: '₹7 - ₹12 LPA', timeline: '0 - 2 yrs' },
      { role: 'Senior Platform Engineer', salaryLPA: '₹16 - ₹29 LPA', timeline: '2 - 5 yrs' },
      { role: 'Cloud Director / Head of Infra', salaryLPA: '₹32 - ₹60+ LPA', timeline: '5+ yrs' },
    ],
  },

  'data-scientist': {
    id: 'data-scientist',
    title: 'Data Scientist & AI Analyst',
    category: 'AI & Data',
    icon: '📊',
    tagline: 'Transform messy big data into strategic predictive insights & models',
    description: 'Applies rigorous statistical modeling, feature engineering, and predictive algorithms to discover actionable intelligence for business and research.',
    demandLevel: 'High',
    growthRate: '+30% YoY',
    salary: { entryLPA: 8.0, midLPA: 16.5, highLPA: 35.0, avgLPA: 14.8 },
    requiredSkills: ['Python', 'SQL (Advanced)', 'Pandas/Polars', 'Scikit-Learn', 'A/B Testing', 'Tableau/PowerBI', 'Bayesian Statistics', 'Feature Engineering'],
    topTools: ['Jupyter', 'Pandas', 'SQL', 'Scikit-Learn', 'Tableau', 'Snowflake', 'DVC'],
    radarDimensions: [
      { name: 'Python & Algos', benchmark: 88 },
      { name: 'Deep Learning', benchmark: 75 },
      { name: 'MLOps & Docker', benchmark: 60 },
      { name: 'Cloud & K8s', benchmark: 60 },
      { name: 'Vector DBs & RAG', benchmark: 70 },
      { name: 'Data Eng & SQL', benchmark: 92 },
      { name: 'System Design', benchmark: 65 },
      { name: 'Math & Stats', benchmark: 95 },
    ],
    recommendedProject: {
      title: 'Customer Churn & Uplift Modeling Pipeline',
      desc: 'Build end-to-end predictive modeling with causal inference, Shapley explainability, and executive dashboards.',
      xp: 350,
      readinessBoost: '+3.5% Readiness',
    },
    recommendedCourse: {
      title: 'Causal Inference & Advanced Econometrics for Tech',
      provider: 'HarvardX',
      duration: '4 Weeks',
      rating: '4.8 ★',
      why: 'Distinguishes elite data scientists from surface-level script runners in top companies.',
    },
    growthPath: [
      { role: 'Data Analyst / Junior Scientist', salaryLPA: '₹6 - ₹11 LPA', timeline: '0 - 2 yrs' },
      { role: 'Senior Data Scientist', salaryLPA: '₹15 - ₹28 LPA', timeline: '2 - 5 yrs' },
      { role: 'Chief Data Officer', salaryLPA: '₹30 - ₹55+ LPA', timeline: '5+ yrs' },
    ],
  },

  'cybersecurity': {
    id: 'cybersecurity',
    title: 'Cybersecurity & Application Defense Engineer',
    category: 'Cyber & Security',
    icon: '🛡️',
    tagline: 'Secure critical systems, conduct penetration tests, and mitigate threats',
    description: 'Protects enterprise digital assets against cyberattacks, hardens networks, reviews code for vulnerabilities, and responds to zero-day incidents.',
    demandLevel: 'Critical',
    growthRate: '+35% YoY (Critical Shortage)',
    salary: { entryLPA: 8.5, midLPA: 17.5, highLPA: 39.0, avgLPA: 15.5 },
    requiredSkills: ['Network Security', 'Penetration Testing', 'OWASP Top 10', 'Wireshark', 'Cryptography', 'SIEM & SOC', 'Python/Bash', 'Linux'],
    topTools: ['Burp Suite', 'Wireshark', 'Metasploit', 'Splunk', 'Kali Linux', 'Ghidra'],
    radarDimensions: [
      { name: 'Python & Algos', benchmark: 75 },
      { name: 'Deep Learning', benchmark: 20 },
      { name: 'MLOps & Docker', benchmark: 70 },
      { name: 'Cloud & K8s', benchmark: 85 },
      { name: 'Vector DBs & RAG', benchmark: 25 },
      { name: 'Data Eng & SQL', benchmark: 65 },
      { name: 'System Design', benchmark: 85 },
      { name: 'Math & Stats', benchmark: 60 },
    ],
    recommendedProject: {
      title: 'Automated Threat Detection & API Vulnerability Scanner',
      desc: 'Develop a custom scanning engine that identifies API injection vulnerabilities and misconfigured cloud buckets.',
      xp: 420,
      readinessBoost: '+4.0% Readiness',
    },
    recommendedCourse: {
      title: 'Practical Ethical Hacking & Defensive Systems',
      provider: 'TCM Security',
      duration: '5 Weeks',
      rating: '4.9 ★',
      why: 'Hands-on lab experience with real vulnerable network machines.',
    },
    growthPath: [
      { role: 'Security Analyst', salaryLPA: '₹6.5 - ₹12 LPA', timeline: '0 - 2 yrs' },
      { role: 'Senior SecOps Engineer', salaryLPA: '₹16 - ₹30 LPA', timeline: '2 - 5 yrs' },
      { role: 'CISO / Head of Security', salaryLPA: '₹35 - ₹65+ LPA', timeline: '5+ yrs' },
    ],
  },

  'ai-product-manager': {
    id: 'ai-product-manager',
    title: 'AI & Technical Product Manager',
    category: 'Product & Management',
    icon: '🎯',
    tagline: 'Define product vision, align cross-functional engineering, and deliver AI value',
    description: 'Bridges customer problem statements with machine learning capabilities. Defines product roadmaps, metrics, and user experience for AI-native software.',
    demandLevel: 'High',
    growthRate: '+34% YoY',
    salary: { entryLPA: 10.0, midLPA: 20.0, highLPA: 45.0, avgLPA: 18.0 },
    requiredSkills: ['Product Strategy', 'AI Product Roadmapping', 'User Research & Prototyping', 'SQL & Product Analytics', 'Agile Leadership', 'System Architecture'],
    topTools: ['Figma', 'Mixpanel', 'Linear', 'Jira', 'Notion', 'OpenAI API'],
    radarDimensions: [
      { name: 'Python & Algos', benchmark: 60 },
      { name: 'Deep Learning', benchmark: 65 },
      { name: 'MLOps & Docker', benchmark: 50 },
      { name: 'Cloud & K8s', benchmark: 50 },
      { name: 'Vector DBs & RAG', benchmark: 70 },
      { name: 'Data Eng & SQL', benchmark: 80 },
      { name: 'System Design', benchmark: 75 },
      { name: 'Math & Stats', benchmark: 75 },
    ],
    recommendedProject: {
      title: 'Comprehensive PRD & AI Feasibility Spec for Copilot',
      desc: 'Author an industry-grade Product Requirement Document including user personas, latency constraints, unit economics, and wireframes.',
      xp: 320,
      readinessBoost: '+3.5% Readiness',
    },
    recommendedCourse: {
      title: 'AI Product Strategy & Market Launch',
      provider: 'Reforge & Stanford d.school',
      duration: '4 Weeks',
      rating: '4.9 ★',
      why: 'Teaches product leaders how to evaluate model tradeoffs, latency, hallucination guardrails, and customer ROI.',
    },
    growthPath: [
      { role: 'Associate Product Manager', salaryLPA: '₹8 - ₹15 LPA', timeline: '0 - 2 yrs' },
      { role: 'Senior AI Product Manager', salaryLPA: '₹18 - ₹35 LPA', timeline: '2 - 5 yrs' },
      { role: 'Head of Product / VP Product', salaryLPA: '₹35 - ₹70+ LPA', timeline: '5+ yrs' },
    ],
  },
};
