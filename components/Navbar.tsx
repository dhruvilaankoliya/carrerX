'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, Network, Map, FileText, CheckCircle2, Bot, LogOut, Menu, X, Sparkles, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [targetCareer, setTargetCareer] = useState('ml-engineer');
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchUser();
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

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
    setUser(null);
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Compass },
    { href: '/skill-graph', label: 'Skill Graph', icon: Network },
    { href: '/roadmap', label: 'Roadmap', icon: Map },
    { href: '/explorer', label: 'Explorer', icon: Compass },
    { href: '/resume', label: 'Resume AI', icon: FileText },
    { href: '/assessment', label: 'Assessment', icon: CheckCircle2 },
    { href: '/mentor', label: 'AI Mentor', icon: Bot },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-20 z-40 transition-all duration-300 ${
        scrolled ? 'bg-[#070b14]/95 backdrop-blur-xl border-b border-indigo-500/20 shadow-2xl' : 'bg-[#070b14]/80 backdrop-blur-md border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-extrabold text-xl tracking-tight text-white">CareerX</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              AI
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
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
              <div className="flex items-center gap-2 bg-[#111a30]/80 border border-indigo-500/30 px-3 py-1 rounded-full text-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
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
                  <span className="font-mono font-bold text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded text-[11px]">
                    {readinessScore}
                  </span>
                )}
              </div>

              {/* User Avatar + Name */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow">
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
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 transition-all"
              >
                Get Started Free →
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
              Log Out ({user.name})
            </button>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm py-1.5 text-center text-slate-300">
                Log In
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="text-sm py-2 text-center bg-cyan-600 rounded-full font-bold text-white">
                Start Free Assessment
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
