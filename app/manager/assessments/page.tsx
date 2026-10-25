'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  Code,
  Flame,
  Cpu,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function ManagerAssessmentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [passFilter, setPassFilter] = useState<'all' | 'true' | 'false'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'attempts' | 'questions'>('attempts');

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (passFilter !== 'all') params.set('passed', passFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/manager/assessments?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load assessment analytics (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading assessment analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [passFilter, search]);

  const handleToggleRetake = async (attemptId: string, currentAllow: boolean) => {
    try {
      setTogglingId(attemptId);
      const res = await fetch(`/api/manager/assessments/${attemptId}/retake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowRetake: !currentAllow }),
      });

      if (res.ok) {
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            attempts: prev.attempts.map((a: any) =>
              a.id === attemptId ? { ...a, allowRetake: !currentAllow } : a
            ),
          };
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleExportCSV = () => {
    if (!data?.attempts) return;
    const headers = ['Learner Name', 'Email', 'Assessment Type', 'Score', 'Status', 'Time Taken (s)', 'Allow Retake', 'Date'];
    const rows = data.attempts.map((a: any) => [
      `"${a.userName}"`,
      `"${a.userEmail}"`,
      `"${a.assessmentType}"`,
      a.score,
      a.passed ? 'PASSED' : 'FAILED',
      a.timeTakenSec,
      a.allowRetake ? 'YES' : 'NO',
      `"${new Date(a.createdAt).toISOString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `careerx-assessments-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
            <Link href="/manager" className="hover:text-cyan-400 transition-colors">
              Manager Console
            </Link>
            <span>/</span>
            <span className="text-cyan-400">Diagnostic Assessments</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-white flex items-center gap-3">
            <FileCheck2 className="w-7 h-7 text-cyan-400" />
            Assessment Submissions & <span className="text-gradient">Question Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track student diagnostic attempts, examine first-vs-latest score deltas, and analyze high-error questions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchAssessments}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Submissions</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-white">
            {data?.totalAttempts ?? '...'}
          </div>
          <p className="text-[11px] text-slate-400">Diagnostic evaluations</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">Cohort Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-emerald-300">
            {data?.passRate ?? '...'}%
          </div>
          <p className="text-[11px] text-emerald-400 font-mono">Passing threshold: ≥ 60%</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Cohort Mean Score</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-purple-300">
            {data?.avgScore ?? '...'} / 100
          </div>
          <p className="text-[11px] text-slate-400">Composite diagnostic score</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">Skill Averages</span>
            <Brain className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-[11px] font-mono space-y-0.5 text-slate-300">
            <div className="flex justify-between">
              <span>Tech: <strong className="text-white">{data?.skillAverages?.tech ?? 0}%</strong></span>
              <span>Aptitude: <strong className="text-white">{data?.skillAverages?.aptitude ?? 0}%</strong></span>
            </div>
            <div className="flex justify-between">
              <span>Problem: <strong className="text-white">{data?.skillAverages?.problemSolving ?? 0}%</strong></span>
              <span>Mind: <strong className="text-white">{data?.skillAverages?.mindGames ?? 0}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('attempts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'attempts'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Attempt History & Retake Control</span>
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Question-Level Analytics (Most Missed)</span>
        </button>
      </div>

      {/* ─── TAB 1: ATTEMPTS LIST & RETAKE CONTROLS ─────────────── */}
      {activeTab === 'attempts' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#070b14] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
              {(['all', 'true', 'false'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPassFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    passFilter === opt
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt === 'all' ? 'All Attempts' : opt === 'true' ? 'Passed (≥60%)' : 'Failed (<60%)'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading && !data ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              <span className="text-xs text-slate-400 font-mono">Loading attempts...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          ) : data?.attempts?.length === 0 ? (
            <div className="h-48 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <FileCheck2 className="w-6 h-6 text-slate-500" />
              <span>No assessment attempts found.</span>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar border border-white/10 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0b1222] border-b border-white/10 text-slate-400 font-mono">
                    <th className="p-3.5">Learner</th>
                    <th className="p-3.5">Assessment Type</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5">Trajectory (First vs Latest)</th>
                    <th className="p-3.5">Section Breakdown</th>
                    <th className="p-3.5">Time Spent</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right">Retake Permission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {data.attempts.map((a: any) => (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{a.userName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{a.userEmail}</div>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-300">
                        {a.assessmentType}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-xs font-bold border ${
                              a.passed
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {a.score}%
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {a.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-[11px]">
                        {a.improvement ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">{a.improvement.firstScore}%</span>
                            <span className="text-slate-500">→</span>
                            <span className="text-white font-bold">{a.improvement.latestScore}%</span>
                            <span
                              className={`ml-1 font-bold ${
                                a.improvement.diff > 0
                                  ? 'text-emerald-400'
                                  : a.improvement.diff < 0
                                  ? 'text-rose-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              ({a.improvement.diff > 0 ? `+${a.improvement.diff}` : a.improvement.diff}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">Initial Attempt</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="text-[10px] font-mono space-y-0.5 text-slate-400">
                          <div>Tech: <span className="text-white">{a.techScore ? Math.round(a.techScore) : 0}%</span></div>
                          <div>Apt: <span className="text-white">{a.aptitudeScore}%</span> • Prob: <span className="text-white">{a.problemSolvingScore}%</span></div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-300">
                        {Math.floor(a.timeTakenSec / 60)}m {a.timeTakenSec % 60}s
                      </td>

                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(a.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleRetake(a.id, a.allowRetake)}
                          disabled={togglingId === a.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto ${
                            a.allowRetake
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/40 hover:bg-rose-500/25'
                          }`}
                        >
                          {a.allowRetake ? (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>Retake Allowed</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Retake Blocked</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: QUESTION-LEVEL ANALYTICS (MOST MISSED) ──────── */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div>
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Most-Missed Question Breakdown Across Cohort
              </h3>
              <p className="text-xs text-slate-400">
                Identifies cognitive bottlenecks and concepts where students repeatedly pick suboptimal answers.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {data?.questionAnalytics?.map((q: any, idx: number) => (
                <div
                  key={q.questionId}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-mono font-bold text-xs text-white">
                        #{idx + 1}
                      </span>
                      <span className="font-heading font-bold text-sm text-white">{q.title}</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono">
                        {q.section}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">
                        {q.wrongCount} / {q.totalAttempts} Missed
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                          q.missRate >= 60
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : q.missRate >= 40
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {q.missRate}% Error Rate
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        q.missRate >= 60 ? 'bg-rose-500' : q.missRate >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${q.missRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
