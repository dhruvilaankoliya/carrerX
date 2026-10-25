'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Network,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import ForceGraph from '@/components/ForceGraph';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export default function ManagerSkillGraphPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [compareUserId, setCompareUserId] = useState<string>('');
  const [activeView, setActiveView] = useState<'overview' | 'individual' | 'heatmap'>('overview');

  const fetchSkillGraphData = async (userToSelect?: string, userToCompare?: string) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (userToSelect) params.set('userId', userToSelect);
      if (userToCompare) params.set('compareUserId', userToCompare);

      const res = await fetch(`/api/manager/skill-graph?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load skill graph analytics (${res.status})`);
      }
      const json = await res.json();
      setData(json);
      if (!selectedUserId && json.studentsList?.length > 0) {
        setSelectedUserId(json.studentsList[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading skill graph analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillGraphData(selectedUserId, compareUserId);
  }, [selectedUserId, compareUserId]);

  const getHeatmapColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40';
    if (score >= 70) return 'bg-cyan-500/25 text-cyan-300 border-cyan-500/30';
    if (score >= 50) return 'bg-amber-500/25 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/25 text-rose-300 border-rose-500/30';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
            <Link href="/manager" className="hover:text-cyan-400 transition-colors">
              Manager Console
            </Link>
            <span>/</span>
            <span className="text-cyan-400">Skill Graph Intelligence</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-white flex items-center gap-3">
            <Network className="w-7 h-7 text-cyan-400" />
            Team Skill Graph & <span className="text-gradient">Competency Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated team strength, users × skills heatmap, peer benchmarking, and weak skill trends.
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 self-start md:self-center">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'overview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Team Strength & Trends
          </button>
          <button
            onClick={() => setActiveView('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'heatmap'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Users × Skills Heatmap
          </button>
          <button
            onClick={() => setActiveView('individual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'individual'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Graph & Peer Compare
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            {error}
          </div>
          <button
            onClick={() => fetchSkillGraphData(selectedUserId, compareUserId)}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !data && (
        <div className="h-96 rounded-2xl bg-[#0b1222] border border-white/10 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Synthesizing team graph competencies...</p>
        </div>
      )}

      {/* ─── VIEW 1: TEAM OVERVIEW & TRENDS ─────────────────────── */}
      {data && activeView === 'overview' && (
        <div className="space-y-6">
          {/* Top 5 Weak Skills Alert Banner */}
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-white">Top 5 Critical Skill Gaps Across Team</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  These engineering competencies currently exhibit the lowest validated mastery across learners.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.topWeakSkills?.map((ws: any) => (
                    <span
                      key={ws.skill}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[11px] font-mono font-bold"
                    >
                      {ws.skill} ({ws.avgScore}%)
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/manager/roadmap"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-amber-500/20 whitespace-nowrap self-start md:self-center flex items-center gap-1.5"
            >
              <span>Assign Curricula</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Average Skill Strength Bar Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Team Average Skill Strength
                  </h3>
                  <p className="text-xs text-slate-400">Mean proficiency index aggregated across active learners</p>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
                  {data.teamAverageSkills?.length || 0} Competencies
                </span>
              </div>

              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.teamAverageSkills?.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="skill"
                      stroke="#94a3b8"
                      width={120}
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
                      formatter={(val: any) => [`${val}% Strength`, 'Score']}
                    />
                    <Bar dataKey="avgScore" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Improvement Trend Over Time Line Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Competency Improvement Trend (4 Weeks)
                  </h3>
                  <p className="text-xs text-slate-400">Progression velocity of team average and vulnerable gaps</p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30">
                  +14% MoM
                </span>
              </div>

              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.skillTrends} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={[20, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#070b14',
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#fff',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Team Overall" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} />
                    {data.topWeakSkills?.slice(0, 3).map((ws: any, idx: number) => {
                      const colors = ['#f43f5e', '#f59e0b', '#8b5cf6'];
                      return (
                        <Line
                          key={ws.skill}
                          type="monotone"
                          dataKey={ws.skill}
                          stroke={colors[idx % colors.length]}
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={{ r: 3 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW 2: USERS × SKILLS HEATMAP ──────────────────────── */}
      {data && activeView === 'heatmap' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Learner × Skill Proficiency Matrix (Heatmap)
              </h3>
              <p className="text-xs text-slate-400">
                Granular competency ratings across all active cohort members. Green = Mastery (85%+), Cyan = Solid (70%+), Amber = Developing (50%+), Rose = Gap (&lt;50%).
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">85%+</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">70%+</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">50%+</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">&lt;50%</span>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar border border-white/10 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0b1222] border-b border-white/10 text-slate-400 font-mono">
                  <th className="p-3 sticky left-0 bg-[#0b1222] z-10 w-44">Learner</th>
                  {data.standardSkills?.map((skill: string) => (
                    <th key={skill} className="p-3 whitespace-nowrap text-center font-semibold text-slate-300 min-w-[100px]">
                      {skill}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {data.usersSkillsHeatmap?.map((u: any) => (
                  <tr key={u.userId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 sticky left-0 bg-[#070b14] z-10 font-sans">
                      <button
                        onClick={() => {
                          setSelectedUserId(u.userId);
                          setActiveView('individual');
                        }}
                        className="text-left font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>{u.userName}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </button>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{u.email}</div>
                    </td>
                    {data.standardSkills?.map((skill: string) => {
                      const score = u.skills[skill] || 0;
                      return (
                        <td key={skill} className="p-2 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${getHeatmapColor(
                              score
                            )}`}
                          >
                            {score}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── VIEW 3: INDIVIDUAL STUDENT GRAPH & PEER COMPARE ────────── */}
      {data && activeView === 'individual' && (
        <div className="space-y-6">
          {/* User Selectors Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Primary User Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Primary Student:</span>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="bg-[#070b14] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans cursor-pointer"
                >
                  {data.studentsList?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Compare With User Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Compare With Peer:</span>
                <select
                  value={compareUserId}
                  onChange={(e) => setCompareUserId(e.target.value)}
                  className="bg-[#070b14] border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400 font-sans cursor-pointer"
                >
                  <option value="">None (Compare vs Target Role Benchmark)</option>
                  {data.studentsList
                    ?.filter((s: any) => s.id !== selectedUserId)
                    .map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {data.selectedUserData?.user && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Target Role:</span>
                <span className="font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                  {data.selectedUserData.user.targetCareer}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Force-Directed Graph Panel */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-400" />
                    Topology Graph: {data.selectedUserData?.user?.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Interactive canvas displaying domain connections, verified strengths, and missing skills
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Strong
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Next
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-400" /> Gap
                  </span>
                </div>
              </div>

              {data.selectedUserData?.forceGraph ? (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#070b14]">
                  <ForceGraph graphData={data.selectedUserData.forceGraph} height={460} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-xs text-slate-500">
                  No topology graph data available
                </div>
              )}
            </div>

            {/* Radar Benchmark Comparison */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Role Fit Radar & Benchmark
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {compareUserId
                    ? `Comparing ${data.selectedUserData?.user?.name} vs ${data.compareUserData?.user?.name}`
                    : `Comparing ${data.selectedUserData?.user?.name} vs ${data.selectedUserData?.user?.targetCareer} Industry Benchmark`}
                </p>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      data={data.compareUserData?.radarComparison || data.selectedUserData?.radarComparison}
                    >
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" tick={false} />
                      <Radar
                        name={data.selectedUserData?.user?.name || 'Student'}
                        dataKey="userScore"
                        stroke="#06b6d4"
                        fill="#06b6d4"
                        fillOpacity={0.4}
                      />
                      {compareUserId ? (
                        <Radar
                          name={data.compareUserData?.user?.name || 'Peer'}
                          dataKey="peerScore"
                          stroke="#a855f7"
                          fill="#a855f7"
                          fillOpacity={0.3}
                        />
                      ) : (
                        <Radar
                          name="Role Benchmark"
                          dataKey="benchmark"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.2}
                        />
                      )}
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#070b14',
                          borderColor: 'rgba(255,255,255,0.15)',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                          color: '#fff',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Action */}
              <div className="pt-4 border-t border-white/10">
                <Link
                  href={`/manager/users/${selectedUserId}`}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect Student Comprehensive Dossier</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
