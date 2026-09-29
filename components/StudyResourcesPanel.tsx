'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Video,
  GraduationCap,
  FileText,
  Users,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface StudyResource {
  id: string;
  skill_name: string;
  resource_title: string;
  resource_url: string;
  resource_type: 'doc' | 'video' | 'course' | 'article';
  provider: string;
  duration: string;
  usage_count: number;
  is_studied?: boolean;
}

export interface SkillMeta {
  timeEst: string;
  roleContext: string;
}

const DEFAULT_SKILL_METADATA: Record<string, SkillMeta> = {
  'Docker': {
    timeEst: '~3-4 hrs',
    roleContext: 'Essential for containerizing ML inference microservices and guaranteeing reproducibility across dev, test, and GPU cloud environments.',
  },
  'Kubernetes': {
    timeEst: '~5-6 hrs',
    roleContext: 'Industry standard for orchestrating distributed ML workloads, autoscaling GPU node pools, and zero-downtime canary model rollouts.',
  },
  'FastAPI': {
    timeEst: '~2-3 hrs',
    roleContext: 'The premier async Python framework for serving high-throughput LLMs and computer vision models with sub-10ms latency.',
  },
  'MLOps': {
    timeEst: '~6-8 hrs',
    roleContext: 'Bridges prototype notebooks and production; covers experiment tracking, model registries, feature stores, and automated retraining.',
  },
  'Vector DB': {
    timeEst: '~2-3 hrs',
    roleContext: 'Core architecture for Generative AI & RAG, enabling semantic search, dense embedding retrieval, and scalable knowledge indexing.',
  },
  'Vector DB (Pinecone)': {
    timeEst: '~2-3 hrs',
    roleContext: 'Core architecture for Generative AI & RAG, enabling semantic search, dense embedding retrieval, and scalable knowledge indexing.',
  },
  'RAG / Vector DBs': {
    timeEst: '~2-3 hrs',
    roleContext: 'Fundamental for modern Generative AI, powering semantic document retrieval, vector similarity search, and RAG knowledge grounding.',
  },
  'CI/CD': {
    timeEst: '~2-3 hrs',
    roleContext: 'Automates unit tests, model verification benchmarks, regression checks, and container builds on every repository push.',
  },
  'Model Monitoring': {
    timeEst: '~3-4 hrs',
    roleContext: 'Detects live data distribution drift, concept drift, output degradation, and latency bottlenecks on real production traffic.',
  },
  'PyTorch': {
    timeEst: '~6-8 hrs',
    roleContext: 'The leading deep learning research & production framework for building, training, and fine-tuning neural networks.',
  },
  'Transformers': {
    timeEst: '~4-5 hrs',
    roleContext: 'The foundational neural architecture behind modern LLMs, vision transformers, and multimodal AI foundation models.',
  },
  'System Design': {
    timeEst: '~6-8 hrs',
    roleContext: 'Crucial for architecting high-availability, distributed ML pipelines with caching, message queues, and fault tolerance.',
  },
  'SQL': {
    timeEst: '~2-3 hrs',
    roleContext: 'Fundamental for querying data warehouses, building feature engineering pipelines, and aggregating analytics metrics.',
  },
};

const BASE_RESOURCES_DB: StudyResource[] = [
  // Docker
  {
    id: 'res_docker_1',
    skill_name: 'Docker',
    resource_title: 'Official Docker Containerization Guide for ML Developers',
    resource_url: 'https://docs.docker.com/get-started/',
    resource_type: 'doc',
    provider: 'Docker Docs',
    duration: '45 mins',
    usage_count: 412,
  },
  {
    id: 'res_docker_2',
    skill_name: 'Docker',
    resource_title: 'Docker for Machine Learning & Python Crash Course',
    resource_url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
    resource_type: 'video',
    provider: 'freeCodeCamp',
    duration: '2.5 hrs',
    usage_count: 589,
  },
  {
    id: 'res_docker_3',
    skill_name: 'Docker',
    resource_title: 'Production Multi-stage Docker Builds for PyTorch & CUDA',
    resource_url: 'https://realpython.com/docker-continuous-integration/',
    resource_type: 'article',
    provider: 'Real Python',
    duration: '1 hr',
    usage_count: 245,
  },

  // Kubernetes
  {
    id: 'res_k8s_1',
    skill_name: 'Kubernetes',
    resource_title: 'Kubernetes Core Concepts & Pod Architecture',
    resource_url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    resource_type: 'doc',
    provider: 'Kubernetes Official',
    duration: '1.5 hrs',
    usage_count: 478,
  },
  {
    id: 'res_k8s_2',
    skill_name: 'Kubernetes',
    resource_title: 'Deploying Scalable ML Inference on K8s Cluster',
    resource_url: 'https://towardsdatascience.com/deploying-machine-learning-models-with-kubernetes-b28669c54e0b',
    resource_type: 'article',
    provider: 'Towards Data Science',
    duration: '1 hr',
    usage_count: 310,
  },
  {
    id: 'res_k8s_3',
    skill_name: 'Kubernetes',
    resource_title: 'Kubernetes for Beginners (Hands-on Labs)',
    resource_url: 'https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners-hands-on/',
    resource_type: 'course',
    provider: 'KodeKloud',
    duration: '4 hrs',
    usage_count: 690,
  },

  // FastAPI
  {
    id: 'res_fastapi_1',
    skill_name: 'FastAPI',
    resource_title: 'FastAPI Official Interactive Tutorial & Async Endpoints',
    resource_url: 'https://fastapi.tiangolo.com/tutorial/',
    resource_type: 'doc',
    provider: 'FastAPI Docs',
    duration: '1 hr',
    usage_count: 745,
  },
  {
    id: 'res_fastapi_2',
    skill_name: 'FastAPI',
    resource_title: 'Serving PyTorch & HuggingFace Models with FastAPI',
    resource_url: 'https://www.youtube.com/watch?v=h5wZ283l58s',
    resource_type: 'video',
    provider: 'freeCodeCamp',
    duration: '2 hrs',
    usage_count: 532,
  },
  {
    id: 'res_fastapi_3',
    skill_name: 'FastAPI',
    resource_title: 'Building High-Performance Async REST APIs in Python',
    resource_url: 'https://testdriven.io/blog/fastapi-crud/',
    resource_type: 'article',
    provider: 'TestDriven.io',
    duration: '1.5 hrs',
    usage_count: 280,
  },

  // MLOps
  {
    id: 'res_mlops_1',
    skill_name: 'MLOps',
    resource_title: 'Made With ML: Production MLOps from Scratch',
    resource_url: 'https://madewithml.com/',
    resource_type: 'course',
    provider: 'MadeWithML (Goku Mohandas)',
    duration: '6 hrs',
    usage_count: 940,
  },
  {
    id: 'res_mlops_2',
    skill_name: 'MLOps',
    resource_title: 'MLflow Tracking, Registry & Model Packaging Tutorial',
    resource_url: 'https://mlflow.org/docs/latest/tutorials-and-examples/index.html',
    resource_type: 'doc',
    provider: 'MLflow Official',
    duration: '1.5 hrs',
    usage_count: 420,
  },
  {
    id: 'res_mlops_3',
    skill_name: 'MLOps',
    resource_title: 'Designing Enterprise Machine Learning Systems',
    resource_url: 'https://chiphuyen.com/book-ml-systems-design/',
    resource_type: 'article',
    provider: 'Chip Huyen (Stanford)',
    duration: '2 hrs',
    usage_count: 810,
  },

  // Vector DB / Pinecone
  {
    id: 'res_vdb_1',
    skill_name: 'Vector DB',
    resource_title: 'Pinecone Vector Search & Dense Embeddings Masterclass',
    resource_url: 'https://docs.pinecone.io/guides/get-started/overview',
    resource_type: 'doc',
    provider: 'Pinecone Docs',
    duration: '1 hr',
    usage_count: 620,
  },
  {
    id: 'res_vdb_2',
    skill_name: 'Vector DB',
    resource_title: 'Building Production RAG with LangChain & Vector Databases',
    resource_url: 'https://www.deeplearning.ai/short-courses/building-evaluating-advanced-rag/',
    resource_type: 'course',
    provider: 'DeepLearning.AI',
    duration: '2 hrs',
    usage_count: 885,
  },
  {
    id: 'res_vdb_3',
    skill_name: 'Vector DB',
    resource_title: 'Vector Indexing (HNSW vs IVF) for High-Scale Retrieval',
    resource_url: 'https://www.pinecone.io/learn/series/faiss/vector-indexes/',
    resource_type: 'article',
    provider: 'Pinecone Learning',
    duration: '45 mins',
    usage_count: 360,
  },

  // CI/CD
  {
    id: 'res_cicd_1',
    skill_name: 'CI/CD',
    resource_title: 'GitHub Actions for Automated Testing & Linting Workflows',
    resource_url: 'https://docs.github.com/en/actions/quickstart',
    resource_type: 'doc',
    provider: 'GitHub Docs',
    duration: '45 mins',
    usage_count: 670,
  },
  {
    id: 'res_cicd_2',
    skill_name: 'CI/CD',
    resource_title: 'Continuous Integration & Continuous Delivery for ML (CML)',
    resource_url: 'https://cml.dev/doc',
    resource_type: 'article',
    provider: 'Iterative.ai',
    duration: '1.5 hrs',
    usage_count: 295,
  },
  {
    id: 'res_cicd_3',
    skill_name: 'CI/CD',
    resource_title: 'Automated Docker Image Building & Deployment Pipeline',
    resource_url: 'https://www.youtube.com/watch?v=R8_veQiYBjI',
    resource_type: 'video',
    provider: 'TechWorld with Nana',
    duration: '1.2 hrs',
    usage_count: 510,
  },

  // Model Monitoring
  {
    id: 'res_monitor_1',
    skill_name: 'Model Monitoring',
    resource_title: 'Evidently AI: Monitoring Data Drift & Prediction Quality',
    resource_url: 'https://docs.evidentlyai.com/',
    resource_type: 'doc',
    provider: 'Evidently AI',
    duration: '1 hr',
    usage_count: 380,
  },
  {
    id: 'res_monitor_2',
    skill_name: 'Model Monitoring',
    resource_title: 'Prometheus & Grafana Metrics for Machine Learning APIs',
    resource_url: 'https://towardsdatascience.com/monitoring-machine-learning-models-in-production-with-prometheus-and-grafana-2f643e2617f2',
    resource_type: 'article',
    provider: 'Towards Data Science',
    duration: '1.5 hrs',
    usage_count: 220,
  },
  {
    id: 'res_monitor_3',
    skill_name: 'Model Monitoring',
    resource_title: 'Detecting Concept Drift in Real-Time Production Streams',
    resource_url: 'https://www.coursera.org/learn/machine-learning-modeling-pipelines-in-production',
    resource_type: 'course',
    provider: 'DeepLearning.AI / Coursera',
    duration: '3 hrs',
    usage_count: 460,
  },
];

interface Props {
  missingKeywords?: string[];
  targetRole?: string;
  isUploaded?: boolean;
}

export default function StudyResourcesPanel({
  missingKeywords = [],
  targetRole = 'Machine Learning Engineer',
  isUploaded = true,
}: Props) {
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [studiedMap, setStudiedMap] = useState<Record<string, boolean>>({});
  const [usageMap, setUsageMap] = useState<Record<string, number>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize and load saved state from localStorage / backend
  useEffect(() => {
    try {
      const savedStudied = localStorage.getItem('careerx_studied_resources');
      if (savedStudied) {
        setStudiedMap(JSON.parse(savedStudied));
      }
      const savedUsage = localStorage.getItem('careerx_resource_usage_counts');
      if (savedUsage) {
        setUsageMap(JSON.parse(savedUsage));
      }
    } catch {}

    // Fetch initial global usage counts from API if available
    fetch('/api/resources/usage')
      .then((res) => res.json())
      .then((data) => {
        if (data?.counts) {
          setUsageMap((prev) => ({ ...prev, ...data.counts }));
        }
      })
      .catch(() => {});
  }, []);

  // Helper to normalize skill names
  const normalizeSkill = (kw: string) => {
    const raw = (kw || '').trim().toLowerCase();
    if (raw.includes('docker')) return 'Docker';
    if (raw.includes('k8s') || raw.includes('kubernetes')) return 'Kubernetes';
    if (raw.includes('fastapi')) return 'FastAPI';
    if (raw.includes('mlops') || raw.includes('mlflow')) return 'MLOps';
    if (raw.includes('vector') || raw.includes('pinecone') || raw.includes('rag')) return 'Vector DB';
    if (raw.includes('ci/cd') || raw.includes('cicd') || raw.includes('actions')) return 'CI/CD';
    if (raw.includes('monitor') || raw.includes('drift')) return 'Model Monitoring';
    if (raw.includes('pytorch')) return 'PyTorch';
    if (raw.includes('transformer') || raw.includes('llm')) return 'Transformers';
    if (raw.includes('design') || raw.includes('architecture')) return 'System Design';
    if (raw.includes('sql')) return 'SQL';
    return kw.trim();
  };

  const getMetadata = (skill: string): SkillMeta => {
    const norm = normalizeSkill(skill);
    if (DEFAULT_SKILL_METADATA[norm]) {
      return DEFAULT_SKILL_METADATA[norm];
    }
    return {
      timeEst: '~3-4 hrs',
      roleContext: `Critical prerequisite skill to meet industry benchmarks for high-impact ${targetRole} roles.`,
    };
  };

  const getCuratedResources = (skill: string): StudyResource[] => {
    const norm = normalizeSkill(skill);
    const matched = BASE_RESOURCES_DB.filter(
      (r) =>
        r.skill_name.toLowerCase() === norm.toLowerCase() ||
        r.skill_name.toLowerCase().includes(norm.toLowerCase()) ||
        norm.toLowerCase().includes(r.skill_name.toLowerCase())
    );

    let list: StudyResource[] = [];

    if (matched.length > 0) {
      list = matched.map((r) => ({
        ...r,
        usage_count: (r.usage_count || 100) + (usageMap[r.id] || 0),
        is_studied: !!studiedMap[r.id],
      }));
    } else {
      // Dynamic fallback references if not present in base DB
      const cleanSkill = skill.trim();
      const slug = cleanSkill.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      list = [
        {
          id: `res_dyn_${slug}_1`,
          skill_name: cleanSkill,
          resource_title: `Official ${cleanSkill} Documentation & Quickstart`,
          resource_url: `https://www.google.com/search?q=${encodeURIComponent(cleanSkill + ' official documentation tutorial')}`,
          resource_type: 'doc',
          provider: 'Official Docs',
          duration: '1.5 hrs',
          usage_count: 154 + (usageMap[`res_dyn_${slug}_1`] || 0),
          is_studied: !!studiedMap[`res_dyn_${slug}_1`],
        },
        {
          id: `res_dyn_${slug}_2`,
          skill_name: cleanSkill,
          resource_title: `${cleanSkill} Comprehensive Video Masterclass`,
          resource_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanSkill + ' crash course tutorial')}`,
          resource_type: 'video',
          provider: 'freeCodeCamp',
          duration: '2.5 hrs',
          usage_count: 289 + (usageMap[`res_dyn_${slug}_2`] || 0),
          is_studied: !!studiedMap[`res_dyn_${slug}_2`],
        },
        {
          id: `res_dyn_${slug}_3`,
          skill_name: cleanSkill,
          resource_title: `Production Best Practices & Architecture for ${cleanSkill}`,
          resource_url: `https://towardsdatascience.com/search?q=${encodeURIComponent(cleanSkill)}`,
          resource_type: 'article',
          provider: 'Towards Data Science',
          duration: '45 mins',
          usage_count: 112 + (usageMap[`res_dyn_${slug}_3`] || 0),
          is_studied: !!studiedMap[`res_dyn_${slug}_3`],
        },
      ];
    }

    // Sort by popularity (highest usage_count first)
    return list.sort((a, b) => b.usage_count - a.usage_count);
  };

  const recordUsage = async (resourceId: string, action = 'open') => {
    // Update local state immediately for instant feedback
    setUsageMap((prev) => {
      const updated = { ...prev, [resourceId]: (prev[resourceId] || 0) + 1 };
      try {
        localStorage.setItem('careerx_resource_usage_counts', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Send async increment to backend
    try {
      await fetch('/api/resources/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, action }),
      });
    } catch {}
  };

  const toggleStudied = (resourceId: string) => {
    const nextStatus = !studiedMap[resourceId];
    const updated = { ...studiedMap, [resourceId]: nextStatus };
    setStudiedMap(updated);

    try {
      localStorage.setItem('careerx_studied_resources', JSON.stringify(updated));
    } catch {}

    if (nextStatus) {
      recordUsage(resourceId, 'mark_studied');
    }
  };

  const renderTypeBadge = (type: StudyResource['resource_type']) => {
    switch (type) {
      case 'doc':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileCode2 className="w-3 h-3" /> Doc
          </span>
        );
      case 'video':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Video className="w-3 h-3" /> Video
          </span>
        );
      case 'course':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <GraduationCap className="w-3 h-3" /> Course
          </span>
        );
      case 'article':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FileText className="w-3 h-3" /> Article
          </span>
        );
      default:
        return null;
    }
  };

  // 1. Initial State before resume scan
  if (!isUploaded) {
    return (
      <div className="rounded-2xl bg-[#0b1222]/70 border border-indigo-500/20 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">Recommended Study Resources</h3>
              <p className="text-xs text-slate-400">Curated references tailored to your missing ATS keywords</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold border border-amber-500/30">
            Awaiting Resume Scan
          </span>
        </div>

        <div className="text-center py-8 px-4 rounded-xl bg-[#070b14]/50 border border-dashed border-white/10 space-y-2">
          <div className="w-10 h-10 rounded-full bg-white/5 mx-auto flex items-center justify-center text-slate-400">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <h4 className="text-sm font-bold text-white">No Skill Gaps Detected Yet</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Upload your resume or paste skills above to automatically identify missing keywords and unlock curated study roadmaps with community popularity stats.
          </p>
        </div>
      </div>
    );
  }

  // 2. Case where no keywords are missing (100% match)
  if (missingKeywords.length === 0) {
    return (
      <div className="rounded-2xl bg-[#0b1222]/70 border border-emerald-500/30 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-white">Recommended Study Resources</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            ✓ All Keywords Matched
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Outstanding! Your resume currently satisfies all primary ATS keyword requirements for <strong className="text-cyan-400">{targetRole}</strong>.
        </p>
      </div>
    );
  }

  // 3. Render Curated Missing Keywords Resources Panel
  return (
    <div className="rounded-2xl bg-[#0b1222]/80 border border-indigo-500/20 p-5 sm:p-6 space-y-5 transition-all">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                Recommended Study Resources
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-[11px] font-bold border border-rose-500/20">
                {missingKeywords.length} Gaps
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Curated learning paths to bridge detected ATS gaps for <strong className="text-cyan-300">{targetRole}</strong>
            </p>
          </div>
        </div>

        {/* Collapse / Expand Toggle Button for Clean UI */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex items-center gap-1.5 self-start sm:self-center"
        >
          <span>{isCollapsed ? 'Expand View' : 'Collapse'}</span>
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Panel Body */}
      {!isCollapsed && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {missingKeywords.map((skill) => {
            const meta = getMetadata(skill);
            const skillResources = getCuratedResources(skill);

            return (
              <div
                key={skill}
                className="rounded-xl bg-[#070b14]/90 border border-white/10 p-4 sm:p-5 space-y-3.5 hover:border-cyan-500/30 transition-all"
              >
                {/* Skill Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      GAP
                    </span>
                    <h4 className="font-heading font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                      {skill}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10 text-amber-300 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-amber-400" /> {meta.timeEst}
                    </span>
                  </div>
                </div>

                {/* Role Context */}
                <p className="text-xs text-slate-300 leading-relaxed bg-[#111a30]/50 p-2.5 rounded-lg border border-white/5">
                  <span className="text-cyan-400 font-semibold">Why this matters: </span>
                  {meta.roleContext}
                </p>

                {/* Curated References List */}
                <div className="space-y-2 pt-1">
                  {skillResources.map((res, idx) => {
                    const isTopPopular = idx === 0;
                    const isStudied = !!studiedMap[res.id];

                    return (
                      <div
                        key={res.id}
                        className={`rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 border transition-all ${
                          isStudied
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-[#111a30]/60 border-white/5 hover:border-white/15'
                        }`}
                      >
                        {/* Left Resource Details */}
                        <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
                          {renderTypeBadge(res.resource_type)}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <a
                                href={res.resource_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => recordUsage(res.id, 'open')}
                                className="text-xs font-semibold text-white hover:text-cyan-300 transition-colors inline-flex items-center gap-1 group truncate"
                              >
                                <span className="truncate">{res.resource_title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                              </a>

                              {isTopPopular && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/30">
                                  <Flame className="w-2.5 h-2.5 text-amber-400" /> Most Popular
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="text-slate-300 font-medium">{res.provider}</span>
                              <span>•</span>
                              <span>{res.duration}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Social Proof & Action Button */}
                        <div className="flex items-center justify-between md:justify-end gap-2.5 flex-shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-white/5">
                          {/* Social Proof Indicator */}
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#070b14] border border-white/10 text-[11px] text-slate-300"
                            title={`${res.usage_count} users have studied or opened this resource`}
                          >
                            <div className="flex -space-x-1 items-center">
                              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-[8px] text-white font-bold">
                                U
                              </div>
                              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[8px] text-white font-bold">
                                +
                              </div>
                            </div>
                            <span>
                              Studied by <strong className="text-cyan-300 font-mono">{res.usage_count}</strong> users
                            </span>
                          </div>

                          {/* Mark as Studied / Open Resource Buttons */}
                          <div className="flex items-center gap-1.5">
                            <a
                              href={res.resource_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => recordUsage(res.id, 'open')}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all inline-flex items-center gap-1"
                            >
                              Open <ExternalLink className="w-2.5 h-2.5" />
                            </a>

                            <button
                              onClick={() => toggleStudied(res.id)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                                isStudied
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30'
                              }`}
                            >
                              {isStudied ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Done
                                </>
                              ) : (
                                'Mark Studied'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
