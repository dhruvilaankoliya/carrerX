/* ==========================================================================
   CareerX - Client-Side Resume Parser, ATS Engine & Multi-Career Recommender
   ========================================================================== */

import { CAREERS_DATA } from '../data/careers.js';

// Keyword dictionary with synonym maps for precise multi-field detection
const SKILL_SYNONYM_MAP = {
  'Python': ['python', 'py'],
  'PyTorch': ['pytorch', 'torch'],
  'TensorFlow': ['tensorflow', 'tf', 'keras'],
  'FastAPI': ['fastapi', 'fast api'],
  'Flask': ['flask'],
  'Django': ['django'],
  'Docker': ['docker', 'container', 'containers', 'dockerfile', 'docker-compose'],
  'Kubernetes': ['kubernetes', 'k8s', 'kubectl', 'helm'],
  'MLOps': ['mlops', 'mlflow', 'kubeflow', 'dvc', 'weights & biases', 'wandb', 'triton'],
  'Vector DB (Pinecone)': ['vector db', 'vectordb', 'pinecone', 'chroma', 'chromadb', 'milvus', 'weaviate', 'qdrant', 'faiss'],
  'RAG / Vector DBs': ['rag', 'retrieval-augmented', 'vector search', 'embeddings', 'pinecone', 'langchain', 'llamaindex'],
  'Transformers': ['transformers', 'huggingface', 'bert', 'gpt', 'llm', 'llms', 'attention'],
  'CI/CD': ['ci/cd', 'cicd', 'github actions', 'jenkins', 'gitlab ci', 'continuous integration', 'continuous deployment'],
  'Model Monitoring': ['model monitoring', 'drift detection', 'evidently', 'evidently ai', 'prometheus', 'grafana', 'great expectations'],
  'SQL': ['sql', 'postgresql', 'postgres', 'mysql', 'sqlite', 'rdbms', 'query'],
  'Data Engineering / SQL': ['sql', 'spark', 'pyspark', 'etl', 'data warehouse', 'snowflake', 'bigquery', 'data pipeline'],
  'Pandas': ['pandas', 'numpy', 'scipy'],
  'Scikit-Learn': ['scikit-learn', 'sklearn'],
  'Deep Learning / PyTorch': ['deep learning', 'neural networks', 'pytorch', 'tensorflow', 'cnn', 'rnn'],
  'TypeScript': ['typescript', 'ts'],
  'React / Next.js': ['react', 'next.js', 'nextjs', 'react.js', 'redux', 'tailwind'],
  'Node / Go': ['node.js', 'nodejs', 'express', 'golang', 'go lang', 'nest.js'],
  'PostgreSQL': ['postgresql', 'postgres', 'relational database'],
  'Redis': ['redis', 'caching', 'in-memory'],
  'GraphQL': ['graphql', 'apollo'],
  'System Design': ['system design', 'microservices', 'distributed systems', 'load balancing', 'high concurrency', 'scalability'],
  'Terraform': ['terraform', 'iac', 'infrastructure as code', 'cloudformation'],
  'AWS/GCP': ['aws', 'amazon web services', 'gcp', 'google cloud', 'azure', 's3', 'ec2', 'lambda'],
  'Linux Shell': ['linux', 'bash', 'shell scripting', 'unix'],
  'Prometheus/Grafana': ['prometheus', 'grafana', 'datadog', 'cloudwatch', 'monitoring'],
  'Security': ['security', 'owasp', 'penetration testing', 'encryption', 'tls', 'ssl'],
  'Network Security': ['network security', 'firewall', 'tcp/ip', 'dns', 'vpc', 'vpn'],
  'Penetration Testing': ['penetration testing', 'pentesting', 'burp suite', 'metasploit', 'vulnerability assessment'],
  'OWASP Top 10': ['owasp', 'xss', 'sql injection', 'csrf', 'appsec'],
  'Wireshark': ['wireshark', 'packet analysis', 'nmap', 'tcpdump'],
  'Cryptography': ['cryptography', 'rsa', 'aes', 'pki', 'hashing'],
  'SIEM & SOC': ['siem', 'soc', 'splunk', 'incident response', 'threat hunting'],
  'Python/Bash': ['python', 'bash', 'scripting'],
  'A/B Testing': ['a/b testing', 'ab testing', 'hypothesis testing', 'experimentation'],
  'Tableau/PowerBI': ['tableau', 'powerbi', 'power bi', 'looker', 'data visualization'],
  'Bayesian Statistics': ['statistics', 'probability', 'bayesian', 'linear regression', 'logistic regression'],
  'Product Strategy': ['product strategy', 'prd', 'product roadmap', 'kpis', 'feature prioritization'],
  'AI Product Roadmapping': ['ai product', 'user stories', 'okrs', 'backlog'],
  'User Research & Prototyping': ['user research', 'prototyping', 'wireframing', 'user journey', 'customer interviews'],
  'SQL & Product Analytics': ['product analytics', 'mixpanel', 'amplitude', 'funnel analysis', 'retention'],
  'Agile Leadership': ['agile', 'scrum', 'jira', 'sprint planning', 'stakeholder management']
};

export class ResumeParser {
  /**
   * Extract plain text from an uploaded File object
   */
  static async extractTextFromFile(file) {
    if (!file) throw new Error('No file provided');

    const fileName = file.name.toLowerCase();

    // 1. Plain text formats (.txt, .md, .json, .csv)
    if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json') || fileName.endsWith('.csv') || (file.type && file.type.includes('text'))) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result || '');
        reader.onerror = () => reject(new Error('Failed to read text file.'));
        reader.readAsText(file);
      });
    }

    // 2. Binary formats (.pdf, .docx, etc.) - Extract printable text streams
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target.result;
          const bytes = new Uint8Array(buffer);
          let extracted = '';
          
          for (let i = 0; i < bytes.length; i++) {
            const charCode = bytes[i];
            if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13 || charCode === 9) {
              extracted += String.fromCharCode(charCode);
            } else if (extracted.length > 0 && extracted[extracted.length - 1] !== ' ') {
              extracted += ' ';
            }
          }

          const cleanedText = extracted.replace(/\s+/g, ' ').trim();
          if (cleanedText.length > 30) {
            resolve(cleanedText);
          } else {
            resolve(`Document: ${file.name}`);
          }
        } catch {
          resolve(`Document: ${file.name}`);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read document file.'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Check if a specific skill/concept is present in the resume text
   */
  static checkSkillInText(skillName, textLower) {
    const synonyms = SKILL_SYNONYM_MAP[skillName] || [
      skillName.toLowerCase(),
      skillName.replace(/\(.*?\)/g, '').trim().toLowerCase()
    ];

    return synonyms.some(term => {
      if (!term || term.length < 2) return false;
      // Handle special characters in regex
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // For short keywords (like 'go', 'ts', 'py', 'r'), enforce word boundaries
      if (term.length <= 3) {
        const boundaryRegex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
        return boundaryRegex.test(textLower);
      }
      return textLower.includes(term);
    });
  }

  /**
   * Performs deep ATS matching for the target career AND multi-career recommendation across all roles
   */
  static analyzeText(resumeText, targetCareerId = 'ml-engineer') {
    const textLower = (resumeText || '').toLowerCase();
    const targetCareer = CAREERS_DATA[targetCareerId] || CAREERS_DATA['ml-engineer'];

    // 1. Identify all detected skills across whole taxonomy
    const allDetectedSkills = [];
    Object.keys(SKILL_SYNONYM_MAP).forEach(skill => {
      if (ResumeParser.checkSkillInText(skill, textLower)) {
        allDetectedSkills.push(skill);
      }
    });

    // 2. Evaluate Target Role ATS Match
    const targetRequiredSkills = targetCareer.requiredSkills || [];
    const targetFoundSkills = [];
    const targetMissingSkills = [];

    targetRequiredSkills.forEach(skill => {
      if (ResumeParser.checkSkillInText(skill, textLower) || allDetectedSkills.includes(skill)) {
        targetFoundSkills.push(skill);
      } else {
        targetMissingSkills.push(skill);
      }
    });

    // Compute ATS match score dynamically (real percentage of matched skills + bonus for breadth)
    const baseTargetCount = targetRequiredSkills.length || 1;
    const directMatchPercent = (targetFoundSkills.length / baseTargetCount) * 80;
    const extraSkillBonus = Math.min(20, allDetectedSkills.length * 2);
    const computedScore = Math.min(99, Math.max(25, Math.round(directMatchPercent + extraSkillBonus)));

    let status = 'Needs Focus • High-Impact Gaps';
    if (computedScore >= 85) status = 'Excellent • Highly Aligned';
    else if (computedScore >= 70) status = 'Good • 2-3 Actionable Gaps';
    else if (computedScore >= 50) status = 'Moderate • Core Skills Missing';

    // 3. Multi-Career Suitability Ranking (Recommend which field suits the user best)
    const careerRecommendations = Object.values(CAREERS_DATA).map(c => {
      const reqs = c.requiredSkills || [];
      const matched = reqs.filter(s => ResumeParser.checkSkillInText(s, textLower) || allDetectedSkills.includes(s));
      const missing = reqs.filter(s => !matched.includes(s));
      
      const matchScore = Math.min(99, Math.max(20, Math.round((matched.length / (reqs.length || 1)) * 85 + Math.min(15, allDetectedSkills.length * 1.5))));

      return {
        id: c.id,
        title: c.title,
        icon: c.icon,
        category: c.category,
        salaryRange: c.salaryRange,
        matchScore: matchScore,
        matchedCount: matched.length,
        totalRequired: reqs.length,
        matchedSkills: matched,
        missingSkills: missing,
        isCurrentTarget: c.id === targetCareerId
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Identify top recommended field
    const bestFitCareer = careerRecommendations[0];

    // Dynamic bullet rewrites based on the detected competencies
    const primarySkill = allDetectedSkills[0] || 'Python';
    const secondarySkill = allDetectedSkills[1] || 'REST APIs';

    const bulletRewrites = [
      {
        section: `Core Experience • ${targetCareer.title}`,
        original: `Used ${primarySkill} and ${secondarySkill} to build software modules for project tasks.`,
        improved: `Architected scalable backend pipelines with ${primarySkill} and ${secondarySkill}, reducing model inference latency by 38% while sustaining 99.9% uptime across production clusters.`,
        impact: '+26% ATS Optimization • STAR Method & Measurable Benchmark'
      },
      {
        section: `Project Showcase • Production Implementation`,
        original: 'Implemented dataset processing and created analytical evaluation scripts.',
        improved: `Engineered end-to-end automated processing pipeline with ${primarySkill}, accelerating data ingestion throughput from 120 req/sec to 850 req/sec.`,
        impact: '+21% ATS Optimization • Action Verbs & Quantified Metrics'
      }
    ];

    return {
      score: computedScore,
      status: status,
      foundKeywords: Array.from(new Set([...targetFoundSkills, ...allDetectedSkills])).slice(0, 16),
      missingKeywords: targetMissingSkills,
      allDetectedSkills: allDetectedSkills,
      careerRecommendations: careerRecommendations,
      bestFitCareer: bestFitCareer,
      bulletRewrites: bulletRewrites
    };
  }
}
