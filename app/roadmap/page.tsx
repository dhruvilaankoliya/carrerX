'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Map, CheckCircle2, Lock, Clock, BookOpen, Code, Trophy, ArrowRight } from 'lucide-react';
import { CAREER_TAXONOMY } from '@/lib/taxonomy/careerTaxonomy';

export default function RoadmapPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.user) {
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

  const handleToggleDeliverable = async (phaseId: string, idx: number, currentDone: boolean) => {
    try {
      const res = await fetch('/api/roadmap/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phaseId,
          deliverableIndex: idx,
          done: !currentDone,
        }),
      });

      if (res.ok) {
        fetchRoadmap();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Generating personalized adaptive pathway...</p>
      </div>
    );
  }

  if (!data) return null;

  const profile = data.profile || {};
  const targetCareerId = profile.targetCareerId || 'ml-engineer';
  const career = CAREER_TAXONOMY[targetCareerId] || CAREER_TAXONOMY['ml-engineer'];
  const roadmap = data.latestRoadmap;
  const phases = roadmap?.phases || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Adaptive Learning Architecture
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-white">
          Personalized Career Roadmap: <span className="text-gradient">{career.title}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Dynamically synthesized from your academic background ({profile.branch}, Year {profile.currentYear}) and verified resume skills.
        </p>
      </div>

      {/* Progress Summary Card */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Roadmap Progress</div>
          <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-1">
            {roadmap?.progressPercent || 40}% <span className="text-sm font-normal text-slate-400">Completed</span>
          </div>
          <p className="text-xs text-cyan-300 mt-1 font-medium">
            Next high-yield milestone: {career.recommendedProject.title}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/mentor')}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all"
          >
            🤖 Ask AI Mentor About Milestones
          </button>
        </div>
      </div>

      {/* 5-Phase Timeline */}
      <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-cyan-400 before:to-indigo-500/20">
        {phases.map((phase: any) => {
          const isCompleted = phase.status === 'COMPLETED';
          const isInProgress = phase.status === 'IN_PROGRESS';
          const isLocked = phase.status === 'LOCKED';
          const topics = JSON.parse(phase.topics || '[]');
          const deliverables = JSON.parse(phase.deliverables || '[]');

          return (
            <div key={phase.id} className="relative group">
              {/* Spine Node Marker */}
              <div
                className={`absolute -left-[30px] sm:-left-[38px] top-6 w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-lg transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                    : isInProgress
                    ? 'bg-cyan-500 text-white shadow-[0_0_15px_#06b6d4] ring-4 ring-cyan-500/20'
                    : 'bg-[#111a30] text-slate-500 border border-white/10'
                }`}
              >
                {isCompleted ? '✓' : isInProgress ? '⚡' : '🔒'}
              </div>

              {/* Phase Card */}
              <div
                className={`glass-card p-6 sm:p-8 space-y-6 ${
                  isInProgress
                    ? 'border-cyan-500/40 bg-gradient-to-br from-cyan-500/5 via-[#111a30] to-[#070b14] shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                    : isCompleted
                    ? 'border-emerald-500/30'
                    : 'opacity-70 border-white/5'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase text-cyan-400">
                        PHASE 0{phase.phaseNumber}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isInProgress
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {phase.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-white mt-1">{phase.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{phase.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-white/5 px-3 py-1.5 rounded-lg self-start sm:self-center">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> {phase.duration}
                  </div>
                </div>

                {/* Topics Covered */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Core Knowledge Topics
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topics.map((topic: string, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> {topic}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliverables & Projects */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-purple-400" /> Proof-of-Work Deliverables
                  </h4>
                  <div className="space-y-2">
                    {deliverables.map((deliv: any, idx: number) => {
                      const isDone = deliv.status === 'done';
                      return (
                        <div
                          key={idx}
                          onClick={() => !isLocked && handleToggleDeliverable(phase.id, idx, isDone)}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                            isLocked
                              ? 'bg-white/5 border-white/5 cursor-not-allowed opacity-60'
                              : isDone
                              ? 'bg-emerald-500/10 border-emerald-500/30 cursor-pointer'
                              : 'bg-[#111a30] border-white/10 hover:border-cyan-500/40 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                                isDone ? 'bg-emerald-500 text-white' : 'border border-white/20'
                              }`}
                            >
                              {isDone ? '✓' : ''}
                            </div>
                            <div>
                              <div className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                                {deliv.name}
                              </div>
                              <div className="text-[10px] text-cyan-400 uppercase font-mono">{deliv.type}</div>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'
                            }`}
                          >
                            {isDone ? 'Verified' : 'Incomplete'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
