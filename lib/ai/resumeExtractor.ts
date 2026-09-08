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
  const textClean = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const textLower = textClean.toLowerCase();

  // 1. Candidate Personal Details Extraction
  let candidateName = '';
  const lines = textClean.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const line = lines[i];
    if (
      !line.match(/@|phone|tel|\+?\d{10}|https?:|github|linkedin|resume|curriculum|page|email/i) &&
      line.split(/\s+/).length >= 1 &&
      line.split(/\s+/).length <= 4 &&
      line.length >= 2 &&
      line.length <= 40 &&
      !/^(experience|education|skills|projects|profile|summary|contact)/i.test(line)
    ) {
      candidateName = line.replace(/^[•\-*\d.]+\s*/, '').trim();
      break;
    }
  }

  const emailMatch = textClean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : undefined;

  const phoneMatch = textClean.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[\s-]?\d{10}|\b\d{10}\b/);
  const phone = phoneMatch ? phoneMatch[0] : undefined;

  const linkedinMatch = textClean.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedin = linkedinMatch ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : undefined;

  const githubMatch = textClean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const github = githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`) : undefined;

  const gpaMatch = textClean.match(/(?:cgpa|gpa|grade|score)[\s:]*([0-9]\.[0-9]{1,2}|10(?:\.0)?)/i);
  const gpa = gpaMatch ? gpaMatch[1] : undefined;

  // 2. Identify Technical Skills & Categorize
  const identifiedSkills = new Set<string>();
  const categorizedSkills: Record<string, string[]> = {
    'AI & Data': [],
    'Software & Web': [],
    'Cloud & DevOps': [],
    'Cyber & Security': [],
    'Product & Management': [],
  };
  const categoryCounts: Record<string, number> = {
    'AI & Data': 0,
    'Software & Web': 0,
    'Cloud & DevOps': 0,
    'Cyber & Security': 0,
    'Product & Management': 0,
  };

  Object.entries(KNOWN_SKILL_DICTIONARY).forEach(([category, skills]) => {
    skills.forEach((skill) => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(textLower)) {
        let canonical = skill.length <= 4 ? skill.toUpperCase() : skill.charAt(0).toUpperCase() + skill.slice(1);
        if (skill === 'c++') canonical = 'C++';
        else if (skill === 'c#') canonical = 'C#';
        else if (skill === 'javascript') canonical = 'JavaScript';
        else if (skill === 'typescript') canonical = 'TypeScript';
        else if (skill === 'next.js') canonical = 'Next.js';
        else if (skill === 'node.js') canonical = 'Node.js';
        else if (skill === 'pytorch') canonical = 'PyTorch';
        else if (skill === 'postgresql') canonical = 'PostgreSQL';
        else if (skill === 'mongodb') canonical = 'MongoDB';
        else if (skill === 'fastapi') canonical = 'FastAPI';

        identifiedSkills.add(canonical);
        if (!categorizedSkills[category].includes(canonical)) {
          categorizedSkills[category].push(canonical);
        }
        categoryCounts[category] += 1;
      }
    });
  });

  // 3. Extract Education Details
  let institution = 'Accredited Engineering University';
  const instMatch = textClean.match(/(?:(?:indian\s+institute\s+of\s+technology|national\s+institute\s+of\s+technology|iit|nit|bits|iiit|dharmsinh\s+desai|delhi\s+technological|vellore\s+institute|anna\s+university)[\w\s,.-]*|(?:[\w\s,.-]+(?:university|institute|college|school\s+of\s+engineering|school\s+of\s+technology)))/i);
  if (instMatch) {
    institution = instMatch[0].trim().replace(/\s+/g, ' ').slice(0, 60);
  }

  let degree = 'B.Tech / B.S.';
  if (/b\.?tech|bachelor of technology/i.test(textClean)) degree = 'B.Tech';
  else if (/b\.?e\.?|bachelor of engineering/i.test(textClean)) degree = 'B.E.';
  else if (/m\.?tech|master/i.test(textClean)) degree = 'M.Tech / M.S.';
  else if (/bca|bachelor of computer/i.test(textClean)) degree = 'BCA';
  else if (/mca|master of computer/i.test(textClean)) degree = 'MCA';

  let fieldOfStudy = 'Computer Science & Engineering';
  if (/data science/i.test(textClean)) fieldOfStudy = 'Data Science & AI';
  else if (/artificial intelligence|ai & ml/i.test(textClean)) fieldOfStudy = 'Artificial Intelligence & ML';
  else if (/information technology|it\b/i.test(textClean)) fieldOfStudy = 'Information Technology';
  else if (/electronics|ece\b/i.test(textClean)) fieldOfStudy = 'Electronics & Communication';
  else if (/mechanical/i.test(textClean)) fieldOfStudy = 'Mechanical Engineering';

  const gradYearMatch = textClean.match(/\b202[4-9]\b/);
  const gradYear = gradYearMatch ? gradYearMatch[0] : '2026';

  // 4. Extract Projects
  const projects: ParsedResumeOutput['projects'] = [];
  const projectBlocks = textClean.split(/(?:projects?|academic projects?|key projects?)\s*[:\n]/i)[1];

  if (projectBlocks) {
    const rawProjectLines = projectBlocks
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 5 && !/^(certifications|education|skills|achievements|experience|contact|languages|interests)/i.test(l));

    let currentProjName = '';
    let currentProjDesc = '';

    for (let i = 0; i < Math.min(rawProjectLines.length, 16); i++) {
      const line = rawProjectLines[i];
      // Check if line looks like end of project section or start of new section
      if (/^(experience|education|skills|certifications|awards|interests|reference)/i.test(line)) {
        break;
      }

      if (/^[•\-*]|\d+\./.test(line) || currentProjName === '') {
        if (currentProjName && currentProjDesc) {
          const matchedProjSkills = Array.from(identifiedSkills).filter((s) =>
            currentProjDesc.toLowerCase().includes(s.toLowerCase())
          );
          projects.push({
            name: currentProjName.replace(/^[•\-*\d.]+\s*/, '').slice(0, 60),
            technologies: matchedProjSkills.length > 0 ? matchedProjSkills.slice(0, 5) : ['Python', 'Git'],
            domain: categoryCounts['AI & Data'] > categoryCounts['Software & Web'] ? 'AI & Data' : 'Software & Web',
            description: currentProjDesc.slice(0, 220),
            complexity: matchedProjSkills.length > 3 ? 'Advanced' : 'Intermediate',
          });
          currentProjDesc = '';
        }
        currentProjName = line.slice(0, 60);
      } else {
        currentProjDesc += ' ' + line;
      }
    }

    if (currentProjName && currentProjDesc && projects.length < 4) {
      const matchedProjSkills = Array.from(identifiedSkills).filter((s) =>
        currentProjDesc.toLowerCase().includes(s.toLowerCase())
      );
      projects.push({
        name: currentProjName.replace(/^[•\-*\d.]+\s*/, '').slice(0, 60),
        technologies: matchedProjSkills.length > 0 ? matchedProjSkills.slice(0, 5) : ['Python', 'JavaScript'],
        domain: categoryCounts['AI & Data'] > categoryCounts['Software & Web'] ? 'AI & Data' : 'Software & Web',
        description: currentProjDesc.slice(0, 220),
        complexity: matchedProjSkills.length > 3 ? 'Advanced' : 'Intermediate',
      });
    }
  }

  // Fallback: search for action bullet points if no project block found
  if (projects.length === 0) {
    const actionLines = lines.filter((l) =>
      /^(?:built|developed|implemented|created|designed|engineered|trained|architected|deployed)\b/i.test(l.replace(/^[•\-*\d.]+\s*/, ''))
    );
    actionLines.slice(0, 3).forEach((line, idx) => {
      const cleanLine = line.replace(/^[•\-*\d.]+\s*/, '');
      const matchedProjSkills = Array.from(identifiedSkills).filter((s) =>
        cleanLine.toLowerCase().includes(s.toLowerCase())
      );
      projects.push({
        name: cleanLine.slice(0, 45) + (cleanLine.length > 45 ? '...' : ''),
        technologies: matchedProjSkills.length > 0 ? matchedProjSkills.slice(0, 4) : ['Python', 'Git'],
        domain: categoryCounts['AI & Data'] > 0 ? 'AI & Data' : 'Software & Web',
        description: cleanLine.slice(0, 200),
        complexity: matchedProjSkills.length > 2 ? 'Advanced' : 'Intermediate',
      });
    });
  }

  // If still none, synthesize from top skills
  if (projects.length === 0 && identifiedSkills.size > 0) {
    const skillsArr = Array.from(identifiedSkills);
    projects.push({
      name: `${skillsArr.slice(0, 2).join(' & ')} Implementation System`,
      technologies: skillsArr.slice(0, 4),
      domain: categoryCounts['AI & Data'] > 0 ? 'AI & Data' : 'Software & Web',
      description: 'Hands-on practical development applying algorithmic optimization and production software engineering principles.',
      complexity: 'Intermediate',
    });
  }

  // 5. Extract Certifications
  const certifications: ParsedResumeOutput['certifications'] = [];
  if (/coursera|deeplearning\.ai|aws certified|udemy|nptel|stanford|google cloud|microsoft certified|oracle certified/i.test(textClean)) {
    const certMatches = textClean.match(/(?:(?:aws|google|microsoft|meta|deeplearning\.ai|coursera|nptel)\s+[\w\s,.-]+(?:certified|specialization|certificate|credential)|(?:certified|specialization|certificate|credential)[\w\s,.-]+)/gi);
    if (certMatches) {
      certMatches.slice(0, 4).forEach((cm) => {
        const cleanName = cm.trim().replace(/\s+/g, ' ').slice(0, 60);
        if (cleanName.length > 10 && !certifications.some(c => c.name === cleanName)) {
          certifications.push({
            name: cleanName,
            platform: /coursera/i.test(cleanName) ? 'Coursera' : /aws/i.test(cleanName) ? 'AWS' : /deeplearning/i.test(cleanName) ? 'DeepLearning.AI' : 'Industry Verified',
            domain: 'Technical Credential',
          });
        }
      });
    }
  }

  // 6. Initial Interest Estimate Computation
  const totalWeight = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
  const initialInterestEstimate = {
    'AI & Data': Math.min(95, Math.max(10, Math.round((categoryCounts['AI & Data'] / totalWeight) * 80 + (categoryCounts['AI & Data'] > 0 ? 15 : 5)))),
    'Software & Web': Math.min(95, Math.max(10, Math.round((categoryCounts['Software & Web'] / totalWeight) * 80 + (categoryCounts['Software & Web'] > 0 ? 15 : 5)))),
    'Cloud & DevOps': Math.min(95, Math.max(10, Math.round((categoryCounts['Cloud & DevOps'] / totalWeight) * 80 + (categoryCounts['Cloud & DevOps'] > 0 ? 15 : 5)))),
    'Cyber & Security': Math.min(95, Math.max(10, Math.round((categoryCounts['Cyber & Security'] / totalWeight) * 80 + (categoryCounts['Cyber & Security'] > 0 ? 15 : 5)))),
    'Product & Management': Math.min(95, Math.max(10, Math.round((categoryCounts['Product & Management'] / totalWeight) * 80 + (categoryCounts['Product & Management'] > 0 ? 15 : 5)))),
  };

  return {
    personalInfo: {
      name: candidateName || undefined,
      email,
      phone,
      linkedin,
      github,
    },
    education: {
      institution,
      degree,
      fieldOfStudy,
      gradYear,
      gpa,
    },
    technicalSkills: Array.from(identifiedSkills),
    categorizedSkills,
    subjects: ['Data Structures & Algorithms', 'Database Management Systems', 'Object Oriented Programming', 'Operating Systems', 'System Design'],
    projects,
    certifications,
    initialInterestEstimate,
  };
}
