'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock,
  Star,
  ExternalLink,
  BookOpen,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Activity,
  FileText,
} from 'lucide-react';

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = use(params as any) as { id: string };
  const userId = resolvedParams.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserDetail() {
      try {
        setLoading(true);
        const res = await fetch(`/api/manager/users/${encodeURIComponent(userId)}`);
        if (!res.ok) {
          throw new Error('Failed to load user details');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Error loading user');
      } finally {
        setLoading(false);
      }
    }
    fetchUserDetail();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading learner profile & gap progress...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-4 text-center">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm max-w-md mx-auto">
          ⚠️ {error || 'User not found'}
        </div>
        <Link
          href="/manager"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Manager Dashboard
        </Link>
      </div>
    );
  }

  const { user, stats, skillGaps, completedResources, feedbacksGiven } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* ─── Back Navigation & Header ───────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <Link
            href="/manager"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Manager Console
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              {user.name}
            </h1>
            {user.isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                ONLINE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-800/60 text-slate-400 border border-white/5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Offline
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                user.role === 'manager'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}
            >
              {user.role}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            ID: {user.id} • Registered: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Readiness Index Pill */}
        {user.readinessScore && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-500/15 to-indigo-500/15 border border-cyan-500/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold">
              ⚡
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Career Readiness</div>
              <div className="font-heading font-extrabold text-xl text-cyan-300">
                {user.readinessScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Metric Cards Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Study Hours */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase">Study Hours Completed</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-cyan-300 font-mono">
            ⚡ {stats?.totalStudyHours || 0} hrs
          </div>
          <p className="text-[11px] text-slate-400">Total duration across all resources</p>
        </div>

        {/* Resources Completed */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase">Resources Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-emerald-300 font-mono">
            {stats?.totalResourcesCompleted || 0}
          </div>
          <p className="text-[11px] text-slate-400">Courses, docs, and articles</p>
        </div>

        {/* Gaps Closed */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase">Gaps Closed</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-purple-300 font-mono">
            {stats?.gapsClosedCount || 0} / {stats?.totalGapsCount || 0}
          </div>
          <p className="text-[11px] text-slate-400">Fully completed target skills</p>
        </div>

        {/* Reviews Submitted */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase">Reviews Submitted</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-amber-300 font-mono">
            {stats?.totalFeedbacksGiven || 0}
          </div>
          <p className="text-[11px] text-slate-400">Star ratings & peer comments</p>
        </div>
      </div>

      {/* ─── Profile & Education Details ─────────────────────── */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" /> Learner Profile & Education
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#070b14]/80 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">College / University</span>
            <div className="font-bold text-white text-sm line-clamp-1">{user.profile?.college || 'N/A'}</div>
            <div className="text-slate-400">{user.profile?.course} • {user.profile?.branch}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#070b14]/80 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Academic Standing</span>
            <div className="font-bold text-white text-sm">
              Year {user.profile?.currentYear || 1} (Grad {user.profile?.gradYear || 2026})
            </div>
            <div className="text-cyan-300 font-mono font-bold">CGPA: {user.profile?.cgpa || 'N/A'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#070b14]/80 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Target Career Goal</span>
            <div className="font-bold text-white text-sm">{user.profile?.careerGoal || 'Software Engineer'}</div>
            <div className="text-slate-400">{user.profile?.preferredField || 'Engineering'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#070b14]/80 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Contact & Presence</span>
            <div className="font-bold text-white truncate">{user.email}</div>
            <div className="text-slate-400 font-mono">
              Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleTimeString() : 'Never'}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: SKILL GAPS LIST WITH COMPLETION STATUS ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">Target ATS Skill Gaps Breakdown</h3>
            <p className="text-xs text-slate-400">Curated gaps tracked for {user.name}&apos;s target role</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillGaps.map((skill: any) => (
            <div
              key={skill.id}
              className={`p-4 rounded-xl border space-y-3 transition-all ${
                skill.isCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-[#0b1222] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                  {skill.skillName}
                </h4>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    skill.isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                  }`}
                >
                  {skill.isCompleted ? 'COMPLETED' : `${skill.completedResources}/${skill.totalResources} DONE`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    skill.isCompleted
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  }`}
                  style={{ width: `${Math.max(5, skill.percent)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                {skill.whyItMatters}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 2: COMPLETED RESOURCES TABLE ─────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">Completed Learning Resources</h3>
            <p className="text-xs text-slate-400">All courses, documentation, and articles studied by this user</p>
          </div>
          <span className="font-mono text-xs text-cyan-300 font-bold">
            {completedResources.length} items logged
          </span>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          {completedResources.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              This learner has not completed any study resources yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070b14]/90 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-5 py-3.5">Resource Title</th>
                    <th className="px-4 py-3.5">Skill</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5">Provider</th>
                    <th className="px-4 py-3.5">Duration</th>
                    <th className="px-4 py-3.5">Completed Date</th>
                    <th className="px-4 py-3.5">User Rating</th>
                    <th className="px-5 py-3.5 text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {completedResources.map((res: any) => (
                    <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-white max-w-sm line-clamp-1">{res.title}</div>
                        {res.comment && (
                          <div className="text-[11px] text-slate-400 italic mt-0.5 line-clamp-1">
                            &ldquo;{res.comment}&rdquo;
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-cyan-300 font-bold">{res.skillName}</td>
                      <td className="px-4 py-3.5 capitalize text-slate-300">{res.type}</td>
                      <td className="px-4 py-3.5 text-slate-300">{res.provider}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-300">{res.durationText}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        {new Date(res.completedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        {res.rating ? (
                          <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {res.rating}/5
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">Unrated</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-cyan-300 transition-colors inline-block"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── SECTION 3: RATINGS & FEEDBACK GIVEN BY USER ───────── */}
      <div className="space-y-4">
        <div>
          <h3 className="font-heading font-bold text-lg text-white">Peer Feedback & Reviews by {user.name}</h3>
          <p className="text-xs text-slate-400">Qualitative takeaways and ratings submitted after completing gap labs</p>
        </div>

        {feedbacksGiven.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#0b1222] border border-white/10 text-center text-xs text-slate-400 font-mono">
            No feedback comments submitted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacksGiven.map((fb: any) => (
              <div
                key={fb.id}
                className="p-4 rounded-xl bg-[#0b1222] border border-white/10 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {fb.skillName}
                  </span>
                  <div className="flex items-center gap-1 text-amber-300 font-mono font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{fb.rating} / 5</span>
                  </div>
                </div>

                <div className="font-heading font-bold text-xs text-white line-clamp-1">
                  {fb.resourceTitle}
                </div>

                {fb.comment && (
                  <p className="text-xs text-slate-300 bg-[#070b14] p-2.5 rounded-lg border border-white/5 italic">
                    &ldquo;{fb.comment}&rdquo;
                  </p>
                )}

                <div className="text-[10px] text-slate-500 font-mono text-right">
                  Reviewed on: {new Date(fb.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
