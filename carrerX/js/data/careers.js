/* ==========================================================================
   CareerX - Comprehensive Industry Careers Database
   ========================================================================== */

export const CAREERS_DATA = {
  'ml-engineer': {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    category: 'AI & Data',
    icon: '🤖',
    tagline: 'Design and deploy production-scale neural networks & LLM pipelines',
    matchScore: 92,
    salaryRange: '$125,000 - $195,000',
    growthRate: '+38% (High Demand)',
    demandLevel: 'Very High',
    description: 'Bridges the gap between machine learning research and scalable production software. Builds training pipelines, optimizes model inference, and deploys intelligent systems.',
    radarDimensions: [
      { name: 'Python & Algos', current: 90, target: 95 },
      { name: 'Deep Learning / PyTorch', current: 82, target: 90 },
      { name: 'MLOps & Docker', current: 48, target: 85 },
      { name: 'Cloud & Kubernetes', current: 52, target: 80 },
      { name: 'Vector DBs & RAG', current: 65, target: 85 },
      { name: 'Data Engineering / SQL', current: 78, target: 80 },
      { name: 'System Design', current: 60, target: 85 },
      { name: 'Math & Stats', current: 85, target: 90 }
    ],
    requiredSkills: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'Kubernetes', 'MLflow', 'RAG / Vector DBs', 'Transformers'],
    topTools: ['PyTorch', 'HuggingFace', 'Docker', 'Ray', 'Pinecone', 'Weights & Biases', 'AWS SageMaker'],
    recommendedProject: {
      title: 'Multimodal RAG Agent with Docker & Kubernetes',
      desc: 'Build an autonomous research assistant with document vectorization, reranking, and live low-latency FastAPI deployment.',
      xp: '+450 XP',
      readinessBoost: '+4.5% Readiness'
    },
    recommendedCourse: {
      title: 'Production Machine Learning with Docker & Kubernetes',
      provider: 'DeepLearning.AI & Stanford Online',
      duration: '4 Weeks (12 hrs total)',
      rating: '4.9 ★',
      why: 'Directly addresses your biggest gap: MLOps containerization and deployment pipelines.'
    },
    growthPath: [
      { role: 'Junior ML Engineer', salary: '$105k - $125k', timeline: '0 - 2 yrs' },
      { role: 'Senior ML / AI Engineer', salary: '$150k - $210k', timeline: '2 - 5 yrs' },
      { role: 'Principal AI Architect / Staff Scientist', salary: '$220k - $340k+', timeline: '5+ yrs' }
    ]
  },

  'fullstack-architect': {
    id: 'fullstack-architect',
    title: 'Full Stack Systems Architect',
    category: 'Software & Web',
    icon: '⚡',
    tagline: 'Architect resilient web applications, distributed APIs & microservices',
    matchScore: 84,
    salaryRange: '$120,000 - $185,000',
    growthRate: '+26% (High Demand)',
    demandLevel: 'High',
    description: 'Spearheads end-to-end software architecture from fluid frontend design systems down to distributed databases, edge caching, and scalable microservices.',
    radarDimensions: [
      { name: 'Python & Algos', current: 90, target: 85 },
      { name: 'Deep Learning / PyTorch', current: 82, target: 30 },
      { name: 'MLOps & Docker', current: 48, target: 75 },
      { name: 'Cloud & Kubernetes', current: 52, target: 85 },
      { name: 'Vector DBs & RAG', current: 65, target: 40 },
      { name: 'Data Engineering / SQL', current: 78, target: 90 },
      { name: 'System Design', current: 60, target: 92 },
      { name: 'Math & Stats', current: 85, target: 60 }
    ],
    requiredSkills: ['TypeScript', 'React / Next.js', 'Node / Go', 'PostgreSQL', 'Redis', 'Docker', 'GraphQL', 'System Design'],
    topTools: ['Next.js', 'Tailwind', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
    recommendedProject: {
      title: 'High-Concurrency Real-time Collaborative Engine',
      desc: 'Build a distributed whiteboard & document canvas with WebSockets, CRDTs, and Redis Streams.',
      xp: '+400 XP',
      readinessBoost: '+4.0% Readiness'
    },
    recommendedCourse: {
      title: 'Advanced Distributed Systems & Microservices',
      provider: 'MIT Distributed Lab & Educative',
      duration: '5 Weeks',
      rating: '4.8 ★',
      why: 'Builds enterprise-grade system design intuition required for senior frontend/backend architect positions.'
    },
    growthPath: [
      { role: 'Full Stack Engineer', salary: '$95k - $120k', timeline: '0 - 2 yrs' },
      { role: 'Senior Full Stack Lead', salary: '$140k - $190k', timeline: '2 - 5 yrs' },
      { role: 'VP of Engineering / Principal Architect', salary: '$210k - $320k', timeline: '5+ yrs' }
    ]
  },

  'cloud-devops': {
    id: 'cloud-devops',
    title: 'Cloud DevOps & Platform Engineer',
    category: 'Cloud & DevOps',
    icon: '☁️',
    tagline: 'Automate infrastructure, CI/CD pipelines, and cloud reliability',
    matchScore: 78,
    salaryRange: '$118,000 - $180,000',
    growthRate: '+32% (Very High)',
    demandLevel: 'Very High',
    description: 'Designs zero-downtime infrastructure as code, manages multi-region cloud clusters, and secures automated deployment pipelines.',
    radarDimensions: [
      { name: 'Python & Algos', current: 90, target: 75 },
      { name: 'Deep Learning / PyTorch', current: 82, target: 20 },
      { name: 'MLOps & Docker', current: 48, target: 95 },
      { name: 'Cloud & Kubernetes', current: 52, target: 95 },
      { name: 'Vector DBs & RAG', current: 65, target: 30 },
      { name: 'Data Engineering / SQL', current: 78, target: 70 },
      { name: 'System Design', current: 60, target: 88 },
      { name: 'Math & Stats', current: 85, target: 50 }
    ],
    requiredSkills: ['Terraform', 'Kubernetes', 'AWS/GCP', 'CI/CD (GitHub Actions)', 'Linux Shell', 'Prometheus/Grafana', 'Security'],
    topTools: ['Kubernetes', 'Terraform', 'Docker', 'ArgoCD', 'Prometheus', 'AWS'],
    recommendedProject: {
      title: 'Multi-Cluster GitOps Infrastructure with Terraform',
      desc: 'Provision scalable Kubernetes clusters with automated canary deployments and observability dashboards.',
      xp: '+380 XP',
      readinessBoost: '+5.0% Readiness'
    },
    recommendedCourse: {
      title: 'Certified Kubernetes Administrator (CKA) Blueprint',
      provider: 'Linux Foundation',
      duration: '6 Weeks',
      rating: '4.9 ★',
      why: 'Cloud & DevOps roles prioritize verified credentials and hands-on Kubernetes orchestration.'
    },
    growthPath: [
      { role: 'DevOps / SRE Associate', salary: '$95k - $120k', timeline: '0 - 2 yrs' },
      { role: 'Staff Platform Engineer', salary: '$145k - $195k', timeline: '2 - 5 yrs' },
      { role: 'Cloud Director / Head of Infrastructure', salary: '$215k - $310k', timeline: '5+ yrs' }
    ]
  },

  'data-scientist': {
    id: 'data-scientist',
    title: 'Data Scientist & AI Analyst',
    category: 'AI & Data',
    icon: '📊',
    tagline: 'Transform messy big data into strategic predictive insights & models',
    matchScore: 89,
    salaryRange: '$115,000 - $175,000',
    growthRate: '+30% (High Demand)',
    demandLevel: 'High',
    description: 'Applies rigorous statistical modeling, feature engineering, and predictive algorithms to discover actionable intelligence for business and research.',
    radarDimensions: [
      { name: 'Python & Algos', current: 90, target: 88 },
      { name: 'Deep Learning / PyTorch', current: 82, target: 75 },
      { name: 'MLOps & Docker', current: 48, target: 60 },
      { name: 'Cloud & Kubernetes', current: 52, target: 60 },
      { name: 'Vector DBs & RAG', current: 65, target: 70 },
      { name: 'Data Engineering / SQL', current: 78, target: 92 },
      { name: 'System Design', current: 60, target: 65 },
      { name: 'Math & Stats', current: 85, target: 95 }
    ],
    requiredSkills: ['Python', 'SQL (Advanced)', 'Pandas/Polars', 'Scikit-Learn', 'A/B Testing', 'Tableau/PowerBI', 'Bayesian Statistics'],
    topTools: ['Jupyter', 'Pandas', 'SQL', 'Scikit-Learn', 'Tableau', 'Snowflake'],
    recommendedProject: {
      title: 'Customer Churn & Uplift Modeling Pipeline',
      desc: 'Build end-to-end predictive modeling with causal inference, Shapley explainability, and executive dashboards.',
      xp: '+350 XP',
      readinessBoost: '+3.5% Readiness'
    },
    recommendedCourse: {
      title: 'Causal Inference & Advanced Econometrics for Tech',
      provider: 'HarvardX',
      duration: '4 Weeks',
      rating: '4.8 ★',
      why: 'Distinguishes elite data scientists from surface-level script runners in top tier companies.'
    },
    growthPath: [
      { role: 'Data Analyst / Junior Scientist', salary: '$85k - $110k', timeline: '0 - 2 yrs' },
      { role: 'Lead Data Scientist', salary: '$135k - $185k', timeline: '2 - 5 yrs' },
      { role: 'Chief Data Officer', salary: '$200k - $300k+', timeline: '5+ yrs' }
    ]
  },

  'cybersecurity': {
    id: 'cybersecurity',
    title: 'Cybersecurity & Application Defense Engineer',
    category: 'Cyber & Security',
    icon: '🛡️',
    tagline: 'Secure critical systems, conduct penetration tests, and mitigate threats',
    matchScore: 72,
    salaryRange: '$120,000 - $190,000',
    growthRate: '+35% (Critical Demand)',
    demandLevel: 'Critical',
    description: 'Protects enterprise digital assets against sophisticated cyberattacks, hardens networks, reviews source code for vulnerabilities, and responds to incidents.',
    radarDimensions: [
      { name: 'Python & Algos', current: 90, target: 75 },
      { name: 'Deep Learning / PyTorch', current: 82, target: 20 },
      { name: 'MLOps & Docker', current: 48, target: 70 },
      { name: 'Cloud & Kubernetes', current: 52, target: 85 },
      { name: 'Vector DBs & RAG', current: 65, target: 25 },
      { name: 'Data Engineering / SQL', current: 78, target: 65 },
      { name: 'System Design', current: 60, target: 85 },
      { name: 'Math & Stats', current: 85, target: 60 }
    ],
    requiredSkills: ['Network Security', 'Penetration Testing', 'OWASP Top 10', 'Wireshark', 'Cryptography', 'SIEM & SOC', 'Python/Bash'],
    topTools: ['Burp Suite', 'Wireshark', 'Metasploit', 'Splunk', 'Kali Linux', 'Ghidra'],
    recommendedProject: {
      title: 'Automated Threat Detection & Vulnerability Scanner',
      desc: 'Develop a custom scanning engine that identifies API injection vulnerabilities and misconfigured cloud buckets.',
      xp: '+420 XP',
      readinessBoost: '+4.0% Readiness'
    },
    recommendedCourse: {
      title: 'Practical Ethical Hacking & Defensive Systems',
      provider: 'TCM Security',
      duration: '5 Weeks',
      rating: '4.9 ★',
      why: 'Hands-on lab experience with real vulnerable network machines.'
    },
    growthPath: [
      { role: 'Security Analyst', salary: '$90k - $115k', timeline: '0 - 2 yrs' },
      { role: 'Senior SecOps Engineer', salary: '$140k - $190k', timeline: '2 - 5 yrs' },
      { role: 'CISO / Head of Security', salary: '$220k - $350k', timeline: '5+ yrs' }
    ]
  },

  'ai-product-manager': {
    id: 'ai-product-manager',
    title: 'AI & Technical Product Manager',
    category: 'Product & Strategy',
    icon: '🎯',
    tagline: 'Define product vision, align cross-functional engineering, and deliver AI value',
    matchScore: 81,
    salaryRange: '$130,000 - $205,000',
    growthRate: '+34% (Emerging)',
    demandLevel: 'High',
    description: 'Bridges customer problem statements with deep machine learning capabilities. Defines product roadmaps, metrics, and user experience for AI-native software.',
    radarDimensions: [
      { name: 'Python & Algos', current: 90, target: 60 },
      { name: 'Deep Learning / PyTorch', current: 82, target: 65 },
      { name: 'MLOps & Docker', current: 48, target: 50 },
      { name: 'Cloud & Kubernetes', current: 52, target: 50 },
      { name: 'Vector DBs & RAG', current: 65, target: 70 },
      { name: 'Data Engineering / SQL', current: 78, target: 80 },
      { name: 'System Design', current: 60, target: 75 },
      { name: 'Math & Stats', current: 85, target: 75 }
    ],
    requiredSkills: ['Product Strategy', 'AI Product Roadmapping', 'User Research & Prototyping', 'SQL & Product Analytics', 'Agile Leadership'],
    topTools: ['Figma', 'Mixpanel', 'Linear', 'Jira', 'Notion', 'OpenAI API'],
    recommendedProject: {
      title: 'Comprehensive PRD & AI Feasibility Spec for Autonomous Customer Support',
      desc: 'Author an industry-grade Product Requirement Document including user personas, latency constraints, unit economics, and wireframes.',
      xp: '+320 XP',
      readinessBoost: '+3.5% Readiness'
    },
    recommendedCourse: {
      title: 'AI Product Strategy & Market Launch',
      provider: 'Reforge & Stanford d.school',
      duration: '4 Weeks',
      rating: '4.9 ★',
      why: 'Teaches product leaders how to evaluate model tradeoffs, latency, hallucination guardrails, and customer ROI.'
    },
    growthPath: [
      { role: 'Associate Product Manager', salary: '$100k - $130k', timeline: '0 - 2 yrs' },
      { role: 'Senior AI Product Manager', salary: '$160k - $220k', timeline: '2 - 5 yrs' },
      { role: 'Head of Product / VP Product', salary: '$230k - $360k', timeline: '5+ yrs' }
    ]
  }
};
