'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Bot, Send, User, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CAREER_TAXONOMY } from '@/lib/taxonomy/careerTaxonomy';

export default function MentorPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'USER' | 'AI'; text: string }>>([
    {
      sender: 'AI',
      text: "👋 Welcome to your dedicated **AI Career Mentor** workspace! I am grounded in your verified profile, target role, and active roadmap. What would you like to focus on today?",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const fetchProfile = async () => {
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

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || input;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg = textToSend.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'USER', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      if (res.ok) {
        const resJson = await res.json();
        setMessages((prev) => [...prev, { sender: 'AI', text: resJson.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'AI', text: '⚠️ Unable to reach AI service. Please try again.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'AI', text: '⚠️ Connection error.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading AI Mentor Workspace...</p>
      </div>
    );
  }

  if (!data) return null;

  const profile = data.profile || {};
  const targetCareer = CAREER_TAXONOMY[profile.targetCareerId || 'ml-engineer'] || CAREER_TAXONOMY['ml-engineer'];
  const userSkills: string[] = JSON.parse(profile.technicalSkills || '[]');
  const criticalGaps = targetCareer.requiredSkills.filter(
    (s) => !userSkills.some((k) => k.toLowerCase().includes(s.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Intelligent Contextual Mentor
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-white">
          AI Career <span className="text-gradient">Advisor Workspace</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Every suggestion is grounded directly in your background ({profile.branch}, Year {profile.currentYear}), verified skills, and roadmap blockers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Grounded Context Panel */}
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Active Student Context
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Student</span>
                <span className="font-bold text-white">{data.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Target Career</span>
                <span className="font-bold text-cyan-400">{targetCareer.title}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Readiness Score</span>
                <span className="font-mono font-bold text-emerald-400">
                  {data.latestReadinessScore?.overallScore || 0}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Academic Year</span>
                <span className="font-bold text-purple-300">Year {profile.currentYear}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-300">
              Primary Skill Blockers
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {criticalGaps.slice(0, 5).map((gap) => (
                <span key={gap} className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-medium">
                  ✗ {gap}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 space-y-2">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-300 mb-2">
              Suggested Prompts
            </h4>
            {[
              { label: '🛠️ Recommended Capstone Project', text: 'What is the best capstone project to build for my target role?' },
              { label: '📄 Resume Keyword Optimization', text: 'Which ATS keywords should I add to my resume to reach 85+ score?' },
              { label: '🎙️ Technical Mock Interview Questions', text: 'Give me the top technical interview questions for my target career.' },
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.text)}
                className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-xs text-slate-300 transition-all font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Interactive Chat Window */}
        <div className="lg:col-span-2 glass-panel flex flex-col h-[650px] border border-cyan-500/30 shadow-2xl overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${m.sender === 'USER' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    m.sender === 'USER'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-tr from-cyan-400 to-purple-600 text-white shadow-md shadow-cyan-500/30'
                  }`}
                >
                  {m.sender === 'USER' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed ${
                    m.sender === 'USER'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-[#15223e]/90 border border-cyan-500/20 text-slate-200 rounded-tl-none'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/### (.*?)\n/g, '<h4 class="text-cyan-300 font-bold text-sm mb-1.5">$1</h4>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`([^`]+)`/g, '<code class="bg-black/40 px-1.5 py-0.5 rounded text-cyan-300 font-mono">$1</code>')
                      .replace(/\n\n/g, '<p class="my-2"></p>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-[#15223e]/80 border border-cyan-500/20 rounded-2xl p-3 text-xs text-cyan-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Synthesizing personalized advice grounded in your profile...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 bg-[#070b14]/90 border-t border-white/10 flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI mentor anything about your career roadmap, gaps, or interview prep..."
              className="flex-1 bg-[#111a30] border border-indigo-500/30 rounded-full px-5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={chatLoading || !input.trim()}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 disabled:opacity-40 font-bold text-xs text-white hover:scale-105 transition-all flex items-center gap-1.5"
            >
              Send <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
