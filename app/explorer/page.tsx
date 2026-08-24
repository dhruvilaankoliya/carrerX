'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Check, X, ArrowRight, Target, Trophy, TrendingUp } from 'lucide-react';
import { CAREER_TAXONOMY, CareerDefinition } from '@/lib/taxonomy/careerTaxonomy';
import { formatSalaryRange, getSalaryBreakdown } from '@/lib/localization/currency';
import { useRouter } from 'next/navigation';

export default function CareerExplorerPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [user, setUser] = useState<any>(null);
  const [targetCareerId, setTargetCareerId] = useState('ml-engineer');
  const [selectedCareer, setSelectedCareer] = useState<CareerDefinition | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.user) {
          setUser(json.user);
          setTargetCareerId(json.user.profile?.targetCareerId || 'ml-engineer');
        }
      }
    } catch {}
  };

  const handleSetTarget = async (careerId: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/profile/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCareerId: careerId }),
      });
      if (res.ok) {
        setTargetCareerId(careerId);
        setSelectedCareer(null);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const userSkills = user?.profile?.technicalSkills ? JSON.parse(user.profile.technicalSkills) : [];
  const careersList = Object.values(CAREER_TAXONOMY);

  const filteredCareers = careersList.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.requiredSkills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      c.topTools.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Industry Intelligence Catalog
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-white">
          Career <span className="text-gradient">Explorer & Role Taxonomy</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore in-demand engineering careers, verified INR compensation ranges, and skill match checklists.
        </p>
      </div>

      {/* Toolbar: Search + Categories */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roles, skills, or tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111a30] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex gap-1.5 bg-[#111a30] p-1 rounded-full border border-white/10 overflow-x-auto max-w-full no-scrollbar">
          {['All', 'AI & Data', 'Software & Web', 'Cloud & DevOps', 'Cyber & Security', 'Product & Management'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Career Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCareers.map((career) => {
          const isTarget = targetCareerId === career.id;

          return (
            <div
              key={career.id}
              className={`glass-card p-6 flex flex-col justify-between transition-all ${
                isTarget ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 via-[#111a30] to-[#070b14] shadow-[0_0_30px_rgba(6,182,212,0.2)]' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-3xl">{career.icon}</span>
                  {isTarget ? (
                    <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      🎯 Active Target
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">
                      {career.category}
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-lg text-white mb-1">{career.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{career.description}</p>

                {/* Skill Checkmarks */}
                <div className="space-y-1.5 mb-6">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Required Skills</div>
                  {career.requiredSkills.slice(0, 4).map((skill) => {
                    const hasSkill = userSkills.some((s: string) => s.toLowerCase().includes(skill.toLowerCase()));
                    return (
                      <div key={skill} className="flex items-center gap-2 text-xs">
                        {hasSkill ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        )}
                        <span className={hasSkill ? 'text-slate-200 font-medium' : 'text-slate-400'}>{skill}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Salary Range</div>
                    <div className="font-mono font-bold text-cyan-400">{formatSalaryRange(career.salary)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Demand</div>
                    <div className="font-mono font-bold text-emerald-400">{career.demandLevel}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCareer(career)}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                  >
                    View Details
                  </button>
                  {isTarget ? (
                    <button
                      onClick={() => router.push('/roadmap')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white flex items-center gap-1"
                    >
                      Roadmap <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSetTarget(career.id)}
                      disabled={updating}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all"
                    >
                      Set as Target
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Detail Modal ────────────────────────────────────────── */}
      {selectedCareer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedCareer.icon}</span>
                <div>
                  <h2 className="font-heading font-bold text-2xl text-white">{selectedCareer.title}</h2>
                  <span className="text-xs text-cyan-400 font-medium">{selectedCareer.tagline}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCareer(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedCareer.description}</p>

            {/* Salary Breakdown in INR LPA */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Verified Indian Market Salary Range (INR LPA)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {getSalaryBreakdown(selectedCareer.salary).map((b) => (
                  <div key={b.level} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{b.level}</div>
                    <div className="font-mono font-extrabold text-base text-cyan-400 mt-0.5">{b.range}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Progression Pathway */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Standard Growth Trajectory
              </h4>
              <div className="space-y-2">
                {selectedCareer.growthPath.map((p, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-white">{p.role}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400">{p.salaryLPA}</div>
                      <div className="text-[10px] text-slate-500">{p.timeline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedCareer(null)}
                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => handleSetTarget(selectedCareer.id)}
                disabled={updating}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white hover:scale-105 transition-all"
              >
                🎯 Set as My Target Career
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
