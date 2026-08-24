'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Network, Info } from 'lucide-react';
import ForceGraph from '@/components/ForceGraph';
import { buildSkillRelationshipGraph, ForceGraphData } from '@/lib/graph/graphBuilder';
import { StudentProfileData } from '@/lib/scoring/types';

export default function SkillGraphPage() {
  const router = useRouter();
  const [graphData, setGraphData] = useState<ForceGraphData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.user) {
          const u = json.user;
          const prof = u.profile || {};
          const parsedResume = u.resumeData?.parsed || {};

          const studentData: StudentProfileData = {
            userId: u.id,
            name: u.name,
            college: prof.college || 'University',
            course: prof.course || 'B.Tech',
            branch: prof.branch || 'Computer Science',
            currentYear: prof.currentYear || 3,
            gradYear: prof.gradYear || 2026,
            cgpa: prof.cgpa,
            programmingLanguages: JSON.parse(prof.programmingLanguages || '[]'),
            technicalSkills: JSON.parse(prof.technicalSkills || '[]'),
            extractedSkills: parsedResume.technicalSkills || [],
            extractedProjects: parsedResume.projects || [],
            extractedCertifications: parsedResume.certifications || [],
            resumeInitialInterests: u.resumeData?.initialInterests || {},
            assessmentScores: {
              techInterest: u.resumeData?.initialInterests || {},
              aptitude: 80,
              problemSolving: 80,
              mindGames: 80,
            },
            streakDays: prof.streakDays || 1,
          };

          const data = buildSkillRelationshipGraph(studentData);
          setGraphData(data);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Force-Directed Knowledge Topology
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-white">
          Technical Skill & <span className="text-gradient">Subject Relationship Graph</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Interactive force-directed graph connecting your profile to domains, validated competencies, and recommended next topics.
        </p>
      </div>

      {loading ? (
        <div className="h-[580px] rounded-2xl bg-[#0b1222] border border-white/10 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Computing topological physics network...</p>
        </div>
      ) : graphData ? (
        <div className="space-y-4">
          <ForceGraph graphData={graphData} height={600} />
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>
                <strong>Interaction:</strong> Click & drag any node to explore connections. Click a node to view its status and related subjects.
              </span>
            </div>
            <span className="font-mono text-cyan-400 font-bold">{graphData.nodes.length} Nodes Modeled</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
