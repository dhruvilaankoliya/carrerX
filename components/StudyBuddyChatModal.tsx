'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Loader2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  body: string;
  createdAt: string;
  isSelf: boolean;
}

interface StudyBuddyChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  targetUserPhoto?: string | null;
  targetUserCollege?: string;
}

export default function StudyBuddyChatModal({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
  targetUserPhoto,
  targetUserCollege,
}: StudyBuddyChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && targetUserId) {
      fetchMessages(true);
      // Polling every 3.5 seconds for new incoming messages
      pollTimerRef.current = setInterval(() => {
        fetchMessages(false);
      }, 3500);
    } else {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setMessages([]);
      setError('');
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, targetUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const res = await fetch(`/api/messages?targetUserId=${targetUserId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.messages || []);
        setError('');
      } else {
        if (initial) {
          setError(data.error || 'Unable to load chat. Ensure your connection is accepted.');
        }
      }
    } catch {
      if (initial) setError('Failed to connect to messaging server');
    } finally {
      if (initial) setLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          messageBody: text,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInputText('');
        setMessages((prev) => [...prev, data.message]);
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch {
      setError('Network error sending message');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl h-[85vh] max-h-[640px] bg-[#070b14] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0c1427]/90">
          <div className="flex items-center gap-3">
            <div className="relative">
              {targetUserPhoto ? (
                <img
                  src={targetUserPhoto}
                  alt={targetUserName}
                  className="w-10 h-10 rounded-full object-cover border border-cyan-400/40"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {targetUserName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#070b14]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 id="chat-dialog-title" className="font-heading font-bold text-sm sm:text-base text-white">
                  Chat with {targetUserName}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[220px] sm:max-w-xs">
                {targetUserCollege || 'CareerX Study Partner'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Privacy Ribbon */}
        <div className="px-4 py-2 bg-cyan-950/20 border-b border-cyan-500/20 flex items-center gap-2 text-[11px] text-cyan-300">
          <Shield className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" />
          <span className="truncate">Encrypted student study channel • Verified connection</span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-gradient-to-b from-[#070b14] to-[#0a1020]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-xs">Loading conversation history...</span>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-sm text-white">Chat Unavailable</h4>
              <p className="text-xs text-slate-400 max-w-sm">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-white">Start Your Study Session</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Say hello to {targetUserName}! Ask about their projects, course recommendations, or schedule a pair learning session.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInputText(`Hey ${targetUserName}! Saw your project on CareerX and would love some tips.`)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all text-left"
                >
                  💡 "Would love some tips on your project..."
                </button>
                <button
                  type="button"
                  onClick={() => setInputText(`Hi! Would you like to practice interview questions together?`)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all text-left"
                >
                  🎯 "Want to practice interview questions?"
                </button>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.isSelf ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.isSelf
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md shadow-cyan-900/30'
                      : 'bg-[#131d36] border border-white/10 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t border-white/10 bg-[#0c1427]/90 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${targetUserName}...`}
            disabled={loading || !!error || sending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#070b14] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
            aria-label={`Message to ${targetUserName}`}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || sending || loading || !!error}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Send message"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
