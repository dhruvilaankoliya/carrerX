'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, ArrowLeft, Check, ShieldCheck, User, GraduationCap, Code2, CheckCircle } from 'lucide-react';

const DRAFT_KEY = 'careerx_signup_draft_v1';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Step 2: Education
    college: '',
    course: 'B.Tech',
    courseOther: '',
    branch: 'Computer Science & Engineering',
    branchOther: '',
    currentYear: '3',
    gradYear: '2026',
    cgpa: '',
    // Step 3: Skills & Preferences
    preferredField: 'AI & Machine Learning',
    programmingLanguages: ['Python', 'SQL'],
    technicalSkills: ['PyTorch', 'Git'],
    linkedin: '',
    github: '',
  });

  // Tag inputs state
  const [langInput, setLangInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Persist draft to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    } catch {}
  }, [formData]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const addTag = (type: 'programmingLanguages' | 'technicalSkills', val: string) => {
    if (!val.trim()) return;
    const clean = val.trim();
    if (!formData[type].includes(clean)) {
      updateField(type, [...formData[type], clean]);
    }
    if (type === 'programmingLanguages') setLangInput('');
    else setSkillInput('');
  };

  const removeTag = (type: 'programmingLanguages' | 'technicalSkills', tag: string) => {
    updateField(type, formData[type].filter((t) => t !== tag));
  };

  const validateStep = (currentStep: number) => {
    setError('');
    if (currentStep === 1) {
      if (!formData.name.trim()) return 'Please enter your full name';
      if (!formData.email.trim() || !formData.email.includes('@')) return 'Please enter a valid email address';
      if (formData.password.length < 6) return 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    } else if (currentStep === 2) {
      if (!formData.college.trim()) return 'Please enter your college or university name';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrev = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        college: formData.college,
        course: formData.course === 'Other' ? formData.courseOther : formData.course,
        branch: formData.branch === 'Other' ? formData.branchOther : formData.branch,
        currentYear: parseInt(formData.currentYear, 10) || 1,
        gradYear: parseInt(formData.gradYear, 10) || 2027,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        preferredField: formData.preferredField,
        programmingLanguages: formData.programmingLanguages,
        technicalSkills: formData.technicalSkills,
        linkedin: formData.linkedin,
        github: formData.github,
      };

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem(DRAFT_KEY);
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Personal', icon: User },
    { num: 2, label: 'Education', icon: GraduationCap },
    { num: 3, label: 'Skills & Goals', icon: Code2 },
    { num: 4, label: 'Review', icon: CheckCircle },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-2xl glass-panel p-6 sm:p-10 border border-indigo-500/25 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Start Your Career Journey
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white">Create Your Student Account</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold">
              Log in here
            </Link>
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div className="relative flex justify-between items-center mb-10 max-w-lg mx-auto">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 -translate-y-1/2 transition-all duration-500 z-0"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
          {stepsList.map((s) => {
            const isCompleted = step > s.num;
            const isActive = step === s.num;
            const Icon = s.icon;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : isActive
                      ? 'bg-cyan-500 text-white shadow-[0_0_15px_#06b6d4] scale-110'
                      : 'bg-[#111a30] text-slate-400 border border-white/10'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[10px] font-semibold ${
                    isActive ? 'text-cyan-400' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* ─── Step 1: Personal Details ───────────────────────── */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Dhruvila"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full bg-[#111a30] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  placeholder="dhruvila@university.edu"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password *</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password *</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 2: Education Details ──────────────────────── */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">College / University Name *</label>
              <input
                type="text"
                placeholder="e.g. Dharmsinh Desai University"
                value={formData.college}
                onChange={(e) => updateField('college', e.target.value)}
                className="w-full bg-[#111a30] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Course / Degree</label>
                <select
                  value={formData.course}
                  onChange={(e) => updateField('course', e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="B.Tech">B.Tech / B.E.</option>
                  <option value="B.S.">B.S. / B.Sc</option>
                  <option value="BCA">BCA / MCA</option>
                  <option value="M.Tech">M.Tech / M.S.</option>
                  <option value="Other">Other</option>
                </select>
                {formData.course === 'Other' && (
                  <input
                    type="text"
                    placeholder="Specify Course"
                    value={formData.courseOther}
                    onChange={(e) => updateField('courseOther', e.target.value)}
                    className="w-full mt-2 bg-[#111a30] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Branch / Specialization</label>
                <select
                  value={formData.branch}
                  onChange={(e) => updateField('branch', e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Other">Other</option>
                </select>
                {formData.branch === 'Other' && (
                  <input
                    type="text"
                    placeholder="Specify Branch"
                    value={formData.branchOther}
                    onChange={(e) => updateField('branchOther', e.target.value)}
                    className="w-full mt-2 bg-[#111a30] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Academic Year</label>
                <select
                  value={formData.currentYear}
                  onChange={(e) => updateField('currentYear', e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Graduation Year</label>
                <input
                  type="number"
                  value={formData.gradYear}
                  onChange={(e) => updateField('gradYear', e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">CGPA / % (Optional)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 8.9"
                  value={formData.cgpa}
                  onChange={(e) => updateField('cgpa', e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 3: Skills & Preferences ───────────────────── */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Career Domain</label>
              <select
                value={formData.preferredField}
                onChange={(e) => updateField('preferredField', e.target.value)}
                className="w-full bg-[#111a30] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Full Stack & Software Engineering">Full Stack & Software Engineering</option>
                <option value="Cloud, DevOps & Infrastructure">Cloud, DevOps & Infrastructure</option>
                <option value="Data Science & Analytics">Data Science & Analytics</option>
                <option value="Cybersecurity & Defense">Cybersecurity & Defense</option>
              </select>
            </div>

            {/* Programming Languages Tag Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Programming Languages</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.programmingLanguages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold"
                  >
                    {lang}
                    <button type="button" onClick={() => removeTag('programmingLanguages', lang)} className="hover:text-white">
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add language (e.g. Python, C++, Java) and press Enter"
                  value={langInput}
                  onChange={(e) => setLangInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('programmingLanguages', langInput);
                    }
                  }}
                  className="flex-1 bg-[#111a30] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => addTag('programmingLanguages', langInput)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Technical Skills Tag Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Technical Frameworks & Tools</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.technicalSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold"
                  >
                    {skill}
                    <button type="button" onClick={() => removeTag('technicalSkills', skill)} className="hover:text-white">
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. PyTorch, React, Docker) and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('technicalSkills', skillInput);
                    }
                  }}
                  className="flex-1 bg-[#111a30] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => addTag('technicalSkills', skillInput)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">LinkedIn Profile (Optional)</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedin}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">GitHub Profile (Optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.github}
                  onChange={(e) => updateField('github', e.target.value)}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 4: Review & Complete ──────────────────────── */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-300 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Full Name</span>
                <span className="font-bold text-white">{formData.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Email</span>
                <span className="font-bold text-white">{formData.email}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">College & Degree</span>
                <span className="font-bold text-white">{formData.college} ({formData.course} - {formData.branch})</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Graduation Year</span>
                <span className="font-bold text-cyan-400">Year {formData.currentYear} • Class of {formData.gradYear}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Target Field</span>
                <span className="font-bold text-purple-300">{formData.preferredField}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Skills Selected</span>
                <span className="font-bold text-slate-200">{[...formData.programmingLanguages, ...formData.technicalSkills].join(', ') || 'None added yet'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] leading-relaxed flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-cyan-400" />
              After signing up, you will be taken to your dashboard to upload your resume and unlock your personalized Skill Gap Radar!
            </div>
          </div>
        )}

        {/* Nav Controls */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 rounded-full text-sm font-extrabold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg hover:shadow-emerald-500/40 hover:scale-105 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? 'Creating Your Intelligence Profile...' : '🚀 Complete & Open Dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
