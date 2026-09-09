/* ==========================================================================
   CareerX - Reactive Student Profile & State Store
   ========================================================================== */

import { CAREERS_DATA } from './careers.js';

class StudentStore {
  constructor() {
    this.profile = {
      name: 'Alex Rivera',
      avatar: 'AR',
      education: 'B.S. Computer Science & AI (Year 3)',
      targetCareerId: 'ml-engineer',
      overallScore: 81,
      scoreDelta: '+6 pts this week',
      readinessTier: 'Tier 1: Job-Ready Contender',
      scores: {
        skills: 84,        // 35% weight
        projects: 76,      // 25% weight
        resume: null,      // null until user uploads/analyzes resume
        interview: 82,     // 15% weight
        certifications: 90 // 10% weight
      },
      xp: 2840,
      level: 7,
      quests: [
        {
          id: 'q1',
          title: 'Dockerize your FastAPI + PyTorch inference endpoint',
          xp: 150,
          category: 'MLOps',
          completed: false,
          boost: '+2.0% Readiness'
        },
        {
          id: 'q2',
          title: 'Fix 3 missing ATS keywords in your resume experience section',
          xp: 100,
          category: 'Resume',
          completed: false,
          boost: '+1.5% Readiness'
        },
        {
          id: 'q3',
          title: 'Complete the RAG Vector Database benchmark quiz',
          xp: 200,
          category: 'Skill Gap',
          completed: true,
          boost: '+2.5% Readiness'
        },
        {
          id: 'q4',
          title: 'Run a 5-minute AI Mock Interview on Transformer Attention',
          xp: 250,
          category: 'Interview',
          completed: false,
          boost: '+3.0% Readiness'
        }
      ],
      roadmapStages: [
        {
          id: 1,
          number: '01',
          title: 'Core Foundations & Mathematical Intuition',
          status: 'completed',
          progress: 100,
          timeEst: '3 Weeks',
          summary: 'Mastered Multivariable Calculus, Linear Algebra for Tensors, and algorithmic efficiency in Python.',
          deliverables: [
            { type: 'Course', name: 'MIT 18.06 Linear Algebra with Python implementations', status: 'done' },
            { type: 'Code', name: 'Optimized Matrix Multiplication & Autograd Engine from Scratch', status: 'done' },
            { type: 'Quiz', name: 'Vector Calculus & Gradient Descent Mastery Exam (98%)', status: 'done' }
          ]
        },
        {
          id: 2,
          number: '02',
          title: 'Classical Machine Learning & Deep Learning Foundations',
          status: 'completed',
          progress: 100,
          timeEst: '4 Weeks',
          summary: 'Trained CNNs, RNNs, and Supervised/Unsupervised pipelines with PyTorch and Scikit-Learn.',
          deliverables: [
            { type: 'Project', name: 'Medical Image Classification with ResNet & Transfer Learning', status: 'done' },
            { type: 'Course', name: 'CS231n: Deep Learning for Computer Vision', status: 'done' },
            { type: 'Cert', name: 'DeepLearning.AI Deep Learning Specialization', status: 'done' }
          ]
        },
        {
          id: 3,
          number: '03',
          title: 'Advanced LLMs, RAG Pipelines & Vector Databases',
          status: 'active',
          progress: 68,
          timeEst: '3 Weeks (1.5 weeks remaining)',
          summary: 'Building state-of-the-art Generative AI applications with chunking strategies, embeddings, and LangChain/LlamaIndex.',
          deliverables: [
            { type: 'Project', name: 'High-Throughput Financial RAG Agent with Pinecone & Hybrid Search', status: 'in-progress' },
            { type: 'Lab', name: 'Fine-Tuning Llama-3 with LoRA and QLoRA on Custom Corpus', status: 'pending' },
            { type: 'Quiz', name: 'Transformer Attention Mechanics & KV-Cache Optimization', status: 'done' }
          ]
        },
        {
          id: 4,
          number: '04',
          title: 'MLOps, Containerization & High-Scale Deployment',
          status: 'locked',
          progress: 0,
          timeEst: '4 Weeks',
          summary: 'Package neural models as high-throughput microservices using Docker, Kubernetes, Triton, and MLflow.',
          deliverables: [
            { type: 'Project', name: 'Distributed Model Inference Cluster with FastAPI & Docker', status: 'locked' },
            { type: 'Pipeline', name: 'Automated Model Drift Monitoring & CI/CD retraining pipeline', status: 'locked' },
            { type: 'Cert', name: 'AWS Certified Machine Learning - Specialty (Prep)', status: 'locked' }
          ]
        },
        {
          id: 5,
          number: '05',
          title: 'Capstone Showcase, ATS Resume Audit & FAANG Mock Interviews',
          status: 'locked',
          progress: 0,
          timeEst: '2 Weeks',
          summary: 'Final portfolio polishing, recruiter-tailored resume packaging, and system design interview readiness.',
          deliverables: [
            { type: 'Capstone', name: 'Full Multimodal AI Copilot with Live Production URL & Benchmarks', status: 'locked' },
            { type: 'Portfolio', name: 'Technical Whitepaper & Interactive GitHub Showcase', status: 'locked' },
            { type: 'Interview', name: 'Simulated 45-min Deep Dive with AI Senior Staff Engineer', status: 'locked' }
          ]
        }
      ],
      resumeAudit: {
        uploaded: false,
        score: null,
        status: null,
        foundKeywords: [],
        missingKeywords: [],
        bulletRewrites: []
      }
    };

    this.listeners = [];
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.profile));
  }

  // Switch active target career
  setTargetCareer(careerId) {
    if (!CAREERS_DATA[careerId]) return;
    this.profile.targetCareerId = careerId;
    const career = CAREERS_DATA[careerId];
    
    // Dynamically adjust fit score and readiness score based on target role
    this.profile.overallScore = Math.round((career.matchScore * 0.7) + (this.profile.scores.skills * 0.3));
    this.recalculateScores();
    this.notify();
  }

  // Toggle Quest Completion
  toggleQuest(questId) {
    const quest = this.profile.quests.find(q => q.id === questId);
    if (!quest) return;
    quest.completed = !quest.completed;
    if (quest.completed) {
      this.profile.xp += quest.xp;
      this.profile.overallScore = Math.min(100, this.profile.overallScore + 2);
    } else {
      this.profile.xp -= quest.xp;
      this.profile.overallScore = Math.max(50, this.profile.overallScore - 2);
    }
    this.recalculateScores();
    this.notify();
  }

  recalculateScores() {
    const s = this.profile.scores;
    const resumeVal = (s.resume !== null && s.resume !== undefined) ? s.resume : 70;
    const computed = Math.round((s.skills * 0.35) + (s.projects * 0.25) + (resumeVal * 0.15) + (s.interview * 0.15) + (s.certifications * 0.10));
    this.profile.overallScore = Math.max(50, Math.min(99, computed));
    
    if (this.profile.overallScore >= 85) {
      this.profile.readinessTier = 'Tier 1: Job-Ready Contender';
    } else if (this.profile.overallScore >= 70) {
      this.profile.readinessTier = 'Tier 2: Advanced Competency';
    } else {
      this.profile.readinessTier = 'Tier 3: Foundation Building';
    }
  }

  getCurrentCareer() {
    return CAREERS_DATA[this.profile.targetCareerId] || CAREERS_DATA['ml-engineer'];
  }
}

export const studentStore = new StudentStore();
