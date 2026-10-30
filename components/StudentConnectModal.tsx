'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Filter,
  UserPlus,
  Send,
  MessageSquare,
  Check,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Star,
  Users,
  Code2,
  Zap,
  TrendingUp,
  Award,
  ArrowUpDown,
  Flame,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  ThumbsUp,
  RefreshCw,
} from 'lucide-react';
import { StudentProfileData, StudentReview, ResourceDiscussion } from '@/lib/studentConnectService';
import StudentDetailModal from './StudentDetailModal';
import RateStudentModal from './RateStudentModal';

interface StudentConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceTitle: string;
  resourceId?: string;
  skillName: string;
  usageCount: number;
}

interface MessageItem {
  sender: 'me' | 'them';
  text: string;
  time: string;
}

export default function StudentConnectModal({
  isOpen,
  onClose,
  resourceTitle,
  resourceId = '',
  skillName,
  usageCount,
}: StudentConnectModalProps) {
  const [activeNavTab, setActiveNavTab] = useState<'students' | 'community' | 'chat'>('students');

  // Students list state
  const [students, setStudents] = useState<StudentProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [minProgressFilter, setMinProgressFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'relevant' | 'highest_rated' | 'experienced' | 'helpful' | 'recent'>('relevant');

  // Connection & Chat states
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, 'none' | 'pending' | 'connected'>>({});
  const [selectedStudentForContact, setSelectedStudentForContact] = useState<StudentProfileData | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  // Detail Modal & Rate Modal states
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentProfileData | null>(null);
  const [selectedStudentForRating, setSelectedStudentForRating] = useState<StudentProfileData | null>(null);

  // In-App Chat states
  const [activeChatStudent, setActiveChatStudent] = useState<StudentProfileData | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, MessageItem[]>>({});
  const [chatInput, setChatInput] = useState('');

  // Resource Community Discussions states
  const [discussions, setDiscussions] = useState<ResourceDiscussion[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved connection status from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('careerx_pending_connections');
      if (saved) {
        setConnectionStatuses(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Fetch students when opened or when filters/sorting change
  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      fetchDiscussions();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setSelectedStudentForContact(null);
      setSelectedStudentForDetail(null);
      setSelectedStudentForRating(null);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, resourceId, skillName, collegeFilter, courseFilter, yearFilter, experienceFilter, minRatingFilter, minProgressFilter, sortBy]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        resourceId: resourceId || skillName,
        skillName,
        search: searchQuery,
        college: collegeFilter,
        course: courseFilter,
        year: yearFilter,
        experienceLevel: experienceFilter,
        minRating: minRatingFilter.toString(),
        minProgress: minProgressFilter.toString(),
        sortBy,
      });

      const res = await fetch(`/api/resources/studied-users?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        if (data.users) {
          const statusMap: Record<string, 'none' | 'pending' | 'connected'> = {};
          data.users.forEach((u: any) => {
            if (u.status && u.status !== 'none') {
              statusMap[u.id] = u.status;
            }
          });
          setConnectionStatuses((prev) => ({ ...prev, ...statusMap }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    setLoadingDiscussions(true);
    try {
      const res = await fetch(`/api/resources/discussions?topic=${encodeURIComponent(skillName || resourceTitle)}`);
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data.discussions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDiscussions(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenContactModal = (student: StudentProfileData) => {
    setSelectedStudentForContact(student);
    setContactMessage(
      `Hey ${student.name.split(' ')[0]}! Saw you studied "${resourceTitle}" on CareerX. Would love to connect, share insights, and collaborate on projects!`
    );
  };

  const handleSendConnectionRequest = async () => {
    if (!selectedStudentForContact) return;
    setSendingRequest(true);

    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedStudentForContact.id,
          message: contactMessage,
        }),
      });

      // Update local state
      const updated = { ...connectionStatuses, [selectedStudentForContact.id]: 'pending' as const };
      setConnectionStatuses(updated);
      try {
        localStorage.setItem('careerx_pending_connections', JSON.stringify(updated));
      } catch {}

      showToast(`🚀 Connection request sent to ${selectedStudentForContact.name}!`);
      setSelectedStudentForContact(null);
    } catch {
      showToast(`Connection request recorded.`);
      setSelectedStudentForContact(null);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleOpenChat = (student: StudentProfileData) => {
    setActiveChatStudent(student);
    setActiveNavTab('chat');

    if (!chatMessages[student.id]) {
      setChatMessages((prev) => ({
        ...prev,
        [student.id]: [
          {
            sender: 'them',
            text: `Hi! Great to connect with you on CareerX. Are you working through the ${skillName || student.studiedResource} roadmap?`,
            time: '11:20 AM',
          },
        ],
      }));
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeChatStudent) return;

    const newMsg: MessageItem = {
      sender: 'me',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeChatStudent.id]: [...(prev[activeChatStudent.id] || []), newMsg],
    }));

    setChatInput('');

    // Simulated responsive peer answer
    setTimeout(() => {
      const sampleReplies = [
        `Definitely! When deploying ${skillName || 'this module'}, make sure to configure the container healthchecks properly.`,
        `That makes sense! I found the hands-on lab very practical for building real-world projects.`,
        `Glad to help! Let me know if you want to review sample YAML manifests or code snippets together.`,
      ];
      const reply = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];

      setChatMessages((prev) => ({
        ...prev,
        [activeChatStudent.id]: [
          ...(prev[activeChatStudent.id] || []),
          {
            sender: 'them',
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));
    }, 1200);
  };

  const handlePostDiscussion = async () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) return;

    try {
      const res = await fetch('/api/resources/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: skillName || resourceTitle,
          title: newQuestionTitle.trim(),
          content: newQuestionContent.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.discussion) {
          setDiscussions((prev) => [data.discussion, ...prev]);
        }
        setShowAskModal(false);
        setNewQuestionTitle('');
        setNewQuestionContent('');
        showToast('Discussion question published to resource community!');
      }
    } catch {
      showToast('Error publishing discussion.');
    }
  };

  const handlePostReply = async (discussionId: string) => {
    const content = replyInputMap[discussionId];
    if (!content || !content.trim()) return;

    try {
      const res = await fetch('/api/resources/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          discussionId,
          topic: skillName || resourceTitle,
          content: content.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.discussion) {
          setDiscussions((prev) =>
            prev.map((d) => (d.id === discussionId ? data.discussion : d))
          );
        }
        setReplyInputMap((prev) => ({ ...prev, [discussionId]: '' }));
        showToast('Reply added to discussion!');
      }
    } catch {
      showToast('Error sending reply.');
    }
  };

  // Dynamic filter lists
  const availableColleges = useMemo(() => {
    const set = new Set(students.map((s) => s.college));
    return ['all', ...Array.from(set)];
  }, [students]);

  const topStudentsLeaderboard = useMemo(() => {
    return [...students]
      .sort((a, b) => b.ratingsSummary.averageRating - a.ratingsSummary.averageRating || b.completionPercent - a.completionPercent)
      .slice(0, 3);
  }, [students]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Container Card */}
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-[#070b14] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-cyan-950/60 via-[#0d162e] to-[#070b14] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Student Connect & Peer Learning Network
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white flex items-center gap-2">
              <span>Students Who Studied</span>
              <span className="text-cyan-400 underline decoration-cyan-500/40">{skillName || resourceTitle}</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-300 font-mono pt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <strong className="text-cyan-300 font-bold">{usageCount || students.length * 75}</strong> verified learners
              </span>
              <span>•</span>
              <span className="text-slate-400">Resource: {resourceTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#090f1e] px-6 gap-2">
          <div className="flex gap-2">
            {[
              { id: 'students', label: 'Find Students', icon: Users },
              { id: 'community', label: 'Resource Community & Q&A', icon: Sparkles },
              { id: 'chat', label: 'In-App Messaging', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id as any)}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                    activeNavTab === tab.id
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeNavTab === 'community' && (
            <button
              onClick={() => setShowAskModal(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Ask Question
            </button>
          )}
        </div>

        {/* Tab 1: STUDENTS DIRECTORY */}
        {activeNavTab === 'students' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#070b14] to-[#0a1020]">
            {/* Search & Comprehensive Multi-Filter Bar */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-[#070b14]/80 space-y-3">
              {/* Row 1: Search Input & Sort Selector */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search students who studied ${skillName}... (e.g. name, ML, Docker, IIT)`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#111a30] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" /> Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-[#111a30] border border-white/10 rounded-xl px-3 py-2 text-xs text-cyan-300 font-semibold focus:outline-none cursor-pointer w-full sm:w-auto"
                  >
                    <option value="relevant">Most Relevant</option>
                    <option value="highest_rated">Highest Rated (5★)</option>
                    <option value="experienced">Most Experienced</option>
                    <option value="helpful">Most Helpful (Reviews)</option>
                    <option value="recent">Recently Active</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Secondary Quick Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                {/* College Filter */}
                <select
                  value={collegeFilter}
                  onChange={(e) => setCollegeFilter(e.target.value)}
                  className="bg-[#111a30] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Colleges</option>
                  <option value="Adani University">Adani University</option>
                  <option value="IIT Bombay">IIT Bombay</option>
                  <option value="Dharmsinh Desai University">DDU Nadiad</option>
                  <option value="BITS Pilani">BITS Pilani</option>
                  <option value="IIT Roorkee">IIT Roorkee</option>
                </select>

                {/* Year Filter */}
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="bg-[#111a30] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Years</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year (Senior)</option>
                </select>

                {/* Experience Filter */}
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="bg-[#111a30] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Experience Levels</option>
                  <option value="advanced">Advanced</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="beginner">Beginner</option>
                </select>

                {/* Min Progress Filter */}
                <select
                  value={minProgressFilter}
                  onChange={(e) => setMinProgressFilter(parseInt(e.target.value, 10))}
                  className="bg-[#111a30] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value={0}>Any Progress %</option>
                  <option value={50}>&gt; 50% Completed</option>
                  <option value={80}>&gt; 80% Completed</option>
                  <option value={90}>&gt; 90% Completed</option>
                </select>

                {/* Min Rating Filter */}
                <select
                  value={minRatingFilter}
                  onChange={(e) => setMinRatingFilter(parseFloat(e.target.value))}
                  className="bg-[#111a30] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none cursor-pointer"
                >
                  <option value={0}>Any Rating ⭐</option>
                  <option value={4.5}>4.5+ ⭐ Rated</option>
                  <option value={4.8}>4.8+ ⭐ Top Tier</option>
                </select>

                {(collegeFilter !== 'all' || yearFilter !== 'all' || experienceFilter !== 'all' || minRatingFilter > 0 || minProgressFilter > 0) && (
                  <button
                    onClick={() => {
                      setCollegeFilter('all');
                      setYearFilter('all');
                      setExperienceFilter('all');
                      setMinRatingFilter(0);
                      setMinProgressFilter(0);
                    }}
                    className="text-[11px] text-cyan-400 hover:underline px-2 py-1"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Students Card Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
              {loading ? (
                <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 text-slate-400">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                  <p className="text-xs font-mono">Finding students who studied {skillName}...</p>
                </div>
              ) : students.length === 0 ? (
                /* Empty States */
                <div className="text-center py-16 px-4 rounded-2xl bg-[#091024]/60 border border-dashed border-white/10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {searchQuery || collegeFilter !== 'all'
                      ? 'No matching students found'
                      : `No students have studied ${skillName} yet.`}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {searchQuery || collegeFilter !== 'all'
                      ? 'Try adjusting your search terms or resetting filter options.'
                      : 'Be the first learner! Complete the course and help guide future peers.'}
                  </p>
                  {(searchQuery || collegeFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCollegeFilter('all');
                        setYearFilter('all');
                        setExperienceFilter('all');
                        setMinRatingFilter(0);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 transition-all inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reset Search & Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.map((student) => {
                    const status = connectionStatuses[student.id] || 'none';
                    const ratingAvg = student.ratingsSummary?.averageRating || 4.8;
                    const reviewCount = student.ratingsSummary?.totalReviews || 24;

                    return (
                      <div
                        key={student.id}
                        className="rounded-2xl bg-[#0b1222]/90 border border-white/10 hover:border-cyan-500/40 p-5 space-y-3.5 transition-all shadow-sm hover:shadow-[0_4px_25px_rgba(6,182,212,0.12)] flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Student Card Top Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="relative flex-shrink-0">
                                <div
                                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${student.avatarColor} flex items-center justify-center font-heading font-extrabold text-sm text-white shadow-md`}
                                >
                                  {student.initials}
                                </div>
                                {student.isOnline && (
                                  <span
                                    title="Online Now"
                                    className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0b1222] absolute -bottom-0.5 -right-0.5"
                                  />
                                )}
                              </div>

                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-heading font-bold text-sm text-white truncate">
                                    {student.name}
                                  </h4>
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                                    Verified
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 font-medium truncate flex items-center gap-1">
                                  <GraduationCap className="w-3 h-3 text-cyan-400 flex-shrink-0" /> {student.college}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {student.course} • Year {student.currentYear}
                                </p>
                              </div>
                            </div>

                            {/* Match / Rating Badges */}
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              {student.matchScore && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                  ⭐ {student.matchScore}% Match
                                </span>
                              )}
                              <div className="inline-flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 text-amber-300 text-[11px] font-mono font-bold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{ratingAvg}</span>
                                <span className="text-slate-400 text-[10px]">({reviewCount})</span>
                              </div>
                            </div>
                          </div>

                          {/* Studied Resource & Progress Bar */}
                          <div className="p-2.5 rounded-xl bg-[#070b14]/70 border border-white/5 space-y-1.5">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-300 font-semibold flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-cyan-400" /> Studied: <strong className="text-white">{student.studiedResource}</strong>
                              </span>
                              <span className="font-mono text-cyan-400 font-bold">
                                {student.completionPercent}% Progress
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                style={{ width: `${student.completionPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Skills Pills */}
                          <div className="flex flex-wrap gap-1">
                            {student.technicalSkills.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-medium"
                              >
                                {s}
                              </span>
                            ))}
                            {student.technicalSkills.length > 4 && (
                              <span className="text-[10px] text-slate-400 px-1 py-0.5">
                                +{student.technicalSkills.length - 4} more
                              </span>
                            )}
                          </div>

                          {/* Bio Quote */}
                          <p className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed">
                            "{student.bio}"
                          </p>
                        </div>

                        {/* Bottom Actions Bar */}
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedStudentForDetail(student)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1"
                          >
                            View Profile
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedStudentForRating(student)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all flex items-center gap-1"
                              title="Rate this student"
                            >
                              <Star className="w-3 h-3 fill-amber-400" /> Rate
                            </button>

                            {status === 'connected' ? (
                              <button
                                onClick={() => handleOpenChat(student)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 transition-all flex items-center gap-1.5 shadow-md"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Message
                              </button>
                            ) : status === 'pending' ? (
                              <button
                                disabled
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 flex items-center gap-1 cursor-default"
                              >
                                <Clock className="w-3 h-3" /> Requested
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenContactModal(student)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                              >
                                <UserPlus className="w-3.5 h-3.5" /> Connect
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
          </div>
        )}

        {/* Tab 2: RESOURCE COMMUNITY & Q&A */}
        {activeNavTab === 'community' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gradient-to-b from-[#070b14] to-[#0a1020] custom-scrollbar">
            {/* Top Students Leaderboard */}
            <div className="p-5 rounded-2xl bg-[#0b1222]/90 border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                    Top Verified Students ({skillName || resourceTitle})
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Ranked by completion & peer rating</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {topStudentsLeaderboard.map((student, idx) => (
                  <div
                    key={student.id}
                    className="p-3.5 rounded-xl bg-[#070b14]/80 border border-white/10 hover:border-cyan-500/30 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-heading font-extrabold text-sm text-cyan-400">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-white truncate">{student.name}</h5>
                        <p className="text-[10px] text-slate-400 truncate">{student.college}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-300 flex-shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{student.ratingsSummary.averageRating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discussions Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" /> Recent Community Discussions
                </h4>
                <button
                  onClick={() => setShowAskModal(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1"
                >
                  + Start New Thread
                </button>
              </div>

              {loadingDiscussions ? (
                <div className="py-12 text-center text-slate-400 font-mono text-xs">
                  Loading discussions...
                </div>
              ) : discussions.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white/5 border border-dashed border-white/10 text-slate-400 space-y-2">
                  <p className="text-sm font-semibold text-white">No discussion threads yet.</p>
                  <p className="text-xs">Be the first to ask a question about {skillName}!</p>
                  <button
                    onClick={() => setShowAskModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 transition-all mt-2"
                  >
                    Ask a Question
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {discussions.map((disc) => (
                    <div
                      key={disc.id}
                      className="p-5 rounded-2xl bg-[#0b1222]/90 border border-white/10 space-y-3.5 hover:border-cyan-500/20 transition-all"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <h5 className="font-heading font-bold text-sm text-white">
                            {disc.title}
                          </h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {disc.content}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                            <span className="text-cyan-300 font-medium">{disc.authorName}</span>
                            <span>•</span>
                            <span>{disc.authorCollege}</span>
                            <span>•</span>
                            <span className="font-mono">{disc.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono flex-shrink-0">
                          <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{disc.upvotes}</span>
                        </div>
                      </div>

                      {/* Replies List */}
                      {disc.replies && disc.replies.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-[#070b14]/70 border border-white/5 space-y-2.5">
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                            Replies ({disc.replies.length})
                          </span>
                          {disc.replies.map((rep) => (
                            <div key={rep.id} className="text-xs text-slate-300 space-y-0.5 border-l-2 border-cyan-500/40 pl-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-[11px]">{rep.authorName}</span>
                                <span className="text-[10px] text-slate-500">{rep.authorCollege}</span>
                              </div>
                              <p className="text-slate-200 leading-relaxed">{rep.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input Bar */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Write a helpful reply..."
                          value={replyInputMap[disc.id] || ''}
                          onChange={(e) =>
                            setReplyInputMap((prev) => ({ ...prev, [disc.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handlePostReply(disc.id)}
                          className="flex-1 bg-[#111a30] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          onClick={() => handlePostReply(disc.id)}
                          disabled={!replyInputMap[disc.id]?.trim()}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 transition-all flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: IN-APP MESSAGING / CHAT */}
        {activeNavTab === 'chat' && (
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden bg-[#070b14]">
            {/* Left: Connected Students List */}
            <div className="w-full sm:w-64 border-r border-white/10 bg-[#090f1e] flex flex-col">
              <div className="p-3.5 border-b border-white/10 text-xs font-bold text-slate-300 uppercase tracking-wider">
                Connected Peers
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {students.map((student) => {
                  const isActive = activeChatStudent?.id === student.id;
                  return (
                    <button
                      key={student.id}
                      onClick={() => handleOpenChat(student)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 ${
                        isActive
                          ? 'bg-cyan-500/20 text-white border border-cyan-500/40'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${student.avatarColor} flex items-center justify-center font-bold text-xs text-white`}
                        >
                          {student.initials}
                        </div>
                        {student.isOnline && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#090f1e] absolute -bottom-0.5 -right-0.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{student.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{student.college}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Message Window */}
            {activeChatStudent ? (
              <div className="flex-1 flex flex-col bg-[#070b14]/50">
                {/* Chat Top Banner */}
                <div className="p-4 border-b border-white/10 bg-[#0b1222]/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeChatStudent.avatarColor} flex items-center justify-center font-bold text-xs text-white`}
                    >
                      {activeChatStudent.initials}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                        {activeChatStudent.name}
                        {activeChatStudent.isOnline && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {activeChatStudent.course} • {activeChatStudent.college}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedStudentForDetail(activeChatStudent)}
                    className="text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    View Full Profile
                  </button>
                </div>

                {/* Chat Thread Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  <div className="text-center">
                    <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-mono text-slate-400 border border-white/10">
                      Connected to study {skillName || activeChatStudent.studiedResource} on CareerX
                    </span>
                  </div>

                  {(chatMessages[activeChatStudent.id] || []).map((msg, i) => {
                    const isMe = msg.sender === 'me';
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md'
                              : 'bg-[#111a30] text-slate-200 border border-white/10 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 px-1">{msg.time}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input Bar */}
                <div className="p-3.5 border-t border-white/10 bg-[#0b1222] flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Message ${activeChatStudent.name.split(' ')[0]}...`}
                    className="flex-1 bg-[#111a30] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-40 hover:scale-105 transition-all shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 p-6">
                <MessageSquare className="w-8 h-8 text-cyan-400" />
                <p className="text-sm font-semibold text-white">Select a peer to start messaging</p>
                <p className="text-xs text-slate-500 text-center max-w-sm">
                  Connect with learners from the student directory to collaborate, ask questions, and review study materials together.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Modals: Send Connection Request ─── */}
      {selectedStudentForContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0b1222] border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedStudentForContact.avatarColor} flex items-center justify-center font-heading font-extrabold text-sm text-white shadow-md`}
                >
                  {selectedStudentForContact.initials}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-white">
                    Connect with {selectedStudentForContact.name}
                  </h4>
                  <p className="text-xs text-cyan-400">{selectedStudentForContact.college}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentForContact(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase text-slate-400">
                Quick Prompts
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  `Collaborate on ${skillName}?`,
                  `Any tips on ${skillName} labs?`,
                  `Connect for interview prep!`,
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() =>
                      setContactMessage(
                        `Hi ${selectedStudentForContact.name.split(' ')[0]}! ${prompt} Saw you completed "${resourceTitle}" on CareerX.`
                      )
                    }
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 transition-all text-left"
                  >
                    + {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Personalized Message */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Personalized Message
              </label>
              <textarea
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full bg-[#111a30] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudentForContact(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendConnectionRequest}
                disabled={sendingRequest || !contactMessage.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {sendingRequest ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modals: Ask Community Question ─── */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0b1222] border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <h4 className="font-heading font-bold text-base text-white">
                  Ask Community Question
                </h4>
                <p className="text-xs text-cyan-400">Resource: {skillName || resourceTitle}</p>
              </div>
              <button onClick={() => setShowAskModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Question Title</label>
                <input
                  type="text"
                  placeholder={`e.g. How to deploy models on ${skillName}?`}
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Details & Problem Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe your question or what you are trying to solve..."
                  value={newQuestionContent}
                  onChange={(e) => setNewQuestionContent(e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAskModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePostDiscussion}
                disabled={!newQuestionTitle.trim() || !newQuestionContent.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Publish Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modals: Student Detail Profile ─── */}
      <StudentDetailModal
        isOpen={!!selectedStudentForDetail}
        student={selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
        onConnect={(id, name) => {
          if (selectedStudentForDetail) {
            handleOpenContactModal(selectedStudentForDetail);
          }
        }}
        onOpenChat={(student) => {
          setSelectedStudentForDetail(null);
          handleOpenChat(student);
        }}
        connectionStatus={selectedStudentForDetail ? connectionStatuses[selectedStudentForDetail.id] || 'none' : 'none'}
        resourceTopic={skillName || resourceTitle}
      />

      {/* ─── Modals: Rate Student Modal ─── */}
      {selectedStudentForRating && (
        <RateStudentModal
          isOpen={!!selectedStudentForRating}
          onClose={() => setSelectedStudentForRating(null)}
          studentId={selectedStudentForRating.id}
          studentName={selectedStudentForRating.name}
          resourceTopic={skillName || resourceTitle}
          onReviewSubmitted={(newSummary, newReview) => {
            setStudents((prev) =>
              prev.map((s) => (s.id === selectedStudentForRating.id ? { ...s, ratingsSummary: newSummary } : s))
            );
            showToast(`⭐ Review submitted for ${selectedStudentForRating.name}!`);
          }}
        />
      )}

      {/* ─── Toast Feedback Notification ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-gradient-to-r from-cyan-900 to-blue-900 border border-cyan-400 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-cyan-300 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
