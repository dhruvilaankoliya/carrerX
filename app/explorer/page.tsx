'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Check,
  X,
  ArrowRight,
  Target,
  Trophy,
  TrendingUp,
  Cpu,
  Layers,
  Cloud,
  Shield,
  Briefcase,
  Zap,
  SlidersHorizontal,
  FolderGit2,
  BookOpen,
} from 'lucide-react';
import { CAREER_TAXONOMY, CareerDefinition } from '@/lib/taxonomy/careerTaxonomy';
import { formatSalaryRange, getSalaryBreakdown } from '@/lib/localization/currency';
import { useRouter } from 'next/navigation';

type SortOption = 'match' | 'salary' | 'demand' | 'title';

const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    icon: any;
    badgeClass: string;
    glowClass: string;
    colorHex: string;
  }
> = {
  'All': {
    label: 'All Categories',
    icon: Sparkles,
    badgeClass: 'bg-white/10 text-slate-200 border-white/20',
    glowClass: 'from-cyan-500/20 to-purple-500/20',
    colorHex: '#38bdf8',
  },
  'AI & Data': {
    label: 'AI & Data',
    icon: Cpu,
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    glowClass: 'from-cyan-500/25 to-blue-600/20',
    colorHex: '#22d3ee',
  },
  'Software & Web': {
    label: 'Software & Web',
    icon: Layers,
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-400/40 shadow-[0_0_12px_rgba(59,130,246,0.25)]',
    glowClass: 'from-blue-500/25 to-indigo-600/20',
    colorHex: '#60a5fa',
  },
  'Cloud & DevOps': {
    label: 'Cloud & DevOps',
    icon: Cloud,
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-400/40 shadow-[0_0_12px_rgba(14,165,233,0.25)]',
    glowClass: 'from-sky-500/25 to-teal-600/20',
    colorHex: '#38bdf8',
  },
  'Cyber & Security': {
    label: 'Cyber & Security',
    icon: Shield,
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
    glowClass: 'from-rose-500/25 to-purple-600/20',
    colorHex: '#fb7185',
  },
  'Product & Management': {
    label: 'Product & Management',
    icon: Briefcase,
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    glowClass: 'from-amber-500/25 to-orange-600/20',
    colorHex: '#fbbf24',
  },
};

export default function CareerExplorerPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('match');
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

  const userSkills: string[] = useMemo(() => {
    if (!user?.profile?.technicalSkills) return ['python', 'pytorch', 'fastapi', 'docker', 'git', 'sql'];
    try {
      return JSON.parse(user.profile.technicalSkills).map((s: string) => s.toLowerCase());
    } catch {
      return [];
    }
  }, [user]);

  const careersList = useMemo(() => Object.values(CAREER_TAXONOMY), []);

  // Compute skill matches for each career
  const careerMatches = useMemo(() => {
    const map: Record<string, { matchedCount: number; totalCount: number; percentage: number }> = {};
    careersList.forEach((c) => {
      let matched = 0;
      c.requiredSkills.forEach((skill) => {
        const sLower = skill.toLowerCase();
        if (userSkills.some((us) => us.includes(sLower) || sLower.includes(us))) {
          matched++;
        }
      });
      const total = c.requiredSkills.length || 1;
      map[c.id] = {
        matchedCount: matched,
        totalCount: total,
        percentage: Math.round((matched / total) * 100),
      };
    });
    return map;
  }, [careersList, userSkills]);

  const filteredAndSortedCareers = useMemo(() => {
    let result = careersList.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.requiredSkills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
        c.topTools.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortBy === 'match') {
        return (careerMatches[b.id]?.percentage || 0) - (careerMatches[a.id]?.percentage || 0);
      }
      if (sortBy === 'salary') {
        return b.salary.avgLPA - a.salary.avgLPA;
      }
      if (sortBy === 'demand') {
        const order: Record<string, number> = { Critical: 4, 'Very High': 3, High: 2, Moderate: 1 };
        return (order[b.demandLevel] || 0) - (order[a.demandLevel] || 0);
      }
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [careersList, search, filterCategory, sortBy, careerMatches]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: careersList.length };
    careersList.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [careersList]);

  return (
    <div className="relative min-h-screen pb-20">
      {/* Ambient Radial Glow Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-10 right-1/4 w-[550px] h-[320px] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8">
        {/* ─── 1. Futuristic Header / Hero ───────────────────────── */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0d162d]/90 via-[#0a1022]/80 to-[#120f26]/90 border border-cyan-500/25 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(6,182,212,0.15)] overflow-hidden">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(34, 211, 238, 0.4) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
                <span>Next-Gen Industry Role Taxonomy</span>
              </div>

              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                Career <span className="text-gradient">Explorer & Intelligence</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Explore tech roles with verified Indian market compensation benchmarks (INR LPA), live competency
                gap mapping against your profile, and structured proof-of-work progression paths.
              </p>
            </div>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-3 gap-3 self-start lg:self-center">
              <div className="bg-[#0b1222]/90 border border-cyan-500/30 rounded-2xl p-3 text-center shadow-[0_0_20px_rgba(6,182,212,0.12)]">
                <div className="font-mono font-extrabold text-lg sm:text-xl text-cyan-400">12+</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Live Tracks</div>
              </div>
              <div className="bg-[#0b1222]/90 border border-purple-500/30 rounded-2xl p-3 text-center shadow-[0_0_20px_rgba(168,85,247,0.12)]">
                <div className="font-mono font-extrabold text-lg sm:text-xl text-purple-300">₹45L+</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Max Peak LPA</div>
              </div>
              <div className="bg-[#0b1222]/90 border border-emerald-500/30 rounded-2xl p-3 text-center shadow-[0_0_20px_rgba(16,185,129,0.12)]">
                <div className="font-mono font-extrabold text-lg sm:text-xl text-emerald-400">100%</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Skill Aligned</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2. Interactive Neon Controls (Search + Categories + Sort) ─── */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input with Neon Bloom */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search roles, frameworks (e.g. PyTorch, Docker, AWS)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0a1020]/90 border border-cyan-500/30 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all backdrop-blur-xl"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown & Quick Indicator */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="flex items-center gap-2 bg-[#0b1222]/90 border border-white/10 px-3.5 py-2.5 rounded-2xl text-xs backdrop-blur-xl">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="match" className="bg-[#0b1222] text-white">Your Skill Match %</option>
                  <option value="salary" className="bg-[#0b1222] text-white">Average Salary (High to Low)</option>
                  <option value="demand" className="bg-[#0b1222] text-white">Hiring Demand Level</option>
                  <option value="title" className="bg-[#0b1222] text-white">Role Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills with Neon Glowing Active State */}
          <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {Object.entries(CATEGORY_CONFIG).map(([catKey, conf]) => {
              const isActive = filterCategory === catKey;
              const Icon = conf.icon;
              const count = categoryCounts[catKey] || 0;

              return (
                <button
                  key={catKey}
                  onClick={() => setFilterCategory(catKey)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.45)] border border-cyan-300/60 scale-[1.03]'
                      : 'bg-[#0d1428]/80 text-slate-300 hover:text-white hover:bg-[#131d38] border border-white/10 hover:border-cyan-500/30'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                  <span>{catKey}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── 3. Career Grid with Neon Glow Theme ─────────────────── */}
        {filteredAndSortedCareers.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0b1222]/60 border border-white/10 backdrop-blur-xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">No Matching Tech Roles Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              We couldn't find any career tracks matching "{search}". Try searching for another keyword or reset filters.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setFilterCategory('All');
              }}
              className="btn-neon-outline px-5 py-2 rounded-xl text-xs font-bold mt-2"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCareers.map((career) => {
              const isTarget = targetCareerId === career.id;
              const match = careerMatches[career.id] || { matchedCount: 0, totalCount: 1, percentage: 0 };
              const categoryConfig = CATEGORY_CONFIG[career.category] || CATEGORY_CONFIG['All'];

              return (
                <div
                  key={career.id}
                  className={`neon-glow-card flex flex-col justify-between p-6 transition-all duration-300 ${
                    isTarget ? 'active-target ring-1 ring-cyan-400/50' : ''
                  }`}
                >
                  {/* Card Top Section */}
                  <div>
                    {/* Header Row: Icon + Target Tag / Category */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-[#101a35] to-[#152042] border border-cyan-500/30 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                          {career.icon}
                        </div>
                      </div>

                      {isTarget ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/25 to-blue-600/25 border border-cyan-400/60 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.35)] animate-pulse">
                          <Target className="w-3 h-3 text-cyan-400" />
                          <span>Active Target</span>
                        </div>
                      ) : (
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${categoryConfig.badgeClass}`}>
                          {career.category}
                        </span>
                      )}
                    </div>

                    {/* Role Title & Tagline */}
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-white mb-1 hover:text-cyan-300 transition-colors">
                      {career.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {career.description}
                    </p>

                    {/* Skill Match Indicator Bar */}
                    <div className="p-3 rounded-xl bg-[#090e1c]/80 border border-white/5 space-y-2 mb-4 shadow-inner">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          Profile Readiness:
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            match.percentage >= 70
                              ? 'text-emerald-400'
                              : match.percentage >= 40
                              ? 'text-cyan-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {match.percentage}% Match ({match.matchedCount}/{match.totalCount})
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            match.percentage >= 70
                              ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_10px_#34d399]'
                              : match.percentage >= 40
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_#22d3ee]'
                              : 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_10px_#f59e0b]'
                          }`}
                          style={{ width: `${Math.max(match.percentage, 8)}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Required Skills Checkmarks */}
                    <div className="space-y-1.5 mb-5">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                        <span>Core Competencies</span>
                        <span className="text-[9px] text-slate-500 lowercase">({career.requiredSkills.length} total)</span>
                      </div>
                      {career.requiredSkills.slice(0, 4).map((skill) => {
                        const hasSkill = userSkills.some(
                          (s: string) => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s)
                        );
                        return (
                          <div key={skill} className="flex items-center gap-2 text-xs">
                            {hasSkill ? (
                              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-rose-500/10 text-rose-400/80 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                                <X className="w-2.5 h-2.5" />
                              </div>
                            )}
                            <span className={hasSkill ? 'text-slate-200 font-medium' : 'text-slate-400'}>{skill}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Top Tools Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {career.topTools.slice(0, 4).map((tool) => (
                        <span
                          key={tool}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/10 hover:border-cyan-400/30 transition-colors"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom / Actions */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">Salary Range (INR)</div>
                        <div className="font-mono font-bold text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                          {formatSalaryRange(career.salary)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-500">Demand Level</div>
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400">
                          <TrendingUp className="w-3 h-3" />
                          {career.demandLevel}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCareer(career)}
                        className="flex-1 py-2.5 rounded-xl btn-neon-outline text-xs font-semibold transition-all"
                      >
                        Inspect Blueprint
                      </button>

                      {isTarget ? (
                        <button
                          onClick={() => router.push('/roadmap')}
                          className="btn-neon-cyan px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <span>Roadmap</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSetTarget(career.id)}
                          disabled={updating}
                          className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 hover:shadow-[0_0_18px_rgba(6,182,212,0.35)] text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Target
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 4. Futuristic Neon Detail Modal ───────────────────────── */}
      {selectedCareer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative glass-panel border border-cyan-500/40 p-6 sm:p-8 max-w-3xl w-full max-h-[92vh] overflow-y-auto space-y-6 shadow-[0_0_60px_rgba(6,182,212,0.25)] rounded-3xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/25 via-[#101a35] to-[#152042] border border-cyan-400/40 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  {selectedCareer.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                      {selectedCareer.title}
                    </h2>
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300">
                      {selectedCareer.category}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-400 font-medium mt-1">{selectedCareer.tagline}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCareer(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedCareer.description}
            </p>

            {/* Indian Market Salary Benchmark in INR LPA */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Verified Indian Market Salary Range (INR LPA)
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {getSalaryBreakdown(selectedCareer.salary).map((b) => (
                  <div
                    key={b.level}
                    className="p-3.5 rounded-2xl bg-[#090f20]/90 border border-cyan-500/25 text-center shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-cyan-400/50 transition-colors"
                  >
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{b.level}</div>
                    <div className="font-mono font-extrabold text-base sm:text-lg text-cyan-300 mt-0.5">
                      {b.range}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Progression Pathway */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Engineering Growth Trajectory
                </h4>
              </div>
              <div className="space-y-2">
                {selectedCareer.growthPath.map((p, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-[#0b1224]/80 border border-white/10 flex justify-between items-center text-xs hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-white">{p.role}</div>
                        <div className="text-[10px] text-slate-400">{p.timeline}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-emerald-400 text-sm">
                      {p.salaryLPA}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Project & Course Blueprint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Capstone Project */}
              <div className="p-4 rounded-2xl bg-[#0a1020]/90 border border-cyan-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-cyan-400 flex items-center gap-1">
                    <FolderGit2 className="w-3 h-3" /> Recommended Project
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    +{selectedCareer.recommendedProject.xp} XP
                  </span>
                </div>
                <h5 className="font-heading font-bold text-sm text-white">
                  {selectedCareer.recommendedProject.title}
                </h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {selectedCareer.recommendedProject.desc}
                </p>
                <div className="text-[10px] text-emerald-400 font-semibold pt-1">
                  Boosts: {selectedCareer.recommendedProject.readinessBoost}
                </div>
              </div>

              {/* Recommended Course */}
              <div className="p-4 rounded-2xl bg-[#0a1020]/90 border border-purple-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-purple-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Curated Certification
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    ★ {selectedCareer.recommendedCourse.rating}
                  </span>
                </div>
                <h5 className="font-heading font-bold text-sm text-white">
                  {selectedCareer.recommendedCourse.title}
                </h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {selectedCareer.recommendedCourse.why}
                </p>
                <div className="text-[10px] text-cyan-400 font-semibold pt-1">
                  {selectedCareer.recommendedCourse.provider} • {selectedCareer.recommendedCourse.duration}
                </div>
              </div>
            </div>

            {/* Modal Bottom Controls */}
            <div className="flex justify-end items-center gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedCareer(null)}
                className="px-5 py-2.5 rounded-full btn-neon-outline text-xs font-semibold"
              >
                Close
              </button>

              {targetCareerId === selectedCareer.id ? (
                <button
                  onClick={() => {
                    setSelectedCareer(null);
                    router.push('/roadmap');
                  }}
                  className="btn-neon-cyan px-7 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2"
                >
                  <span>Open Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleSetTarget(selectedCareer.id)}
                  disabled={updating}
                  className="btn-neon-cyan px-7 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 disabled:opacity-50"
                >
                  <Target className="w-4 h-4" />
                  <span>{updating ? 'Setting Target...' : 'Set as My Target Career'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
