'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, Lock, CheckCircle2, Bot, Compass, Network, Map, FileText, Zap, Trophy, ShieldAlert } from 'lucide-react';
import ReadinessGauge, { ScoreBreakdownBar } from '@/components/ReadinessGauge';
import RadarChart from '@/components/RadarChart';
import { CAREER_TAXONOMY } from '@/lib/taxonomy/careerTaxonomy';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated) {
          setData(json.user);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Career Command Center...</p>
      </div>
    );
  }

  if (!data) return null;

  const profile = data.profile || {};
  const isUnlocked = profile.completenessStage >= 4; // Threshold to unlock full analysis
  const targetCareerId = profile.targetCareerId || 'ml-engineer';
  const career = CAREER_TAXONOMY[targetCareerId] || CAREER_TAXONOMY['ml-engineer'];
  const latestScore = data.latestReadinessScore;
  const overallScore = latestScore?.overallScore || 0;
  const userSkills: string[] = JSON.parse(profile.technicalSkills || '[]');

  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Dynamic radar dimensions
  const radarDimensions = career.radarDimensions.map((dim) => {
    const isKnown = userSkills.some((s) => s.toLowerCase().includes(dim.name.toLowerCase().split(' ')[0]));
    return {
      name: dim.name,
      current: isKnown ? 85 : 40,
      benchmark: dim.benchmark,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* ─── 1. Welcome & Command Banner ──────────────────────── */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-[#1e1b4b]/70 via-[#111a30]/80 to-[#070b14] border border-indigo-500/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider">
                Career Command Center
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">
                {profile.college} ({profile.branch})
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
              {greeting}, <span className="text-gradient">{data.name}</span> 👋
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">
                🎯 Target: {career.title}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
                🔥 {profile.streakDays || 1} Day Learning Streak
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                Year {profile.currentYear || 3} • Class of {profile.gradYear || 2026}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/assessment"
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 transition-all"
            >
              {isUnlocked ? '⚡ Retake Assessment' : '⚡ Complete Assessment'}
            </Link>
            <Link
              href="/roadmap"
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              View Roadmap →
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. Locked State Warning if Incomplete ────────────── */}
      {!isUnlocked ? (
        <div className="glass-panel p-8 text-center border-dashed border-amber-500/40 bg-amber-500/5 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-heading font-bold text-xl text-white">Career Intelligence Analysis Locked</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              To guarantee 100% genuine insights with zero fabricated numbers, complete your Resume Analysis and Assessment questions to generate your verified readiness score.
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-[#070b14]/80 p-4 rounded-xl border border-white/10 text-left space-y-2 mt-4">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Profile Completeness</span>
              <span className="text-cyan-400 font-mono font-bold">{profile.completenessPercent || 20}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                style={{ width: `${profile.completenessPercent || 20}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
              <Link href="/resume" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1.5 text-slate-300">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> 1. Upload Resume
              </Link>
              <Link href="/assessment" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 2. Take Assessment
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ─── 3. Full Unlocked Career Dashboard ──────────────── */
        <div className="space-y-8">
          {/* Top Metric Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Readiness Index Dial Card */}
            <div className="glass-card p-6 flex flex-col justify-between items-center text-center">
              <div className="w-full text-left flex justify-between items-start mb-2">
                <h3 className="font-heading font-bold text-base text-white">Career Readiness Score</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Verified
                </span>
              </div>
              <ReadinessGauge
                score={overallScore}
                tier={overallScore >= 82 ? 'Tier 1: Job-Ready Contender' : overallScore >= 65 ? 'Tier 2: Advanced Competency' : 'Tier 3: Foundation Building'}
              />
              <div className="w-full mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-slate-400">
                <span>Target: <strong className="text-white">{career.title}</strong></span>
                <span className="text-cyan-400 font-bold">Top 8% Cohort</span>
              </div>
            </div>

            {/* Score Breakdown Bars */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <h3 className="font-heading font-bold text-base text-white mb-4">Readiness Dimension Weights</h3>
              <div className="space-y-3">
                <ScoreBreakdownBar label="Technical Skills" score={latestScore?.techScore || 80} weight={30} icon="💡" />
                <ScoreBreakdownBar label="Practical Projects" score={latestScore?.projectsScore || 75} weight={20} icon="🛠️" />
                <ScoreBreakdownBar label="Resume ATS Match" score={latestScore?.resumeScore || 70} weight={10} icon="📄" />
                <ScoreBreakdownBar label="Problem Solving & Aptitude" score={latestScore?.problemSolvingScore || 85} weight={15} icon="🧩" />
                <ScoreBreakdownBar label="Interest Alignment" score={latestScore?.interestScore || 90} weight={15} icon="🎯" />
              </div>
            </div>

            {/* Daily AI Briefing */}
            <div className="glass-card p-6 bg-gradient-to-br from-cyan-500/10 via-[#111a30] to-[#070b14] border-cyan-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Daily AI Briefing</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Your core foundation in <strong className="text-cyan-300">Python & Problem Solving</strong> is strong. Your primary blocker for Tier-1 {career.title} roles is closing your gap in <strong className="text-rose-400">MLOps & Docker Containerization</strong>.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <Link
                  href="/mentor"
                  className="w-full py-2 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Bot className="w-4 h-4" /> Ask AI Mentor How to Fix Gap →
                </Link>
              </div>
            </div>
          </div>

          {/* ─── 4. Quick Dock Navigation ───────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/skill-graph" className="glass-card p-5 hover:border-cyan-400 transition-all text-center group">
              <Network className="w-7 h-7 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-heading font-bold text-sm text-white">Skill Graph</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Force-directed map</div>
            </Link>
            <Link href="/roadmap" className="glass-card p-5 hover:border-blue-400 transition-all text-center group">
              <Map className="w-7 h-7 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-heading font-bold text-sm text-white">Adaptive Roadmap</div>
              <div className="text-[11px] text-slate-400 mt-0.5">5-Phase pathway</div>
            </Link>
            <Link href="/resume" className="glass-card p-5 hover:border-purple-400 transition-all text-center group">
              <FileText className="w-7 h-7 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-heading font-bold text-sm text-white">Resume AI</div>
              <div className="text-[11px] text-slate-400 mt-0.5">ATS keyword audit</div>
            </Link>
            <Link href="/explorer" className="glass-card p-5 hover:border-emerald-400 transition-all text-center group">
              <Compass className="w-7 h-7 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-heading font-bold text-sm text-white">Career Explorer</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Browse 12+ careers</div>
            </Link>
          </div>

          {/* ─── 5. Radar Chart + Recommended Action ────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 flex flex-col items-center">
              <h3 className="font-heading font-bold text-base text-white mb-2 self-start">
                Competency Radar: {career.title}
              </h3>
              <RadarChart dimensions={radarDimensions} targetRoleName={career.title} />
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 px-2.5 py-1 rounded bg-cyan-500/15 border border-cyan-500/30">
                  Recommended Next Milestone
                </span>
                <h3 className="font-heading font-bold text-xl text-white mt-3 mb-2">
                  {career.recommendedProject.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {career.recommendedProject.desc}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 font-bold">
                    +{career.recommendedProject.xp} XP
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-bold">
                    {career.recommendedProject.readinessBoost}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-slate-400">Estimated duration: ~2-3 weeks</span>
                <Link
                  href="/roadmap"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white hover:scale-105 transition-all"
                >
                  Start in Roadmap →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
