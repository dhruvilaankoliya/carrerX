'use client';

import React from 'react';

interface ReadinessGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  tier?: string;
}

export default function ReadinessGauge({
  score,
  size = 140,
  strokeWidth = 10,
  label = 'Readiness Index',
  tier,
}: ReadinessGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  let tierColor = 'text-cyan-400';
  if (score >= 82) tierColor = 'text-emerald-400';
  else if (score >= 65) tierColor = 'text-blue-400';
  else tierColor = 'text-amber-400';

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
          />
        </svg>
        <div className="absolute text-center flex flex-col items-center">
          <span className="font-heading font-extrabold text-3xl text-white leading-none tracking-tight">
            {score}
          </span>
          <span className="text-[11px] font-mono text-slate-400 mt-0.5">/ 100</span>
        </div>
      </div>
      {label && <span className="text-xs text-slate-400 font-medium mt-2">{label}</span>}
      {tier && <span className={`text-xs font-bold ${tierColor} mt-0.5`}>{tier}</span>}
    </div>
  );
}

export function ScoreBreakdownBar({
  label,
  score,
  weight,
  icon,
}: {
  label: string;
  score: number;
  weight: number;
  icon: string;
}) {
  let color = 'bg-cyan-400';
  let textColor = 'text-cyan-400';
  if (score >= 82) {
    color = 'bg-emerald-400';
    textColor = 'text-emerald-400';
  } else if (score >= 65) {
    color = 'bg-blue-400';
    textColor = 'text-blue-400';
  } else {
    color = 'bg-amber-400';
    textColor = 'text-amber-400';
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <span>{icon}</span>
          <span>{label}</span>
          <span className="text-[10px] text-slate-500 font-normal">({weight}%)</span>
        </div>
        <span className={`font-mono font-bold ${textColor}`}>{score}/100</span>
      </div>
      <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
