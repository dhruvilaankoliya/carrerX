'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Bot,
  Send,
  User,
  ShieldCheck,
  GraduationCap,
  Cpu,
  CheckCircle2,
  Code2,
  FileText,
  HelpCircle,
  Key,
  X,
  ExternalLink,
} from 'lucide-react';
import { CAREER_TAXONOMY } from '@/lib/taxonomy/careerTaxonomy';

interface ChatMessage {
  id?: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
  provider?: string;
  model?: string;
}

export default function MentorPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('CareerX Engine');
  const [isLlmConnected, setIsLlmConnected] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [storedKey, setStoredKey] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('careerx_custom_llm_key') || '';
    setStoredKey(saved);
    setCustomKeyInput(saved);
    fetchProfileAndHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const fetchProfileAndHistory = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }

      const json = await res.json();
      if (!json.authenticated || !json.user) {
        router.push('/login');
        return;
      }

      setData(json.user);

      const historyRes = await fetch('/api/mentor/chat');
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setActiveProvider(historyData.activeProvider || 'CareerX Engine');
        setIsLlmConnected(Boolean(historyData.isLlmConnected || localStorage.getItem('careerx_custom_llm_key')));

        if (historyData.messages && historyData.messages.length > 0) {
          setMessages(historyData.messages);
        } else {
          initWelcomeMessage(json.user);
        }
      } else {
        initWelcomeMessage(json.user);
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const initWelcomeMessage = (user: any) => {
    const profile = user.profile || {};
    const targetCareer =
      CAREER_TAXONOMY[profile.targetCareerId || 'ml-engineer'] || CAREER_TAXONOMY['ml-engineer'];
    const readinessScore = user.latestReadinessScore?.overallScore || 0;

    const welcome: ChatMessage = {
      sender: 'AI',
      text: `Hello **${user.name}**! 👋 I am your dedicated AI Academic & Career Mentor for **${targetCareer.title}**.\n\nI am grounded in your academic background (${profile.college || 'Engineering'}, ${profile.branch || 'CSE'}, Year ${profile.currentYear || 1}) and your current readiness score (**${readinessScore}/100**).\n\n🎓 **Educational Focus Active**: Ask me anything about computer science concepts, coding & algorithms, high-impact capstone projects, ATS resume optimization, or technical mock interview questions!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([welcome]);
  };

  const handleSaveKey = () => {
    const trimmed = customKeyInput.trim();
    if (trimmed) {
      localStorage.setItem('careerx_custom_llm_key', trimmed);
      setStoredKey(trimmed);
      setIsLlmConnected(true);
      if (trimmed.startsWith('AIzaSy')) setActiveProvider('Google Gemini');
      else if (trimmed.startsWith('gsk_')) setActiveProvider('Groq Llama-3');
      else if (trimmed.startsWith('sk-')) setActiveProvider('OpenAI ChatGPT');
    } else {
      localStorage.removeItem('careerx_custom_llm_key');
      setStoredKey('');
      setIsLlmConnected(false);
      setActiveProvider('CareerX Engine');
    }
    setShowKeyModal(false);
  };

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || input;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      sender: 'USER',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInput('');
    setChatLoading(true);

    try {
      const activeKey = storedKey || localStorage.getItem('careerx_custom_llm_key') || '';
      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, apiKey: activeKey }),
      });

      const json = await res.json();
      if (res.ok && json.response) {
        const aiMsg: ChatMessage = {
          sender: 'AI',
          text: json.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: json.provider,
          model: json.model,
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (json.model) {
          setActiveProvider(json.model);
        }
      } else {
        const errorMsg: ChatMessage = {
          sender: 'AI',
          text: '⚠️ An error occurred while synthesizing your answer. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (e) {
      console.error(e);
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
  const targetCareer =
    CAREER_TAXONOMY[profile.targetCareerId || 'ml-engineer'] || CAREER_TAXONOMY['ml-engineer'];
  const userSkills: string[] = JSON.parse(profile.technicalSkills || '[]');
  const criticalGaps = targetCareer.requiredSkills.filter(
    (s) => !userSkills.some((k: string) => k.toLowerCase().includes(s.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Intelligent Contextual Mentor
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> Educational Scope Guardrail Active
            </div>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            AI Academic & Career <span className="text-gradient">Mentor Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounded in your academic background ({profile.branch || 'Engineering'}, Year {profile.currentYear || 1}), verified skills, and roadmap blockers.
          </p>
        </div>

        {/* Provider Badge & Key Config */}
        <div className="flex items-center gap-2">
          <div className="glass-card px-4 py-2.5 flex items-center gap-3 border-cyan-500/30">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Active Engine</div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isLlmConnected ? 'bg-emerald-400' : 'bg-cyan-400'} animate-pulse`} />
                {activeProvider}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowKeyModal(true)}
            className="px-3.5 py-3 rounded-xl border border-cyan-500/30 hover:border-cyan-400 bg-white/5 hover:bg-white/10 text-xs font-mono font-medium text-cyan-300 flex items-center gap-1.5 transition-all shadow-sm"
            title="Configure Free API Key (Gemini / Groq / ChatGPT)"
          >
            <Key className="w-4 h-4" />
            <span className="hidden md:inline">{storedKey ? 'API Key Set' : 'Set Free API Key'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Grounded Context Panel */}
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Active Student Profile
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
                <span className="font-bold text-purple-300">Year {profile.currentYear || 1}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase font-mono tracking-wider text-slate-300">
              Primary Skill Blockers to Bridge
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {criticalGaps.slice(0, 5).map((gap: string) => (
                <span
                  key={gap}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-mono font-semibold"
                >
                  ✗ {gap}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 space-y-2">
            <h4 className="font-heading font-bold text-xs uppercase font-mono tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> High-Yield Educational Prompts
            </h4>
            {[
              {
                icon: <Code2 className="w-3.5 h-3.5 text-cyan-400" />,
                label: '🛠️ Recommended Capstone Project',
                text: 'What is the best capstone project to build for my target role to bridge my skill gaps?',
              },
              {
                icon: <FileText className="w-3.5 h-3.5 text-cyan-400" />,
                label: '📄 Resume Keyword Optimization',
                text: 'Which ATS keywords and bullet points should I add to my resume to reach 85+ score?',
              },
              {
                icon: <Bot className="w-3.5 h-3.5 text-cyan-400" />,
                label: '🎙️ Technical Mock Interview',
                text: 'Give me the top technical interview questions and STAR answer frameworks for my target career.',
              },
              {
                icon: <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />,
                label: '🧠 Algorithm Concept: Dijkstra',
                text: 'Explain Dijkstra algorithm time and space complexity with routing examples.',
              },
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.text)}
                className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-xs text-slate-300 transition-all font-medium flex items-center justify-between group"
              >
                <span>{p.label}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-cyan-400 font-mono">Ask →</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Interactive Chat Window */}
        <div className="lg:col-span-2 glass-panel flex flex-col h-[680px] border border-cyan-500/30 shadow-2xl overflow-hidden">
          {/* Chat Header Bar */}
          <div className="px-6 py-3 border-b border-white/10 bg-[#070b14]/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Conversational AI & Educational Mode</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Powered by <span className="font-bold text-cyan-400">{activeProvider}</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[88%] ${m.sender === 'USER' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
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
                <div className="space-y-1">
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed ${
                      m.sender === 'USER'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-sm'
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
                  {m.model && m.sender === 'AI' && (
                    <div className="text-[10px] text-slate-400 font-mono px-1">
                      via {m.model}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-[#15223e]/80 border border-cyan-500/20 rounded-2xl p-3.5 text-xs text-cyan-400 flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Synthesizing answer...
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
              placeholder="Ask an educational question, say 'hii', or request capstone/interview advice..."
              className="flex-1 bg-[#111a30] border border-indigo-500/30 rounded-full px-5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
            />
            <button
              type="submit"
              disabled={chatLoading || !input.trim()}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 disabled:opacity-40 font-bold text-xs text-white hover:scale-105 transition-all flex items-center gap-1.5 shadow-sm"
            >
              Send <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Free API Key Configuration Modal (Dark Space Theme) */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1222] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-white">Connect Free LLM API</h3>
                  <p className="text-xs text-slate-400">Google Gemini • Groq Llama-3 • ChatGPT</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Paste your free API key below to power the AI Mentor with cutting-edge models (Gemini 2.0 Flash or Groq Llama 3.3).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-between text-cyan-300 transition-all font-medium"
                >
                  <span>✨ Get Free Gemini Key</span>
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                </a>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-400 flex items-center justify-between text-purple-300 transition-all font-medium"
                >
                  <span>⚡ Get Free Groq Key</span>
                  <ExternalLink className="w-3 h-3 text-purple-400" />
                </a>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-mono uppercase text-slate-300 font-semibold">
                  API Key:
                </label>
                <input
                  type="password"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  placeholder="AIzaSy... or gsk_... or sk-..."
                  className="w-full bg-[#111a30] border border-indigo-500/30 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setCustomKeyInput('');
                  localStorage.removeItem('careerx_custom_llm_key');
                  setStoredKey('');
                  setIsLlmConnected(false);
                  setActiveProvider('CareerX Engine');
                  setShowKeyModal(false);
                }}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
              >
                Clear / Reset
              </button>
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                Save & Connect Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
