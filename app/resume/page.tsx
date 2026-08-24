'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Code2, Trophy, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResumePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingAnswers, setSubmittingAnswers] = useState(false);

  useEffect(() => {
    fetchExistingResume();
  }, []);

  const fetchExistingResume = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.user?.resumeData?.parsed) {
          setParsedData(json.user.resumeData.parsed);
          fetchQuestions();
        }
      }
    } catch {}
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

  const handleParse = async () => {
    setError('');
    setLoading(true);

    try {
      let res: Response;
      if (mode === 'upload' && file) {
        const formData = new FormData();
        formData.append('resume', file);
        res = await fetch('/api/resume/parse', {
          method: 'POST',
          body: formData,
        });
      } else if (mode === 'paste' && pastedText.trim()) {
        res = await fetch('/api/resume/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: pastedText }),
        });
      } else {
        setError('Please choose a file or paste your resume text.');
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setParsedData(data.parsed);
        fetchQuestions();
      } else {
        setError(data.error || 'Failed to parse resume.');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (qId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmitQuestions = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions to complete this section.');
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
        setError('Failed to submit question answers.');
      }
    } catch {
      setError('Submission error.');
    } finally {
      setSubmittingAnswers(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Resume Intelligence Engine
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-white">
          Resume Parsing & <span className="text-gradient">Skill Extraction</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload your real resume to extract verified skills, projects, and certifications without manual data entry.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* ─── 1. Upload / Paste Card ─────────────────────────────── */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="flex gap-3 border-b border-white/10 pb-4">
          <button
            onClick={() => setMode('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'upload' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            📁 Upload PDF / DOCX File
          </button>
          <button
            onClick={() => setMode('paste')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'paste' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Paste Plaintext Resume
          </button>
        </div>

        {mode === 'upload' ? (
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
              {file ? file.name : 'Click to select or drag and drop your resume file'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, or TXT up to 10MB</p>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Paste Resume Text</label>
            <textarea
              rows={8}
              placeholder="Paste your education, skills, projects, and work experience here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full bg-[#111a30] border border-white/10 rounded-xl p-4 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleParse}
            disabled={loading || (mode === 'upload' && !file) || (mode === 'paste' && !pastedText.trim())}
            className="px-8 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Extracting Real Skills & Projects...
              </>
            ) : (
              <>
                ⚡ Parse & Extract Structured Data <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── 2. Extracted Results Display ────────────────────────── */}
      {parsedData && (
        <div className="glass-panel p-6 sm:p-8 space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Extraction Verified</span>
              <h2 className="font-heading font-bold text-xl text-white">Extracted Profile Intelligence</h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
              ✓ {parsedData.technicalSkills?.length || 0} Skills Detected
            </span>
          </div>

          {/* Initial Interest Estimate Warning Label */}
          {parsedData.initialInterestEstimate && (
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-cyan-300">
                  Initial Interest Estimate (Derived from Resume Evidence)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Not final • Adjusted by assessment</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(parsedData.initialInterestEstimate).map(([domain, score]: [string, any]) => (
                  <div key={domain} className="bg-[#070b14]/80 p-2.5 rounded-lg border border-white/5 text-center">
                    <div className="text-[11px] text-slate-400 truncate">{domain}</div>
                    <div className="font-mono font-bold text-base text-cyan-400 mt-0.5">{score}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Skills Badges */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-cyan-400" /> Extracted Technical Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {parsedData.technicalSkills?.map((s: string) => (
                <span key={s} className="px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Extracted Projects */}
          {parsedData.projects?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" /> Extracted Projects
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {parsedData.projects.map((p: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between items-start">
                      <h5 className="font-heading font-bold text-sm text-white">{p.name}</h5>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                        {p.domain}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.technologies?.map((t: string) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                          {t}
                        </span>
                      ))}
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
          <div className="border-b border-white/10 pb-4">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Personalized Questions</span>
            <h2 className="font-heading font-bold text-xl text-white mt-0.5">
              Conditioned on Your Specific Resume Content
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              These questions were synthesized directly from your extracted skills and projects.
            </p>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id || idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] font-mono uppercase font-bold text-purple-400">
                    {q.category} • Related to {q.relatedItem}
                  </span>
                </div>
                <h4 className="font-heading font-semibold text-sm text-white">{q.questionText}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options?.map((opt: string) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`p-3 rounded-xl text-left text-xs font-medium transition-all ${
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

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              onClick={handleSubmitQuestions}
              disabled={submittingAnswers}
              className="px-8 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              {submittingAnswers ? 'Submitting Answers...' : 'Save & Proceed to Full Assessment →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
