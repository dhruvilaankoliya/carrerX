/* ==========================================================================
   CareerX - Curated Study Resources Database & Usage Store
   ========================================================================== */

const INITIAL_RESOURCES_DATABASE = [
  // ─── Docker ─────────────────────────────────────────────────────────────
  {
    id: 'res_docker_1',
    skill_name: 'Docker',
    resource_title: 'Official Docker Containerization Guide for Developers',
    resource_url: 'https://docs.docker.com/get-started/',
    resource_type: 'doc',
    provider: 'Docker Docs',
    duration: '45 mins',
    usage_count: 342,
    is_studied: false
  },
  {
    id: 'res_docker_2',
    skill_name: 'Docker for Machine Learning & Python Crash Course',
    resource_url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
    resource_type: 'video',
    provider: 'freeCodeCamp',
    duration: '2.5 hrs',
    usage_count: 518,
    is_studied: false
  },
  {
    id: 'res_docker_3',
    skill_name: 'Production Multi-stage Docker Builds for PyTorch & CUDA',
    resource_url: 'https://realpython.com/docker-continuous-integration/',
    resource_type: 'article',
    provider: 'Real Python',
    duration: '1 hr',
    usage_count: 189,
    is_studied: false
  },

  // ─── Kubernetes ─────────────────────────────────────────────────────────
  {
    id: 'res_k8s_1',
    skill_name: 'Kubernetes Core Concepts & Pod Architecture',
    resource_url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    resource_type: 'doc',
    provider: 'Kubernetes Official',
    duration: '1.5 hrs',
    usage_count: 412,
    is_studied: false
  },
  {
    id: 'res_k8s_2',
    skill_name: 'Deploying Scalable ML Inference on K8s Cluster',
    resource_url: 'https://towardsdatascience.com/deploying-machine-learning-models-with-kubernetes-b28669c54e0b',
    resource_type: 'article',
    provider: 'Towards Data Science',
    duration: '1 hr',
    usage_count: 275,
    is_studied: false
  },
  {
    id: 'res_k8s_3',
    skill_name: 'Kubernetes for Beginners (Hands-on Labs)',
    resource_url: 'https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners-hands-on/',
    resource_type: 'course',
    provider: 'KodeKloud',
    duration: '4 hrs',
    usage_count: 630,
    is_studied: false
  },

  // ─── FastAPI ────────────────────────────────────────────────────────────
  {
    id: 'res_fastapi_1',
    skill_name: 'FastAPI Official Interactive Tutorial & Async Endpoints',
    resource_url: 'https://fastapi.tiangolo.com/tutorial/',
    resource_type: 'doc',
    provider: 'FastAPI Docs',
    duration: '1 hr',
    usage_count: 684,
    is_studied: false
  },
  {
    id: 'res_fastapi_2',
    skill_name: 'Serving PyTorch & HuggingFace Models with FastAPI',
    resource_url: 'https://www.youtube.com/watch?v=h5wZ283l58s',
    resource_type: 'video',
    provider: 'freeCodeCamp',
    duration: '2 hrs',
    usage_count: 495,
    is_studied: false
  },
  {
    id: 'res_fastapi_3',
    skill_name: 'Building High-Performance Async REST APIs in Python',
    resource_url: 'https://testdriven.io/blog/fastapi-crud/',
    resource_type: 'article',
    provider: 'TestDriven.io',
    duration: '1.5 hrs',
    usage_count: 231,
    is_studied: false
  },

  // ─── MLOps ──────────────────────────────────────────────────────────────
  {
    id: 'res_mlops_1',
    skill_name: 'Made With ML: Production MLOps from Scratch',
    resource_url: 'https://madewithml.com/',
    resource_type: 'course',
    provider: 'MadeWithML (Goku Mohandas)',
    duration: '6 hrs',
    usage_count: 890,
    is_studied: false
  },
  {
    id: 'res_mlops_2',
    skill_name: 'MLflow Tracking, Registry & Model Packaging Tutorial',
    resource_url: 'https://mlflow.org/docs/latest/tutorials-and-examples/index.html',
    resource_type: 'doc',
    provider: 'MLflow Official',
    duration: '1.5 hrs',
    usage_count: 360,
    is_studied: false
  },
  {
    id: 'res_mlops_3',
    skill_name: 'Designing Enterprise Machine Learning Systems',
    resource_url: 'https://chiphuyen.com/book-ml-systems-design/',
    resource_type: 'article',
    provider: 'Chip Huyen (Stanford)',
    duration: '2 hrs',
    usage_count: 742,
    is_studied: false
  },

  // ─── Vector DB (Pinecone / Chroma / Milvus) ─────────────────────────────
  {
    id: 'res_vdb_1',
    skill_name: 'Vector DB (Pinecone)',
    resource_title: 'Pinecone Vector Search & Dense Embeddings Masterclass',
    resource_url: 'https://docs.pinecone.io/guides/get-started/overview',
    resource_type: 'doc',
    provider: 'Pinecone Docs',
    duration: '1 hr',
    usage_count: 560,
    is_studied: false
  },
  {
    id: 'res_vdb_2',
    skill_name: 'Vector DB (Pinecone)',
    resource_title: 'Building Production RAG with LangChain and Vector Databases',
    resource_url: 'https://www.deeplearning.ai/short-courses/building-evaluating-advanced-rag/',
    resource_type: 'course',
    provider: 'DeepLearning.AI',
    duration: '2 hrs',
    usage_count: 815,
    is_studied: false
  },
  {
    id: 'res_vdb_3',
    skill_name: 'Vector DB (Pinecone)',
    resource_title: 'Vector Indexing (HNSW vs IVF) for High-Scale Retrieval',
    resource_url: 'https://www.pinecone.io/learn/series/faiss/vector-indexes/',
    resource_type: 'article',
    provider: 'Pinecone Learning',
    duration: '45 mins',
    usage_count: 310,
    is_studied: false
  },

  // ─── CI/CD ──────────────────────────────────────────────────────────────
  {
    id: 'res_cicd_1',
    skill_name: 'CI/CD',
    resource_title: 'GitHub Actions for Automated Testing & Linting Workflows',
    resource_url: 'https://docs.github.com/en/actions/quickstart',
    resource_type: 'doc',
    provider: 'GitHub Docs',
    duration: '45 mins',
    usage_count: 620,
    is_studied: false
  },
  {
    id: 'res_cicd_2',
    skill_name: 'CI/CD',
    resource_title: 'Continuous Integration & Continuous Delivery for ML (CML)',
    resource_url: 'https://cml.dev/doc',
    resource_type: 'article',
    provider: 'Iterative.ai',
    duration: '1.5 hrs',
    usage_count: 245,
    is_studied: false
  },
  {
    id: 'res_cicd_3',
    skill_name: 'CI/CD',
    resource_title: 'Automated Docker Image Building & Deployment Pipeline',
    resource_url: 'https://www.youtube.com/watch?v=R8_veQiYBjI',
    resource_type: 'video',
    provider: 'TechWorld with Nana',
    duration: '1.2 hrs',
    usage_count: 480,
    is_studied: false
  },

  // ─── Model Monitoring ───────────────────────────────────────────────────
  {
    id: 'res_monitor_1',
    skill_name: 'Model Monitoring',
    resource_title: 'Evidently AI: Monitoring Data Drift & Prediction Quality',
    resource_url: 'https://docs.evidentlyai.com/',
    resource_type: 'doc',
    provider: 'Evidently AI',
    duration: '1 hr',
    usage_count: 315,
    is_studied: false
  },
  {
    id: 'res_monitor_2',
    skill_name: 'Model Monitoring',
    resource_title: 'Prometheus & Grafana Metrics for Machine Learning APIs',
    resource_url: 'https://towardsdatascience.com/monitoring-machine-learning-models-in-production-with-prometheus-and-grafana-2f643e2617f2',
    resource_type: 'article',
    provider: 'Towards Data Science',
    duration: '1.5 hrs',
    usage_count: 198,
    is_studied: false
  },
  {
    id: 'res_monitor_3',
    skill_name: 'Model Monitoring',
    resource_title: 'Detecting Concept Drift in Real-Time Production Streams',
    resource_url: 'https://www.coursera.org/learn/machine-learning-modeling-pipelines-in-production',
    resource_type: 'course',
    provider: 'DeepLearning.AI / Coursera',
    duration: '3 hrs',
    usage_count: 420,
    is_studied: false
  }
];

// Skill Metadata Map: Role context and estimated learning time
const SKILL_METADATA_MAP = {
  'Docker': {
    timeEst: '~3-4 hrs',
    roleContext: 'Essential for containerizing ML inference pipelines and preventing environment mismatch between local dev and cloud clusters.'
  },
  'Kubernetes': {
    timeEst: '~5-6 hrs',
    roleContext: 'Core orchestrator for autoscaling model replicas, managing GPU node pools, and zero-downtime rolling model updates.'
  },
  'FastAPI': {
    timeEst: '~2-3 hrs',
    roleContext: 'Industry standard for building high-throughput, async REST microservices that serve model predictions with sub-10ms latency.'
  },
  'MLOps': {
    timeEst: '~6-8 hrs',
    roleContext: 'Bridges prototype notebooks and production; covers reproducible experiments, model registries, and automated retraining pipelines.'
  },
  'Vector DB (Pinecone)': {
    timeEst: '~2-3 hrs',
    roleContext: 'Fundamental for modern Generative AI, powering semantic document retrieval, vector similarity search, and RAG knowledge grounding.'
  },
  'CI/CD': {
    timeEst: '~2-3 hrs',
    roleContext: 'Automates unit tests, model verification benchmarks, and container image builds upon every repository push.'
  },
  'Model Monitoring': {
    timeEst: '~3-4 hrs',
    roleContext: 'Detects data distribution shift, embedding concept drift, and latency degradation on live production traffic.'
  }
};

class StudyResourcesStore {
  constructor() {
    this.storageKey = 'careerx_study_resources_db';
    this.resources = this.loadResources();
    this.listeners = [];
  }

  loadResources() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return JSON.parse(JSON.stringify(INITIAL_RESOURCES_DATABASE));
  }

  saveResources() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.resources));
    } catch {
      // ignore
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.resources));
  }

  // Normalize skill name matching (e.g. 'Vector DB (Pinecone)' matches 'Vector DB')
  normalizeSkillName(keyword) {
    const raw = (keyword || '').trim().toLowerCase();
    for (const key of Object.keys(SKILL_METADATA_MAP)) {
      if (key.toLowerCase() === raw || raw.includes(key.toLowerCase()) || key.toLowerCase().includes(raw)) {
        return key;
      }
    }
    return keyword.trim();
  }

  getSkillMetadata(keyword, roleName = 'Machine Learning Engineer') {
    const normalized = this.normalizeSkillName(keyword);
    if (SKILL_METADATA_MAP[normalized]) {
      return SKILL_METADATA_MAP[normalized];
    }
    return {
      timeEst: '~3-4 hrs',
      roleContext: `Critical prerequisite skill to meet industry benchmarks for high-impact ${roleName} roles.`
    };
  }

  getResourcesForSkill(keyword) {
    const normalized = this.normalizeSkillName(keyword);
    const matched = this.resources.filter(r => 
      r.skill_name.toLowerCase() === normalized.toLowerCase() ||
      r.skill_name.toLowerCase().includes(normalized.toLowerCase()) ||
      normalized.toLowerCase().includes(r.skill_name.toLowerCase())
    );

    if (matched.length > 0) {
      // Sort by usage count descending (most popular first)
      return matched.sort((a, b) => b.usage_count - a.usage_count);
    }

    // Fallback dynamic curated resources if not already pre-populated
    return [
      {
        id: `res_dyn_${keyword.replace(/\s+/g, '_')}_1`,
        skill_name: keyword,
        resource_title: `Official ${keyword} Documentation & Quickstart`,
        resource_url: `https://www.google.com/search?q=${encodeURIComponent(keyword + ' official documentation tutorial')}`,
        resource_type: 'doc',
        provider: 'Official Docs',
        duration: '1.5 hrs',
        usage_count: 142,
        is_studied: false
      },
      {
        id: `res_dyn_${keyword.replace(/\s+/g, '_')}_2`,
        skill_name: keyword,
        resource_title: `${keyword} Comprehensive Video Masterclass`,
        resource_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword + ' crash course tutorial')}`,
        resource_type: 'video',
        provider: 'freeCodeCamp',
        duration: '2 hrs',
        usage_count: 268,
        is_studied: false
      },
      {
        id: `res_dyn_${keyword.replace(/\s+/g, '_')}_3`,
        skill_name: keyword,
        resource_title: `Production Best Practices for ${keyword}`,
        resource_url: `https://towardsdatascience.com/search?q=${encodeURIComponent(keyword)}`,
        resource_type: 'article',
        provider: 'Towards Data Science',
        duration: '45 mins',
        usage_count: 95,
        is_studied: false
      }
    ].sort((a, b) => b.usage_count - a.usage_count);
  }

  recordResourceUsage(resourceId) {
    const item = this.resources.find(r => r.id === resourceId);
    if (item) {
      item.usage_count += 1;
      this.saveResources();
      return item.usage_count;
    }
    return 1;
  }

  toggleMarkAsStudied(resourceId) {
    const item = this.resources.find(r => r.id === resourceId);
    if (item) {
      item.is_studied = !item.is_studied;
      if (item.is_studied) {
        item.usage_count += 1;
      }
      this.saveResources();
      return item.is_studied;
    }
    return false;
  }
}

export const studyResourcesStore = new StudyResourcesStore();
