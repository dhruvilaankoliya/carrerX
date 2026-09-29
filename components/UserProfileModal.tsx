'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  GraduationCap,
  BookOpen,
  Code2,
  FolderGit2,
  Award,
  Sparkles,
  ExternalLink,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  Shield,
  Mail,
  Phone,
  Lock,
  Layers,
  Zap,
  Loader2,
  Clock,
} from 'lucide-react';

interface UserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (userId: string) => void;
  onOpenChat: (userId: string, name: string, photo?: string | null, college?: string) => void;
  connectionStatus?: 'none' | 'pending' | 'accepted' | 'declined';
  roleCategory?: 'Experienced Learner' | 'Study Buddy' | 'Peer';
}

export default function UserProfileModal({
  userId,
  isOpen,
  onClose,
  onConnect,
  onOpenChat,
  connectionStatus = 'none',
  roleCategory = 'Peer',
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'courses' | 'skills'>('overview');

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    } else {
      setProfile(null);
      setError('');
      setActiveTab('overview');
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${userId}/profile`);
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.profile);
      } else {
        setError(data.message || data.error || 'Failed to load profile');
      }
    } catch {
      setError('Network error loading profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isConnected = (profile?.connectionStatus || connectionStatus) === 'accepted';
  const isPending = (profile?.connectionStatus || connectionStatus) === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#070b14] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-dialog-title"
      >
        {/* Header Ribbon */}
        <div className="relative p-6 bg-gradient-to-r from-cyan-950/50 via-[#0d162e] to-[#070b14] border-b border-white/10 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              {profile?.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-lg shadow-cyan-500/20">
                  {profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'CX'}
                </div>
              )}
              {profile?.availableToHelp && (
                <span
                  title="Available to help other students"
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#070b14] flex items-center justify-center text-white text-[10px] font-bold"
                >
                  ✓
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 id="profile-dialog-title" className="font-heading font-extrabold text-lg sm:text-xl text-white">
                  {profile?.name || 'Student Profile'}
                </h3>
                {roleCategory && (
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      roleCategory === 'Experienced Learner'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : roleCategory === 'Study Buddy'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}
                  >
                    {roleCategory}
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-cyan-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                {profile?.course} • Year {profile?.currentYear}
              </p>

              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                {profile?.college}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#090f1e] px-6 gap-2 pt-2">
          {(['overview', 'skills', 'projects', 'courses'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-gradient-to-b from-[#070b14] to-[#0a1020]">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-xs">Loading candidate profile...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-400 space-y-2">
              <Shield className="w-8 h-8 mx-auto" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : (
            <>
              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  {/* Career Goal Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 border border-cyan-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Target Career Goal</span>
                      <h4 className="font-heading font-bold text-sm text-white mt-0.5">
                        {profile?.careerGoal || profile?.preferredField || 'Machine Learning Engineer'}
                      </h4>
                    </div>
                    {profile?.gradYear && (
                      <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                        Class of {profile.gradYear}
                      </span>
                    )}
                  </div>

                  {/* Skills I Can Help With */}
                  {profile?.availableToHelp && profile?.technicalSkills?.length > 0 && (
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-heading">
                        <Zap className="w-4 h-4" />
                        <span>Skills I Can Help Fellow Students With</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {profile.technicalSkills.slice(0, 6).map((skill: string) => (
                          <span
                            key={skill}
                            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Learning Journey Summary */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <h5 className="font-heading font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Learning Focus & Interests
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {profile?.interests?.length > 0 ? (
                        profile.interests.map((interest: string) => (
                          <span
                            key={interest}
                            className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No specific interest tags added yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Verified Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#091024] border border-white/5 text-center">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Verified Projects</div>
                      <div className="font-mono font-bold text-lg text-cyan-400 mt-0.5">
                        {profile?.projects?.length || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#091024] border border-white/5 text-center">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Courses Finished</div>
                      <div className="font-mono font-bold text-lg text-purple-400 mt-0.5">
                        {profile?.courses?.length || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#091024] border border-white/5 text-center col-span-2 sm:col-span-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Certifications</div>
                      <div className="font-mono font-bold text-lg text-emerald-400 mt-0.5">
                        {profile?.certifications?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Contact Information Notice */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-cyan-400" /> Contact & Privacy Safeguards
                      </span>
                      {isConnected ? (
                        <span className="text-[10px] text-emerald-400 font-bold">✓ Connected</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Restricted until connected</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#070b14]/70 border border-white/5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate text-slate-300">
                          {profile?.email || '•••••••@private (Connect to view)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#070b14]/70 border border-white/5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-300">
                          {profile?.phone || '•••••••••• (Connect to view)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Skills */}
              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" /> Technical & Engineering Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.technicalSkills?.map((s: string) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Projects */}
              {activeTab === 'projects' && (
                <div className="space-y-3">
                  {profile?.projects?.length > 0 ? (
                    profile.projects.map((p: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-[#091024] border border-white/10 space-y-2 hover:border-cyan-500/30 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <h5 className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                            <FolderGit2 className="w-4 h-4 text-purple-400" /> {p.name}
                          </h5>
                          {p.complexity && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                              {p.complexity}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                        {p.technologies && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {p.technologies.map((t: string) => (
                              <span
                                key={t}
                                className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-8">No public projects uploaded yet.</p>
                  )}
                </div>
              )}

              {/* Tab: Courses & Certs */}
              {activeTab === 'courses' && (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-heading font-bold text-xs text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Completed Courses
                    </h5>
                    <div className="space-y-2">
                      {profile?.courses?.length > 0 ? (
                        profile.courses.map((c: any, i: number) => (
                          <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                            <div>
                              <h6 className="font-heading font-bold text-xs text-white">{c.name}</h6>
                              <span className="text-[11px] text-slate-400">{c.provider || 'Online Learning'}</span>
                            </div>
                            {c.completedAt && (
                              <span className="text-[10px] font-mono text-cyan-400">{c.completedAt}</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No courses recorded yet.</p>
                      )}
                    </div>
                  </div>

                  {profile?.certifications?.length > 0 && (
                    <div className="pt-2">
                      <h5 className="font-heading font-bold text-xs text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-400" /> Certifications
                      </h5>
                      <div className="space-y-2">
                        {profile.certifications.map((cert: any, i: number) => (
                          <div key={i} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                            <div>
                              <h6 className="font-heading font-bold text-xs text-white">{cert.name}</h6>
                              <span className="text-[11px] text-slate-400">{cert.platform || 'Industry Verified'}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                              Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#090f1e] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChat(profile.id, profile.name, profile.profilePhoto, profile.college);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Message {profile?.name?.split(' ')[0] || 'Student'}
              </button>
            ) : isPending ? (
              <button
                type="button"
                disabled
                className="px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 cursor-default"
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Request Sent ✓
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (profile?.id) onConnect(profile.id);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <UserPlus className="w-4 h-4" /> Connect as Study Partner
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
