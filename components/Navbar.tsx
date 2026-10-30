'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, Network, Map, FileText, CheckCircle2, Bot, LogOut, Menu, X, Sparkles, User as UserIcon, ShieldCheck, Users, MessageSquare, Clock, Check } from 'lucide-react';
import StudyBuddyChatModal from './StudyBuddyChatModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [targetCareer, setTargetCareer] = useState('ml-engineer');
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Study Network & Connection Requests state
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [networkTab, setNetworkTab] = useState<'incoming' | 'connected'>('incoming');
  const [connectionsData, setConnectionsData] = useState<{
    incomingRequests: any[];
    outgoingRequests: any[];
    connections: any[];
  }>({
    incomingRequests: [],
    outgoingRequests: [],
    connections: [],
  });
  const [chatTarget, setChatTarget] = useState<{
    id: string;
    name: string;
    photo?: string | null;
    college?: string;
  } | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
    fetchConnections();
    const timer = setInterval(fetchConnections, 4000);
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, [pathname]);

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/connections');
      if (res.ok) {
        const data = await res.json();
        setConnectionsData({
          incomingRequests: data.incomingRequests || [],
          outgoingRequests: data.outgoingRequests || [],
          connections: data.connections || [],
        });
      }
    } catch {}
  };

  const handleRespondConnection = async (connectionId: string, action: 'accept' | 'decline') => {
    setRespondingId(connectionId);
    try {
      const res = await fetch('/api/connections/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, action }),
      });
      if (res.ok) {
        await fetchConnections();
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRespondingId(null);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setTargetCareer(data.user.profile?.targetCareerId || 'ml-engineer');
          if (data.user.latestReadinessScore) {
            setReadinessScore(data.user.latestReadinessScore.overallScore);
          }
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const handleTargetChange = async (newCareerId: string) => {
    setTargetCareer(newCareerId);
    try {
      const res = await fetch('/api/profile/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCareerId: newCareerId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.readiness) {
          setReadinessScore(data.readiness.overallScore);
        }
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const baseNavLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Compass },
    { href: '/network', label: 'Network', icon: Users },
    { href: '/skill-graph', label: 'Skill Graph', icon: Network },
    { href: '/roadmap', label: 'Roadmap', icon: Map },
    { href: '/explorer', label: 'Explorer', icon: Compass },
    { href: '/resume', label: 'Resume AI', icon: FileText },
    { href: '/assessment', label: 'Assessment', icon: CheckCircle2 },
    { href: '/mentor', label: 'AI Mentor', icon: Bot },
  ];

  const navLinks = user?.role === 'manager'
    ? [{ href: '/manager', label: 'Manager Hub', icon: ShieldCheck }, ...baseNavLinks]
    : baseNavLinks;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-20 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070b14]/90 backdrop-blur-2xl border-b border-cyan-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(6,182,212,0.15)]'
          : 'bg-[#070b14]/75 backdrop-blur-xl border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-extrabold text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">CareerX</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              AI
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1 bg-[#0b1222]/80 p-1.5 rounded-2xl border border-white/5 shadow-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse -ml-0.5" />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : ''}`} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Action Bar */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Target Career Switcher */}
              <div className="flex items-center gap-2 bg-[#10192e]/90 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-cyan-400/60 transition-all">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
                <select
                  value={targetCareer}
                  onChange={(e) => handleTargetChange(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ml-engineer" className="bg-[#111a30]">ML Engineer</option>
                  <option value="fullstack-architect" className="bg-[#111a30]">Full Stack Architect</option>
                  <option value="cloud-devops" className="bg-[#111a30]">Cloud DevOps</option>
                  <option value="data-scientist" className="bg-[#111a30]">Data Scientist</option>
                  <option value="cybersecurity" className="bg-[#111a30]">Cybersecurity</option>
                  <option value="ai-product-manager" className="bg-[#111a30]">AI Product Manager</option>
                </select>
                {readinessScore !== null && (
                  <span className="font-mono font-bold text-cyan-300 bg-cyan-500/25 border border-cyan-400/30 px-2 py-0.5 rounded text-[11px] shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                    {readinessScore}
                  </span>
                )}
              </div>

              {/* Study Network & Incoming Connection Requests Trigger */}
              <button
                type="button"
                onClick={() => setNetworkModalOpen(true)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  connectionsData.incomingRequests.length > 0
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
                    : connectionsData.connections.length > 0
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-[#10192e]/90 border-cyan-500/30 hover:border-cyan-400/60 text-slate-300 hover:text-white'
                }`}
                title="Open Study Network & Connection Requests"
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium">Network</span>
                {connectionsData.incomingRequests.length > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
                    {connectionsData.incomingRequests.length}
                  </span>
                ) : connectionsData.connections.length > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
                    {connectionsData.connections.length}
                  </span>
                ) : null}
              </button>

              {/* User Avatar + Role Badge + Name */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${
                  user.role === 'manager'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                }`}>
                  {user.role === 'manager' ? 'MANAGER' : 'STUDENT'}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                  {user.name?.slice(0, 2).toUpperCase() || 'CX'}
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-neon-cyan px-4 py-1.5 rounded-full text-xs font-bold text-white transition-all flex items-center gap-1.5"
              >
                Sign Up →
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0b1222] border-b border-indigo-500/20 px-6 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-2 text-sm text-slate-300 hover:text-cyan-400"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2.5 py-2 text-sm text-rose-400 hover:text-rose-300 text-left border-t border-white/10 mt-2"
            >
              <LogOut className="w-4 h-4" />
              Reset Session ({user.name})
            </button>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm py-2 text-center bg-cyan-600 rounded-full font-bold text-white">
                Open Dashboard
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Study Network & Connections Modal */}
      {networkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-xl bg-[#090e1a]/95 border border-cyan-500/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-white">CareerX Study Network</h3>
                  <p className="text-xs text-slate-400">Connect, peer-review & collaborate on skill roadmaps</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/network"
                  onClick={() => setNetworkModalOpen(false)}
                  className="hidden sm:flex px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 hover:text-white font-bold text-xs items-center gap-1 transition-all"
                >
                  Full Channels Hub →
                </Link>
                <button
                  type="button"
                  onClick={() => setNetworkModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-[#070b14]/60 p-1.5 gap-2 px-5">
              <button
                type="button"
                onClick={() => setNetworkTab('incoming')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  networkTab === 'incoming'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>Incoming Requests</span>
                {connectionsData.incomingRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
                    {connectionsData.incomingRequests.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setNetworkTab('connected')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  networkTab === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>Connected Buddies</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                  {connectionsData.connections.length}
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {networkTab === 'incoming' ? (
                connectionsData.incomingRequests.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto">
                      <Clock className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">No pending connection requests</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Browse "Recommended Study Resources" or "AI Skill Matching" on your resume page to send requests to peers!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connectionsData.incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl bg-[#0b1222] border border-cyan-500/30 hover:border-cyan-400/50 transition-all space-y-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {req.partnerPhoto ? (
                              <img
                                src={req.partnerPhoto}
                                alt={req.partnerName}
                                className="w-11 h-11 rounded-xl object-cover border border-cyan-400/40"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
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
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-semibold">
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
                            onClick={() => handleRespondConnection(req.id, 'accept')}
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {respondingId === req.id ? 'Accepting...' : 'Accept Connection'}
                          </button>
                          <button
                            type="button"
                            disabled={respondingId === req.id}
                            onClick={() => handleRespondConnection(req.id, 'decline')}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 font-semibold text-xs transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                connectionsData.connections.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">No connected study buddies yet</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Once another student accepts your study connection request, they will appear here and you can chat live!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connectionsData.connections.map((conn) => (
                      <div
                        key={conn.id}
                        className="p-4 rounded-2xl bg-[#0b1222] border border-emerald-500/30 flex items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {conn.partnerPhoto ? (
                            <img
                              src={conn.partnerPhoto}
                              alt={conn.partnerName}
                              className="w-11 h-11 rounded-xl object-cover border border-emerald-500/40 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {conn.partnerName.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-heading font-bold text-sm text-white truncate">{conn.partnerName}</h4>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                            </div>
                            <p className="text-xs text-slate-400 truncate">
                              {conn.partnerCourse} {conn.partnerYear ? `• Yr ${conn.partnerYear}` : ''}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{conn.partnerCollege}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setNetworkModalOpen(false);
                            setChatTarget({
                              id: conn.partnerId,
                              name: conn.partnerName,
                              photo: conn.partnerPhoto,
                              college: conn.partnerCollege,
                            });
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center gap-1.5 transition-all flex-shrink-0"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Message
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#070b14]/80 flex justify-end">
              <button
                type="button"
                onClick={() => setNetworkModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Peer Chat Modal */}
      <StudyBuddyChatModal
        isOpen={!!chatTarget}
        onClose={() => setChatTarget(null)}
        targetUserId={chatTarget?.id || ''}
        targetUserName={chatTarget?.name || ''}
        targetUserPhoto={chatTarget?.photo}
        targetUserCollege={chatTarget?.college}
      />
    </nav>
  );
}
