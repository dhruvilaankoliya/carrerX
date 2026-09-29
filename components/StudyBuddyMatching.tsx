'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  UserCheck,
  GraduationCap,
  BookOpen,
  Code2,
  FolderGit2,
  MessageSquare,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
  Clock,
  Layers,
  Zap,
  ExternalLink,
  Award,
  Settings,
  Flame,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import UserProfileModal from './UserProfileModal';
import StudyBuddyChatModal from './StudyBuddyChatModal';
import PrivacySettingsModal from './PrivacySettingsModal';

export interface MatchResultItem {
  userId: string;
  name: string;
  college: string;
  course: string;
  year: number;
  gradYear?: number;
  profilePhoto?: string | null;
  careerGoal?: string;
  roleCategory: 'Experienced Learner' | 'Study Buddy' | 'Peer';
  matchPercentage: number;
  scoreBreakdown: {
    skillsScore: number;
    projectsScore: number;
    careerGoalScore: number;
    interestsScore: number;
    weightedTotal: number;
  };
  matchedSkills: string[];
  canHelpWith: string[];
  studiedSkills: string[];
  completedCoursesCount: number;
  projectsCount: number;
  whyExplanation: {
    lookingToLearn: string[];
    experiencedIn: string[];
    summary: string;
  };
  connectionStatus: 'none' | 'pending' | 'accepted' | 'declined';
  availableToHelp: boolean;
  studyBuddyEnabled: boolean;
  profileVisibility: string;
  showEmail: boolean;
  showPhone: boolean;
  lastActiveAt?: string | Date;
}

interface StudyBuddyMatchingProps {
  targetSkills?: string[];
  targetRole?: string;
  isUploaded?: boolean;
}

export default function StudyBuddyMatching({
  targetSkills = ['Docker', 'Kubernetes', 'FastAPI', 'MLOps', 'Vector DB'],
  targetRole = 'Machine Learning Engineer',
  isUploaded = true,
}: StudyBuddyMatchingProps) {
  const [mode, setMode] = useState<'help' | 'study_buddy'>('help');
  const [levelFilter, setLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [hasProjectsOnly, setHasProjectsOnly] = useState(false);
  const [sortOption, setSortOption] = useState<'best_skill_match' | 'most_relevant' | 'same_college' | 'same_course' | 'recently_active'>('best_skill_match');

  const [matches, setMatches] = useState<MatchResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [expandedWhyCards, setExpandedWhyCards] = useState<Record<string, boolean>>({});

  // Feedback notifications
  const [connectToast, setConnectToast] = useState<{ id: string; message: string } | null>(null);

  // Modals state
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);
  const [viewingProfileRole, setViewingProfileRole] = useState<'Experienced Learner' | 'Study Buddy' | 'Peer'>('Peer');
  const [chatTarget, setChatTarget] = useState<{
    id: string;
    name: string;
    photo?: string | null;
    college?: string;
  } | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Available filter options from server
  const [filterOptions, setFilterOptions] = useState<{
    colleges: string[];
    courses: string[];
    skills: string[];
  }>({ colleges: [], courses: [], skills: [] });

  useEffect(() => {
    fetchMatches();
  }, [
    mode,
    levelFilter,
    selectedSkillFilter,
    collegeFilter,
    courseFilter,
    yearFilter,
    hasProjectsOnly,
    sortOption,
    searchQuery,
    targetSkills,
  ]);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (mode) params.append('mode', mode);
      if (selectedSkillFilter && selectedSkillFilter !== 'all') params.append('skill', selectedSkillFilter);
      if (collegeFilter && collegeFilter !== 'all') params.append('college', collegeFilter);
      if (courseFilter && courseFilter !== 'all') params.append('course', courseFilter);
      if (yearFilter && yearFilter !== 'all') params.append('year', yearFilter);
      if (hasProjectsOnly) params.append('hasProjects', 'true');
      if (sortOption) params.append('sort', sortOption);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (targetSkills && targetSkills.length > 0) {
        params.append('targetSkills', JSON.stringify(targetSkills));
      }

      const res = await fetch(`/api/matching?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        let list: MatchResultItem[] = data.matches || [];

        // Apply client level filter for study buddy mode if requested
        if (mode === 'study_buddy' && levelFilter !== 'all') {
          list = list.filter((m) => {
            if (levelFilter === 'beginner') return (m.year || 1) <= 2 && m.projectsCount <= 1;
            if (levelFilter === 'intermediate') return (m.year === 3) || (m.projectsCount >= 2 && m.projectsCount < 4);
            if (levelFilter === 'advanced') return (m.year || 1) >= 4 || m.projectsCount >= 4 || m.completedCoursesCount >= 2;
            return true;
          });
        }

        setMatches(list);
        setTotalCount(data.allPotentialCount || list.length);
        if (data.filterOptions) {
          setFilterOptions({
            colleges: data.filterOptions.colleges || [],
            courses: data.filterOptions.courses || [],
            skills: data.filterOptions.skills || [],
          });
        }
      } else {
        setError(data.error || 'Failed to load matched students');
      }
    } catch {
      setError('Network error loading study connections');
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnectionRequest = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConnectToast({
          id: targetUserId,
          message: data.message || 'Connection request sent ✓',
        });
        setTimeout(() => setConnectToast(null), 3500);

        // Update local status
        setMatches((prev) =>
          prev.map((m) =>
            m.userId === targetUserId
              ? { ...m, connectionStatus: data.status || 'pending' }
              : m
          )
        );
      } else {
        alert(data.error || 'Failed to send request');
      }
    } catch {
      alert('Network error sending connection request');
    }
  };

  const toggleScoreBreakdown = (userId: string) => {
    setExpandedCards((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const toggleWhyMatch = (userId: string) => {
    setExpandedWhyCards((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div id="study-matching-section" className="space-y-6 pt-4">
      {/* ─── 1. Section Header & Badge ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
              AI Skill Matching
            </span>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" /> Privacy Enforced
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white mt-1.5 flex items-center gap-2">
            Connect With People Who Know What You're Learning
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Turn your skill gaps into connections with students who have already learned them.
          </p>
        </div>

        <button
          onClick={() => setIsPrivacyModalOpen(true)}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
          title="Manage who can discover and connect with you"
        >
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          <span>My Privacy & Availability</span>
        </button>
      </div>

      {/* ─── 2. Hero Live Count Card ─── */}
      <div className="glass-panel p-6 sm:p-7 relative overflow-hidden bg-gradient-to-r from-[#0a1224] via-[#0d1833] to-[#070b14] border border-cyan-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
                {totalCount} potential study connections found
              </span>
              <span className="text-xs text-slate-400">• Deterministic skill overlap</span>
            </div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
              People Who Studied What You Need
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Connect with students who have already learned the skills you're working toward. Review their projects, study together, or ask for guidance on your target topics.
            </p>
          </div>

          {/* Mode Selector Toggle */}
          <div className="flex bg-[#060a14] p-1.5 rounded-2xl border border-white/10 self-start md:self-auto flex-shrink-0">
            <button
              onClick={() => setMode('help')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                mode === 'help'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> People Who Can Help
            </button>
            <button
              onClick={() => setMode('study_buddy')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                mode === 'study_buddy'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Find Study Buddy
            </button>
          </div>
        </div>

        {/* Study Buddy Level Filter (Visible in Study Buddy Mode) */}
        {mode === 'study_buddy' && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-slate-400 uppercase text-[10px] font-bold">Experience Level:</span>
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1 rounded-lg font-semibold uppercase text-[11px] transition-all ${
                  levelFilter === lvl
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-400'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── 3. Search & Filter Bar ─── */}
      <div className="glass-panel p-4 sm:p-5 space-y-3 bg-[#080d1a]/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill, college..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#060a14] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          {/* Skill Filter Dropdown */}
          <div>
            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition-all"
            >
              <option value="all">All Matched Skills</option>
              {filterOptions.skills.map((s) => (
                <option key={s} value={s}>
                  Skill: {s}
                </option>
              ))}
            </select>
          </div>

          {/* College Filter */}
          <div>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition-all"
            >
              <option value="all">All Colleges / Universities</option>
              {filterOptions.colleges.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-cyan-500/30 text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400 transition-all"
            >
              <option value="best_skill_match">Sort: Best Skill Match (70% weight)</option>
              <option value="most_relevant">Sort: Overall Highest Match</option>
              <option value="same_college">Sort: Same College First</option>
              <option value="same_course">Sort: Same Branch/Course</option>
              <option value="recently_active">Sort: Recently Active</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono">Academic Year:</span>
            {['all', '1', '2', '3', '4'].map((yr) => (
              <button
                key={yr}
                onClick={() => setYearFilter(yr)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition-all ${
                  yearFilter === yr
                    ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-300'
                    : 'bg-white/5 hover:text-white'
                }`}
              >
                {yr === 'all' ? 'All Years' : `Year ${yr}`}
              </button>
            ))}

            <label className="flex items-center gap-1.5 ml-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={hasProjectsOnly}
                onChange={(e) => setHasProjectsOnly(e.target.checked)}
                className="rounded bg-[#060a14] border-white/20 text-cyan-500 focus:ring-0"
              />
              <span className="text-xs">With Portfolio Projects</span>
            </label>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Showing <strong className="text-cyan-300">{matches.length}</strong> matching learners
          </div>
        </div>
      </div>

      {/* ─── 4. Match Cards Grid ─── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="glass-panel p-5 space-y-4 animate-pulse bg-white/5 border border-white/5 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-white/5 rounded-xl" />
              <div className="h-6 bg-white/10 rounded w-full" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        /* Empty State */
        <div className="glass-panel p-8 sm:p-12 text-center space-y-4 bg-[#080d1a]/90 border border-white/10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-heading font-bold text-lg text-white">No matching study partners yet.</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your filter options, or add more skills, interests, and projects to your profile to expand matching recommendations.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              Complete My Profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="#study-resources-panel"
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-2 transition-all"
            >
              Browse Study Resources <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((cand) => {
            const isExpanded = !!expandedCards[cand.userId];
            const isWhyExpanded = !!expandedWhyCards[cand.userId];
            const isConnected = cand.connectionStatus === 'accepted';
            const isPending = cand.connectionStatus === 'pending';

            return (
              <div
                key={cand.userId}
                className="glass-panel p-5 sm:p-6 space-y-4 bg-[#070b14]/90 border border-white/10 hover:border-cyan-500/40 transition-all rounded-2xl flex flex-col justify-between"
              >
                {/* Top User Info & Match Badge */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {cand.profilePhoto ? (
                          <img
                            src={cand.profilePhoto}
                            alt={cand.name}
                            className="w-12 h-12 rounded-xl object-cover border border-cyan-400/40"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                            {cand.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        {cand.availableToHelp && (
                          <span
                            title="Available to help students"
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-[#070b14] flex items-center justify-center text-[8px] text-white font-bold"
                          >
                            ✓
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-heading font-bold text-sm text-white hover:text-cyan-300 transition-colors">
                          {cand.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span>
                            {cand.course} • Yr {cand.year}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[170px]" title={cand.college}>
                          {cand.college}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Badge & Role Category */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold shadow-sm shadow-cyan-500/10">
                        {cand.matchPercentage}% Match
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          cand.roleCategory === 'Experienced Learner'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : cand.roleCategory === 'Study Buddy'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
                        }`}
                      >
                        {cand.roleCategory}
                      </span>
                    </div>
                  </div>

                  {/* Skills / Studied Tags */}
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    {/* Matched On */}
                    {cand.matchedSkills.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Matched On:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cand.matchedSkills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold"
                            >
                              ✓ {s}
                            </span>
                          ))}
                          {cand.matchedSkills.length > 4 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                              +{cand.matchedSkills.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Can Help With */}
                    {cand.canHelpWith.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Can help with:
                        </span>
                        <p className="text-xs text-slate-300 font-medium">
                          {cand.canHelpWith.slice(0, 3).join(', ')}
                        </p>
                      </div>
                    )}

                    {/* Stats badges */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-purple-400" />
                        <strong className="text-slate-200">{cand.completedCoursesCount}</strong> Courses
                      </span>
                      <span className="flex items-center gap-1">
                        <FolderGit2 className="w-3 h-3 text-indigo-400" />
                        <strong className="text-slate-200">{cand.projectsCount}</strong> Projects
                      </span>
                    </div>
                  </div>

                  {/* Expandable Score Breakdown */}
                  <div className="border-t border-white/5 pt-2">
                    <button
                      type="button"
                      onClick={() => toggleScoreBreakdown(cand.userId)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono font-semibold flex items-center justify-between w-full"
                    >
                      <span>Deterministic Score Breakdown</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-3 rounded-xl bg-[#050811] border border-white/5 space-y-2 text-xs animate-in fade-in">
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="text-slate-400">Skills Overlap (70%):</span>
                          <span className="font-mono font-bold text-cyan-400">
                            {cand.scoreBreakdown.skillsScore}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="text-slate-400">Projects Relevance (15%):</span>
                          <span className="font-mono font-bold text-purple-400">
                            {cand.scoreBreakdown.projectsScore}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="text-slate-400">Career Goal (10%):</span>
                          <span className="font-mono font-bold text-indigo-400">
                            {cand.scoreBreakdown.careerGoalScore}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="text-slate-400">Interests Match (5%):</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {cand.scoreBreakdown.interestsScore}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expandable "Why this match?" */}
                  <div className="border-t border-white/5 pt-2">
                    <button
                      type="button"
                      onClick={() => toggleWhyMatch(cand.userId)}
                      className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center justify-between w-full"
                    >
                      <span>Why this match?</span>
                      {isWhyExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isWhyExpanded && (
                      <div className="mt-2.5 p-3 rounded-xl bg-[#050811] border border-white/5 space-y-2.5 text-xs animate-in fade-in">
                        <p className="text-[11px] text-slate-300 leading-relaxed italic">
                          "{cand.whyExplanation.summary}"
                        </p>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">
                            What you're looking to learn:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {cand.whyExplanation.lookingToLearn.slice(0, 4).map((item) => (
                              <span
                                key={item}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">
                            What {cand.name.split(' ')[0]} has experience in:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {cand.whyExplanation.experiencedIn.slice(0, 4).map((item) => (
                              <span
                                key={item}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions: View Profile & Connect / Message */}
                <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewingProfileUserId(cand.userId);
                      setViewingProfileRole(cand.roleCategory);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors text-center"
                  >
                    View Profile
                  </button>

                  {isConnected ? (
                    <button
                      type="button"
                      onClick={() =>
                        setChatTarget({
                          id: cand.userId,
                          name: cand.name,
                          photo: cand.profilePhoto,
                          college: cand.college,
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Message
                    </button>
                  ) : isPending ? (
                    <button
                      type="button"
                      disabled
                      className="flex-1 px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1 cursor-default"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Request Sent ✓
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendConnectionRequest(cand.userId)}
                      className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Connect
                    </button>
                  )}
                </div>

                {/* Connection Toast if present */}
                {connectToast?.id === cand.userId && (
                  <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{connectToast.message}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 5. Modals ─── */}
      <UserProfileModal
        isOpen={!!viewingProfileUserId}
        userId={viewingProfileUserId}
        onClose={() => setViewingProfileUserId(null)}
        onConnect={handleSendConnectionRequest}
        onOpenChat={(id, name, photo, college) => {
          setViewingProfileUserId(null);
          setChatTarget({ id, name, photo, college });
        }}
        roleCategory={viewingProfileRole}
      />

      <StudyBuddyChatModal
        isOpen={!!chatTarget}
        onClose={() => setChatTarget(null)}
        targetUserId={chatTarget?.id || ''}
        targetUserName={chatTarget?.name || ''}
        targetUserPhoto={chatTarget?.photo}
        targetUserCollege={chatTarget?.college}
      />

      <PrivacySettingsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onSettingsSaved={() => fetchMatches()}
      />
    </div>
  );
}
