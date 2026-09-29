'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
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
} from 'lucide-react';
import { StudiedUser } from '@/app/api/resources/studied-users/route';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resourceTitle: string;
  resourceId: string;
  skillName: string;
  usageCount: number;
}

interface MessageItem {
  sender: 'me' | 'them';
  text: string;
  time: string;
}

export default function StudiedUsersDrawer({
  isOpen,
  onClose,
  resourceTitle,
  resourceId,
  skillName,
  usageCount,
}: Props) {
  const [users, setUsers] = useState<StudiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForContact, setSelectedUserForContact] = useState<StudiedUser | null>(null);
  const [selectedUserForChat, setSelectedUserForChat] = useState<StudiedUser | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, MessageItem[]>>({});
  const [chatInput, setChatInput] = useState('');

  // Fetch users when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchStudiedUsers();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setSelectedUserForContact(null);
      setSelectedUserForChat(null);
      setSearchQuery('');
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, resourceId, skillName]);

  // Load persistent connection statuses
  const fetchStudiedUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/resources/studied-users?resourceId=${encodeURIComponent(resourceId)}&skillName=${encodeURIComponent(skillName)}`
      );
      if (res.ok) {
        const data = await res.json();
        let fetchedUsers: StudiedUser[] = data.users || [];

        // Sync with local sent connection requests
        try {
          const savedPending = JSON.parse(localStorage.getItem('careerx_pending_connections') || '{}');
          fetchedUsers = fetchedUsers.map((u) => {
            if (savedPending[u.id]) {
              return { ...u, status: savedPending[u.id] };
            }
            return u;
          });
        } catch {}

        setUsers(fetchedUsers);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenContactModal = (user: StudiedUser) => {
    setSelectedUserForContact(user);
    setContactMessage(
      `Hey ${user.name.split(' ')[0]}! Saw you studied "${resourceTitle}" on CareerX. Would love to connect and share ML insights!`
    );
  };

  const handleSendConnectionRequest = async () => {
    if (!selectedUserForContact) return;
    setSendingRequest(true);

    try {
      const res = await fetch('/api/connect/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUserForContact.id,
          targetUserName: selectedUserForContact.name,
          resourceId,
          message: contactMessage,
        }),
      });

      if (res.ok) {
        // Update user state
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUserForContact.id ? { ...u, status: 'pending' } : u))
        );

        // Save to localStorage
        try {
          const saved = JSON.parse(localStorage.getItem('careerx_pending_connections') || '{}');
          saved[selectedUserForContact.id] = 'pending';
          localStorage.setItem('careerx_pending_connections', JSON.stringify(saved));
        } catch {}

        showToast(`🚀 Connection request sent to ${selectedUserForContact.name}!`);
        setSelectedUserForContact(null);
      }
    } catch {
      showToast(`Error sending request. Please try again.`);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleOpenDirectChat = (user: StudiedUser) => {
    setSelectedUserForChat(user);
    if (!chatMessages[user.id]) {
      setChatMessages((prev) => ({
        ...prev,
        [user.id]: [
          {
            sender: 'them',
            text: `Hey! Thanks for connecting on CareerX. Did you complete the ${skillName} lab?`,
            time: '10:42 AM',
          },
        ],
      }));
    }
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim() || !selectedUserForChat) return;

    const newMsg: MessageItem = {
      sender: 'me',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedUserForChat.id]: [...(prev[selectedUserForChat.id] || []), newMsg],
    }));

    setChatInput('');

    // Simulated peer reply after short delay
    setTimeout(() => {
      const replies = [
        `Awesome! That specific section really helped me optimize my model latency.`,
        `Nice! Let me know if you want to collaborate on the RAG pipeline project!`,
        `Great insights! Check out the production Docker config in that tutorial.`,
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      setChatMessages((prev) => ({
        ...prev,
        [selectedUserForChat.id]: [
          ...(prev[selectedUserForChat.id] || []),
          {
            sender: 'them',
            text: randomReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));
    }, 1200);
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.companyOrCollege.toLowerCase().includes(q) ||
        u.mutualSkills.some((s) => s.toLowerCase().includes(q))
    );
  }, [users, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-In Drawer */}
      <div className="relative z-10 w-full max-w-lg bg-[#070b14]/95 backdrop-blur-2xl border-l border-indigo-500/30 h-full flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.15)] animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-[#0b1222]/80">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold uppercase tracking-wider">
              <BookOpen className="w-3 h-3" /> Peer Learning Network
            </div>
            <h3 className="font-heading font-extrabold text-lg text-white leading-tight">
              Learners Who Studied
            </h3>
            <p className="text-xs text-slate-300 line-clamp-1">
              {resourceTitle}
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                <strong className="text-cyan-300">{usageCount}</strong> community members verified
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-white/5 bg-[#070b14]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, role (e.g. ML Engineer), or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111a30] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
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
        </div>

        {/* User List Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar">
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
              <p className="text-xs font-mono">Loading peer learners...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-slate-400 space-y-2">
              <p className="text-sm font-semibold text-white">No learners matched "{searchQuery}"</p>
              <p className="text-xs">Try searching for a different skill, college or company keyword.</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              return (
                <div
                  key={user.id}
                  className="p-4 rounded-xl bg-[#0b1222]/90 border border-white/10 hover:border-cyan-500/30 transition-all space-y-3 shadow-sm hover:shadow-[0_4px_20px_rgba(6,182,212,0.1)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* User Avatar + Identity */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${user.avatarColor} flex items-center justify-center font-heading font-extrabold text-sm text-white shadow-md`}
                        >
                          {user.initials}
                        </div>
                        {user.isOnline && (
                          <span
                            className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0b1222] absolute -bottom-0.5 -right-0.5"
                            title="Online Now"
                          />
                        )}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-heading font-bold text-sm text-white truncate">
                            {user.name}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium truncate flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-cyan-400 flex-shrink-0" /> {user.role}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-indigo-400 flex-shrink-0" /> {user.companyOrCollege}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {user.status === 'connected' ? (
                        <button
                          onClick={() => handleOpenDirectChat(user)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Message
                        </button>
                      ) : user.status === 'pending' ? (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 flex items-center gap-1 cursor-default opacity-90"
                        >
                          <Clock className="w-3.5 h-3.5" /> Requested
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenContactModal(user)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Contact
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bio / Project context */}
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#070b14]/70 p-2.5 rounded-lg border border-white/5">
                    {user.bio}
                  </p>

                  {/* Mutual Skills & Timestamp */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-slate-500">Skills:</span>
                      {user.mutualSkills.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-300 text-[10px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      Studied {user.studiedAt}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10 bg-[#0b1222]/90 text-[11px] text-slate-400 text-center">
          Connect with peer learners to form study circles, review code, or prepare for technical interviews.
        </div>
      </div>

      {/* ─── 1. Send Connection Request Modal ──────────────────────── */}
      {selectedUserForContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0b1222] border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedUserForContact.avatarColor} flex items-center justify-center font-heading font-extrabold text-sm text-white shadow-md`}
                >
                  {selectedUserForContact.initials}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-white">
                    Connect with {selectedUserForContact.name}
                  </h4>
                  <p className="text-xs text-cyan-400">{selectedUserForContact.role}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserForContact(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestion Prompts */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase text-slate-400">
                Quick Prompts
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  `Collaborate on ML project?`,
                  `Any tips on ${skillName}?`,
                  `Connect for interview prep!`,
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() =>
                      setContactMessage(
                        `Hi ${selectedUserForContact.name.split(' ')[0]}! ${prompt} Saw you completed "${resourceTitle}" on CareerX.`
                      )
                    }
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 transition-all text-left"
                  >
                    + {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Message input */}
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
                onClick={() => setSelectedUserForContact(null)}
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

      {/* ─── 2. Direct Chat Modal (For Connected Peers) ─────────────── */}
      {selectedUserForChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0b1222] border border-emerald-500/40 rounded-2xl flex flex-col h-[520px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#070b14]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${selectedUserForChat.avatarColor} flex items-center justify-center font-bold text-xs text-white shadow`}
                >
                  {selectedUserForChat.initials}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                    {selectedUserForChat.name}
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </h4>
                  <p className="text-[11px] text-slate-400">{selectedUserForChat.role} • Active now</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserForChat(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Thread Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#070b14]/50 custom-scrollbar">
              <div className="text-center">
                <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-mono text-slate-400 border border-white/10">
                  Connected on CareerX Peer Study Network
                </span>
              </div>

              {(chatMessages[selectedUserForChat.id] || []).map((msg, i) => {
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
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder={`Message ${selectedUserForChat.name.split(' ')[0]}...`}
                className="flex-1 bg-[#111a30] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSendChatMessage}
                disabled={!chatInput.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-40 hover:scale-105 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast Notification ────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-gradient-to-r from-cyan-900 to-blue-900 border border-cyan-400 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-cyan-300 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
