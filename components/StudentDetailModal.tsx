'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
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
  Star,
  Clock,
  Zap,
  Check,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Flag,
  Share2,
} from 'lucide-react';
import { StudentProfileData, StudentReview } from '@/lib/studentConnectService';
import RateStudentModal from './RateStudentModal';

interface StudentDetailModalProps {
  student: StudentProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (studentId: string, studentName: string) => void;
  onOpenChat: (student: StudentProfileData) => void;
  connectionStatus?: 'none' | 'pending' | 'connected';
  resourceTopic?: string;
}

export default function StudentDetailModal({
  student,
  isOpen,
  onClose,
  onConnect,
  onOpenChat,
  connectionStatus = 'none',
  resourceTopic,
}: StudentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'reviews' | 'learning'>('overview');
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [localStudent, setLocalStudent] = useState<StudentProfileData | null>(null);
  const [reported, setReported] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (student) {
      setLocalStudent(student);
      setActiveTab('overview');
      setReported(false);
      setBlocked(false);
    }
  }, [student]);

  if (!isOpen || !localStudent) return null;

  const currentStatus = connectionStatus;
  const ratingSummary = localStudent.ratingsSummary || {
    averageRating: 4.8,
    totalReviews: 24,
    distribution: { 5: 18, 4: 4, 3: 1, 2: 0, 1: 0 },
  };

  const handleReviewSubmitted = (newSummary: any, newReview: StudentReview) => {
    setLocalStudent((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ratingsSummary: newSummary,
        reviews: [newReview, ...prev.reviews.filter((r) => r.id !== newReview.id)],
      };
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#070b14] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header Banner */}
          <div className="relative p-6 bg-gradient-to-r from-cyan-950/60 via-[#0d162e] to-[#070b14] border-b border-white/10 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                {localStudent.profilePhoto ? (
                  <img
                    src={localStudent.profilePhoto}
                    alt={localStudent.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20"
                  />
                ) : (
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${localStudent.avatarColor} flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-lg shadow-cyan-500/20`}
                  >
                    {localStudent.initials}
                  </div>
                )}
                {localStudent.isOnline && (
                  <span
                    title="Online Now"
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#070b14]"
                  />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white">
                    {localStudent.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                    ✓ Verified Learner
                  </span>
                  {localStudent.matchScore && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {localStudent.matchScore}% Match
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium text-cyan-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  {localStudent.course} • Year {localStudent.currentYear}
                </p>

                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  {localStudent.college}
                </p>

                {/* Rating Badge */}
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="flex items-center gap-1 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{ratingSummary.averageRating} / 5</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    ({ratingSummary.totalReviews} {ratingSummary.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-[#090f1e] px-6 gap-2 pt-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'skills', label: 'Skills & Tech' },
              { id: 'learning', label: 'Learning Journey' },
              { id: 'reviews', label: `Reviews (${ratingSummary.totalReviews})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-gradient-to-b from-[#070b14] to-[#0a1020] custom-scrollbar">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Career Goal Card */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 border border-cyan-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                      Career Goal
                    </span>
                    <h4 className="font-heading font-bold text-sm text-white mt-0.5">
                      {localStudent.careerGoal}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    Class of {localStudent.gradYear}
                  </span>
                </div>

                {/* Bio Quote */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    About / Bio
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    "{localStudent.bio}"
                  </p>
                </div>

                {/* Studied Resource Progress */}
                <div className="p-4 rounded-xl bg-[#091024] border border-indigo-500/20 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Studied:{' '}
                      <span className="text-cyan-300">{localStudent.studiedResource}</span>
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {localStudent.completionPercent}% Completed
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${localStudent.completionPercent}%` }}
                    />
                  </div>
                </div>

                {/* Match Reasons if available */}
                {localStudent.matchReasons && localStudent.matchReasons.length > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Why CareerX Recommends This Learner:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {localStudent.matchReasons.map((r, i) => (
                        <div key={i} className="text-xs text-slate-200 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {localStudent.achievements && localStudent.achievements.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" /> Key Milestones & Achievements
                    </span>
                    <div className="space-y-1.5">
                      {localStudent.achievements.map((ach, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. SKILLS TAB */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#091024] border border-white/10 space-y-3">
                  <h4 className="font-heading font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" /> Technical Competencies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {localStudent.technicalSkills.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Code2 className="w-3 h-3 text-cyan-400" /> {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Experience Level
                  </span>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
                      {localStudent.experienceLevel} Engineering Proficiency
                    </span>
                    <span className="text-xs text-slate-400">
                      {localStudent.availableToHelp
                        ? '✓ Available to help other students on CareerX'
                        : 'Focused on individual project work'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. LEARNING JOURNEY TAB */}
            {activeTab === 'learning' && (
              <div className="space-y-4">
                {/* Completed Resources */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                  <h5 className="font-heading font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed Resources & Topics
                  </h5>
                  <div className="space-y-1.5">
                    {localStudent.completedResources.map((res, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-[#070b14]/70 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <span className="text-white font-medium flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> {res}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Mastered
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Currently Learning */}
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2.5">
                  <h5 className="font-heading font-bold text-xs text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-cyan-400" /> Currently Learning & Exploring
                  </h5>
                  <div className="space-y-1.5">
                    {localStudent.currentlyLearning.map((item, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-[#070b14]/70 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-200 flex items-center gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" /> {item}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                          In Progress
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-5">
                {/* Ratings Breakdown Visualizer */}
                <div className="p-5 rounded-2xl bg-[#091024] border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading font-extrabold text-4xl text-amber-400">
                          {ratingSummary.averageRating}
                        </span>
                        <span className="text-slate-400 text-sm">/ 5.0</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= Math.round(ratingSummary.averageRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">
                        Based on {ratingSummary.totalReviews} verified student ratings
                      </p>
                    </div>

                    <button
                      onClick={() => setIsRateModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all flex items-center gap-1.5 self-start sm:self-center"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> Rate this Student
                    </button>
                  </div>

                  {/* 5-tier distribution bar breakdown */}
                  <div className="space-y-2 pt-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = (ratingSummary.distribution as any)[star] || 0;
                      const pct = ratingSummary.totalReviews > 0
                        ? Math.round((count / ratingSummary.totalReviews) * 100)
                        : (star === 5 ? 75 : star === 4 ? 20 : star === 3 ? 5 : 0);
                      return (
                        <div key={star} className="flex items-center gap-3 text-xs">
                          <span className="w-7 font-mono font-bold text-slate-300 flex items-center gap-1">
                            {star} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right font-mono text-slate-400 text-[11px]">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-3">
                  <h5 className="font-heading font-bold text-xs text-slate-300 uppercase tracking-wider">
                    Recent Student Feedback
                  </h5>
                  {localStudent.reviews && localStudent.reviews.length > 0 ? (
                    localStudent.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl bg-[#070b14]/90 border border-white/10 space-y-2 hover:border-cyan-500/20 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                              {rev.reviewerName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h6 className="font-heading font-bold text-xs text-white">
                                {rev.reviewerName}
                              </h6>
                              <span className="text-[10px] text-slate-400">
                                {rev.reviewerCollege || 'CareerX Learner'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                            <span className="text-[10px] font-mono text-slate-400 ml-1.5">
                              {rev.createdAt}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed italic">
                          "{rev.reviewText}"
                        </p>

                        {rev.resourceTopic && (
                          <div className="pt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                              Topic: {rev.resourceTopic}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 px-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-slate-400 space-y-1">
                      <p className="text-xs">No written reviews yet.</p>
                      <button
                        onClick={() => setIsRateModalOpen(true)}
                        className="text-xs text-cyan-400 underline font-semibold"
                      >
                        Be the first to review {localStudent.name}!
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Privacy & Safety Notice */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" /> CareerX Safe Communication: Personal contact info is kept private.
              </span>
              <div className="flex items-center gap-2">
                {reported ? (
                  <span className="text-[11px] text-amber-400 font-semibold">Reported</span>
                ) : (
                  <button
                    onClick={() => setReported(true)}
                    className="text-[11px] hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <Flag className="w-3 h-3" /> Report
                  </button>
                )}
                <span>•</span>
                {blocked ? (
                  <span className="text-[11px] text-rose-400 font-semibold">Blocked</span>
                ) : (
                  <button
                    onClick={() => setBlocked(true)}
                    className="text-[11px] hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <ShieldAlert className="w-3 h-3" /> Block
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#090f1e] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
            >
              Close
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400" /> Rate Student
              </button>

              {currentStatus === 'connected' ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChat(localStudent);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <MessageSquare className="w-4 h-4" /> Message {localStudent.name.split(' ')[0]}
                </button>
              ) : currentStatus === 'pending' ? (
                <button
                  type="button"
                  disabled
                  className="px-5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 cursor-default"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Request Sent ✓
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onConnect(localStudent.id, localStudent.name)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <UserPlus className="w-4 h-4" /> Connect with Student
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5-Star Rate Modal */}
      <RateStudentModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        studentId={localStudent.id}
        studentName={localStudent.name}
        resourceTopic={resourceTopic || localStudent.studiedResource}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </>
  );
}
