import { StudentProfileData } from '../scoring/types';

export interface GraphNode {
  id: string;
  name: string;
  type: 'STUDENT' | 'DOMAIN' | 'SKILL' | 'SUBJECT';
  domain?: string;
  status?: 'STRONG' | 'LEARNING' | 'BEGINNER' | 'MISSING' | 'RECOMMENDED';
  radius: number;
  color: string;
  details?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
  color: string;
}

export interface ForceGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function buildSkillRelationshipGraph(profile: StudentProfileData): ForceGraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // 1. Central Student Node
  const studentNodeId = 'student_root';
  nodes.push({
    id: studentNodeId,
    name: profile.name,
    type: 'STUDENT',
    radius: 28,
    color: '#06b6d4',
    details: `${profile.branch} (${profile.college}) • Year ${profile.currentYear}`,
  });

  // 2. Domain Nodes
  const domains = [
    { id: 'dom_prog', name: 'Programming Foundations', color: '#3b82f6' },
    { id: 'dom_ai', name: 'AI, ML & Data Science', color: '#8b5cf6' },
    { id: 'dom_soft', name: 'Software Architecture & Web', color: '#ec4899' },
    { id: 'dom_cloud', name: 'Cloud, DevOps & Containers', color: '#10b981' },
    { id: 'dom_cyber', name: 'Cybersecurity & Defense', color: '#f43f5e' },
  ];

  domains.forEach((d) => {
    nodes.push({
      id: d.id,
      name: d.name,
      type: 'DOMAIN',
      radius: 18,
      color: d.color,
      details: `Core engineering domain in CareerX intelligence index`,
    });
    links.push({
      source: studentNodeId,
      target: d.id,
      weight: 2.5,
      color: 'rgba(99, 102, 241, 0.35)',
    });
  });

  // 3. User Skills Set
  const userSkills = new Set(
    [
      ...profile.programmingLanguages,
      ...profile.technicalSkills,
      ...profile.extractedSkills,
    ].map((s) => s.toLowerCase())
  );

  const domainSkillTaxonomy: Record<string, { domainId: string; skills: { name: string; isCore?: boolean }[] }> = {
    Programming: {
      domainId: 'dom_prog',
      skills: [
        { name: 'Python', isCore: true },
        { name: 'Data Structures & Algorithms', isCore: true },
        { name: 'OOP Concepts', isCore: true },
        { name: 'Git & GitHub', isCore: true },
        { name: 'C++' },
        { name: 'Java' },
      ],
    },
    'AI & ML': {
      domainId: 'dom_ai',
      skills: [
        { name: 'PyTorch', isCore: true },
        { name: 'Linear Algebra for Tensors', isCore: true },
        { name: 'Deep Learning & Neural Nets', isCore: true },
        { name: 'RAG & Vector DBs' },
        { name: 'Scikit-Learn' },
        { name: 'Transformers' },
        { name: 'SQL & Data Engineering' },
      ],
    },
    'Software & Web': {
      domainId: 'dom_soft',
      skills: [
        { name: 'TypeScript / JavaScript', isCore: true },
        { name: 'React & Next.js', isCore: true },
        { name: 'REST & GraphQL APIs' },
        { name: 'System Design Principles' },
        { name: 'Database Management (PostgreSQL)' },
      ],
    },
    'Cloud & DevOps': {
      domainId: 'dom_cloud',
      skills: [
        { name: 'Docker Containers', isCore: true },
        { name: 'Linux Command Line', isCore: true },
        { name: 'Kubernetes Orchestration' },
        { name: 'CI/CD Pipelines' },
        { name: 'AWS Cloud Services' },
      ],
    },
    Cybersecurity: {
      domainId: 'dom_cyber',
      skills: [
        { name: 'OWASP Security Top 10' },
        { name: 'Network Security & Wireshark' },
        { name: 'Cryptography Foundations' },
      ],
    },
  };

  Object.entries(domainSkillTaxonomy).forEach(([, data]) => {
    data.skills.forEach((skill) => {
      const sLower = skill.name.toLowerCase();
      const isKnown = Array.from(userSkills).some((us) => us.includes(sLower) || sLower.includes(us));
      
      let status: GraphNode['status'] = 'MISSING';
      let color = 'rgba(244, 63, 94, 0.7)'; // Coral for Missing

      if (isKnown) {
        if (skill.isCore) {
          status = 'STRONG';
          color = '#10b981'; // Emerald for Strong
        } else {
          status = 'LEARNING';
          color = '#38bdf8'; // Cyan for Learning
        }
      } else if (skill.isCore) {
        status = 'RECOMMENDED';
        color = '#f59e0b'; // Amber for Recommended Next
      }

      const nodeId = `skill_${skill.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      nodes.push({
        id: nodeId,
        name: skill.name,
        type: 'SKILL',
        status,
        radius: isKnown ? 12 : 9,
        color,
        details: `Status: ${status} • Connected to ${data.domainId.replace('dom_', '').toUpperCase()}`,
      });

      links.push({
        source: data.domainId,
        target: nodeId,
        weight: isKnown ? 2 : 1,
        color: isKnown ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 0.1)',
      });
    });
  });

  return { nodes, links };
}
