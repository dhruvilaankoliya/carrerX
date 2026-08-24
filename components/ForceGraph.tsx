'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ForceGraphData, GraphNode } from '@/lib/graph/graphBuilder';
import { ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';

interface ForceGraphProps {
  graphData: ForceGraphData;
  height?: number;
}

export default function ForceGraph({ graphData, height = 580 }: ForceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const simulationRef = useRef<{
    nodes: any[];
    links: any[];
    zoom: number;
    panX: number;
    panY: number;
    isDragging: boolean;
    draggedNode: any | null;
    dragStartX: number;
    dragStartY: number;
    animationId: number | null;
  }>({
    nodes: [],
    links: [],
    zoom: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    draggedNode: null,
    dragStartX: 0,
    dragStartY: 0,
    animationId: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 800;
    canvas.width = width * (window.devicePixelRatio || 1);
    canvas.height = height * (window.devicePixelRatio || 1);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    // Initialize node physics coordinates
    const nodes = graphData.nodes.map((node, i) => {
      const angle = (i / graphData.nodes.length) * Math.PI * 2;
      const dist = node.type === 'STUDENT' ? 0 : node.type === 'DOMAIN' ? 140 : 250 + Math.random() * 80;
      return {
        ...node,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
      };
    });

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const links: Array<{ source: any; target: any; weight: number; color: string }> = [];
    
    graphData.links.forEach((l) => {
      const src = nodeMap.get(l.source);
      const tgt = nodeMap.get(l.target);
      if (src && tgt) {
        links.push({
          source: src,
          target: tgt,
          weight: l.weight,
          color: l.color,
        });
      }
    });

    const sim = simulationRef.current;
    sim.nodes = nodes;
    sim.links = links;

    // Simple spring-electrical force iteration
    const tick = () => {
      // 1. Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 320) {
            const force = (320 - dist) / dist * 0.04;
            n1.vx -= dx * force;
            n1.vy -= dy * force;
            n2.vx += dx * force;
            n2.vy += dy * force;
          }
        }
      }

      // 2. Attraction along links
      for (const link of links) {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dist = Math.hypot(dx, dy) || 1;
        const targetDist = link.source.type === 'STUDENT' ? 140 : 110;
        const force = (dist - targetDist) * 0.015;
        link.source.vx += (dx / dist) * force;
        link.source.vy += (dy / dist) * force;
        link.target.vx -= (dx / dist) * force;
        link.target.vy -= (dy / dist) * force;
      }

      // 3. Center gravity pull
      for (const n of nodes) {
        if (n.type === 'STUDENT') {
          n.vx += (width / 2 - n.x) * 0.05;
          n.vy += (height / 2 - n.y) * 0.05;
        } else {
          n.vx += (width / 2 - n.x) * 0.003;
          n.vy += (height / 2 - n.y) * 0.003;
        }

        // Apply velocity with damping
        n.vx *= 0.85;
        n.vy *= 0.85;
        if (!sim.draggedNode || sim.draggedNode.id !== n.id) {
          n.x += n.vx;
          n.y += n.vy;
        }
      }

      // Render
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2 + sim.panX, height / 2 + sim.panY);
      ctx.scale(sim.zoom, sim.zoom);
      ctx.translate(-width / 2, -height / 2);

      // Draw Links
      for (const l of links) {
        ctx.beginPath();
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
        ctx.strokeStyle = l.color || 'rgba(99, 102, 241, 0.2)';
        ctx.lineWidth = (l.weight || 1) * 1.2;
        ctx.stroke();
      }

      // Draw Nodes
      for (const n of nodes) {
        const isHovered = hoveredNode?.id === n.id;
        const isSelected = selectedNode?.id === n.id;

        // Glow halo
        const glowRadius = n.radius * (isHovered || isSelected ? 2.2 : 1.4);
        const grad = ctx.createRadialGradient(n.x, n.y, n.radius * 0.4, n.x, n.y, glowRadius);
        grad.addColorStop(0, n.color);
        grad.addColorStop(1, 'rgba(7, 11, 20, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node Body
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, isHovered ? n.radius * 1.2 : n.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(n.x - n.radius * 0.25, n.y - n.radius * 0.25, n.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = isHovered || isSelected ? '#ffffff' : '#cbd5e1';
        ctx.font = `${isHovered || n.type === 'STUDENT' ? 'bold ' : ''}11px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(n.name, n.x, n.y + n.radius + 14);
      }

      ctx.restore();
      sim.animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (sim.animationId) cancelAnimationFrame(sim.animationId);
    };
  }, [graphData, height, hoveredNode, selectedNode]);

  // Canvas Mouse Controls
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, clientX: 0, clientY: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const sim = simulationRef.current;
    const width = rect.width;
    const height = rect.height;
    const x = (clientX - width / 2 - sim.panX) / sim.zoom + width / 2;
    const y = (clientY - height / 2 - sim.panY) / sim.zoom + height / 2;
    return { x, y, clientX, clientY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y, clientX, clientY } = getCanvasCoords(e);
    const sim = simulationRef.current;

    const hit = sim.nodes.find((n) => Math.hypot(n.x - x, n.y - y) <= n.radius + 6);
    if (hit) {
      sim.draggedNode = hit;
      setSelectedNode(hit);
    } else {
      sim.isDragging = true;
      sim.dragStartX = clientX - sim.panX;
      sim.dragStartY = clientY - sim.panY;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y, clientX, clientY } = getCanvasCoords(e);
    const sim = simulationRef.current;

    if (sim.draggedNode) {
      sim.draggedNode.x = x;
      sim.draggedNode.y = y;
      return;
    }

    if (sim.isDragging) {
      sim.panX = clientX - sim.dragStartX;
      sim.panY = clientY - sim.dragStartY;
      return;
    }

    const hit = sim.nodes.find((n) => Math.hypot(n.x - x, n.y - y) <= n.radius + 6);
    setHoveredNode(hit || null);
  };

  const handleMouseUp = () => {
    const sim = simulationRef.current;
    sim.isDragging = false;
    sim.draggedNode = null;
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-radial from-[#0e172e] to-[#070b14] border border-indigo-500/20 shadow-2xl">
      {/* HUD Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10">
        {/* Status Legend */}
        <div className="bg-[#0b1222]/90 backdrop-blur-md border border-indigo-500/30 rounded-xl px-4 py-2 flex flex-wrap gap-4 text-[11px] font-semibold pointer-events-auto shadow-lg">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" /> Strong Skill</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" /> Currently Learning</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" /> Recommended Next</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" /> Missing Skill</div>
        </div>

        {/* Zoom Controls */}
        <div className="flex gap-1.5 bg-[#0b1222]/90 backdrop-blur-md border border-indigo-500/30 p-1.5 rounded-xl pointer-events-auto">
          <button
            onClick={() => { simulationRef.current.zoom = Math.min(2.4, simulationRef.current.zoom * 1.2); }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => { simulationRef.current.zoom = Math.max(0.6, simulationRef.current.zoom * 0.8); }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              simulationRef.current.zoom = 1;
              simulationRef.current.panX = 0;
              simulationRef.current.panY = 0;
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Selected Node Details Card */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 max-w-xs bg-[#0b1222]/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-4 shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {selectedNode.type} {selectedNode.status ? `• ${selectedNode.status}` : ''}
            </span>
            <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
          <h4 className="font-heading font-bold text-base text-white mt-1.5">{selectedNode.name}</h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedNode.details}</p>
        </div>
      )}
    </div>
  );
}
