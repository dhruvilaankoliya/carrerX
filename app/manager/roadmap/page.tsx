'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Map,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  X,
  Target,
  SlidersHorizontal,
} from 'lucide-react';

export default function ManagerRoadmapPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'stuck' | 'behind' | 'completed'>('all');

  // Modal state for assigning / modifying roadmap
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [targetCareerId, setTargetCareerId] = useState('ml-engineer');
  const [deadline, setDeadline] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchRoadmaps = async (activeFilter: string = filter) => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/manager/roadmap?filter=${activeFilter}`);
      if (!res.ok) {
        throw new Error(`Failed to load roadmaps (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading roadmap telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps(filter);
  }, [filter]);

  const handleOpenAssignModal = (userRow: any) => {
    setSelectedUser(userRow);
    setTargetCareerId(userRow.targetCareerId || 'ml-engineer');
    setDeadline(userRow.deadline ? userRow.deadline.split('T')[0] : '');
    setModalSuccess('');
    setAssignModalOpen(true);
  };

  const handleAssignRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setAssigning(true);
      setModalSuccess('');
      const res = await fetch('/api/manager/roadmap/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.userId,
          targetCareerId,
          deadline: deadline ? new Date(deadline).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update roadmap');
      }

      setModalSuccess('Roadmap and deadline successfully updated!');
      setTimeout(() => {
        setAssignModalOpen(false);
        fetchRoadmaps(filter);
      }, 1200);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAssigning(false);
    }
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
            <span className="text-cyan-400">Roadmap Velocity</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-white flex items-center gap-3">
            <Map className="w-7 h-7 text-cyan-400" />
            Cohort Roadmap <span className="text-gradient">Progress & Milestones</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor learning velocity, detect 7-day stalled progress, assign target curricula, and adjust milestones.
          </p>
        </div>

        <button
          onClick={() => fetchRoadmaps(filter)}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all self-start md:self-center flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Learners</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-white">
            {data?.stats?.totalLearners ?? '...'}
          </div>
          <p className="text-[11px] text-slate-400">With active roadmaps</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400">Stuck (7+ Days)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-rose-300">
            {data?.stats?.stuckCount ?? '...'}
          </div>
          <p className="text-[11px] text-rose-400 font-mono">Zero activity for over 7 days</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">Behind Schedule</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-amber-300">
            {data?.stats?.behindCount ?? '...'}
          </div>
          <p className="text-[11px] text-amber-400 font-mono">Behind expected milestone date</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">Average Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-emerald-300">
            {data?.stats?.avgProgress ?? '...'}%
          </div>
          <p className="text-[11px] text-slate-400">Across all cohort phases</p>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <h3 className="font-heading font-bold text-base text-white">Learner Roadmap Assignments</h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
            {(['all', 'stuck', 'behind', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filter === tab
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
                {tab === 'stuck' && (data?.stats?.stuckCount || 0) > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[10px]">
                    {data.stats.stuckCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {loading && !data ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Loading roadmap logs...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        ) : data?.roadmaps?.length === 0 ? (
          <div className="h-48 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <CheckCircle2 className="w-6 h-6 text-slate-500" />
            <span>No roadmaps matching filter "{filter}".</span>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar border border-white/10 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0b1222] border-b border-white/10 text-slate-400 font-mono">
                  <th className="p-3.5">Learner</th>
                  <th className="p-3.5">Assigned Target Role</th>
                  <th className="p-3.5">Progress</th>
                  <th className="p-3.5">Current Milestone</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Status & Flags</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {data.roadmaps.map((r: any) => (
                  <tr key={r.userId} className="hover:bg-white/[0.02] transition-colors">
                    {/* User */}
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        {r.userName}
                        {r.isStuck && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold animate-pulse">
                            STUCK (7d+)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{r.userEmail}</div>
                    </td>

                    {/* Assigned Career */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{r.careerTitle}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Assigned by: <span className="text-cyan-400">{r.assignedBy}</span>
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="p-3.5 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="font-bold text-white">{r.progressPercent}%</span>
                        <span className="text-slate-400">
                          {r.completedStages}/{r.totalStages} Phases
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${r.progressPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* Milestone */}
                    <td className="p-3.5">
                      <div className="text-slate-300 font-medium max-w-xs truncate" title={r.currentMilestone}>
                        {r.currentMilestone}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Last Active:{' '}
                        {new Date(r.lastActivityAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Deadline */}
                    <td className="p-3.5 font-mono">
                      {r.deadline ? (
                        <div>
                          <div className="text-slate-300">
                            {new Date(r.deadline).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          {r.isBehind && (
                            <span className="text-[10px] text-amber-400 font-bold">Behind Target</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">Not Set</span>
                      )}
                    </td>

                    {/* Status & Flags */}
                    <td className="p-3.5">
                      {r.progressPercent === 100 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : r.isStuck ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-mono font-bold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Stalled
                        </span>
                      ) : r.isBehind ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> At Risk
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-bold flex items-center gap-1 w-fit">
                          On Track
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenAssignModal(r)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition-all"
                      >
                        Assign / Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── MODAL: ASSIGN / CHANGE ROADMAP & SET DEADLINE ────────── */}
      {assignModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-white/15 space-y-6 shadow-2xl bg-[#0b1222]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <h3 className="font-heading font-bold text-lg text-white">Assign Curricula & Deadline</h3>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {modalSuccess}
              </div>
            )}

            <form onSubmit={handleAssignRoadmap} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">Student</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedUser.userName} (${selectedUser.userEmail})`}
                  className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-white/10 text-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">
                  Target Engineering Specialization
                </label>
                <select
                  value={targetCareerId}
                  onChange={(e) => setTargetCareerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {data?.availableCareers?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Generating this roadmap calibrates the student's 5 phases with real deliverables.
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">Completion Target Deadline</label>
                <div className="relative">
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Learners falling behind this date will trigger the "Behind Schedule" manager alert.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {assigning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Roadmap & Deadline</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
