import { ParsedResumeOutput } from './types';

const KNOWN_SKILL_DICTIONARY: Record<string, string[]> = {
  'AI & Data': [
    'python', 'pytorch', 'tensorflow', 'keras', 'scikit-learn', 'pandas', 'numpy', 'scipy',
    'sql', 'postgresql', 'mysql', 'mongodb', 'snowflake', 'spark', 'hadoop', 'tableau',
    'powerbi', 'nlp', 'llm', 'transformers', 'huggingface', 'rag', 'langchain', 'llamaindex',
    'pinecone', 'milvus', 'chroma', 'computer vision', 'opencv', 'deep learning', 'machine learning',
    'data analysis', 'data engineering', 'data science', 'matlab', 'r'
  ],
  'Software & Web': [
    'javascript', 'typescript', 'react', 'next.js', 'vue', 'angular', 'html', 'css',
    'tailwind', 'node.js', 'express', 'nest.js', 'django', 'flask', 'fastapi', 'spring boot',
    'java', 'c++', 'c#', 'c', 'go', 'rust', 'ruby', 'php', 'graphql', 'rest api', 'websockets',
    'redux', 'system design', 'data structures', 'algorithms', 'git', 'github'
  ],
  'Cloud & DevOps': [
    'docker', 'kubernetes', 'aws', 'amazon web services', 'azure', 'gcp', 'google cloud',
    'terraform', 'ansible', 'jenkins', 'ci/cd', 'github actions', 'linux', 'bash', 'shell',
    'prometheus', 'grafana', 'helm', 'argocd', 'nginx', 'apache', 'microservices'
  ],
  'Cyber & Security': [
    'cybersecurity', 'penetration testing', 'ethical hacking', 'owasp', 'wireshark', 'burp suite',
    'metasploit', 'cryptography', 'kali linux', 'siem', 'soc', 'network security', 'vulnerability assessment',
    'incident response', 'firewall', 'tcp/ip'
  ],
  'Product & Management': [
    'product management', 'agile', 'scrum', 'jira', 'confluence', 'figma', 'ui/ux', 'user research',
    'roadmapping', 'mixpanel', 'linear', 'a/b testing', 'prd'
  ]
};

export async function extractResumeData(rawText: string): Promise<ParsedResumeOutput> {
  const textLower = rawText.toLowerCase();

  // 1. Identify Technical Skills
  const identifiedSkills = new Set<string>();
  const categoryCounts: Record<string, number> = {
    'AI & Data': 0,
    'Software & Web': 0,
    'Cloud & DevOps': 0,
    'Cyber & Security': 0,
    'Product & Management': 0,
  };

  Object.entries(KNOWN_SKILL_DICTIONARY).forEach(([category, skills]) => {
    skills.forEach((skill) => {
      // Regex word boundary match
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(textLower)) {
        // Format skill with canonical title
        const canonical = skill.length <= 4 ? skill.toUpperCase() : skill.charAt(0).toUpperCase() + skill.slice(1);
        identifiedSkills.add(canonical);
        categoryCounts[category] += 1;
      }
    });
  });

  // 2. Extract Education Heuristics
  let institution = 'Accredited Engineering University';
  const instMatch = rawText.match(/(?:university|institute|college|school of technology|iit|nit|bits|iiit)[\w\s,.-]+/i);
  if (instMatch) {
    institution = instMatch[0].trim().slice(0, 60);
  }

  let degree = 'B.Tech / B.S.';
  if (/b\.?tech|bachelor of technology/i.test(rawText)) degree = 'B.Tech';
  else if (/b\.?e\.?|bachelor of engineering/i.test(rawText)) degree = 'B.E.';
  else if (/m\.?tech|master/i.test(rawText)) degree = 'M.Tech / M.S.';
  else if (/bca|bachelor of computer/i.test(rawText)) degree = 'BCA';

  let fieldOfStudy = 'Computer Science & Engineering';
  if (/data science/i.test(rawText)) fieldOfStudy = 'Data Science & AI';
  else if (/information technology|it\b/i.test(rawText)) fieldOfStudy = 'Information Technology';
  else if (/electronics|ece\b/i.test(rawText)) fieldOfStudy = 'Electronics & Communication';
  else if (/mechanical/i.test(rawText)) fieldOfStudy = 'Mechanical Engineering';

  // 3. Extract Projects
  const projects: ParsedResumeOutput['projects'] = [];
  const projectBlocks = rawText.split(/(?:projects?|academic projects?|key projects?)\s*[:\n]/i)[1];
  
  if (projectBlocks) {
    const lines = projectBlocks.split(/\n+/).map(l => l.trim()).filter(l => l.length > 5);
    let currentProjName = '';
    let currentProjDesc = '';
    
    for (let i = 0; i < Math.min(lines.length, 12); i++) {
      const line = lines[i];
      if (/^[•\-*]|\d+\./.test(line) || currentProjName === '') {
        if (currentProjName && currentProjDesc) {
          const matchedProjSkills = Array.from(identifiedSkills).filter(s => currentProjDesc.toLowerCase().includes(s.toLowerCase()));
          projects.push({
            name: currentProjName.replace(/^[•\-*\d.]+\s*/, '').slice(0, 50),
            technologies: matchedProjSkills.length > 0 ? matchedProjSkills.slice(0, 5) : ['Python', 'Git'],
            domain: categoryCounts['AI & Data'] > categoryCounts['Software & Web'] ? 'AI & Data' : 'Software & Web',
            description: currentProjDesc.slice(0, 180),
            complexity: matchedProjSkills.length > 3 ? 'Advanced' : 'Intermediate',
          });
          currentProjDesc = '';
        }
        currentProjName = line.slice(0, 60);
      } else {
        currentProjDesc += ' ' + line;
      }
    }

    if (currentProjName && currentProjDesc && projects.length < 3) {
      const matchedProjSkills = Array.from(identifiedSkills).filter(s => currentProjDesc.toLowerCase().includes(s.toLowerCase()));
      projects.push({
        name: currentProjName.replace(/^[•\-*\d.]+\s*/, '').slice(0, 50),
        technologies: matchedProjSkills.length > 0 ? matchedProjSkills.slice(0, 5) : ['Python', 'JavaScript'],
        domain: 'Software & Web',
        description: currentProjDesc.slice(0, 180),
        complexity: 'Intermediate',
      });
    }
  }

  // If no projects explicitly found, generate sensible structured project from identified skills
  if (projects.length === 0 && identifiedSkills.size > 0) {
    const skillsArr = Array.from(identifiedSkills);
    projects.push({
      name: `${skillsArr.slice(0, 2).join(' & ')} Implementation System`,
      technologies: skillsArr.slice(0, 4),
      domain: categoryCounts['AI & Data'] > 0 ? 'AI & Data' : 'Software & Web',
      description: 'Hands-on practical development applying algorithmic and architectural design principles.',
      complexity: 'Intermediate',
    });
  }

  // 4. Extract Certifications
  const certifications: ParsedResumeOutput['certifications'] = [];
  if (/coursera|deeplearning\.ai|aws certified|udemy|nptel|stanford|google cloud/i.test(rawText)) {
    const certMatches = rawText.match(/(?:certified|specialization|certificate|credential)[\w\s,.-]+/gi);
    if (certMatches) {
      certMatches.slice(0, 3).forEach((cm) => {
        certifications.push({
          name: cm.trim().slice(0, 60),
          platform: /coursera/i.test(rawText) ? 'Coursera' : /aws/i.test(rawText) ? 'AWS' : 'Industry Verified',
          domain: 'Technical Credential',
        });
      });
    }
  }

  // 5. Initial Interest Estimate Computation (Normalized Percentages across domains)
  const totalWeight = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
  const initialInterestEstimate = {
    'AI & Data': Math.min(95, Math.max(10, Math.round((categoryCounts['AI & Data'] / totalWeight) * 80 + (categoryCounts['AI & Data'] > 0 ? 15 : 5)))),
    'Software & Web': Math.min(95, Math.max(10, Math.round((categoryCounts['Software & Web'] / totalWeight) * 80 + (categoryCounts['Software & Web'] > 0 ? 15 : 5)))),
    'Cloud & DevOps': Math.min(95, Math.max(10, Math.round((categoryCounts['Cloud & DevOps'] / totalWeight) * 80 + (categoryCounts['Cloud & DevOps'] > 0 ? 15 : 5)))),
    'Cyber & Security': Math.min(95, Math.max(10, Math.round((categoryCounts['Cyber & Security'] / totalWeight) * 80 + (categoryCounts['Cyber & Security'] > 0 ? 15 : 5)))),
    'Product & Management': Math.min(95, Math.max(10, Math.round((categoryCounts['Product & Management'] / totalWeight) * 80 + (categoryCounts['Product & Management'] > 0 ? 15 : 5)))),
  };

  return {
    education: {
      institution,
      degree,
      fieldOfStudy,
      gradYear: rawText.match(/\b202[4-9]\b/)?.[0] || '2026',
    },
    technicalSkills: Array.from(identifiedSkills),
    subjects: ['Data Structures & Algorithms', 'Database Management Systems', 'Object Oriented Programming', 'Operating Systems'],
    projects,
    certifications,
    initialInterestEstimate,
  };
}
