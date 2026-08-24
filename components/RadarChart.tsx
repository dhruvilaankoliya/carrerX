'use client';

import React from 'react';

interface Dimension {
  name: string;
  current: number;
  benchmark: number;
}

interface RadarChartProps {
  dimensions: Dimension[];
  size?: number;
  targetRoleName?: string;
}

export default function RadarChart({
  dimensions,
  size = 380,
  targetRoleName = 'Benchmark',
}: RadarChartProps) {
  if (!dimensions || dimensions.length === 0) {
    return <div className="text-slate-500 text-center py-10 text-xs">No radar data available</div>;
  }

  const center = size / 2;
  const radius = center - 45;
  const levels = 4;
  const total = dimensions.length;
  const angleSlice = (Math.PI * 2) / total;

  // Grid polygons
  const gridPolygons = [];
  for (let lvl = 1; lvl <= levels; lvl++) {
    const levelRadius = (radius / levels) * lvl;
    const points = dimensions.map((_, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = center + levelRadius * Math.cos(angle);
      const y = center + levelRadius * Math.sin(angle);
      return `${x},${y}`;
    });
    gridPolygons.push(points.join(' '));
  }

  // Target Benchmark polygon
  const targetPoints = dimensions.map((d, i) => {
    const angle = i * angleSlice - Math.PI / 2;
    const r = ((d.benchmark || 80) / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Student Current polygon
  const currentPoints = dimensions.map((d, i) => {
    const angle = i * angleSlice - Math.PI / 2;
    const r = ((d.current || 20) / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <linearGradient id="currentAreaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Concentric Web Grid */}
        {gridPolygons.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Axis Spokes & Labels */}
        {dimensions.map((d, i) => {
          const angle = i * angleSlice - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          const labelOffset = radius + 20;
          const lx = center + labelOffset * Math.cos(angle);
          const ly = center + labelOffset * Math.sin(angle);
          const textAnchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';

          return (
            <g key={i}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
              <text
                x={lx}
                y={ly + 4}
                fill="#94a3b8"
                fontSize="10.5"
                fontWeight="600"
                textAnchor={textAnchor}
              >
                {d.name}
              </text>
            </g>
          );
        })}

        {/* Target Benchmark Area */}
        <polygon
          points={targetPoints}
          fill="rgba(139, 92, 246, 0.12)"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeDasharray="5,4"
        />

        {/* Current Student Area */}
        <polygon
          points={currentPoints}
          fill="url(#currentAreaGrad)"
          stroke="#06b6d4"
          strokeWidth="2.5"
          className="drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
        />

        {/* Vertex Dots */}
        {dimensions.map((d, i) => {
          const angle = i * angleSlice - Math.PI / 2;
          const cr = ((d.current || 20) / 100) * radius;
          const cx = center + cr * Math.cos(angle);
          const cy = center + cr * Math.sin(angle);

          const tr = ((d.benchmark || 80) / 100) * radius;
          const tx = center + tr * Math.cos(angle);
          const ty = center + tr * Math.sin(angle);

          return (
            <g key={i}>
              <circle cx={tx} cy={ty} r="3.5" fill="#8b5cf6" />
              <circle cx={cx} cy={cy} r="4.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="text-slate-200">Your Current Level</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 rounded-full bg-purple-500 border border-dashed border-purple-400" />
          <span className="text-slate-400">{targetRoleName} Benchmark</span>
        </div>
      </div>
    </div>
  );
}
