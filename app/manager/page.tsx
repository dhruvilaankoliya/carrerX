'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Star,
  Clock,
  Download,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Flame,
  ArrowUpDown,
  BookOpen,
  Sparkles,
  UserCheck,
  TrendingUp,
  Network,
  Map,
  FileCheck2,
  Compass,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'resources' | 'feedback'>('users');

  // Stats state
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Alerts state
  const [alerts, setAlerts] = useState<any>(null);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  // Resources analytics state
  const [resources, setResources] = useState<any[]>([]);
  const [resourceSort, setResourceSort] = useState<'popularity' | 'rating'>('popularity');
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [expandedResource, setExpandedResource] = useState<string | null>(null);

  // Feedback feed state
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackSkills, setFeedbackSkills] = useState<string[]>([]);
  const [feedbackSkillFilter, setFeedbackSkillFilter] = useState('all');
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState('all');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Auto-refresh timer state (15s polling)
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(15);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load Overview Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/manager/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching manager stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load Users Table
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams({
        q: searchQuery,
        role: roleFilter,
        status: statusFilter,
        page: page.toString(),
        limit: '10',
      });
      const res = await fetch(`/api/manager/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching manager users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter, page]);

  // Load Resources Analytics
  const loadResources = useCallback(async () => {
    try {
      setResourcesLoading(true);
      const res = await fetch('/api/resources');
      if (res.ok) {
        const data = await res.json();
        const allRes: any[] = [];
        (data.skills || []).forEach((skill: any) => {
          (skill.resources || []).forEach((r: any) => {
            allRes.push({
              ...r,
              skillName: skill.name,
            });
          });
        });
        setResources(allRes);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  // Load Feedback Feed
  const loadFeedback = useCallback(async () => {
    try {
      setFeedbackLoading(true);
      const params = new URLSearchParams({
        skill: feedbackSkillFilter,
        rating: feedbackRatingFilter,
        q: feedbackSearch,
      });
      const res = await fetch(`/api/manager/feedback?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
        if (data.availableSkills) {
          setFeedbackSkills(data.availableSkills);
        }
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setFeedbackLoading(false);
    }
  }, [feedbackSkillFilter, feedbackRatingFilter, feedbackSearch]);

  // Load Cohort Alerts
  const loadAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/manager/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error('Error fetching manager alerts:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadStats();
    loadAlerts();
    loadUsers();
    loadResources();
    loadFeedback();
  }, [loadStats, loadAlerts, loadUsers, loadResources, loadFeedback]);

  // Trigger users load on filter change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Trigger feedback load on filter change
  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  // Auto-refresh countdown effect (every 15s)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          // Trigger refresh
          loadStats();
          loadUsers();
          if (activeTab === 'resources') loadResources();
          if (activeTab === 'feedback') loadFeedback();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, activeTab, loadStats, loadUsers, loadResources, loadFeedback]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadStats(), loadUsers(), loadResources(), loadFeedback()]);
    setSecondsUntilRefresh(15);
    setIsRefreshing(false);
  };

  const handleExportCsv = () => {
    window.open('/api/manager/export.csv', '_blank');
  };

  // Sort resources
  const sortedResources = [...resources].sort((a, b) => {
    if (resourceSort === 'popularity') {
      return (b.studiedCount || 0) - (a.studiedCount || 0);
    }
    return (b.avgRating || 0) - (a.avgRating || 0);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* ─── Header & Manager Action Bar ───────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              MANAGER INTELLIGENCE CONSOLE
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Presence Engine
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Student Performance & ATS Gap Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor real-time learner presence, completed resources, peer feedback, and closing skill gaps across all cohorts.
          </p>
        </div>

        {/* Live Refresh & Export Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Polling auto-refresh countdown indicator */}
          <div className="flex items-center gap-2 bg-[#0b1222] border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                autoRefresh ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse' : 'bg-slate-600'
              }`}
              title={autoRefresh ? 'Auto-refresh is ON (Click to pause)' : 'Auto-refresh is PAUSED (Click to resume)'}
            />
            <span className="font-mono text-[11px]">
              {autoRefresh ? `Syncing: ${secondsUntilRefresh}s` : 'Paused'}
            </span>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Refresh Now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ─── MANAGER SUB-VIEWS QUICK NAVIGATION ───────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/manager/skill-graph"
          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading font-bold text-xs text-white group-hover:text-cyan-300">Skill Graph</div>
              <div className="text-[10px] text-slate-400">Heatmap & Peer Benchmarking</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/manager/roadmap"
          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Map className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading font-bold text-xs text-white group-hover:text-emerald-300">Roadmap Velocity</div>
              <div className="text-[10px] text-slate-400">Milestones & 7d Stalled Badges</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/manager/assessments"
          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading font-bold text-xs text-white group-hover:text-purple-300">Assessments</div>
              <div className="text-[10px] text-slate-400">Attempts & Retake Control</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/manager/explorer"
          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading font-bold text-xs text-white group-hover:text-amber-300">Explorer Telemetry</div>
              <div className="text-[10px] text-slate-400">Search Volume & Funnel</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* ─── SECTION A: OVERVIEW METRIC CARDS ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-2xl text-white">
              {statsLoading ? '...' : stats?.totalUsers || 0}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({stats?.studentUsers || 0} students)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-cyan-400 font-bold">{stats?.managerUsers || 1}</span> manager account(s)
          </p>
        </div>

        {/* Currently Online (Live Presence) */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-2 hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Currently Online
            </span>
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-2xl text-emerald-300">
              {statsLoading ? '...' : stats?.onlineUsers || 0}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Ping received &lt; 2 min ago</p>
        </div>

        {/* Active Today */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Active Today</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-2xl text-white">
              {statsLoading ? '...' : stats?.activeToday || 0}
            </span>
            <span className="text-[11px] text-indigo-300 font-mono">Learners</span>
          </div>
          <p className="text-[11px] text-slate-400">Logged in or studied today</p>
        </div>

        {/* Total Completed Resources */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Completed Resources</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-2xl text-cyan-300">
              {statsLoading ? '...' : stats?.totalResourcesCompleted || 0}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">items</span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            ⚡ {stats?.totalStudyHours || 0} total study hrs
          </p>
        </div>

        {/* Average Rating Across All Feedback */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-2 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
              Average Rating
            </span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-2xl text-amber-300">
              {statsLoading ? '...' : stats?.averageRating ? `${stats.averageRating}★` : 'N/A'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Based on <strong className="text-amber-300 font-mono">{stats?.totalFeedbackCount || 0}</strong> reviews
          </p>
        </div>
      </div>

      {/* ─── SECTION: HIGH PRIORITY COHORT ATTENTION ALERTS ─────── */}
      {alerts && alerts.totalAlertsCount > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>High-Priority Cohort Attention Alerts ({alerts.totalAlertsCount})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Inactive 7+ Days */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  Inactive Learners (7+ Days)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold">
                  {alerts.alerts.inactive.count}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {alerts.alerts.inactive.count > 0
                  ? `${alerts.alerts.inactive.items[0]?.name} and others haven't logged in over a week.`
                  : 'All learners have been active recently.'}
              </p>
              {alerts.alerts.inactive.count > 0 && (
                <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[150px]">
                    {alerts.alerts.inactive.items.map((i: any) => i.name).slice(0, 2).join(', ')}
                  </span>
                  <Link href="/manager/roadmap?filter=stuck" className="text-rose-300 hover:text-white font-bold flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Low Assessment Score (<60%) */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Low Assessment Score (&lt;60%)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                  {alerts.alerts.lowScores.count}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {alerts.alerts.lowScores.count > 0
                  ? `${alerts.alerts.lowScores.items[0]?.userName} scored ${alerts.alerts.lowScores.items[0]?.score}% on diagnostic evaluation.`
                  : 'All learners achieved passing diagnostic threshold.'}
              </p>
              {alerts.alerts.lowScores.count > 0 && (
                <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[150px]">
                    {alerts.alerts.lowScores.items[0]?.userName} ({alerts.alerts.lowScores.items[0]?.score}%)
                  </span>
                  <Link href="/manager/assessments?passed=false" className="text-amber-300 hover:text-white font-bold flex items-center gap-1">
                    <span>Manage Retakes</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Behind-Schedule / Stuck Roadmaps */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-white flex items-center gap-1.5">
                  <Map className="w-3.5 h-3.5 text-indigo-400" />
                  Stalled Roadmaps (7d+)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                  {alerts.alerts.stuckRoadmaps.count}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {alerts.alerts.stuckRoadmaps.count > 0
                  ? `${alerts.alerts.stuckRoadmaps.items[0]?.userName} has made 0 deliverable progress for over 7 days.`
                  : 'All roadmap deliverable pipelines moving on schedule.'}
              </p>
              {alerts.alerts.stuckRoadmaps.count > 0 && (
                <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[150px]">
                    {alerts.alerts.stuckRoadmaps.items[0]?.userName} ({alerts.alerts.stuckRoadmaps.items[0]?.progressPercent}%)
                  </span>
                  <Link href="/manager/roadmap?filter=stuck" className="text-indigo-300 hover:text-white font-bold flex items-center gap-1">
                    <span>View Roadmaps</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN TABS NAVIGATION ───────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-400/50 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Live Users & Presence Table</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
            {pagination.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'resources'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-400/50 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Resource Analytics & Popularity</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 text-amber-300 border border-amber-400/50 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback Feed</span>
          {feedbacks.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
              {feedbacks.length}
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB 1: LIVE USERS TABLE ───────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Filters & Search Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0b1222]/80 border border-white/10">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name, email, or college..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#070b14]/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Role Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px] font-mono">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-[#070b14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Students (Users)</option>
                  <option value="manager">Managers</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px] font-mono">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-[#070b14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="online">🟢 Online Only</option>
                  <option value="offline">⚪ Offline</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070b14]/90 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-5 py-3.5">Learner / User</th>
                    <th className="px-4 py-3.5">Presence Status</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">College / Degree</th>
                    <th className="px-4 py-3.5">Target Role</th>
                    <th className="px-4 py-3.5">Completed Resources</th>
                    <th className="px-4 py-3.5">Study Hours</th>
                    <th className="px-4 py-3.5">Last Seen</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersLoading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-2" />
                        <span className="font-mono text-xs">Loading learner data...</span>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <Sparkles className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                        <span>No users match the current search or filters.</span>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* User Name & Email */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-md">
                              {u.name?.slice(0, 2).toUpperCase() || 'CX'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-heading font-bold text-white group-hover:text-cyan-300 transition-colors">
                                {u.name}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Online / Offline Presence Badge */}
                        <td className="px-4 py-4">
                          {u.isOnline ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                              ONLINE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-800/60 text-slate-400 border border-white/5">
                              <span className="w-2 h-2 rounded-full bg-slate-500" />
                              Offline
                            </span>
                          )}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                              u.role === 'manager'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* College */}
                        <td className="px-4 py-4 text-slate-300">
                          <div className="truncate max-w-[140px]" title={u.college}>
                            {u.college}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {u.course} • {u.currentYear ? `Yr ${u.currentYear}` : ''}
                          </div>
                        </td>

                        {/* Target Role */}
                        <td className="px-4 py-4 text-slate-300 font-medium">
                          <span className="truncate max-w-[130px] block" title={u.targetRole}>
                            {u.targetRole}
                          </span>
                        </td>

                        {/* Completed Resources */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="font-mono font-bold text-white">
                              {u.completedResourcesCount}
                            </span>
                            <span className="text-[10px] text-slate-500">done</span>
                          </div>
                        </td>

                        {/* Study Hours */}
                        <td className="px-4 py-4 font-mono font-semibold text-cyan-300">
                          ⚡ {u.totalStudyHours} hrs
                        </td>

                        {/* Last Seen */}
                        <td className="px-4 py-4 text-slate-400 font-mono text-[11px]">
                          {u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                        </td>

                        {/* Action: View Detail */}
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/manager/users/${u.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 transition-all group/link"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#070b14]/80 border-t border-white/10 text-xs">
                <span className="text-slate-400 font-mono">
                  Showing page {page} of {pagination.totalPages} ({pagination.total} total learners)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-all font-semibold"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-all font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: RESOURCE ANALYTICS ─────────────────────────── */}
      {activeTab === 'resources' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0b1222]/80 border border-white/10">
            <div>
              <h3 className="font-heading font-bold text-base text-white">Curated Resource Popularity & Impact</h3>
              <p className="text-xs text-slate-400">Track student completions, average ratings, and peer reviews per reference material</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono">Sort By:</span>
              <button
                onClick={() => setResourceSort('popularity')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  resourceSort === 'popularity'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                🔥 Most Studied
              </button>
              <button
                onClick={() => setResourceSort('rating')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  resourceSort === 'rating'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                ★ Highest Rated
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resourcesLoading ? (
              <div className="col-span-full py-12 text-center text-slate-400 font-mono text-xs">
                Loading resources...
              </div>
            ) : sortedResources.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400">
                No resources found.
              </div>
            ) : (
              sortedResources.map((res) => {
                const isExpanded = expandedResource === res.id;
                return (
                  <div
                    key={res.id}
                    className="p-5 rounded-2xl bg-[#0b1222]/90 border border-white/10 hover:border-cyan-500/40 transition-all space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          {res.skillName}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {res.avgRating > 0 ? `${res.avgRating} / 5` : 'Unrated'}
                        </span>
                      </div>

                      <h4 className="font-heading font-bold text-sm text-white line-clamp-2">
                        {res.title}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="text-slate-300">{res.provider}</span>
                        <span>•</span>
                        <span>{res.durationText || `${res.durationHrs} hrs`}</span>
                        <span>•</span>
                        <span className="capitalize">{res.type}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Total Completions:</span>
                        <span className="font-mono font-extrabold text-cyan-300 text-sm">
                          👥 {res.studiedCount || 0} students
                        </span>
                      </div>

                      {/* Expandable Feedback comments list */}
                      {res.recentFeedbacks && res.recentFeedbacks.length > 0 && (
                        <div>
                          <button
                            onClick={() => setExpandedResource(isExpanded ? null : res.id)}
                            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{isExpanded ? 'Hide Reviews' : `View ${res.recentFeedbacks.length} Reviews`}</span>
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                              {res.recentFeedbacks.map((fb: any) => (
                                <div
                                  key={fb.id}
                                  className="p-2 rounded-lg bg-[#070b14] border border-white/5 text-[11px] space-y-1"
                                >
                                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                                    <span className="font-bold text-slate-300">{fb.userName}</span>
                                    <span className="text-amber-400">★ {fb.rating}</span>
                                  </div>
                                  <p className="text-slate-300 leading-snug italic">
                                    &ldquo;{fb.comment}&rdquo;
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: FEEDBACK FEED ──────────────────────────────── */}
      {activeTab === 'feedback' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Feed Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0b1222]/80 border border-white/10">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reviews by keyword, student, or resource..."
                value={feedbackSearch}
                onChange={(e) => setFeedbackSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#070b14]/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Skill Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px] font-mono">Skill:</span>
                <select
                  value={feedbackSkillFilter}
                  onChange={(e) => setFeedbackSkillFilter(e.target.value)}
                  className="bg-[#070b14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">All Skills</option>
                  {feedbackSkills.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px] font-mono">Rating:</span>
                <select
                  value={feedbackRatingFilter}
                  onChange={(e) => setFeedbackRatingFilter(e.target.value)}
                  className="bg-[#070b14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">★★★★★ (5 Stars)</option>
                  <option value="4">★★★★☆ (4 Stars)</option>
                  <option value="3">★★★☆☆ (3 Stars)</option>
                  <option value="2">★★☆☆☆ (2 Stars)</option>
                  <option value="1">★☆☆☆☆ (1 Star)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feedback Cards Feed */}
          <div className="space-y-3">
            {feedbackLoading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                Loading feedback stream...
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                No feedback reviews match your filter.
              </div>
            ) : (
              feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-5 rounded-2xl bg-[#0b1222]/90 border border-white/10 hover:border-amber-500/40 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                    {/* Student Info */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                        {fb.user?.name?.slice(0, 2).toUpperCase() || 'ST'}
                      </div>
                      <div>
                        <div className="font-heading font-bold text-sm text-white flex items-center gap-2">
                          <span>{fb.user?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({fb.user?.college})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{fb.user?.email}</div>
                      </div>
                    </div>

                    {/* Star Rating & Date */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= fb.rating
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-slate-400 font-mono text-xs">
                        {new Date(fb.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Resource & Skill context */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {fb.skillName}
                    </span>
                    <a
                      href={fb.resource?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-white hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                    >
                      <span>{fb.resource?.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                    <span className="text-slate-500 font-mono text-[11px]">
                      via {fb.resource?.provider}
                    </span>
                  </div>

                  {/* Comment */}
                  {fb.comment && (
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-[#070b14]/70 p-3 rounded-xl border border-white/5 italic">
                      &ldquo;{fb.comment}&rdquo;
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
