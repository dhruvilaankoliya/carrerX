'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, Brain, Code, Cpu, Flame } from 'lucide-react';

export default function AssessmentPage() {
  const router = useRouter();
  const [section, setSection] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Assessment State
  const [techAnswers, setTechAnswers] = useState<Record<string, number>>({
    'AI & Data': 4,
    'Software & Web': 3,
    'Cloud & DevOps': 3,
    'Cyber & Security': 2,
    'Product & Management': 2,
  });

  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<string, string>>({});
  const [problemAnswers, setProblemAnswers] = useState<Record<string, string>>({});
  const [mindGameAnswers, setMindGameAnswers] = useState<Record<string, string>>({});

  // ─── Section A: Technical Domain Questions ─────────────────
  const techQuestions = [
    { domain: 'AI & Data', title: 'Machine Learning & Neural Architectures', desc: 'Training neural networks, vector embedding pipelines, and generative models' },
    { domain: 'Software & Web', title: 'High-Scale Systems & Microservices', desc: 'Distributed web APIs, concurrency, caching, and clean software architecture' },
    { domain: 'Cloud & DevOps', title: 'Cloud Infrastructure & Kubernetes', desc: 'Automating multi-cluster deployments, CI/CD pipelines, and observability' },
    { domain: 'Cyber & Security', title: 'Defensive Security & Threat Hunting', desc: 'Application vulnerability scanning, network defense, and cryptography' },
    { domain: 'Product & Management', title: 'Technical Product Strategy', desc: 'Defining customer requirements, PRDs, ROI, and agile engineering alignment' },
  ];

  // ─── Section B: Aptitude Questions ──────────────────────────
  const aptitudeQuestions = [
    {
      id: 'apt_1',
      question: 'A microservice cluster experiences a 3x traffic spike. If each pod processes 120 req/sec and you have 4 pods running, how many additional pods must auto-scale to handle 960 req/sec total?',
      options: ['2 additional pods', '4 additional pods', '6 additional pods', '8 additional pods'],
      correct: '4 additional pods',
    },
    {
      id: 'apt_2',
      question: 'Identify the next term in the algorithmic scaling sequence: 2, 8, 32, 128, ?',
      options: ['256', '512', '1024', '4096'],
      correct: '512',
    },
    {
      id: 'apt_3',
      question: 'If Algorithm A is O(N log N) and Algorithm B is O(N^2), for an input array of N = 100,000 elements, which approach will complete faster?',
      options: ['Algorithm A by a massive margin', 'Algorithm B due to caching', 'Both execute in identical clock cycles', 'Depends strictly on CPU frequency'],
      correct: 'Algorithm A by a massive margin',
    },
  ];

  // ─── Section C: Problem Solving Puzzles & Debugging ──────────
  const problemQuestions = [
    {
      id: 'prob_1',
      title: 'Bug Diagnostic: Async Concurrency Race Condition',
      snippet: `async function fetchUserData(userId) {
  let cache = {};
  if (!cache[userId]) {
    cache[userId] = await api.getUser(userId); // Race condition on concurrent calls!
  }
  return cache[userId];
}`,
      question: 'What is the most robust fix for the concurrency race condition in this snippet?',
      options: [
        'Store the in-flight Promise in the cache map before awaiting resolution',
        'Wrap the API call in a synchronous while-loop',
        'Remove the cache and fetch directly on every request',
        'Add a 500ms setTimeout before checking the cache',
      ],
      correct: 'Store the in-flight Promise in the cache map before awaiting resolution',
    },
    {
      id: 'prob_2',
      title: 'System Design Optimization',
      snippet: `Goal: Reduce database query latency for top-viewed product pages under 50,000 QPS.`,
      question: 'Which architecture pattern achieves the highest throughput with sub-millisecond response time?',
      options: [
        'Add an in-memory Redis cluster with cache-aside and TTL invalidation',
        'Add more SQL read replicas with complex multi-table joins',
        'Compress SQL table data with gzip',
        'Run database queries inside background cron jobs',
      ],
      correct: 'Add an in-memory Redis cluster with cache-aside and TTL invalidation',
    },
  ];

  // ─── Section D: Mind Games & Pattern Analysis ────────────────
  const mindGameQuestions = [
    {
      id: 'game_1',
      title: 'Pattern Matching: Tensor Matrix Dimensionality',
      question: 'A batch tensor has shape (B, S, H) = (32, 512, 768). After self-attention projection with 12 heads, what is the shape per head?',
      options: ['(32, 12, 512, 64)', '(32, 512, 12, 768)', '(384, 512, 64)', '(32, 12, 64, 512)'],
      correct: '(32, 12, 512, 64)',
    },
    {
      id: 'game_2',
      title: 'Strategic Decision Under Uncertainty',
      question: 'Your machine learning model achieves 99.1% training accuracy but drops to 74.3% on out-of-distribution validation data. What is your primary corrective action?',
      options: [
        'Apply Dropout, weight decay regularization, and data augmentation',
        'Increase model parameter size by 4x',
        'Train for 50 additional epochs without early stopping',
        'Remove validation split and train on 100% of available data',
      ],
      correct: 'Apply Dropout, weight decay regularization, and data augmentation',
    },
  ];

  const handleSubmitAll = async () => {
    setLoading(true);
    setError('');

    try {
      // Calculate normalized scores
      const techInterestScores: Record<string, number> = {};
      Object.entries(techAnswers).forEach(([k, v]) => {
        techInterestScores[k] = Math.round((v / 5) * 100);
      });

      // Aptitude Score
      let aptCorrect = 0;
      aptitudeQuestions.forEach((q) => {
        if (aptitudeAnswers[q.id] === q.correct) aptCorrect++;
      });
      const aptitudeScore = Math.round((aptCorrect / aptitudeQuestions.length) * 100) || 75;

      // Problem Solving Score
      let probCorrect = 0;
      problemQuestions.forEach((q) => {
        if (problemAnswers[q.id] === q.correct) probCorrect++;
      });
      const problemSolvingScore = Math.round((probCorrect / problemQuestions.length) * 100) || 80;

      // Mind Games Score
      let gameCorrect = 0;
      mindGameQuestions.forEach((q) => {
        if (mindGameAnswers[q.id] === q.correct) gameCorrect++;
      });
      const mindGamesScore = Math.round((gameCorrect / mindGameQuestions.length) * 100) || 80;

      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techInterestScores,
          aptitudeScore,
          problemSolvingScore,
          mindGamesScore,
          rawResponses: [
            ...Object.entries(aptitudeAnswers).map(([k, v]) => ({ section: 'APTITUDE', questionId: k, rawAnswer: v })),
            ...Object.entries(problemAnswers).map(([k, v]) => ({ section: 'PROBLEM_SOLVING', questionId: k, rawAnswer: v })),
            ...Object.entries(mindGameAnswers).map(([k, v]) => ({ section: 'MIND_GAMES', questionId: k, rawAnswer: v })),
          ],
        }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Submission failed.');
      }
    } catch {
      setError('Network error during assessment submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Multidimensional Career Assessment
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-white">
          Career Intelligence <span className="text-gradient">Diagnostic Engine</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete each section to unlock your pure calculated Career Readiness Score and customized 5-Phase Roadmap.
        </p>
      </div>

      {/* Disclaimer Alert */}
      <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 text-cyan-400" />
        <span>
          <strong>Disclaimer:</strong> This assessment generates a personalized <em>Career & Learning Fit Profile</em>. It is not an IQ or psychological test.
        </span>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'A', label: '1. Technical Interest', icon: Cpu },
          { id: 'B', label: '2. Cognitive Aptitude', icon: Brain },
          { id: 'C', label: '3. Problem Solving', icon: Code },
          { id: 'D', label: '4. Mind Games', icon: Flame },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
              section === s.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* ─── Section A: Technical Domain Interest ────────────────── */}
      {section === 'A' && (
        <div className="glass-panel p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">Rate Your Intellectual Curiosity (1 - 5 Stars)</h3>
            <p className="text-xs text-slate-400">Which engineering fields give you genuine technical energy?</p>
          </div>

          <div className="space-y-4">
            {techQuestions.map((q) => {
              const val = techAnswers[q.domain] || 3;
              return (
                <div key={q.domain} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="font-heading font-bold text-sm text-white">{q.title}</div>
                    <div className="text-xs text-slate-400">{q.desc}</div>
                  </div>
                  <div className="flex gap-1.5 self-end sm:self-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTechAnswers((prev) => ({ ...prev, [q.domain]: star }))}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                          star <= val
                            ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300 scale-105'
                            : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              onClick={() => setSection('B')}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              Continue to Aptitude →
            </button>
          </div>
        </div>
      )}

      {/* ─── Section B: Cognitive Aptitude ───────────────────────── */}
      {section === 'B' && (
        <div className="glass-panel p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">Logical Reasoning & Numerical Scaling</h3>
            <p className="text-xs text-slate-400">Testing analytical problem decomposition.</p>
          </div>

          <div className="space-y-6">
            {aptitudeQuestions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-[11px] font-mono uppercase font-bold text-cyan-400">Question {idx + 1} of {aptitudeQuestions.length}</div>
                <h4 className="font-heading font-semibold text-sm text-white">{q.question}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt) => {
                    const isSelected = aptitudeAnswers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAptitudeAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        className={`p-3 rounded-xl text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                            : 'bg-[#111a30]/80 border-white/10 text-slate-300 hover:bg-white/10'
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

          <div className="flex justify-between pt-4 border-t border-white/10">
            <button onClick={() => setSection('A')} className="px-5 py-2 rounded-full text-xs font-semibold text-slate-300 bg-white/5">
              ← Back
            </button>
            <button
              onClick={() => setSection('C')}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              Continue to Problem Solving →
            </button>
          </div>
        </div>
      )}

      {/* ─── Section C: Problem Solving Puzzles ──────────────────── */}
      {section === 'C' && (
        <div className="glass-panel p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">Algorithmic Debugging & Architecture Challenges</h3>
            <p className="text-xs text-slate-400">Analyze code snippets and choose the optimal architectural remedy.</p>
          </div>

          <div className="space-y-6">
            {problemQuestions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-[11px] font-mono uppercase font-bold text-purple-400">Challenge {idx + 1}: {q.title}</div>
                <pre className="p-3 rounded-xl bg-[#070b14] border border-white/10 text-cyan-300 text-xs font-mono overflow-x-auto">
                  {q.snippet}
                </pre>
                <h4 className="font-heading font-semibold text-sm text-white">{q.question}</h4>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {q.options.map((opt) => {
                    const isSelected = problemAnswers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setProblemAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        className={`p-3 rounded-xl text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-500/25 border-purple-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                            : 'bg-[#111a30]/80 border-white/10 text-slate-300 hover:bg-white/10'
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

          <div className="flex justify-between pt-4 border-t border-white/10">
            <button onClick={() => setSection('B')} className="px-5 py-2 rounded-full text-xs font-semibold text-slate-300 bg-white/5">
              ← Back
            </button>
            <button
              onClick={() => setSection('D')}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              Continue to Mind Games →
            </button>
          </div>
        </div>
      )}

      {/* ─── Section D: Mind Games & Pattern Analysis ────────────── */}
      {section === 'D' && (
        <div className="glass-panel p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">Pattern Recognition & Strategic Tradeoffs</h3>
            <p className="text-xs text-slate-400">Final section to calibrate your problem solving style score.</p>
          </div>

          <div className="space-y-6">
            {mindGameQuestions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-[11px] font-mono uppercase font-bold text-emerald-400">Mind Game {idx + 1}: {q.title}</div>
                <h4 className="font-heading font-semibold text-sm text-white">{q.question}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt) => {
                    const isSelected = mindGameAnswers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setMindGameAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        className={`p-3 rounded-xl text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-500/25 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : 'bg-[#111a30]/80 border-white/10 text-slate-300 hover:bg-white/10'
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

          <div className="flex justify-between pt-6 border-t border-white/10">
            <button onClick={() => setSection('C')} className="px-5 py-2 rounded-full text-xs font-semibold text-slate-300 bg-white/5">
              ← Back
            </button>
            <button
              onClick={handleSubmitAll}
              disabled={loading}
              className="px-8 py-3 rounded-full text-sm font-extrabold text-white bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/40 hover:scale-105 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? 'Synthesizing Your Intelligence Profile...' : '🚀 Finalize & Compute Career Intelligence Profile'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
