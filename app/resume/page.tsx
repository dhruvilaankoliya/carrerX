'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Code2,
  Trophy,
  Layers,
  GraduationCap,
  Mail,
  Phone,
  ExternalLink,
  Briefcase,
  Award,
  BookOpen,
  Compass,
  Check,
  RefreshCw,
  User,
  Zap,
  Key,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResumePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [uploadMeta, setUploadMeta] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingAnswers, setSubmittingAnswers] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeDomainTab, setActiveDomainTab] = useState<string>('All');
  const [apiKey, setApiKey] = useState('');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchExistingResume();
    try {
      const savedKey = localStorage.getItem('careerx_gemini_api_key');
      if (savedKey) setApiKey(savedKey);
    } catch {}
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    try {
      if (newKey.trim()) {
        localStorage.setItem('careerx_gemini_api_key', newKey.trim());
      } else {
        localStorage.removeItem('careerx_gemini_api_key');
      }
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2000);
    } catch {}
  };

  const fetchExistingResume = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        setIsAuthenticated(true);
        if (json.user?.resumeData?.parsed) {
          setParsedData(json.user.resumeData.parsed);
          setUploadMeta({
            fileName: json.user.resumeData.fileName || 'Verified_Resume.pdf',
            provider: 'CareerX Intelligence Engine',
            careerMatches: json.user.careerMatches || [],
            preliminaryReadiness: json.user.latestReadinessScore
              ? {
                  overallScore: json.user.latestReadinessScore.overallScore,
                  subscores: {
                    techSkills: json.user.latestReadinessScore.techScore,
                    projects: json.user.latestReadinessScore.projectsScore,
                    resume: json.user.latestReadinessScore.resumeScore,
                    problemSolving: json.user.latestReadinessScore.problemSolvingScore,
                  },
                }
              : null,
            completenessPercent: json.user.profile?.completenessPercent || 45,
            completenessStage: json.user.profile?.completenessStage || 2,
          });
          fetchQuestions();
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/resume/questions');
      if (res.ok) {
        const json = await res.json();
        setQuestions(json.questions || []);
      }
    } catch {}
  };

  const loadSampleResume = () => {
    setMode('paste');
    setPastedText(`Dhruvila
Computer Science & AI Engineering Student
Email: dhruvila@careerx.dev • Phone: +91 9876543210
LinkedIn: https://linkedin.com/in/dhruvila • GitHub: https://github.com/dhruvilaankoliya

EDUCATION
Dharmsinh Desai University, Nadiad
B.Tech in Computer Science & Engineering (2022 – 2026) | CGPA: 8.9 / 10.0
Coursework: Data Structures & Algorithms, Operating Systems, Database Management Systems, System Design, Machine Learning

TECHNICAL SKILLS
• Languages: Python, C++, JavaScript, TypeScript, SQL
• AI / ML: PyTorch, FastAPI, Pandas, NumPy, Scikit-Learn, Vector Embeddings (RAG), Deep Learning
• Software & Web: React, Next.js, Node.js, Express, Tailwind CSS, REST APIs
• Cloud & DevOps: Docker, Kubernetes, AWS, Git, GitHub Actions, Linux

PROJECTS
• Multimodal RAG Research Assistant
  - Built a high-throughput semantic search pipeline using Llama-3, PyTorch, and Pinecone vector database.
  - Containerized FastAPI microservices with Docker and deployed automated CI/CD test coverage gates.
• ResNet Medical Vision Classifier
  - Trained deep convolutional neural network for automated radiological anomaly detection with PyTorch.
  - Achieved 94.2% validation accuracy with comprehensive ROC-AUC metrics and low-latency inference.

CERTIFICATIONS
• Deep Learning Specialization – DeepLearning.AI (Coursera)
• AWS Certified Cloud Practitioner`);
    setError('');
  };

  const handleParse = async () => {
    setError('');
    setLoading(true);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);

    try {
      let res: Response;
      const headers: Record<string, string> = {};
      if (apiKey.trim()) {
        headers['x-gemini-key'] = apiKey.trim();
      }

      if (mode === 'upload' && file) {
        const formData = new FormData();
        formData.append('resume', file);
        res = await fetch('/api/resume/parse', {
          method: 'POST',
          headers,
          body: formData,
        });
      } else if (mode === 'paste' && pastedText.trim()) {
        res = await fetch('/api/resume/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({ rawText: pastedText }),
        });
      } else {
        setError('Please select a resume file or paste your resume text.');
        setLoading(false);
        clearInterval(stepInterval);
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setParsedData(data.parsed);
        setUploadMeta({
          fileName: data.fileName || file?.name || 'Uploaded_Resume.pdf',
          provider: data.provider || 'CareerX Intelligence Engine',
          careerMatches: data.careerMatches || [],
          preliminaryReadiness: data.preliminaryReadiness || null,
          completenessPercent: data.completenessPercent || 45,
          completenessStage: data.completenessStage || 2,
        });

        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          fetchQuestions();
        }

        // Smooth scroll to output results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      } else {
        if (res.status === 401) {
          setIsAuthenticated(false);
          setError('You must be signed in to upload your resume. Please sign in below.');
        } else {
          setError(data.error || 'Failed to extract resume data. Please try again.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with resume parser.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const handleAnswerChange = (qId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmitQuestions = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before proceeding.');
      return;
    }

    setSubmittingAnswers(true);
    setError('');

    try {
      const res = await fetch('/api/resume/questions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (res.ok) {
        router.push('/assessment');
      } else {
        setError('Failed to submit questions. Please try again.');
      }
    } catch {
      setError('Network error submitting answers.');
    } finally {
      setSubmittingAnswers(false);
    }
  };

  // Grouped skills helper
  const categorizedSkills = parsedData?.categorizedSkills || {
    'AI & Data': parsedData?.technicalSkills?.filter((s: string) =>
      ['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'Pandas', 'NumPy', 'SQL', 'RAG', 'Pinecone', 'Deep learning', 'Scikit-Learn'].includes(s)
    ) || [],
    'Software & Web': parsedData?.technicalSkills?.filter((s: string) =>
      ['React', 'Next.js', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'Tailwind', 'HTML', 'CSS', 'Git'].includes(s)
    ) || [],
    'Cloud & DevOps': parsedData?.technicalSkills?.filter((s: string) =>
      ['Docker', 'Kubernetes', 'AWS', 'Linux', 'GCP', 'Azure', 'CI/CD'].includes(s)
    ) || [],
  };

  const domainTabs = ['All', ...Object.keys(categorizedSkills).filter((k) => categorizedSkills[k]?.length > 0)];

  const displayedSkills =
    activeDomainTab === 'All'
      ? parsedData?.technicalSkills || []
      : categorizedSkills[activeDomainTab] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Resume Intelligence Engine
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Resume Parsing & <span className="text-gradient">Skill Intelligence</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Upload your resume in PDF, DOCX, or TXT format. CareerX dynamically extracts verified skills, projects,
            education, and credentials to calibrate your real-time career readiness analytics.
          </p>
        </div>

        {/* AI Settings Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setShowApiConfig(!showApiConfig)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Provider</span>
            {apiKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : null}
            {showApiConfig ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* AI Key Configuration Card (Expandable) */}
      {showApiConfig && (
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-3 animate-in fade-in">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                AI Engine & Free Gemini Key (Optional)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Default: <strong className="text-cyan-300">CareerX Local Engine (Free, Offline)</strong>
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Want multimodal AI parsing that reads <strong>scanned PDFs, Canva resumes, and complex graphics</strong> directly? You can enter a free Google Gemini API key. Google provides 100% free keys with no credit card required at{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 underline hover:text-cyan-300 inline-flex items-center gap-0.5"
            >
              Google AI Studio <ExternalLink className="w-3 h-3" />
            </a>.
          </p>
          <div className="flex gap-2 pt-1">
            <input
              type="password"
              placeholder="Paste Google Gemini API Key (e.g. AIzaSy...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 bg-[#111a30] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              onClick={() => handleSaveApiKey(apiKey)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 transition-all flex items-center gap-1"
            >
              {keySaved ? <Check className="w-3.5 h-3.5" /> : null}
              {keySaved ? 'Saved!' : 'Save Key'}
            </button>
            {apiKey && (
              <button
                onClick={() => handleSaveApiKey('')}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Authentication Alert if Not Logged In */}
      {isAuthenticated === false && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Authentication Required to Save Resume</div>
              <div className="text-slate-300">
                Sign in to save your parsed skills, benchmark your readiness score, and unlock your career roadmap.
              </div>
            </div>
          </div>
          <Link
            href="/login"
            className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:shadow-lg transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            Sign In Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Error Alert with Quick Tab Switch */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          {mode === 'upload' && (
            <button
              onClick={() => {
                setMode('paste');
                setError('');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-[11px] font-bold transition-all flex items-center gap-1.5 flex-shrink-0 self-end sm:self-auto"
            >
              📋 Switch to "Paste Text" Tab
            </button>
          )}
        </div>
      )}

      {/* ─── 1. Upload / Paste Card ─────────────────────────────── */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'upload'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📁 Upload PDF / DOCX File
            </button>
            <button
              onClick={() => setMode('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'paste'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 Paste Plaintext Resume
            </button>
          </div>

          <button
            onClick={loadSampleResume}
            className="text-xs px-3.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" /> Try Demo Resume (1-Click)
          </button>
        </div>

        {mode === 'upload' ? (
          <div>
            <div
              onClick={() => document.getElementById('resume-file-input')?.click()}
              className="border-2 border-dashed border-indigo-500/30 hover:border-cyan-400/60 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-[#0b1222]/40 hover:bg-[#0b1222]/70 group"
            >
              <input
                id="resume-file-input"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-bold text-base text-white">
                {file ? (
                  <span className="text-cyan-300 flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" /> {file.name}
                  </span>
                ) : (
                  'Click to select or drag and drop your resume file'
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {file
                  ? `Selected file size: ${(file.size / 1024).toFixed(1)} KB • Click to choose a different file`
                  : 'Supports standard PDF, DOCX, or TXT up to 10MB'}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Paste Resume Text</label>
              <button
                type="button"
                onClick={loadSampleResume}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold"
              >
                Fill with Sample Student Resume
              </button>
            </div>
            <textarea
              rows={8}
              placeholder="Paste your education, skills, projects, and work experience here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full bg-[#111a30] border border-white/10 rounded-xl p-4 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-[11px] text-slate-400">
            {apiKey ? (
              <span className="text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI Vision Engine Enabled (Google Gemini)
              </span>
            ) : parsedData && !loading ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Latest resume intelligence verified & cached
              </span>
            ) : (
              '100% Client-Safe • Dynamic skill categorization & project analysis'
            )}
          </div>

          <button
            onClick={handleParse}
            disabled={loading || (mode === 'upload' && !file) || (mode === 'paste' && !pastedText.trim())}
            className="w-full sm:w-auto px-8 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                {loadingStep === 1
                  ? 'Reading Document Text...'
                  : loadingStep === 2
                  ? 'Extracting Skills & Projects...'
                  : 'Synthesizing Career Intelligence...'}
              </>
            ) : (
              <>
                ⚡ Parse & Extract Structured Data <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── 2. Extracted Output Results Showcase ────────────────── */}
      {parsedData && (
        <div ref={resultsRef} className="space-y-6 animate-in fade-in duration-500">
          {/* Extraction Success Banner */}
          <div className="glass-panel p-6 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-[#0b1222] to-cyan-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  Verified Extraction • {uploadMeta?.provider || 'CareerX Intelligence Engine'}
                </div>
                <h2 className="font-heading font-bold text-xl text-white">
                  Resume Intelligence Successfully Processed
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Extracted <span className="text-cyan-400 font-bold">{parsedData.technicalSkills?.length || 0} skills</span>,{' '}
                  <span className="text-purple-400 font-bold">{parsedData.projects?.length || 0} projects</span>, and verified education profile.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" /> View Command Center
              </Link>
              <button
                onClick={() => {
                  setFile(null);
                  setPastedText('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-upload
              </button>
            </div>
          </div>

          {/* Candidate Profile Details Card */}
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Candidate Profile</span>
                <h3 className="font-heading font-bold text-lg text-white">Extracted Identity & Education</h3>
              </div>
              {uploadMeta?.fileName && (
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" /> {uploadMeta.fileName}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Name & Contact */}
              <div className="p-4 rounded-xl bg-[#070b14]/80 border border-white/5 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-cyan-400" /> Candidate Name
                </span>
                <div className="font-heading font-bold text-base text-white">
                  {parsedData.personalInfo?.name || 'Dhruvila'}
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  {parsedData.personalInfo?.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{parsedData.personalInfo.email}</span>
                    </div>
                  )}
                  {parsedData.personalInfo?.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>{parsedData.personalInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Degree & Field */}
              <div className="p-4 rounded-xl bg-[#070b14]/80 border border-white/5 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Degree & Branch
                </span>
                <div className="font-heading font-bold text-base text-white">
                  {parsedData.education?.degree || 'B.Tech'}
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {parsedData.education?.fieldOfStudy || 'Computer Science & Engineering'}
                </p>
              </div>

              {/* Institution */}
              <div className="p-4 rounded-xl bg-[#070b14]/80 border border-white/5 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" /> College / University
                </span>
                <div className="font-heading font-bold text-sm text-white line-clamp-2">
                  {parsedData.education?.institution || 'Dharmsinh Desai University'}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Grad: {parsedData.education?.gradYear || '2026'}</span>
                  {parsedData.education?.gpa && (
                    <span className="text-cyan-400 font-bold font-mono">• CGPA: {parsedData.education.gpa}</span>
                  )}
                </div>
              </div>

              {/* Career Readiness Impact */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 space-y-2">
                <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> Readiness Impact
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-extrabold text-2xl text-cyan-300">
                    {uploadMeta?.preliminaryReadiness?.overallScore || 73}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ 100 Index</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Profile Completeness: {uploadMeta?.completenessPercent || 100}%
                </p>
              </div>
            </div>
          </div>

          {/* Career Matches from Resume Card */}
          {uploadMeta?.careerMatches && uploadMeta.careerMatches.length > 0 && (
            <div className="glass-panel p-6 sm:p-8 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">Role Alignment</span>
                  <h3 className="font-heading font-bold text-lg text-white">Top Target Roles Unlocked</h3>
                </div>
                <span className="text-xs text-slate-400">Derived from verified resume skills & projects</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {uploadMeta.careerMatches.map((m: any) => (
                  <div
                    key={m.careerId}
                    className="p-4 rounded-xl bg-[#070b14]/90 border border-white/10 hover:border-cyan-500/40 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{m.icon || '🚀'}</span>
                        <h4 className="font-heading font-bold text-sm text-white">{m.title}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                        {m.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{m.whyRecommended}</p>
                    {m.whatsMissing && (
                      <div className="pt-1">
                        <span className="text-[10px] uppercase font-mono text-slate-400">Next Growth Gaps:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(Array.isArray(m.whatsMissing) ? m.whatsMissing : JSON.parse(m.whatsMissing || '[]'))
                            .slice(0, 2)
                            .map((gap: string) => (
                              <span
                                key={gap}
                                className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20"
                              >
                                {gap}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Skills Extraction View */}
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Skills Intelligence</span>
                <h3 className="font-heading font-bold text-lg text-white">Extracted Technical Skills</h3>
              </div>

              {/* Domain Filter Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {domainTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveDomainTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeDomainTab === tab
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 border'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {displayedSkills.map((s: string) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:scale-105 hover:bg-cyan-500/25 transition-all cursor-default flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" /> {s}
                </span>
              ))}
            </div>
          </div>

          {/* Projects View */}
          {parsedData.projects?.length > 0 && (
            <div className="glass-panel p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">Verified Portfolio</span>
                  <h3 className="font-heading font-bold text-lg text-white">Extracted Projects</h3>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
                  {parsedData.projects.length} Projects Identified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {parsedData.projects.map((p: any, i: number) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#070b14]/80 border border-white/10 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-heading font-bold text-sm text-white">{p.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex-shrink-0">
                        {p.domain || 'Software & Web'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                      {p.technologies?.map((t: string) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications View */}
          {parsedData.certifications?.length > 0 && (
            <div className="glass-panel p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Credentials</span>
                  <h3 className="font-heading font-bold text-lg text-white">Extracted Certifications</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parsedData.certifications.map((c: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-heading font-bold text-xs text-white">{c.name}</h5>
                      <span className="text-[11px] text-slate-400">{c.platform || 'Industry Verified'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Initial Interest Estimate Distribution */}
          {parsedData.initialInterestEstimate && (
            <div className="glass-panel p-6 sm:p-8 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Domain Orientation</span>
                  <h3 className="font-heading font-bold text-lg text-white">
                    Initial Domain Interest Distribution
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Derived from resume evidence</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(parsedData.initialInterestEstimate).map(([domain, score]: [string, any]) => (
                  <div key={domain} className="bg-[#070b14]/80 p-3 rounded-xl border border-white/5 text-center space-y-1">
                    <div className="text-xs text-slate-400 truncate">{domain}</div>
                    <div className="font-mono font-bold text-lg text-cyan-400">{score}%</div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── 3. Dynamic Resume Questions Section ─────────────────── */}
      {questions.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 space-y-6 animate-in fade-in duration-500">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Adaptive Verification</span>
              <h2 className="font-heading font-bold text-xl text-white mt-0.5">
                Questions Tailored to Your Extracted Resume
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Answer these questions to calibrate your domain interest alignment and unlock your full assessment score.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold self-start">
              {Object.keys(answers).length} / {questions.length} Answered
            </span>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id || idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] font-mono uppercase font-bold text-purple-400">
                    {q.category} • Related to {q.relatedItem}
                  </span>
                </div>
                <h4 className="font-heading font-semibold text-sm text-white leading-relaxed">{q.questionText}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options?.map((opt: string) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`p-3.5 rounded-xl text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                            : 'bg-[#111a30]/80 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                        } border`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <span className="text-xs text-slate-400">
              {Object.keys(answers).length === questions.length
                ? 'All questions completed! Ready to save.'
                : `Please select an answer for all ${questions.length} questions.`}
            </span>

            <button
              onClick={handleSubmitQuestions}
              disabled={submittingAnswers || Object.keys(answers).length < questions.length}
              className="w-full sm:w-auto px-8 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {submittingAnswers ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Saving Responses...
                </>
              ) : (
                <>
                  Save & Proceed to Full Assessment <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
