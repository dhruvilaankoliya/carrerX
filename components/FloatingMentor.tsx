'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';

export default function FloatingMentor() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'USER' | 'AI'; text: string }>>([
    {
      sender: 'AI',
      text: "👋 Hi there! I'm your **CareerX AI Mentor**. Ask me anything about your skill gaps, standout capstone projects, resume bullet optimizations, or technical interview strategies!",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'USER', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { sender: 'AI', text: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'AI', text: '⚠️ Please sign in to access personalized AI mentor responses grounded in your profile.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'AI', text: '⚠️ Network connection issue. Please check your connection and try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    { label: '🛠️ Standout Capstone Project', query: 'What is the best capstone project I should build to stand out for my target role?' },
    { label: '📄 Resume Keyword Gaps', query: 'What critical ATS keywords am I missing on my resume for my target role?' },
    { label: '🎙️ Technical Interview Questions', query: 'Give me the top technical interview questions and STAR answer strategies for my target career.' },
  ];

  return (
    <>
      {/* Floating Action Pill */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#0b1120] to-[#1e1b4b] border border-cyan-500/40 hover:border-cyan-400 rounded-full px-4 py-2.5 flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.35)] hover:scale-105 transition-all group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center relative">
          <Bot className="w-4 h-4 text-white" />
          <span className="absolute inset-[-3px] rounded-full border border-cyan-400/50 animate-ping" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-white leading-tight">AI Mentor</div>
          <div className="text-[10px] text-cyan-400 font-medium">Ask anything →</div>
        </div>
      </button>

      {/* Slide-in Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] z-50 bg-[#0b1222]/95 backdrop-blur-2xl border-l border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#070b14]/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-md shadow-cyan-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-white">CareerX AI Mentor</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Grounded in your profile & roadmap
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 max-w-[90%] ${m.sender === 'USER' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.sender === 'USER'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                      : 'bg-[#15223e]/80 border border-cyan-500/20 text-slate-200 rounded-bl-none prose prose-invert prose-xs'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/### (.*?)\n/g, '<h4 class="text-cyan-300 font-bold text-xs mb-1">$1</h4>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`([^`]+)`/g, '<code class="bg-black/40 px-1 py-0.5 rounded text-cyan-300">$1</code>')
                      .replace(/\n\n/g, '<p class="my-1"></p>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 max-w-[80%]">
                <div className="bg-[#15223e]/80 border border-cyan-500/20 rounded-2xl p-3 text-xs text-cyan-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Analyzing your profile & synthesizing advice...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-3 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.query)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] font-medium text-cyan-300 transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#070b14]/80 border-t border-white/10 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your career path..."
              className="flex-1 bg-[#111a30] border border-indigo-500/30 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 disabled:opacity-40 flex items-center justify-center text-white hover:scale-105 transition-transform"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
