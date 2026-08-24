import { MentorChatRequest } from './types';

export async function generateMentorResponse(request: MentorChatRequest): Promise<string> {
  const { userMessage, studentContext } = request;
  const msgLower = userMessage.toLowerCase();

  const { name, targetCareer, overallScore, readinessTier, knownSkills, criticalGaps, activeRoadmapPhase } = studentContext;

  // Grounded context prompt logic
  if (msgLower.includes('capstone') || msgLower.includes('project')) {
    const gapStr = criticalGaps.length > 0 ? criticalGaps.slice(0, 2).join(' and ') : 'Production Deployment';
    return `### 🛠️ High-Yield Capstone Recommendation for ${name}

Based on your target of **${targetCareer}** (Current Readiness: **${overallScore}/100** • ${readinessTier}) and your primary skill gap in **${gapStr}**:

1. **Project Concept**: Build an end-to-end **High-Throughput ${targetCareer} System**.
2. **Key Tech Stack**: Integrate your existing strength in \`${knownSkills.slice(0, 2).join(', ') || 'Python'}\` with your gap tools: \`${criticalGaps.slice(0, 2).join(', ') || 'Docker & FastAPI'}\`.
3. **Architecture**:
   - Asynchronous backend service with automated input validation.
   - Containerized with multi-stage Dockerfile and deployed on a cloud cluster.
   - Observability dashboard tracking latency and error rates.
4. **Estimated ROI**: Completing and documenting this project on GitHub will directly raise your **Projects** subscore and bridge key ATS keywords, boosting overall readiness by **+4.5 to +6.0 points**!`;
  }

  if (msgLower.includes('resume') || msgLower.includes('ats') || msgLower.includes('keyword')) {
    return `### 📄 Contextual Resume Optimization for ${name}

Targeting **${targetCareer}** in Tier-1 hiring pipelines requires high keyword alignment:

- **Current Identified Strengths**: \`${knownSkills.slice(0, 4).join(', ') || 'Core Programming, Algorithms'}\`
- **Missing High-Impact ATS Keywords**: \`${criticalGaps.slice(0, 4).join(', ') || 'Docker, CI/CD, Kubernetes, Microservices'}\`

**Actionable Bullet Upgrade**:
Instead of writing: *"Worked on programming project using ${knownSkills[0] || 'Python'}"*
Upgrade to:
> *"Architected and deployed high-availability service using ${knownSkills[0] || 'Python'} and ${criticalGaps[0] || 'Docker'}, reducing processing latency by 34% across 10,000+ test records."*`;
  }

  if (msgLower.includes('interview') || msgLower.includes('question') || msgLower.includes('prep')) {
    return `### 🎙️ Technical Interview Focus Areas for ${targetCareer}

Here are the top 3 high-probability interview questions for candidates at your stage (${activeRoadmapPhase}):

1. **System & Architecture**: *"How would you architect a fault-tolerant service using \`${criticalGaps[0] || 'Docker'}\` under 1,500 requests per second?"*
2. **Deep Algorithmic Intuition**: *"Explain the time and memory complexity tradeoffs of your chosen data structure in \`${knownSkills[0] || 'Python'}\`."*
3. **STAR Behavioral Case**: *"Tell me about a time you identified a critical bug in a team project and how you verified the fix before deployment."*

Would you like to simulate an answer to any of these?`;
  }

  // General grounded response
  return `### 💡 Career Intelligence Insight for ${name}

Regarding *"**${userMessage}**"*:

- **Your Current Pathway**: You are currently in **${activeRoadmapPhase}** on your roadmap toward **${targetCareer}** (Readiness Score: **${overallScore}/100**).
- **Tactical Advice**: Prioritize closing your key gaps in \`${criticalGaps.slice(0, 3).join(', ') || 'System Design & Deployment'}\` while continuing to showcase your strengths in \`${knownSkills.slice(0, 3).join(', ')}\`.
- **Next High-Impact Milestone**: Complete the next assignment in your Roadmap tab to increase your learning consistency streak!`;
}
