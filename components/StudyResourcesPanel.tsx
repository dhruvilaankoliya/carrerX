'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  MessageSquare,
  UserPlus,
  Star,
  RotateCcw,
  History,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import StudentConnectModal from './StudentConnectModal';
import ResourceFeedbackModal from './ResourceFeedbackModal';

export interface StudyResource {
  id: string;
  skill_name: string;
  resource_title: string;
  resource_url: string;
  resource_type: 'doc' | 'video' | 'course' | 'article';
  provider: string;
  duration: string;
  durationHrs?: number;
  usage_count: number;
  is_studied?: boolean;
  my_rating?: number | null;
  my_comment?: string | null;
  avg_rating?: number;
  ratings_count?: number;
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

// Fallback resources if DB is initializing
const BASE_RESOURCES_DB: StudyResource[] = [
  // Kubernetes (Screenshot spec)
  {
    id: 'res_k8s_3',
    skill_name: 'Kubernetes',
    resource_title: 'Kubernetes for Beginners (Hands-on Labs)',
    resource_url: 'https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners-hands-on/',
    resource_type: 'course',
    provider: 'KodeKloud',
    duration: '4 hrs',
    durationHrs: 4.0,
    usage_count: 693,
  },
  {
    id: 'res_k8s_1',
    skill_name: 'Kubernetes',
    resource_title: 'Kubernetes Core Concepts & Pod Architecture',
    resource_url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    resource_type: 'doc',
    provider: 'Kubernetes Official',
    duration: '1.5 hrs',
    durationHrs: 1.5,
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
    durationHrs: 1.0,
    usage_count: 310,
  },
  // Docker
  {
    id: 'res_docker_2',
    skill_name: 'Docker',
    resource_title: 'Docker for Machine Learning & Python Crash Course',
    resource_url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
    resource_type: 'video',
    provider: 'freeCodeCamp',
    duration: '2.5 hrs',
    durationHrs: 2.5,
    usage_count: 589,
  },
  {
    id: 'res_docker_1',
    skill_name: 'Docker',
    resource_title: 'Official Docker Containerization Guide for ML Developers',
    resource_url: 'https://docs.docker.com/get-started/',
    resource_type: 'doc',
    provider: 'Docker Docs',
    duration: '45 mins',
    durationHrs: 0.75,
    usage_count: 412,
  },
  {
    id: 'res_docker_3',
    skill_name: 'Docker',
    resource_title: 'Production Multi-stage Docker Builds for PyTorch & CUDA',
    resource_url: 'https://realpython.com/docker-continuous-integration/',
    resource_type: 'article',
    provider: 'Real Python',
    duration: '1 hr',
    durationHrs: 1.0,
    usage_count: 245,
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
    durationHrs: 1.0,
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
    durationHrs: 2.0,
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
    durationHrs: 1.5,
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
    durationHrs: 6.0,
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
    durationHrs: 1.5,
    usage_count: 420,
  },
  // Vector DB
  {
    id: 'res_vdb_2',
    skill_name: 'Vector DB',
    resource_title: 'Building Production RAG with LangChain & Vector Databases',
    resource_url: 'https://www.deeplearning.ai/short-courses/building-evaluating-advanced-rag/',
    resource_type: 'course',
    provider: 'DeepLearning.AI',
    duration: '2 hrs',
    durationHrs: 2.0,
    usage_count: 885,
  },
  {
    id: 'res_vdb_1',
    skill_name: 'Vector DB',
    resource_title: 'Pinecone Vector Search & Dense Embeddings Masterclass',
    resource_url: 'https://docs.pinecone.io/guides/get-started/overview',
    resource_type: 'doc',
    provider: 'Pinecone Docs',
    duration: '1 hr',
    durationHrs: 1.0,
    usage_count: 620,
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
  const [activeTab, setActiveTab] = useState<'resources' | 'history'>('resources');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Data from backend
  const [dbSkills, setDbSkills] = useState<any[]>([]);
  const [studiedMap, setStudiedMap] = useState<Record<string, boolean>>({});
  const [usageMap, setUsageMap] = useState<Record<string, number>>({});
  const [feedbackMap, setFeedbackMap] = useState<Record<string, { rating: number; comment: string | null }>>({});
  const [studyHistory, setStudyHistory] = useState<any[]>([]);
  const [myAvgRating, setMyAvgRating] = useState<number>(0);
  const [totalStudyHours, setTotalStudyHours] = useState<number>(0);

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Student Connect Modal active state
  const [connectModalData, setConnectModalData] = useState<{
    isOpen: boolean;
    resourceTitle: string;
    resourceId: string;
    skillName: string;
    usageCount: number;
  } | null>(null);

  // Feedback Modal active state
  const [feedbackModalData, setFeedbackModalData] = useState<{
    isOpen: boolean;
    resourceId: string;
    resourceTitle: string;
    skillName: string;
    rating?: number | null;
    comment?: string | null;
  } | null>(null);

  // Fetch resources from backend API
  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/resources');
      if (!res.ok) {
        throw new Error('Failed to load study resources');
      }

      const data = await res.json();
      if (data.skills) {
        setDbSkills(data.skills);

        const newStudied: Record<string, boolean> = {};
        const newUsage: Record<string, number> = {};
        const newFeedback: Record<string, { rating: number; comment: string | null }> = {};

        data.skills.forEach((skill: any) => {
          skill.resources.forEach((r: any) => {
            newStudied[r.id] = r.isStudied;
            newUsage[r.id] = r.studiedCount;
            if (r.myFeedback) {
              newFeedback[r.id] = {
                rating: r.myFeedback.rating,
                comment: r.myFeedback.comment,
              };
            }
          });
        });

        setStudiedMap(newStudied);
        setUsageMap(newUsage);
        setFeedbackMap(newFeedback);
      }

      if (data.userMetrics) {
        setMyAvgRating(data.userMetrics.myAvgRating || 0);
        setTotalStudyHours(data.userMetrics.totalHours || 0);
      }

      if (data.studyHistory) {
        setStudyHistory(data.studyHistory);
      }
    } catch (err: any) {
      console.error('Error fetching /api/resources:', err);
      setError(err.message || 'Failed to connect to resources service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

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

  // Get curated resources for a skill (checks DB first, then fallback)
  const getCuratedResources = (skill: string): StudyResource[] => {
    const norm = normalizeSkill(skill);

    // Check if skill is in DB
    const dbSkill = dbSkills.find(
      (s) => s.name.toLowerCase() === norm.toLowerCase() || s.name.toLowerCase().includes(norm.toLowerCase())
    );

    if (dbSkill && dbSkill.resources?.length > 0) {
      return dbSkill.resources.map((r: any) => ({
        id: r.id,
        skill_name: norm,
        resource_title: r.title,
        resource_url: r.url,
        resource_type: r.type,
        provider: r.provider,
        duration: r.durationText,
        durationHrs: r.durationHrs,
        usage_count: usageMap[r.id] !== undefined ? usageMap[r.id] : r.studiedCount,
        is_studied: studiedMap[r.id] !== undefined ? studiedMap[r.id] : r.isStudied,
        my_rating: feedbackMap[r.id]?.rating ?? r.myFeedback?.rating ?? null,
        my_comment: feedbackMap[r.id]?.comment ?? r.myFeedback?.comment ?? null,
        avg_rating: r.avgRating,
        ratings_count: r.ratingsCount,
      }));
    }

    // Fallback matched from base DB
    const matched = BASE_RESOURCES_DB.filter(
      (r) =>
        r.skill_name.toLowerCase() === norm.toLowerCase() ||
        r.skill_name.toLowerCase().includes(norm.toLowerCase()) ||
        norm.toLowerCase().includes(r.skill_name.toLowerCase())
    );

    if (matched.length > 0) {
      return matched.map((r) => ({
        ...r,
        usage_count: usageMap[r.id] !== undefined ? usageMap[r.id] : r.usage_count,
        is_studied: !!studiedMap[r.id],
        my_rating: feedbackMap[r.id]?.rating ?? null,
        my_comment: feedbackMap[r.id]?.comment ?? null,
      }));
    }

    // Dynamic generation for any unlisted skill
    const cleanSkill = skill.trim();
    const slug = cleanSkill.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return [
      {
        id: `res_dyn_${slug}_1`,
        skill_name: cleanSkill,
        resource_title: `Official ${cleanSkill} Documentation & Quickstart`,
        resource_url: `https://www.google.com/search?q=${encodeURIComponent(cleanSkill + ' official documentation tutorial')}`,
        resource_type: 'doc',
        provider: 'Official Docs',
        duration: '1.5 hrs',
        durationHrs: 1.5,
        usage_count: 154 + (usageMap[`res_dyn_${slug}_1`] || 0),
        is_studied: !!studiedMap[`res_dyn_${slug}_1`],
        my_rating: feedbackMap[`res_dyn_${slug}_1`]?.rating ?? null,
        my_comment: feedbackMap[`res_dyn_${slug}_1`]?.comment ?? null,
      },
      {
        id: `res_dyn_${slug}_2`,
        skill_name: cleanSkill,
        resource_title: `${cleanSkill} Comprehensive Video Masterclass`,
        resource_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanSkill + ' crash course tutorial')}`,
        resource_type: 'video',
        provider: 'freeCodeCamp',
        duration: '2.5 hrs',
        durationHrs: 2.5,
        usage_count: 289 + (usageMap[`res_dyn_${slug}_2`] || 0),
        is_studied: !!studiedMap[`res_dyn_${slug}_2`],
        my_rating: feedbackMap[`res_dyn_${slug}_2`]?.rating ?? null,
        my_comment: feedbackMap[`res_dyn_${slug}_2`]?.comment ?? null,
      },
      {
        id: `res_dyn_${slug}_3`,
        skill_name: cleanSkill,
        resource_title: `Production Best Practices & Architecture for ${cleanSkill}`,
        resource_url: `https://towardsdatascience.com/search?q=${encodeURIComponent(cleanSkill)}`,
        resource_type: 'article',
        provider: 'Towards Data Science',
        duration: '45 mins',
        durationHrs: 0.75,
        usage_count: 112 + (usageMap[`res_dyn_${slug}_3`] || 0),
        is_studied: !!studiedMap[`res_dyn_${slug}_3`],
        my_rating: feedbackMap[`res_dyn_${slug}_3`]?.rating ?? null,
        my_comment: feedbackMap[`res_dyn_${slug}_3`]?.comment ?? null,
      },
    ];
  };

  // Toggle studied status via API
  const toggleStudied = async (res: StudyResource, skill: string) => {
    const resourceId = res.id;
    const currentStatus = !!studiedMap[resourceId];
    const nextStatus = !currentStatus;

    // Optimistic UI updates
    setStudiedMap((prev) => ({ ...prev, [resourceId]: nextStatus }));
    setUsageMap((prev) => ({
      ...prev,
      [resourceId]: Math.max(0, (prev[resourceId] || res.usage_count) + (nextStatus ? 1 : -1)),
    }));

    setTogglingId(resourceId);

    try {
      const resp = await fetch(`/api/resources/${encodeURIComponent(resourceId)}/studied`, {
        method: 'POST',
      });

      if (resp.ok) {
        const data = await resp.json();
        setStudiedMap((prev) => ({ ...prev, [resourceId]: data.isStudied }));
        if (typeof data.studiedCount === 'number') {
          setUsageMap((prev) => ({ ...prev, [resourceId]: data.studiedCount }));
        }

        // If toggled ON -> trigger Rating & Feedback modal immediately!
        if (data.isStudied) {
          setFeedbackModalData({
            isOpen: true,
            resourceId: res.id,
            resourceTitle: res.resource_title,
            skillName: skill,
            rating: feedbackMap[res.id]?.rating || 5,
            comment: feedbackMap[res.id]?.comment || '',
          });
        }
      } else {
        // Rollback
        setStudiedMap((prev) => ({ ...prev, [resourceId]: currentStatus }));
      }
    } catch {
      // Rollback
      setStudiedMap((prev) => ({ ...prev, [resourceId]: currentStatus }));
    } finally {
      setTogglingId(null);
    }
  };

  // Open Feedback Modal for editing
  const handleOpenFeedback = (res: StudyResource, skill: string) => {
    setFeedbackModalData({
      isOpen: true,
      resourceId: res.id,
      resourceTitle: res.resource_title,
      skillName: skill,
      rating: feedbackMap[res.id]?.rating || 5,
      comment: feedbackMap[res.id]?.comment || '',
    });
  };

  // Handle successful feedback submission
  const handleFeedbackSuccess = (feedback: { rating: number; comment: string | null }) => {
    if (feedbackModalData?.resourceId) {
      setFeedbackMap((prev) => ({
        ...prev,
        [feedbackModalData.resourceId]: feedback,
      }));
      // Refresh study history
      loadResources();
    }
  };

  const handleOpenStudentConnect = (res: StudyResource, skill: string) => {
    setConnectModalData({
      isOpen: true,
      resourceTitle: res.resource_title,
      resourceId: res.id,
      skillName: skill,
      usageCount: usageMap[res.id] || res.usage_count,
    });
  };

  // Calculate overall closed gaps count
  const effectiveGaps = missingKeywords.length > 0 ? missingKeywords : ['Kubernetes', 'Docker', 'FastAPI', 'MLOps', 'Vector DB', 'CI/CD'];

  const gapsStats = useMemo(() => {
    let closedCount = 0;
    const perSkillMap: Record<string, { studied: number; total: number; percent: number }> = {};

    effectiveGaps.forEach((skill) => {
      const resources = getCuratedResources(skill);
      const total = resources.length;
      const studied = resources.filter((r) => !!studiedMap[r.id]).length;
      const isClosed = total > 0 && studied > 0; // Skill considered progressing or closed if studied >= 1
      if (total > 0 && studied === total) {
        closedCount += 1;
      }
      perSkillMap[skill] = {
        studied,
        total,
        percent: total > 0 ? Math.round((studied / total) * 100) : 0,
      };
    });

    return { closedCount, totalCount: effectiveGaps.length, perSkillMap };
  }, [effectiveGaps, studiedMap, dbSkills, usageMap]);

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
            Upload your resume or paste skills above to automatically identify missing keywords, connect with students who mastered them, and unlock curated study roadmaps.
          </p>
        </div>
      </div>
    );
  }

  // 2. Case where no keywords are missing (100% match)
  if (missingKeywords.length === 0 && effectiveGaps.length === 0) {
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
    <>
      <div className="rounded-2xl bg-[#0b1222]/80 border border-indigo-500/20 p-5 sm:p-6 space-y-5 transition-all shadow-xl">
        {/* Panel Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0 shadow-lg shadow-cyan-500/10">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-white">
                  Recommended Study Resources
                </h3>

                {/* Overall "Gaps closed: X/6" Indicator */}
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Gaps Closed: {gapsStats.closedCount}/{gapsStats.totalCount}
                </span>

                {/* My Average Rating Given Badge */}
                {myAvgRating > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-xs font-mono font-bold border border-amber-500/30 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    My Avg Rating: {myAvgRating}★
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Curated learning paths, peer network & real-time completion tracking for <strong className="text-cyan-300">{targetRole}</strong>
              </p>
            </div>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* View Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-[#070b14]/90 border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('resources')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'resources'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Curated Resources
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>My Study History</span>
                {studyHistory.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-mono">
                    {studyHistory.length}
                  </span>
                )}
              </button>
            </div>

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-10 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Syncing study progress & peer ratings from database...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadResources}
              className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-white font-semibold transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Panel Body */}
        {!isCollapsed && !loading && (
          <>
            {/* ──────── TAB 1: CURATED RESOURCES & PROGRESS ──────── */}
            {activeTab === 'resources' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {effectiveGaps.map((skill) => {
                  const meta = getMetadata(skill);
                  const skillResources = getCuratedResources(skill);
                  const skillStats = gapsStats.perSkillMap[skill] || { studied: 0, total: skillResources.length, percent: 0 };
                  const isSkillAllDone = skillStats.total > 0 && skillStats.studied === skillStats.total;

                  return (
                    <div
                      key={skill}
                      className={`rounded-xl border p-4 sm:p-5 space-y-3.5 transition-all ${
                        isSkillAllDone
                          ? 'bg-[#07131b]/80 border-emerald-500/30'
                          : 'bg-[#070b14]/90 border-white/10 hover:border-cyan-500/30'
                      }`}
                    >
                      {/* Skill Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded border font-mono ${
                              isSkillAllDone
                                ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                                : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                            }`}
                          >
                            {isSkillAllDone ? 'CLOSED' : 'GAP'}
                          </span>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                            {skill}
                          </h4>
                          {isSkillAllDone && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-in zoom-in" />
                          )}
                        </div>

                        {/* Per-Skill Progress Indicator */}
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="font-mono text-xs font-semibold text-cyan-300">
                            {skillStats.studied}/{skillStats.total} Completed ({skillStats.percent}%)
                          </span>
                          <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10 text-amber-300 font-mono text-[11px]">
                            <Clock className="w-3 h-3 text-amber-400" /> {meta.timeEst}
                          </span>
                        </div>
                      </div>

                      {/* Per-Skill Animated Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isSkillAllDone
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                          }`}
                          style={{ width: `${Math.max(5, skillStats.percent)}%` }}
                        />
                      </div>

                      {/* Role Context */}
                      <p className="text-xs text-slate-300 leading-relaxed bg-[#111a30]/50 p-2.5 rounded-lg border border-white/5">
                        <span className="text-cyan-400 font-semibold">Why this matters: </span>
                        {meta.roleContext}
                      </p>

                      {/* Curated References List */}
                      <div className="space-y-2 pt-1">
                        {skillResources.map((res, idx) => {
                          const isTopPopular = idx === 0 || res.usage_count > 600;
                          const isStudied = !!studiedMap[res.id];
                          const userFb = feedbackMap[res.id];
                          const isToggling = togglingId === res.id;

                          return (
                            <div
                              key={res.id}
                              className={`rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 border transition-all ${
                                isStudied
                                  ? 'bg-emerald-950/25 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
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

                                    {/* Star Rating Badge if user already rated */}
                                    {userFb?.rating && (
                                      <span
                                        onClick={() => handleOpenFeedback(res, skill)}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-pointer hover:bg-amber-500/25 transition-all"
                                        title={`You rated this ${userFb.rating}★. Click to edit review.`}
                                      >
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        <span>My: {userFb.rating}★</span>
                                        <Edit3 className="w-2 h-2 text-amber-400" />
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                    <span className="text-slate-300 font-medium">{res.provider}</span>
                                    <span>•</span>
                                    <span>{res.duration}</span>
                                    {res.avg_rating && res.avg_rating > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="text-amber-300 flex items-center gap-0.5 font-mono">
                                          ★ {res.avg_rating} ({res.ratings_count || 1})
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Interactive Social Proof & Action Buttons */}
                              <div className="flex items-center justify-between md:justify-end gap-2.5 flex-shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-white/5">
                                {/* Interactive "Studied by X students" clickable badge */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenStudentConnect(res, skill)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#070b14] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer group shadow-sm"
                                  title={`Click to connect with students who studied ${skill}`}
                                >
                                  <div className="flex -space-x-1 items-center">
                                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-[8px] text-white font-bold group-hover:scale-110 transition-transform">
                                      U
                                    </div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[8px] text-white font-bold group-hover:scale-110 transition-transform">
                                      +
                                    </div>
                                  </div>
                                  <span>
                                    👥 Studied by{' '}
                                    <strong className="text-cyan-300 font-mono group-hover:underline">
                                      {usageMap[res.id] || res.usage_count}
                                    </strong>{' '}
                                    students
                                  </span>
                                </button>

                                {/* Action Buttons: [Open] [Mark Studied / Undo] [Find Students] */}
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={res.resource_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all inline-flex items-center gap-1"
                                  >
                                    Open <ExternalLink className="w-2.5 h-2.5" />
                                  </a>

                                  {/* Mark Studied / Completed State Button */}
                                  <button
                                    onClick={() => toggleStudied(res, skill)}
                                    disabled={isToggling}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 group/btn ${
                                      isStudied
                                        ? 'bg-emerald-500/20 hover:bg-rose-500/20 text-emerald-300 hover:text-rose-300 border border-emerald-500/40 hover:border-rose-500/40'
                                        : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30'
                                    }`}
                                    title={isStudied ? 'Click to undo completed state' : 'Click to mark as studied and rate'}
                                  >
                                    {isStudied ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400 group-hover/btn:hidden" />
                                        <RotateCcw className="w-3 h-3 text-rose-400 hidden group-hover/btn:inline" />
                                        <span className="group-hover/btn:hidden">✓ Studied</span>
                                        <span className="hidden group-hover/btn:inline">Undo</span>
                                      </>
                                    ) : (
                                      'Mark Studied'
                                    )}
                                  </button>

                                  {/* Prominent "Find Students" Button */}
                                  <button
                                    onClick={() => handleOpenStudentConnect(res, skill)}
                                    className="px-2.5 py-1 rounded-md text-[11px] font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
                                  >
                                    <Users className="w-3 h-3" /> Find Students
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

            {/* ──────── TAB 2: MY STUDY HISTORY ──────── */}
            {activeTab === 'history' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-[#070b14]/70 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white">My Completed Study Timeline</h4>
                      <p className="text-xs text-slate-400">All materials and labs you completed to close target ATS gaps</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      ⚡ Total Hours: {totalStudyHours} hrs
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      ✓ Completed: {studyHistory.length}
                    </span>
                  </div>
                </div>

                {studyHistory.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-xl bg-[#070b14]/50 border border-dashed border-white/10 space-y-2">
                    <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
                    <h5 className="font-bold text-sm text-white">No Completed Study History Yet</h5>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Click &quot;Mark Studied&quot; on any recommended course, doc, or article above to log your hours and track your progress here.
                    </p>
                    <button
                      onClick={() => setActiveTab('resources')}
                      className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all"
                    >
                      Browse Curated Resources →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {studyHistory.map((item) => (
                      <div
                        key={item.progressId || item.resourceId}
                        className="p-4 rounded-xl bg-[#070b14]/90 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/20 uppercase">
                              {item.skillName}
                            </span>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs sm:text-sm font-bold text-white hover:text-cyan-300 transition-colors inline-flex items-center gap-1 group truncate"
                            >
                              <span className="truncate">{item.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                            </a>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span>{item.provider}</span>
                            <span>•</span>
                            <span className="text-cyan-300">{item.durationText}</span>
                            <span>•</span>
                            <span>Completed: {new Date(item.studiedAt).toLocaleDateString()}</span>
                          </div>

                          {/* User Feedback Comment if present */}
                          {item.comment && (
                            <p className="text-xs text-slate-300 bg-[#111a30]/60 p-2 rounded-lg border border-white/5 italic">
                              &ldquo;{item.comment}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Right: Rating & Edit Review */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {item.rating ? (
                            <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{item.rating} / 5</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">Unrated</span>
                          )}

                          <button
                            onClick={() =>
                              handleOpenFeedback(
                                {
                                  id: item.resourceId,
                                  resource_title: item.title,
                                  skill_name: item.skillName,
                                  resource_url: item.url,
                                  resource_type: item.type,
                                  provider: item.provider,
                                  duration: item.durationText,
                                  usage_count: 100,
                                },
                                item.skillName
                              )
                            }
                            className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3 text-cyan-400" />
                            <span>{item.rating ? 'Edit Review' : 'Add Review'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Dedicated Student Connect & Peer Learning Hub Modal ─── */}
      {connectModalData && (
        <StudentConnectModal
          isOpen={connectModalData.isOpen}
          onClose={() => setConnectModalData(null)}
          resourceTitle={connectModalData.resourceTitle}
          resourceId={connectModalData.resourceId}
          skillName={connectModalData.skillName}
          usageCount={connectModalData.usageCount}
        />
      )}

      {/* ─── Dedicated Rating & Review Feedback Modal ─── */}
      {feedbackModalData && (
        <ResourceFeedbackModal
          isOpen={feedbackModalData.isOpen}
          onClose={() => setFeedbackModalData(null)}
          resourceId={feedbackModalData.resourceId}
          resourceTitle={feedbackModalData.resourceTitle}
          skillName={feedbackModalData.skillName}
          initialRating={feedbackModalData.rating}
          initialComment={feedbackModalData.comment}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </>
  );
}
