/* ==========================================================================
   CareerX - Signature Career Constellation Graph Data & Nodes
   ========================================================================== */

export const CONSTELLATION_DATA = {
  nodes: [
    // Target Career Nodes (Star Clusters)
    { id: 'c_ml', name: 'Machine Learning Engineer', type: 'career', match: 92, x: 0.5, y: 0.5, radius: 24, glow: '#f59e0b', desc: 'Central Destination: Production AI & Deep Learning Systems' },
    { id: 'c_fs', name: 'Full Stack Architect', type: 'career', match: 84, x: 0.82, y: 0.28, radius: 18, glow: '#ec4899', desc: 'Alternative Path: High-Scale Distributed Web Applications' },
    { id: 'c_ds', name: 'Data Scientist', type: 'career', match: 89, x: 0.2, y: 0.72, radius: 18, glow: '#3b82f6', desc: 'Alternative Path: Statistical Inference & Big Data' },
    { id: 'c_do', name: 'Cloud DevOps Specialist', type: 'career', match: 78, x: 0.8, y: 0.75, radius: 16, glow: '#8b5cf6', desc: 'Alternative Path: Infrastructure as Code & Orchestration' },

    // Core Skill Nodes
    { id: 's_py', name: 'Python Mastery', type: 'skill', match: 95, x: 0.38, y: 0.42, radius: 12, glow: '#3b82f6', desc: 'Advanced OOP, AsyncIO, Vectorization' },
    { id: 's_pt', name: 'PyTorch & Neural Nets', type: 'skill', match: 88, x: 0.45, y: 0.35, radius: 13, glow: '#3b82f6', desc: 'Backprop, CNNs, Transformers, TorchScript' },
    { id: 's_dk', name: 'Docker & Containers', type: 'skill', match: 52, x: 0.62, y: 0.62, radius: 11, glow: '#f43f5e', desc: 'Target Gap: Microservice Containerization' },
    { id: 's_k8', name: 'Kubernetes Cluster', type: 'skill', match: 48, x: 0.68, y: 0.68, radius: 11, glow: '#f43f5e', desc: 'Target Gap: Scalable Pod Orchestration' },
    { id: 's_la', name: 'Linear Algebra / Math', type: 'skill', match: 90, x: 0.32, y: 0.32, radius: 11, glow: '#3b82f6', desc: 'Matrix Decompositions, Eigenvalues' },
    { id: 's_sql', name: 'PostgreSQL & Big Data', type: 'skill', match: 82, x: 0.28, y: 0.58, radius: 11, glow: '#3b82f6', desc: 'Complex Joins, Window Queries, Indexing' },
    { id: 's_rag', name: 'Vector DBs / RAG', type: 'skill', match: 70, x: 0.55, y: 0.38, radius: 12, glow: '#06b6d4', desc: 'Pinecone, Embeddings, Hybrid Search' },
    { id: 's_fa', name: 'FastAPI Microservices', type: 'skill', match: 75, x: 0.58, y: 0.52, radius: 11, glow: '#3b82f6', desc: 'Pydantic, ASGI, High-throughput Endpoints' },

    // Student Interest Nodes
    { id: 'i_genai', name: 'Generative AI & LLMs', type: 'interest', x: 0.48, y: 0.22, radius: 10, glow: '#8b5cf6', desc: 'Passion: Fine-tuning & Autonomous Agents' },
    { id: 'i_perf', name: 'High-Performance Computing', type: 'interest', x: 0.65, y: 0.32, radius: 10, glow: '#8b5cf6', desc: 'Passion: CUDA Kernels, Low-latency Caching' },
    { id: 'i_auto', name: 'Autonomous Automation', type: 'interest', x: 0.72, y: 0.52, radius: 10, glow: '#8b5cf6', desc: 'Passion: Self-healing Systems & CI/CD' },

    // Curated Course Nodes
    { id: 'cr_mit', name: 'MIT Linear Algebra', type: 'course', x: 0.24, y: 0.24, radius: 9, glow: '#06b6d4', desc: 'Completed: Gilbert Strang 18.06' },
    { id: 'cr_cs231', name: 'Stanford CS231n', type: 'course', x: 0.34, y: 0.20, radius: 9, glow: '#06b6d4', desc: 'Completed: Deep Learning for Vision' },
    { id: 'cr_mlops', name: 'Production MLOps', type: 'course', x: 0.66, y: 0.78, radius: 10, glow: '#06b6d4', desc: 'Recommended: Bridge High-Impact Gap' },

    // High-Yield Project Nodes
    { id: 'p_rag', name: 'Multimodal RAG Agent', type: 'project', x: 0.52, y: 0.65, radius: 13, glow: '#10b981', desc: 'Capstone: Llama-3 + Pinecone + Docker' },
    { id: 'p_med', name: 'ResNet Medical Classifier', type: 'project', x: 0.35, y: 0.50, radius: 10, glow: '#10b981', desc: 'Completed: 94.2% Validation Accuracy' },
    { id: 'p_inf', name: 'Distributed Torch Cluster', type: 'project', x: 0.74, y: 0.44, radius: 10, glow: '#10b981', desc: 'Future: Ray + Triton Deployment' }
  ],
  links: [
    // Connect Skills to Target Career
    { source: 's_py', target: 'c_ml', weight: 3 },
    { source: 's_pt', target: 'c_ml', weight: 3 },
    { source: 's_dk', target: 'c_ml', weight: 2 },
    { source: 's_rag', target: 'c_ml', weight: 2 },
    { source: 's_fa', target: 'c_ml', weight: 2 },
    { source: 's_la', target: 's_pt', weight: 2 },
    { source: 's_sql', target: 'c_ml', weight: 1.5 },

    // Connect Interests
    { source: 'i_genai', target: 's_pt', weight: 2 },
    { source: 'i_genai', target: 's_rag', weight: 2.5 },
    { source: 'i_perf', target: 's_fa', weight: 1.5 },
    { source: 'i_perf', target: 'c_fs', weight: 2 },
    { source: 'i_auto', target: 's_dk', weight: 2 },
    { source: 'i_auto', target: 'c_do', weight: 2 },

    // Connect Courses to Skills
    { source: 'cr_mit', target: 's_la', weight: 2 },
    { source: 'cr_cs231', target: 's_pt', weight: 2 },
    { source: 'cr_mlops', target: 's_dk', weight: 2.5 },
    { source: 'cr_mlops', target: 's_k8', weight: 2.5 },

    // Connect Projects
    { source: 'p_rag', target: 'c_ml', weight: 3.5 },
    { source: 'p_rag', target: 's_rag', weight: 2 },
    { source: 'p_rag', target: 's_fa', weight: 2 },
    { source: 'p_med', target: 's_pt', weight: 2 },
    { source: 'p_inf', target: 's_k8', weight: 2 },
    { source: 'p_inf', target: 'c_ml', weight: 2.5 },

    // Alternative Career interlinks
    { source: 's_sql', target: 'c_ds', weight: 2.5 },
    { source: 's_dk', target: 'c_do', weight: 2.5 },
    { source: 's_k8', target: 'c_do', weight: 3 },
    { source: 's_fa', target: 'c_fs', weight: 2 }
  ]
};
