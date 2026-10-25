'use client';

import React, { useState, useEffect } from 'react';
import { Star, X, Check, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

interface ResourceFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string;
  resourceTitle: string;
  skillName: string;
  initialRating?: number | null;
  initialComment?: string | null;
  onSuccess: (updatedFeedback: { rating: number; comment: string | null }) => void;
}

export default function ResourceFeedbackModal({
  isOpen,
  onClose,
  resourceId,
  resourceTitle,
  skillName,
  initialRating = 5,
  initialComment = '',
  onSuccess,
}: ResourceFeedbackModalProps) {
  const [rating, setRating] = useState<number>(initialRating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>(initialComment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating || 5);
      setComment(initialComment || '');
      setError(null);
    }
  }, [isOpen, initialRating, initialComment]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating from 1 to 5');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/resources/${encodeURIComponent(resourceId)}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      onSuccess({
        rating,
        comment: comment.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving feedback');
    } finally {
      setLoading(false);
    }
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0b1222] border border-cyan-500/30 p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.2)] space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {skillName}
              </span>
              <span className="text-xs text-slate-400">Resource Completed!</span>
            </div>
            <h3 className="font-heading font-bold text-base sm:text-lg text-white mt-1 line-clamp-1">
              Rate: {resourceTitle}
            </h3>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating Interactive Selector */}
          <div className="text-center space-y-2 py-2">
            <label className="text-xs font-semibold text-slate-300 block">
              How effective was this resource for closing your gap?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isLit = starVal <= activeRating;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(starVal)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    aria-label={`Rate ${starVal} star${starVal > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        isLit
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-mono font-bold text-amber-300">
              {activeRating === 5 && '★★★★★ Excellent — Essential Masterclass'}
              {activeRating === 4 && '★★★★☆ Very Good — Strong Foundation'}
              {activeRating === 3 && '★★★☆☆ Good — Helpful Overview'}
              {activeRating === 2 && '★★☆☆☆ Fair — Needs More Depth'}
              {activeRating === 1 && '★☆☆☆☆ Basic — Missed Core Concepts'}
            </p>
          </div>

          {/* Feedback Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1 font-semibold">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Peer Review & Tips (Optional)
              </span>
              <span
                className={`font-mono text-[11px] ${
                  comment.length > 450 ? 'text-amber-400' : 'text-slate-500'
                }`}
              >
                {comment.length} / 500
              </span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="What hands-on labs or takeaways helped you the most? Share advice with other students studying this gap..."
              rows={3}
              className="w-full p-3 rounded-xl bg-[#070b14]/90 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 resize-none transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Rating</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
