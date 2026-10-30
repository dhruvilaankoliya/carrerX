'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  MessageSquare,
  Send,
  Check,
  X,
  Search,
  Sparkles,
  Clock,
  Hash,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  RefreshCw,
  Terminal,
  Compass,
  Code2,
  BookOpen,
  ArrowLeftRight,
  LogOut,
} from 'lucide-react';

interface ConnectionItem {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerCollege?: string;
  partnerCourse?: string;
  partnerYear?: number;
  partnerPhoto?: string | null;
  partnerRole?: string;
  status: string;
  message?: string;
  createdAt: string;
}

interface MessageItem {
  id: string;
  senderId: string;
  receiverId?: string;
  senderName?: string;
  senderCollege?: string;
  senderPhoto?: string | null;
  body?: string;
  text?: string;
  createdAt: string;
  isSelf: boolean;
}

const STUDY_CHANNELS = [
  {
    id: 'ml-engineering',
    name: 'ml-engineering',
    title: 'ML & AI Study Hub',
    desc: 'Deep learning, PyTorch, Transformers, Model Serving & MLOps pipelines',
    tag: 'Tier-1 ML Hub',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'kubernetes-devops',
    name: 'kubernetes-devops',
    title: 'Kubernetes & Cloud Hub',
    desc: 'Cluster orchestration, Docker, Helm charts, CI/CD and production infra',
    tag: 'DevOps & Infra',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'fullstack-architect',
    name: 'fullstack-architect',
    title: 'Full-Stack Systems',
    desc: 'Next.js 15, FastAPI, PostgreSQL, Prisma, caching, and scalable APIs',
    tag: 'System Design',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'interview-prep',
    name: 'interview-prep',
    title: 'Mock Interviews & DSA',
    desc: 'Daily LeetCode patterns, system design rounds, and behavioral peer drills',
    tag: 'Career Ready',
    color: 'from-purple-500 to-pink-600',
  },
];

export default function NetworkPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'requests' | 'discover'>('chat');
  const [chatMode, setChatMode] = useState<'direct' | 'channel'>('direct');
  const [selectedBuddyId, setSelectedBuddyId] = useState<string>('');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('ml-engineering');

  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionItem[]>([]);
  const [discoverStudents, setDiscoverStudents] = useState<any[]>([]);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const [searchFilter, setSearchFilter] = useState('');
  const [discoverSearch, setDiscoverSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Send Request Modal State
  const [connectModalStudent, setConnectModalStudent] = useState<any | null>(null);
  const [connectIntroMessage, setConnectIntroMessage] = useState('');
  const [sendingConnectRequest, setSendingConnectRequest] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Load: Authenticated User, Connections & Discoverable Students
  useEffect(() => {
    fetchCurrentUser();
    fetchConnections();
    fetchDiscoverStudents();

    const interval = setInterval(() => {
      fetchConnections();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch (e) {
      console.error('Failed to fetch user:', e);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/connections');
      if (res.ok) {
        const data = await res.json();
        const conns: ConnectionItem[] = data.connections || [];
        setConnections(conns);
        setIncomingRequests(data.incomingRequests || []);
        setOutgoingRequests(data.outgoingRequests || []);

        // Ensure selected buddy exists in current connections list
        if (conns.length > 0) {
          setSelectedBuddyId((prev) => {
            const exists = conns.some((c) => c.partnerId === prev);
            return exists ? prev : conns[0].partnerId;
          });
        }
      }
    } catch (e) {
      console.error('Failed to load connections:', e);
    }
  };

  const fetchDiscoverStudents = async () => {
    try {
      const res = await fetch('/api/matching?mode=all&sort=best_skill_match');
      if (res.ok) {
        const data = await res.json();
        setDiscoverStudents(data.matches || []);
      }
    } catch (e) {
      console.error('Failed to load discover students:', e);
    }
  };

  // 2. Load Messages whenever active chat target changes
  useEffect(() => {
    fetchMessages();
    const timer = setInterval(fetchMessages, 2500);
    return () => clearInterval(timer);
  }, [chatMode, selectedBuddyId, selectedChannelId]);

  const fetchMessages = async () => {
    if (chatMode === 'direct') {
      if (!selectedBuddyId) {
        setMessages([]);
        return;
      }
      try {
        const res = await fetch(`/api/messages?targetUserId=${selectedBuddyId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (e) {
        console.error('Error fetching direct messages:', e);
      }
    } else {
      try {
        const res = await fetch(`/api/channels?channelId=${selectedChannelId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (e) {
        console.error('Error fetching channel messages:', e);
      }
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || sendingMessage) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setSendingMessage(true);

    try {
      if (chatMode === 'direct') {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId: selectedBuddyId,
            messageBody: textToSend,
          }),
        });
        if (res.ok) {
          await fetchMessages();
        } else {
          showToast('Failed to send message. Please try again.');
        }
      } else {
        const res = await fetch('/api/channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelId: selectedChannelId,
            text: textToSend,
          }),
        });
        if (res.ok) {
          await fetchMessages();
        } else {
          showToast('Failed to post to channel.');
        }
      }
    } catch (e) {
      console.error(e);
      showToast('Network error while sending message.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Quick Account Persona Switcher
  const handleQuickSwitchUser = async (targetEmail: string) => {
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail }),
      });
      if (res.ok) {
        const partnerDisplayName = targetEmail.includes('aarav') ? 'Aarav Sharma' : 'Dhruvila';
        showToast(`Switched account to ${partnerDisplayName}!`);
        setSelectedBuddyId('');
        await fetchCurrentUser();
        await fetchConnections();
        await fetchDiscoverStudents();
      }
    } catch {
      showToast('Error switching accounts.');
    }
  };

  // Simulate Partner Reply (for testing in a single tab)
  const handleSimulatePartnerReply = async () => {
    if (!selectedBuddyId) return;
    try {
      const sampleReplies = [
        "Hey! Yes, I just deployed the Kubernetes Helm chart. Let's review the ingress settings!",
        "Awesome! I've been working on Triton inference serving with Docker containerization.",
        "That sounds great! Want to do a mock system design interview round later today?",
        "Checked out your roadmap progress — looking very strong on ML fundamentals!",
      ];
      const randomReply = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];

      const res = await fetch('/api/messages/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: selectedBuddyId,
          text: randomReply,
        }),
      });
      if (res.ok) {
        await fetchMessages();
        showToast(`💬 Received live reply from ${activeBuddy?.partnerName || 'peer'}!`);
      }
    } catch {
      showToast('Simulation error.');
    }
  };

  // Respond to Connection Request
  const handleRespondRequest = async (connectionId: string, action: 'accept' | 'decline') => {
    setRespondingId(connectionId);
    try {
      const res = await fetch('/api/connections/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, action }),
      });
      if (res.ok) {
        showToast(action === 'accept' ? '🎉 Connection accepted! Channel created.' : 'Connection declined.');
        await fetchConnections();
        await fetchDiscoverStudents();
        if (action === 'accept') {
          setActiveTab('chat');
          setChatMode('direct');
        }
      } else {
        showToast('Error responding to request.');
      }
    } catch {
      showToast('Network error.');
    } finally {
      setRespondingId(null);
    }
  };

  // Send New Connection Request
  const handleOpenConnectModal = (student: any) => {
    setConnectModalStudent(student);
    setConnectIntroMessage(
      `Hey ${student.name.split(' ')[0]}! I saw your ${student.careerGoal || 'engineering'} profile on CareerX. Would love to connect and share study roadmaps!`
    );
  };

  const handleSendConnectionRequest = async () => {
    if (!connectModalStudent || sendingConnectRequest) return;
    setSendingConnectRequest(true);
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: connectModalStudent.userId || connectModalStudent.id,
          message: connectIntroMessage,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`🚀 Connection request sent to ${connectModalStudent.name}!`);
        setConnectModalStudent(null);
        await fetchConnections();
        await fetchDiscoverStudents();
      } else {
        showToast(data.error || 'Failed to send connection request.');
      }
    } catch {
      showToast('Network error while sending request.');
    } finally {
      setSendingConnectRequest(false);
    }
  };

  const activeBuddy = connections.find((c) => c.partnerId === selectedBuddyId);
  const activeChannel = STUDY_CHANNELS.find((c) => c.id === selectedChannelId);

  // Determine current user display info
  const isDhruvila = currentUser?.email === 'dhruvila@careerx.dev';
  const otherUserEmail = isDhruvila ? 'aarav.sharma@demo.careerx.dev' : 'dhruvila@careerx.dev';
  const otherUserName = isDhruvila ? 'Aarav Sharma (IIT Bombay)' : 'Dhruvila (Dharmsinh Desai Univ)';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-[0_0_25px_rgba(6,182,212,0.5)] animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Top Command Header ────────────────────────────────────── */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-[#0d1424] via-[#09101f] to-[#060a12] border border-cyan-500/30 rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Peer Study Network & Channels
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Face-to-Face Chat
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              CareerX <span className="text-gradient">Communication Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Connect with fellow engineering students, accept incoming peer requests, and collaborate across 1-on-1 direct channels and community study groups.
            </p>
          </div>

          {/* Quick Metrics & Persona Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Active Identity Pill */}
            {currentUser && (
              <div className="px-3.5 py-1.5 rounded-2xl bg-[#0f172a] border border-cyan-500/40 text-xs flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-slate-400 text-[11px]">Logged in as:</span>
                <span className="font-bold text-white font-heading">{currentUser.name}</span>
                <span className="text-[10px] text-cyan-300 font-mono">({currentUser.profile?.college?.split(' ')[0] || 'DDU'})</span>
              </div>
            )}

            {/* Quick Switch Button */}
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              className="px-3.5 py-1.5 rounded-2xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Log out and choose another demo student from the login page"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Switch Account / Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 mt-6 pt-2 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`pb-3 px-4 font-heading font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'chat'
                ? 'border-cyan-400 text-cyan-300 shadow-[0_2px_12px_rgba(6,182,212,0.4)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Channels & Messages</span>
            {connections.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                {connections.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-4 font-heading font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'requests'
                ? 'border-cyan-400 text-cyan-300 shadow-[0_2px_12px_rgba(6,182,212,0.4)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Connection Requests</span>
            {incomingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold animate-pulse">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`pb-3 px-4 font-heading font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'discover'
                ? 'border-cyan-400 text-cyan-300 shadow-[0_2px_12px_rgba(6,182,212,0.4)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Discover & Connect</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: CHANNELS & MESSAGES ────────────────────────────── */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
          {/* Left Sidebar: Channels & Direct Peers */}
          <div className="lg:col-span-4 glass-card p-4 flex flex-col gap-4 bg-[#090e1a]/95 border-cyan-500/25">
            {/* Search channels & peers */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search channels or peers..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#060a12] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Section 1: Study Topic Channels */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 font-bold px-2 py-1">
                <span>Study Group Channels</span>
                <span className="text-cyan-400">#</span>
              </div>
              {STUDY_CHANNELS.filter((ch) =>
                ch.title.toLowerCase().includes(searchFilter.toLowerCase()) || ch.name.includes(searchFilter.toLowerCase())
              ).map((ch) => {
                const isActive = chatMode === 'channel' && selectedChannelId === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setChatMode('channel');
                      setSelectedChannelId(ch.id);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 text-cyan-200 shadow-sm'
                        : 'hover:bg-white/5 border border-transparent text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold flex-shrink-0">
                        #
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading font-bold text-xs truncate">{ch.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{ch.desc}</div>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono whitespace-nowrap">
                      {ch.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Section 2: Direct Study Buddies (Connected Network) */}
            <div className="space-y-1.5 pt-3 border-t border-white/10 flex-1 flex flex-col">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 font-bold px-2 py-1">
                <span>Direct Network Channels</span>
                <span className="text-emerald-400 font-bold">{connections.length}</span>
              </div>

              {connections.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#060a12]/80 border border-dashed border-white/10 text-center space-y-2.5 my-auto">
                  <Users className="w-6 h-6 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-semibold">No Connected Friends Yet</p>
                  <p className="text-[11px] text-slate-400">
                    Send a connection request to connect and chat!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('discover')}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-xs transition-all inline-block"
                  >
                    Find Students →
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 overflow-y-auto max-h-[280px] custom-scrollbar">
                  {connections
                    .filter((c) => c.partnerName.toLowerCase().includes(searchFilter.toLowerCase()))
                    .map((conn) => {
                      const isActive = chatMode === 'direct' && selectedBuddyId === conn.partnerId;
                      return (
                        <button
                          key={conn.id}
                          type="button"
                          onClick={() => {
                            setChatMode('direct');
                            setSelectedBuddyId(conn.partnerId);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2.5 ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/50 text-emerald-200 shadow-sm'
                              : 'hover:bg-white/5 border border-transparent text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {conn.partnerPhoto ? (
                              <img
                                src={conn.partnerPhoto}
                                alt={conn.partnerName}
                                className="w-8 h-8 rounded-lg object-cover border border-emerald-400/40 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {conn.partnerName.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-heading font-bold text-xs truncate text-white">
                                  {conn.partnerName}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {conn.partnerCollege}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                            Chat
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Right Main Area: The Communication Channel */}
          <div className="lg:col-span-8 glass-card p-0 flex flex-col bg-[#090e1a]/95 border-cyan-500/25 overflow-hidden">
            {/* Channel Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-[#0d1527] to-[#070b14] flex items-center justify-between">
              {chatMode === 'direct' ? (
                activeBuddy ? (
                  <div className="flex items-center gap-3">
                    {activeBuddy.partnerPhoto ? (
                      <img
                        src={activeBuddy.partnerPhoto}
                        alt={activeBuddy.partnerName}
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-400/50"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-sm">
                        {activeBuddy.partnerName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-base text-white">{activeBuddy.partnerName}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected Peer
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {activeBuddy.partnerCollege} • {activeBuddy.partnerCourse}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-slate-400">Select a study buddy to start messaging</div>
                )
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-lg">
                    #
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-base text-white">{activeChannel?.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                        {activeChannel?.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{activeChannel?.desc}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchMessages}
                  title="Refresh messages"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Channel Messages Stream */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[460px] min-h-[380px] custom-scrollbar bg-[#060a12]/50">
              {messages.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-slate-200">
                    {chatMode === 'direct'
                      ? activeBuddy
                        ? `Start conversation with ${activeBuddy.partnerName}`
                        : 'No chat selected'
                      : `Welcome to #${activeChannel?.name}`}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Say hello, share insights on your Kubernetes or ML roadmaps, or ask a question!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  // Direct peer resolution: if senderId matches current logged in user, it's YOU on the right.
                  const isMe = currentUser ? m.senderId === currentUser.id : m.isSelf;
                  const messageBody = m.body || m.text;
                  const senderName = isMe ? `You (${currentUser?.name || 'Me'})` : (m.senderName || activeBuddy?.partnerName || 'Peer');
                  const senderCollege = isMe ? (currentUser?.profile?.college || '') : (m.senderCollege || activeBuddy?.partnerCollege || '');

                  return (
                    <div key={m.id} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-1 shadow-sm">
                          {(m.senderName || activeBuddy?.partnerName || 'CX').substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className={`max-w-[75%] sm:max-w-[65%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400">
                          <span className={`font-semibold ${isMe ? 'text-cyan-300' : 'text-emerald-300'}`}>
                            {senderName}
                          </span>
                          {senderCollege && !isMe && (
                            <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                              • {senderCollege}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-500">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                            isMe
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                              : 'bg-[#10192e] border border-emerald-500/30 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          {messageBody}
                        </div>
                      </div>

                      {isMe && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-1 shadow-sm">
                          {(currentUser?.name || 'ME').substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-4 py-2 bg-[#080d1a] border-t border-white/5 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-500 flex-shrink-0 flex items-center gap-1 font-mono text-[10px]">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Actions:
              </span>
              <button
                type="button"
                onClick={() => setMessageText('Hey! Are you working through the Kubernetes roadmap right now?')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors whitespace-nowrap"
              >
                Kubernetes Roadmap?
              </button>
              <button
                type="button"
                onClick={() => setMessageText('Would love to review system design and MLOps architecture together!')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors whitespace-nowrap"
              >
                MLOps Review
              </button>
              {chatMode === 'direct' && activeBuddy && (
                <button
                  type="button"
                  onClick={handleSimulatePartnerReply}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white font-semibold transition-all whitespace-nowrap flex items-center gap-1"
                  title="Simulate instant reply from partner to test two-way communication"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Simulate {activeBuddy.partnerName.split(' ')[0]}'s Reply</span>
                </button>
              )}
            </div>

            {/* Message Composer Input */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-white/10 bg-[#070b14] flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={
                  chatMode === 'direct'
                    ? activeBuddy
                      ? `Message ${activeBuddy.partnerName}...`
                      : 'Select a buddy to message'
                    : `Message #${activeChannel?.name}...`
                }
                disabled={chatMode === 'direct' && !activeBuddy}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#090e1a] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sendingMessage || (chatMode === 'direct' && !activeBuddy)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/25 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 2: CONNECTION REQUESTS (SEND & ACCEPT) ────────────── */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Incoming Requests Section */}
          <div className="glass-panel p-6 bg-[#090e1a]/90 border-cyan-500/30 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-white">
                    Incoming Study Requests ({incomingRequests.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Students who want to connect with you, collaborate, and share insights.
                  </p>
                </div>
              </div>
            </div>

            {incomingRequests.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No pending incoming requests</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When other peers want to connect with you, they will appear here!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-[#0b1222] border border-cyan-500/30 hover:border-cyan-400/50 transition-all space-y-4 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {req.partnerPhoto ? (
                          <img
                            src={req.partnerPhoto}
                            alt={req.partnerName}
                            className="w-12 h-12 rounded-xl object-cover border border-cyan-400/40"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                            {req.partnerName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-heading font-bold text-sm text-white">{req.partnerName}</h4>
                          <p className="text-xs text-slate-400">
                            {req.partnerCourse} {req.partnerYear ? `• Year ${req.partnerYear}` : ''}
                          </p>
                          <p className="text-[11px] text-slate-500">{req.partnerCollege}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                        {req.partnerRole || 'Peer'}
                      </span>
                    </div>

                    {req.message && (
                      <div className="p-3 rounded-xl bg-[#060a12] border border-white/5 text-xs text-slate-300 italic">
                        "{req.message}"
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={respondingId === req.id}
                        onClick={() => handleRespondRequest(req.id, 'accept')}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {respondingId === req.id ? 'Connecting...' : 'Accept Connection'}
                      </button>
                      <button
                        type="button"
                        disabled={respondingId === req.id}
                        onClick={() => handleRespondRequest(req.id, 'decline')}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 font-semibold text-xs transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Pending Requests Section */}
          <div className="glass-panel p-6 bg-[#090e1a]/90 border-white/10 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-white">
                    Sent Requests ({outgoingRequests.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Requests you sent to peers that are currently awaiting their response.
                  </p>
                </div>
              </div>
            </div>

            {outgoingRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                You have no pending outgoing requests. Explore the "Discover & Connect" tab to reach out!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {outgoingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-[#0b1222] border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-cyan-600/30 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {req.partnerName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate">{req.partnerName}</div>
                        <div className="text-[11px] text-slate-400 truncate">{req.partnerCollege}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono flex-shrink-0">
                      Pending...
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: DISCOVER & SEND REQUESTS ───────────────────────── */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="glass-panel p-5 bg-[#090e1a]/90 border-cyan-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search fellow students by name, college, skill, or career target..."
                value={discoverSearch}
                onChange={(e) => setDiscoverSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#060a12] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              type="button"
              onClick={fetchDiscoverStudents}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh List
            </button>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {discoverStudents
              .filter((st) => {
                const q = discoverSearch.toLowerCase();
                return (
                  st.name.toLowerCase().includes(q) ||
                  (st.college || '').toLowerCase().includes(q) ||
                  (st.careerGoal || '').toLowerCase().includes(q) ||
                  (st.matchingSkills || []).some((s: string) => s.toLowerCase().includes(q))
                );
              })
              .map((st) => {
                const isConnected = st.connectionStatus === 'accepted';
                const isPending = st.connectionStatus === 'pending';

                return (
                  <div
                    key={st.userId}
                    className="glass-card p-5 bg-[#090e1a]/95 border-cyan-500/30 hover:border-cyan-400/60 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {st.profilePhoto ? (
                            <img
                              src={st.profilePhoto}
                              alt={st.name}
                              className="w-12 h-12 rounded-xl object-cover border border-cyan-400/40"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                              {st.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-heading font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                                {st.name}
                              </h4>
                              {isConnected && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Connected Buddy" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {st.course} {st.year ? `• Year ${st.year}` : ''}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{st.college}</p>
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                          {st.matchPercentage ? `${st.matchPercentage}% Match` : 'Peer'}
                        </span>
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(st.matchingSkills || st.technicalSkills || ['Kubernetes', 'Python', 'MLOps']).slice(0, 4).map((sk: string) => (
                          <span
                            key={sk}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-3 border-t border-white/10">
                      {isConnected ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('chat');
                            setChatMode('direct');
                            setSelectedBuddyId(st.userId);
                          }}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Open Channel
                        </button>
                      ) : isPending ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-default"
                        >
                          <Clock className="w-3.5 h-3.5 text-cyan-400" /> Request Pending...
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenConnectModal(st)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/25 transition-all hover:scale-[1.02]"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Send Connection Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ─── Send Connection Request Modal ─────────────────────────── */}
      {connectModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg bg-[#090e1a]/95 border border-cyan-500/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.2)] overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-white">
                    Connect with {connectModalStudent.name}
                  </h3>
                  <p className="text-xs text-slate-400">{connectModalStudent.college}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConnectModalStudent(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Introduction Message
                </label>
                <textarea
                  rows={4}
                  value={connectIntroMessage}
                  onChange={(e) => setConnectIntroMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#060a12] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Mention mutual study topics (Kubernetes, MLOps, System Design) to boost acceptance!
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConnectModalStudent(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={sendingConnectRequest}
                  onClick={handleSendConnectionRequest}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/25 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingConnectRequest ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
