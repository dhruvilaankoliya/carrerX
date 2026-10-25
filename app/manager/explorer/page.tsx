'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Eye,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
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

export default function ManagerExplorerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExplorerAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/manager/explorer');
      if (!res.ok) {
        throw new Error(`Failed to load explorer telemetry (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading explorer telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplorerAnalytics();
  }, []);

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
            <span className="text-cyan-400">Career Explorer Telemetry</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-white flex items-center gap-3">
            <Compass className="w-7 h-7 text-cyan-400" />
            Explorer Searches & <span className="text-gradient">Curriculum Funnel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze market interests, search intent, zero-result keyword bottlenecks, and the 3-stage study funnel.
          </p>
        </div>

        <button
          onClick={fetchExplorerAnalytics}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold self-start md:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ─── SECTION 1: 3-STAGE CONVERSION FUNNEL ─────────────────── */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Explorer to Verified Study Funnel
            </h3>
            <p className="text-xs text-slate-400">
              Tracking user actions from taxonomy discovery to outbound resource reading and completion logging.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-400">
              End-to-End Conversion:{' '}
              <strong className="text-emerald-400 text-sm">
                {data?.funnelSummary?.overallConversionRate ?? 0}%
              </strong>
            </span>
          </div>
        </div>

        {/* Funnel Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {data?.funnel?.map((stage: any, idx: number) => {
            const icons = [Compass, BookOpen, CheckCircle2];
            const colors = ['border-cyan-500/40 text-cyan-300', 'border-blue-500/40 text-blue-300', 'border-emerald-500/40 text-emerald-300'];
            const StageIcon = icons[idx] || Compass;

            return (
              <div
                key={stage.stage}
                className={`p-5 rounded-2xl bg-white/5 border ${colors[idx]} relative space-y-3 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase font-bold text-slate-400">
                      Stage {idx + 1}
                    </span>
                    <StageIcon className="w-4 h-4" />
                  </div>
                  <h4 className="font-heading font-bold text-base text-white mt-1">{stage.stage}</h4>
                  <p className="text-xs text-slate-400 mt-1">{stage.description}</p>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-baseline justify-between">
                    <span className="font-heading font-extrabold text-2xl text-white">
                      {stage.count}
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {stage.conversionRate}% of top
                    </span>
                  </div>
                  {idx > 0 && (
                    <div className="text-[10px] font-mono text-rose-400 mt-1">
                      Drop-off: {stage.dropOffRate}% from previous stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── SECTION 2: POPULAR SEARCHED / EXPLORED ROLES ─────────── */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Most-Explored Engineering Specializations
              </h3>
              <p className="text-xs text-slate-400">Target roles learners are viewing in the explorer</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 font-bold px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
              Taxonomy Views
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.popularRoles?.slice(0, 6)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="title"
                  stroke="#94a3b8"
                  width={140}
                  tick={{ fontSize: 11, fill: '#cbd5e1' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070b14',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`${val} Views`, 'Explored']}
                />
                <Bar dataKey="views" fill="#38bdf8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── SECTION 3: POPULAR SEARCHED SKILLS & KEYWORDS ───────── */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                Popular Searched Skills & Keywords
              </h3>
              <p className="text-xs text-slate-400">Top keywords queried in the Career Explorer search bar</p>
            </div>
            <span className="text-[11px] font-mono text-purple-400 font-bold px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30">
              Search Volume
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {data?.popularSkills?.map((s: any, idx: number) => (
              <div
                key={s.skill}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-mono font-bold text-[11px] text-slate-300">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-white">{s.skill}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden hidden sm:block">
                    <div
                      className="h-full rounded-full bg-purple-400"
                      style={{
                        width: `${Math.min(100, Math.round((s.count / (data.popularSkills[0]?.count || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-slate-400 font-semibold">{s.count} searches</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SECTION 4: ZERO-RESULT SEARCH QUERIES (CONTENT GAPS) ── */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Zero-Result Search Queries (Curriculum Content Gaps)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Queries submitted by learners that yielded 0 matches in the taxonomy or resource catalog. Use this data to add new study material.
            </p>
          </div>
          <span className="text-[11px] font-mono text-rose-300 font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40">
            {data?.zeroResultQueries?.length || 0} Unmatched Queries
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {data?.zeroResultQueries?.map((zq: any) => (
            <div
              key={zq.query}
              className="p-3.5 rounded-xl bg-[#070b14]/80 border border-rose-500/30 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-rose-300">
                  {zq.count} Missing Result{zq.count > 1 ? 's' : ''}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(zq.lastSearched).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="font-heading font-bold text-sm text-white truncate" title={zq.query}>
                "{zq.query}"
              </div>
              <p className="text-[11px] text-slate-400">
                Action: Add curated study materials or taxonomy tag.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
