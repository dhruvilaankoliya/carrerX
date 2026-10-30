'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Eye,
  EyeOff,
  Users,
  Search,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Zap,
  KeyRound,
  Check,
} from 'lucide-react';

interface DemoStudent {
  id: string;
  name: string;
  email: string;
  password: string;
  college: string;
  role: string;
  careerGoal: string;
  photo?: string | null;
  tag: string;
}

const DEFAULT_DEMO_USERS: DemoStudent[] = [
  {
    id: 'user_dhruvila',
    name: 'Dhruvila',
    email: 'dhruvila@careerx.dev',
    password: 'CareerX@2026',
    college: 'Dharmsinh Desai University',
    role: 'user',
    careerGoal: 'Machine Learning Engineer',
    photo: null,
    tag: 'Primary Student Account',
  },
  {
    id: 'user_aarav',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@demo.careerx.dev',
    password: 'CareerX@2026',
    college: 'IIT Bombay',
    role: 'user',
    careerGoal: 'Machine Learning Engineer',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    tag: 'ML / Infrastructure',
  },
  {
    id: 'user_priya',
    name: 'Priya Patel',
    email: 'priya.patel@demo.careerx.dev',
    password: 'CareerX@2026',
    college: 'Dharmsinh Desai University',
    role: 'user',
    careerGoal: 'Machine Learning Engineer',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    tag: 'Data Science & MLOps',
  },
  {
    id: 'user_rohit',
    name: 'Rohit Verma',
    email: 'rohit.verma@demo.careerx.dev',
    password: 'CareerX@2026',
    college: 'Delhi Technological University',
    role: 'user',
    careerGoal: 'Cloud DevOps',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    tag: 'Kubernetes & CI/CD',
  },
  {
    id: 'user_vikram',
    name: 'Vikram Mehta',
    email: 'vikram.mehta@demo.careerx.dev',
    password: 'CareerX@2026',
    college: 'BITS Pilani',
    role: 'user',
    careerGoal: 'Full Stack Architect',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    tag: 'Next.js & Microservices',
  },
  {
    id: 'user_neha',
    name: 'Neha Kulkarni',
    email: 'neha.kulkarni@demo.careerx.dev',
    password: 'CareerX@2026',
    college: 'COEP Pune',
    role: 'user',
    careerGoal: 'Machine Learning Engineer',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    tag: 'LLMs & Quantization',
  },
  {
    id: 'user_ananya',
    name: 'Ananya Gupta',
    email: 'ananya.gupta@demo.careerx.dev',
    password: 'CareerX@2026',
    college: 'IIIT Hyderabad',
    role: 'user',
    careerGoal: 'Data Scientist',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
    tag: 'Analytics & Statistics',
  },
  {
    id: 'user_karan',
    name: 'Karan Singhal',
    email: 'karan.singhal@demo.careerx.dev',
    password: 'CareerX@2026',
    college: 'NIT Trichy',
    role: 'user',
    careerGoal: 'Machine Learning Engineer',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    tag: 'Vector DB & FastAPI',
  },
  {
    id: 'user_siddharth',
    name: 'Siddharth Nair',
    email: 'siddharth.nair@demo.careerx.dev',
    password: 'CareerX@2026',
    college: 'RVCE Bangalore',
    role: 'user',
    careerGoal: 'Cloud DevOps',
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
    tag: 'Docker & Linux',
  },
  {
    id: 'user_manager',
    name: 'Platform Mentor Manager',
    email: 'manager@example.com',
    password: 'CareerX@Manager2026',
    college: 'CareerX Global Operations',
    role: 'manager',
    careerGoal: 'Platform Director',
    photo: null,
    tag: 'Manager / Mentor Admin',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [quickLoggingInId, setQuickLoggingInId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Demo user filters
  const [demoFilter, setDemoFilter] = useState<'all' | 'students' | 'manager'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const executeLogin = async (targetEmail: string, targetPass: string, redirectPath?: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail.toLowerCase().trim(),
          password: targetPass,
          rememberMe,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      // Redirect target
      const target = redirectPath || callbackUrl || (data.user?.role === 'manager' ? '/manager' : '/network');
      router.push(target);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
      setQuickLoggingInId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }
    await executeLogin(email, password);
  };

  const handleInstantDemoLogin = async (student: DemoStudent) => {
    setQuickLoggingInId(student.id);
    setEmail(student.email);
    setPassword(student.password);
    await executeLogin(student.email, student.password, student.role === 'manager' ? '/manager' : '/network');
  };

  const handleFillCredentials = (student: DemoStudent) => {
    setError('');
    setEmail(student.email);
    setPassword(student.password);
    setCopiedEmail(student.email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const filteredDemoUsers = DEFAULT_DEMO_USERS.filter((u) => {
    if (demoFilter === 'students' && u.role === 'manager') return false;
    if (demoFilter === 'manager' && u.role !== 'manager') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.college.toLowerCase().includes(q) ||
        u.careerGoal.toLowerCase().includes(q) ||
        u.tag.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-lg shadow-cyan-500/25 mb-1">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
          Welcome to <span className="text-cyan-400">CareerX</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Sign in to access your student network, collaborate in real-time study channels, and chat 1-on-1 with fellow engineering peers.
        </p>
      </div>

      {/* Peer Chat Testing Guide Callout */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d172e] via-[#091224] to-[#0b1b36] border border-cyan-500/30 shadow-lg shadow-cyan-500/10 space-y-2">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm font-heading">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>How to Test 1-on-1 Student Chat Across Multiple Accounts:</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          1. Click <strong className="text-white">⚡ 1-Click Login</strong> on <strong className="text-cyan-300">Dhruvila</strong> → Navigate to the <strong className="text-white">Network</strong> page → Select <strong className="text-emerald-300">Priya Patel</strong> (or any peer) → Send a message.
          <br />
          2. Click <strong className="text-white">Switch Account / Logout</strong> in the top header.
          <br />
          3. Click <strong className="text-white">⚡ 1-Click Login</strong> on <strong className="text-emerald-300">Priya Patel</strong> → Open <strong className="text-white">Network</strong> → Click <strong className="text-cyan-300">Dhruvila</strong> → <span className="text-emerald-400 font-semibold">Dhruvila&apos;s message is right there!</span> Type a reply, and both peers can talk back and forth freely.
        </p>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Demo Accounts Directory */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  All Available Demo Student Accounts
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any account to instantly sign in or copy credentials
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#060a12] border border-white/5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setDemoFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    demoFilter === 'all' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({DEFAULT_DEMO_USERS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDemoFilter('students')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    demoFilter === 'students' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Students (9)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoFilter('manager')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    demoFilter === 'manager' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Manager (1)
                </button>
              </div>
            </div>

            {/* Search filter for demo accounts */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search students by name, college (e.g. DDU, IIT Bombay), or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#060a12] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* User Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
              {filteredDemoUsers.map((user) => {
                const isLoggingThis = quickLoggingInId === user.id;
                const isDhruvila = user.email.includes('dhruvila');
                const isManager = user.role === 'manager';

                return (
                  <div
                    key={user.id}
                    className={`p-3.5 rounded-2xl transition-all border flex flex-col justify-between gap-3 ${
                      isDhruvila
                        ? 'bg-gradient-to-br from-cyan-950/40 via-[#0a1426] to-[#070b14] border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : isManager
                        ? 'bg-gradient-to-br from-purple-950/40 via-[#100e26] to-[#070b14] border-purple-500/40'
                        : 'bg-[#090f1d] hover:bg-[#0c152a] border-white/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {user.photo ? (
                            <img
                              src={user.photo}
                              alt={user.name}
                              className="w-9 h-9 rounded-xl object-cover border border-cyan-400/40"
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                              isManager ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : 'bg-gradient-to-br from-cyan-600 to-blue-600'
                            }`}>
                              {user.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-heading font-bold text-xs text-white truncate flex items-center gap-1.5">
                              <span>{user.name}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            </h4>
                            <p className="text-[11px] text-cyan-300 font-medium truncate">{user.careerGoal}</p>
                          </div>
                        </div>

                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold border ${
                          isManager
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : isDhruvila
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}>
                          {user.tag}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-[11px] text-slate-400 pl-0.5">
                        <p className="truncate flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{user.college}</span>
                        </p>
                        <p className="truncate font-mono text-[10px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleInstantDemoLogin(user)}
                        className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          isManager
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
                        } disabled:opacity-50`}
                      >
                        {isLoggingThis ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <Zap className="w-3 h-3 fill-current" />
                        )}
                        <span>{isLoggingThis ? 'Signing in...' : '1-Click Login'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFillCredentials(user)}
                        className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-[11px] font-medium transition-colors"
                        title="Copy credentials into sign-in form"
                      >
                        {copiedEmail === user.email ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Filled
                          </span>
                        ) : (
                          'Fill'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Standard Sign In Form Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-5 border border-white/10 shadow-2xl relative overflow-hidden bg-[#0a101f]/95">
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-xl text-white">Direct Account Sign In</h3>
              <p className="text-xs text-slate-400">
                Sign in with any demo account or your registered credentials
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@careerx.dev or aarav.sharma@demo.careerx.dev"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b14]/80 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-mono"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" /> Password
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Students: CareerX@2026
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#070b14]/80 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-[#070b14] border-white/20 text-cyan-500 focus:ring-0"
                  />
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 rounded-xl font-heading font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Network</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Sign up prompt */}
            <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/10">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-cyan-400 hover:underline font-semibold">
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#070b14]">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
