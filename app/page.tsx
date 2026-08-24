import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Compass, Network, Map, ShieldCheck, Zap, Bot, Trophy, CheckCircle2 } from 'lucide-react';
import { CAREER_TAXONOMY } from '@/lib/taxonomy/careerTaxonomy';
import { formatSalaryRange } from '@/lib/localization/currency';

export default function HomePage() {
  const trendingCareers = Object.values(CAREER_TAXONOMY).slice(0, 3);

  return (
    <div className="relative overflow-hidden">
      {/* ─── 1. Hero Section ───────────────────────────────────── */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-top-2 duration-700">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-pulse" />
          Next-Gen AI Career & Skill Intelligence Platform
        </div>

        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          Discover Your Potential.<br />
          <span className="text-gradient">Build the Career You're Meant For.</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          CareerX analyzes your real strengths, identifies critical industry skill gaps, and computes an adaptive, gamified roadmap toward high-impact engineering placements.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] hover:scale-105 transition-all flex items-center gap-2"
          >
            Start Free AI Assessment <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-full text-base font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 transition-all flex items-center gap-2"
          >
            Open Command Center 🚀
          </Link>
        </div>

        {/* Micro-Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 text-left">
          <div className="glass-card p-4 text-center">
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-cyan-400">42,000+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Skills & Competencies Modeled</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-400">94.8%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Placement Benchmark Accuracy</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-purple-400">1,250+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Adaptive Industry Roadmaps</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-400">4.9 / 5.0 ★</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Student Placement Rating</div>
          </div>
        </div>
      </section>

      {/* ─── 2. How CareerX Works (4-Step Transformation Journey) ─── */}
      <section className="py-20 bg-[#0b1222]/60 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">How CareerX Works</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mt-2">
              A 4-Step Intelligent Journey to Job-Ready
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Transforming academic foundations into industry-verified engineering readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 border-t-2 border-cyan-400">
              <span className="font-mono text-xs font-bold text-cyan-400">STEP 01</span>
              <h3 className="font-heading font-bold text-lg text-white mt-2 mb-2">Deep AI Assessment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates cognitive aptitude, technical interest vectors, and real resume evidence to build your learning profile.
              </p>
            </div>
            <div className="glass-card p-6 border-t-2 border-blue-500">
              <span className="font-mono text-xs font-bold text-blue-400">STEP 02</span>
              <h3 className="font-heading font-bold text-lg text-white mt-2 mb-2">Skill Relationship Graph</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visualizes your live competency network, mapping strong skills, active learning, and critical hiring blockers.
              </p>
            </div>
            <div className="glass-card p-6 border-t-2 border-purple-500">
              <span className="font-mono text-xs font-bold text-purple-400">STEP 03</span>
              <h3 className="font-heading font-bold text-lg text-white mt-2 mb-2">Adaptive 5-Phase Roadmap</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step-by-step milestones with high-yield projects, curated courses, and verifiable proof-of-work deliverables.
              </p>
            </div>
            <div className="glass-card p-6 border-t-2 border-emerald-500">
              <span className="font-mono text-xs font-bold text-emerald-400">STEP 04</span>
              <h3 className="font-heading font-bold text-lg text-white mt-2 mb-2">Placement Launchpad</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Line-by-line ATS resume optimization, keyword gap remediation, and simulated technical mock interview practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Trending Engineering Careers ───────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">Explore Careers</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mt-2">
              High-Demand Modern Tech Roles
            </h2>
            <p className="text-sm text-slate-400 mt-1">Real INR salary benchmarks and tool requirements.</p>
          </div>
          <Link href="/explorer" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            Browse All 12+ Careers →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingCareers.map((career) => (
            <div key={career.id} className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">{career.icon}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {career.growthRate}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-xl text-white mb-2">{career.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{career.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {career.requiredSkills.slice(0, 4).map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Estimated Range</div>
                  <div className="font-mono font-bold text-sm text-cyan-400">{formatSalaryRange(career.salary)}</div>
                </div>
                <Link
                  href={`/explorer`}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. Grand CTA Banner ────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="glass-panel p-8 sm:p-14 text-center relative overflow-hidden bg-gradient-to-br from-[#1e1b4b]/80 via-[#0f172a]/95 to-[#070b14] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">Ready to Take Command?</span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-white mt-2 mb-4">
            Stop Guessing. <span className="text-gradient">Start Building Your Industry Edge.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
            Create your account in 60 seconds. Parse your resume, unlock your Skill Gap Radar, and start navigating your career roadmap today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/40 hover:scale-105 transition-all"
          >
            ⚡ Create Free Student Account →
          </Link>
        </div>
      </section>
    </div>
  );
}
