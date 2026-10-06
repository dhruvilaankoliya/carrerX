'use client';

import React, { useState } from 'react';
import {
  X,
  Star,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';

interface RateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  resourceTopic?: string;
  onReviewSubmitted?: (newSummary: any, review: any) => void;
}

export default function RateStudentModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  resourceTopic = 'General Topic',
  onReviewSubmitted,
}: RateStudentModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickPrompts = [
    `Very helpful in explaining ${resourceTopic} concepts!`,
    `Helped me troubleshoot my code and deployment setup.`,
    `Great study partner, patient and knowledgeable.`,
    `Excellent explanation of architecture and best practices.`,
  ];

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }
    if (!reviewText.trim()) {
      setError('Please write a short review sharing how this student helped you.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/students/${studentId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          reviewText: reviewText.trim(),
          resourceTopic,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        if (onReviewSubmitted) {
          onReviewSubmitted(data.ratingsSummary, data.review);
        }
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Failed to submit review.');
      }
    } catch {
      setError('Network error submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#070b14] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-[#0d162e] to-[#070b14] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-white">
                Rate & Review Student
              </h3>
              <p className="text-xs text-slate-300">
                Peer feedback for <strong className="text-cyan-300">{studentName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {success ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-white text-base">Review Submitted!</h4>
              <p className="text-xs text-slate-300">
                Thank you! Your verified rating has been published to {studentName}'s peer profile.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Star Selection */}
              <div className="text-center py-2 space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  How helpful was this student's assistance?
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs font-bold text-amber-300">
                  {rating === 5 && '⭐⭐⭐⭐⭐ Exceptional (5.0 / 5)'}
                  {rating === 4 && '⭐⭐⭐⭐ Very Good (4.0 / 5)'}
                  {rating === 3 && '⭐⭐⭐ Good / Helpful (3.0 / 5)'}
                  {rating === 2 && '⭐⭐ Fair (2.0 / 5)'}
                  {rating === 1 && '⭐ Needs Improvement (1.0 / 5)'}
                </div>
              </div>

              {/* Quick Suggestion Prompts */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Quick Prompts (Click to Insert)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setReviewText(prompt)}
                      className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 border border-white/10 transition-all"
                    >
                      + {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Written Feedback / Review
                </label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={`Write a short review sharing how ${studentName} helped you learn ${resourceTopic}...`}
                  className="w-full bg-[#111a30] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Review
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
