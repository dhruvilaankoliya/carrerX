import { MentorChatRequest, MentorChatResult } from './types';

// Comprehensive pattern matcher for non-educational queries (movies, songs, sports, gossip, recipes, etc.)
const OFF_TOPIC_PATTERNS = [
  /\b(movie|movies|film|films|actor|actors|actress|actresses|bollywood|hollywood|cinema|theater|box office|trailer|director|cast|performer|perform|netflix|disney|prime video|web series|anime|manga|song|songs|music|singer|lyrics|album|toxic movie)\b/i,
  /\b(who won|cricket|ipl|football|fifa|messi|ronaldo|virat kohli|rohit|match score|tournament|tennis|basketball|nba|world cup|olympics)\b/i,
  /\b(recipe|recipes|how to cook|bake a cake|make pizza|chicken curry|burger|biryani|dish|restaurant|cooking)\b/i,
  /\b(celebrity gossip|dating advice|girlfriend|boyfriend|love advice|horoscope|zodiac sign|astrology|kundali)\b/i,
  /\b(politics|election|elections|minister|president|political party|prime minister)\b/i,
  /\b(video game|game cheat|gta cheats|game walkthrough|gaming tips|playstation|xbox|pubg|free fire|fortnite)\b/i,
  /\b(crypto trading signal|buy stock|betting tips|casino|lottery|gambling)\b/i,
];

// Check if a query is non-educational
function checkIsOffTopic(query: string): boolean {
  const q = query.trim().toLowerCase();
  // Allow greetings and conversational checks even if words coincide
  if (/^(hi+|hey+|hello+|namaste|hola|howdy|sup|good\s*(morning|afternoon|evening)|who are you|what can you do|help|thanks|thank you|bye)$/i.test(q)) {
    return false;
  }
  return OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(q));
}

function buildSystemPrompt(studentContext: MentorChatRequest['studentContext']): string {
  const {
    name,
    college,
    branch,
    currentYear,
    targetCareer,
    overallScore,
    readinessTier,
    knownSkills,
    criticalGaps,
    activeRoadmapPhase,
  } = studentContext;

  return `You are CareerX AI Mentor, a smart, friendly, and expert AI Academic & Career Advisor dedicated to guiding college and engineering students to career success.

STUDENT PROFILE CONTEXT:
- Name: ${name}
- Academic Institution: ${college || 'Engineering College'}
- Department / Branch: ${branch || 'Computer Science & Engineering'}
- Academic Year: Year ${currentYear}
- Target Career Path: ${targetCareer}
- Current Readiness Score: ${overallScore}/100 (${readinessTier})
- Verified Known Skills: ${knownSkills.length > 0 ? knownSkills.join(', ') : 'Foundational Programming'}
- Critical Missing Skill Gaps: ${criticalGaps.length > 0 ? criticalGaps.join(', ') : 'Production System Design & Deployment'}
- Active Learning Roadmap Stage: ${activeRoadmapPhase}

CONVERSATIONAL & EDUCATIONAL SCOPE RULES:
1. GREETINGS & CASUAL INTERACTION:
   - If the student says "hii", "hello", "hey", "how are you", etc., respond warmly, greet them by name, and offer 3-4 specific educational/career topics you can help them with right now.
   - If the student says "thank you" or "bye", respond politely and encouragingly.
2. EDUCATIONAL & TECHNICAL QUESTIONS:
   - Answer thoroughly and clearly for all educational topics: computer science concepts, programming (Python, C++, JS/TS, Java, etc.), data structures & algorithms, system design, databases, AI/ML, cloud/DevOps, academic coursework, capstone projects, ATS resume reviews, and technical interview questions.
   - Explain concepts with clear code examples, analogies, time/space complexity, and practical tips.
3. OFF-TOPIC / NON-EDUCATIONAL QUERIES:
   - If the user asks about entertainment, movies (e.g. "toxic movie", actor questions), celebrity gossip, sports scores, cooking recipes, video games walkthroughs, or politics, POLITELY DECLINE.
   - State that as their CareerX AI Academic Mentor, you specialize exclusively in educational and career guidance. Then offer to help with their studies or their journey toward becoming a **${targetCareer}**.

RESPONSE FORMATTING:
- Clean Markdown with bold key terms, structured bullet points, and syntax-highlighted code blocks where applicable.`;
}

// 1. Google Gemini API
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  history: MentorChatRequest['history'] = [],
  userMessage: string
): Promise<{ text: string; model: string } | null> {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        contents.push({
          role: h.sender === 'USER' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Gemini (${model}) status ${res.status}:`, errText);
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) {
        return { text: text.trim(), model: `Google ${model}` };
      }
    } catch (err) {
      console.warn(`Gemini (${model}) error:`, err);
    }
  }
  return null;
}

// 2. Groq API
async function callGroq(
  apiKey: string,
  systemPrompt: string,
  history: MentorChatRequest['history'] = [],
  userMessage: string
): Promise<{ text: string; model: string } | null> {
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

  for (const model of models) {
    try {
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
      ];

      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        messages.push({
          role: h.sender === 'USER' ? 'user' : 'assistant',
          content: h.text,
        });
      }
      messages.push({ role: 'user', content: userMessage });

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Groq (${model}) status ${res.status}:`, errText);
        continue;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text && text.trim().length > 0) {
        return { text: text.trim(), model: `Groq (${model})` };
      }
    } catch (err) {
      console.warn(`Groq (${model}) error:`, err);
    }
  }
  return null;
}

// 3. OpenRouter API
async function callOpenRouter(
  apiKey: string,
  systemPrompt: string,
  history: MentorChatRequest['history'] = [],
  userMessage: string
): Promise<{ text: string; model: string } | null> {
  const freeModels = [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1:free',
  ];

  for (const model of freeModels) {
    try {
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
      ];

      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        messages.push({
          role: h.sender === 'USER' ? 'user' : 'assistant',
          content: h.text,
        });
      }
      messages.push({ role: 'user', content: userMessage });

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://careerx.local',
          'X-Title': 'CareerX AI Mentor',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text && text.trim().length > 0) {
        return { text: text.trim(), model: `OpenRouter (${model})` };
      }
    } catch (err) {
      console.warn(`OpenRouter (${model}) error:`, err);
    }
  }
  return null;
}

// 4. OpenAI API (ChatGPT)
async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  history: MentorChatRequest['history'] = [],
  userMessage: string
): Promise<{ text: string; model: string } | null> {
  const models = ['gpt-4o-mini', 'gpt-3.5-turbo'];

  for (const model of models) {
    try {
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
      ];

      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        messages.push({
          role: h.sender === 'USER' ? 'user' : 'assistant',
          content: h.text,
        });
      }
      messages.push({ role: 'user', content: userMessage });

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text && text.trim().length > 0) {
        return { text: text.trim(), model: `OpenAI (${model})` };
      }
    } catch (err) {
      console.warn(`OpenAI (${model}) error:`, err);
    }
  }
  return null;
}

// 5. Intelligent NLP Conversational & Educational Knowledge Engine (Offline Fallback)
function generateDeterministicMentorResponse(request: MentorChatRequest): string {
  const { userMessage, studentContext } = request;
  const msgLower = userMessage.trim().toLowerCase();
  const { name, targetCareer, overallScore, readinessTier, knownSkills, criticalGaps, activeRoadmapPhase } = studentContext;

  // 1. GREETINGS (hii, hello, hey, good morning, etc.)
  if (/^(hi+|hey+|hello+|namaste|hola|howdy|sup|yo|hiya)$/i.test(msgLower) || msgLower.startsWith('hi ') || msgLower.startsWith('hello ') || msgLower.startsWith('hey ')) {
    return `👋 **Hello ${name}!** Welcome back to your AI Mentor workspace!

I am your **CareerX AI Academic & Career Advisor** for **${targetCareer}** (Current Readiness: **${overallScore}/100** • ${readinessTier}).

How can I help you accelerate your learning today?
- 🧠 **Explain a Concept**: e.g., *"Explain Dijkstra's algorithm with code"* or *"How does transformer attention work?"*
- 🛠️ **Capstone Project Idea**: e.g., *"What is the best capstone project to bridge my gap in ${criticalGaps[0] || 'Docker'}?"*
- 📄 **Resume Review**: e.g., *"Which ATS keywords should I add for ${targetCareer}?"*
- 🎙️ **Technical Interview Prep**: e.g., *"Give me top interview questions for ${targetCareer} with STAR answers"*

What topic would you like to explore?`;
  }

  // 2. COURTESIES & SMALL TALK
  if (/^(how are you|how r u|how are you doing|how do you do)/i.test(msgLower)) {
    return `I'm doing fantastic, **${name}**! Thank you for asking. 😊

I'm ready to help you master key concepts and bridge your skill gaps in \`${criticalGaps.slice(0, 2).join(', ') || 'System Design'}\` toward becoming a top-tier **${targetCareer}**.

What can we work on right now?`;
  }

  if (/^(who are you|what can you do|what is your role|help me|what is this)/i.test(msgLower)) {
    return `### 🎓 About Your CareerX AI Mentor

I am your dedicated **AI Academic & Career Advisor**, specifically tuned to your profile as a **${studentContext.branch || 'CSE'}** student targeting **${targetCareer}**.

Here is what I can do for you:
1. **Academic & CS Concepts**: Explain data structures, algorithms, system design, databases, and ML models with code examples.
2. **Project Architecture**: Provide end-to-end architectures for capstone projects that impress recruiters.
3. **Resume & ATS Optimization**: Help you craft high-impact, quantifiable bullet points that pass automated screenings.
4. **Mock Technical Interviews**: Practice coding and architectural questions with immediate evaluation.

What question or topic do you have in mind?`;
  }

  if (/^(thank you|thanks|thx|awesome|great|perfect|cool|good)/i.test(msgLower)) {
    return `You're very welcome, **${name}**! 🚀

Keep up the great momentum on your **${targetCareer}** roadmap. Don't hesitate to ask whenever you encounter a tricky bug, need a project idea, or want to prepare for technical interviews!`;
  }

  if (/^(bye|goodbye|see you|cya|take care|good night)/i.test(msgLower)) {
    return `Goodbye **${name}**! 👋 Best of luck with your studies and project building today. Stay consistent and keep coding! 🌟`;
  }

  // 3. OFF-TOPIC / NON-EDUCATIONAL DETECTOR (e.g., toxic movie, cricket, recipes, gossip)
  if (checkIsOffTopic(userMessage)) {
    return `### 🎓 Educational Scope Notice

Hello **${name}**! As your **CareerX AI Academic & Career Advisor**, I specialize exclusively in **educational, technical, coding, and career-related questions**.

I don't provide information about movies, entertainment, sports, or non-educational topics (such as *"**${userMessage}**"*).

Let's keep your focus on becoming a **${targetCareer}**! How can I assist with your coursework, coding projects, skill gaps, or interview preparation today?`;
  }

  // 4. CAPSTONE & PROJECT QUESTIONS
  if (msgLower.includes('capstone') || msgLower.includes('project') || msgLower.includes('build')) {
    const gapStr = criticalGaps.length > 0 ? criticalGaps.slice(0, 2).join(' and ') : 'Production Deployment';
    return `### 🛠️ High-Yield Capstone Recommendation for ${name}

Based on your target of **${targetCareer}** (Current Readiness: **${overallScore}/100** • ${readinessTier}) and your primary skill gap in **${gapStr}**:

1. **Project Concept**: Build an end-to-end **High-Throughput ${targetCareer} System**.
2. **Key Tech Stack**: Integrate your existing strength in \`${knownSkills.slice(0, 2).join(', ') || 'Python'}\` with your gap tools: \`${criticalGaps.slice(0, 2).join(', ') || 'Docker & FastAPI'}\`.
3. **Architecture**:
   - Asynchronous backend service with automated input validation and schema enforcement.
   - Containerized with multi-stage Dockerfile and deployed with automated health-check endpoints.
   - Observability dashboard tracking latency, throughput, and error rates.
4. **Estimated ROI**: Completing and documenting this project on GitHub with a comprehensive README and live demo will directly elevate your **Projects** score, raising overall readiness by **+4.5 to +6.0 points**!`;
  }

  // 5. RESUME & ATS QUESTIONS
  if (msgLower.includes('resume') || msgLower.includes('ats') || msgLower.includes('keyword')) {
    return `### 📄 Contextual Resume Optimization for ${name}

Targeting **${targetCareer}** in Tier-1 hiring pipelines requires high keyword alignment:

- **Current Identified Strengths**: \`${knownSkills.slice(0, 4).join(', ') || 'Core Programming, Algorithms'}\`
- **Missing High-Impact ATS Keywords**: \`${criticalGaps.slice(0, 4).join(', ') || 'Docker, CI/CD, Kubernetes, Microservices'}\`

**Actionable Bullet Upgrade**:
Instead of writing: *"Worked on programming project using ${knownSkills[0] || 'Python'}"*
Upgrade to:
> *"Architected and deployed a resilient microservice using ${knownSkills[0] || 'Python'} and ${criticalGaps[0] || 'Docker'}, reducing processing latency by 34% across 10,000+ benchmark requests."*`;
  }

  // 6. INTERVIEW PREPARATION
  if (msgLower.includes('interview') || msgLower.includes('question') || msgLower.includes('mock') || msgLower.includes('prep')) {
    return `### 🎙️ Technical Interview Focus Areas for ${targetCareer}

Here are the top 3 high-probability technical interview questions for candidates at your stage (${activeRoadmapPhase}):

1. **System & Architecture**: *"How would you architect a fault-tolerant service using \`${criticalGaps[0] || 'Docker'}\` under 1,500 requests per second?"*
2. **Deep Algorithmic Intuition**: *"Explain the time and memory complexity tradeoffs of your chosen data structure in \`${knownSkills[0] || 'Python'}\`."*
3. **STAR Behavioral Case**: *"Tell me about a time you identified a critical bug in a team project and how you verified the fix before deployment."*

Would you like to simulate an answer to any of these? Type your response and I'll evaluate it!`;
  }

  // 7. SPECIFIC COMPUTER SCIENCE & AI/ML TOPIC EXPLANATIONS
  if (msgLower.includes('dijkstra') || msgLower.includes('shortest path')) {
    return `### 🧠 Algorithm Breakdown: Dijkstra's Shortest Path

1. **Intuition**: Finds the shortest path from a single source node to all other nodes in a weighted graph with non-negative edge weights using a Greedy approach.
2. **Key Data Structure**: Min-Priority Queue (Min-Heap) to extract the minimum distance node in $\\mathcal{O}(\\log V)$ time.
3. **Complexity**:
   - **Time Complexity**: $\\mathcal{O}((V + E) \\log V)$ with adjacency list and binary heap.
   - **Space Complexity**: $\\mathcal{O}(V)$ for distance array and priority queue.
4. **Key Interview Edge-Case**: If edge weights can be negative, Dijkstra will fail; use Bellman-Ford or SPFA instead!`;
  }

  if (msgLower.includes('binary search')) {
    return `### 🧠 Concept Breakdown: Binary Search

1. **Core Concept**: Efficiently finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.
2. **Complexity**:
   - **Time Complexity**: $\\mathcal{O}(\\log n)$
   - **Space Complexity**: $\\mathcal{O}(1)$ iterative.
3. **Template**:
\`\`\`python
def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\``;
  }

  if (msgLower.includes('docker') || msgLower.includes('container')) {
    return `### 🐳 Engineering Concept: Docker & Containerization

1. **What is Docker**: An open-source platform that packages an application and its dependencies into a lightweight, portable container that runs consistently across any environment.
2. **Container vs Virtual Machine**: Containers share the host OS kernel and isolate user spaces, making them boot in milliseconds with minimal CPU/RAM overhead compared to full hypervisor VMs.
3. **Why it matters for ${targetCareer}**: Production AI and backend models must be containerized with predictable dependencies (CUDA drivers, PyTorch runtime, FastAPI) for cloud deployment on Kubernetes.`;
  }

  if (msgLower.includes('rag') || msgLower.includes('retrieval augmented')) {
    return `### 🤖 AI Architecture: Retrieval-Augmented Generation (RAG)

1. **The Problem**: LLMs have a fixed knowledge cutoff and can hallucinate on domain-specific facts.
2. **The RAG Solution**:
   - **Indexing**: Chunk documents, compute vector embeddings, and store them in a vector DB (Pinecone / Chroma / Milvus).
   - **Retrieval**: At query time, convert user query into an embedding and perform cosine similarity search.
   - **Augmentation**: Inject the top-$k$ retrieved chunks into the prompt context for the LLM.
3. **Evaluation Metrics**: Faithfulness, Answer Relevance, and Context Recall (using Ragas framework).`;
  }

  if (msgLower.includes('machine learning') || msgLower.includes('neural network') || msgLower.includes('deep learning')) {
    return `### 🧠 Core Foundations: Machine Learning & Deep Learning

1. **Supervised Learning**: Training on labeled data $(X, y)$ to optimize a loss function (e.g. MSE for Regression, Cross-Entropy for Classification).
2. **Backpropagation**: Applying the chain rule of calculus backwards from output to input to calculate gradients $\\frac{\\partial L}{\\partial W}$ and update weights via Gradient Descent:
   $$W \\leftarrow W - \\alpha \\nabla_W L$$
3. **Key Skill for ${targetCareer}**: Balancing model bias vs variance, preventing overfitting with dropout/weight decay, and deploying efficient inference endpoints.`;
  }

  // 8. GENERAL EDUCATIONAL FALLBACK
  return `### 💡 Academic & Career Guidance for ${name}

Regarding your question *"**${userMessage}**"*:

- **Pathway Alignment**: You are currently in **${activeRoadmapPhase}** aiming for **${targetCareer}** (Readiness Score: **${overallScore}/100**).
- **Core Recommendation**: Focus on solidifying conceptual understanding in \`${knownSkills.slice(0, 2).join(', ') || 'Core CS'}\` and bridging key gaps in \`${criticalGaps.slice(0, 2).join(', ') || 'Cloud & System Design'}\`.
- **Actionable Next Step**: Try asking a specific technical question (e.g., *"Explain SQL indexing"*, *"How to design a microservice"*, or *"Give me a capstone project"*)!`;
}

/**
 * Main AI Mentor Entry Point
 */
export async function generateMentorResponse(request: MentorChatRequest & { customApiKey?: string }): Promise<MentorChatResult> {
  const { userMessage, studentContext, history = [], customApiKey } = request;

  // 1. Fast guardrail check for blatant off-topic questions
  if (checkIsOffTopic(userMessage)) {
    return {
      response: `### 🎓 Educational Scope Notice\n\nHello **${studentContext.name}**! As your **CareerX AI Academic & Career Advisor**, I am specifically configured to assist exclusively with **educational, technical, coding, capstone project, and career roadmap questions**.\n\nI don't answer entertainment or movie queries (such as *"**${userMessage}**"*).\n\nLet's focus on your journey toward becoming a **${studentContext.targetCareer}**! How can I assist with your studies, projects, or interview preparation today?`,
      provider: 'heuristic',
      isEducational: false,
    };
  }

  const systemPrompt = buildSystemPrompt(studentContext);

  // 2. Check Custom API Key (Passed dynamically by user if configured in UI)
  if (customApiKey && customApiKey.trim().length > 0) {
    const key = customApiKey.trim();
    if (key.startsWith('AIzaSy')) {
      const geminiRes = await callGemini(key, systemPrompt, history, userMessage);
      if (geminiRes) {
        return { response: geminiRes.text, provider: 'gemini', model: geminiRes.model, isEducational: true };
      }
    } else if (key.startsWith('gsk_')) {
      const groqRes = await callGroq(key, systemPrompt, history, userMessage);
      if (groqRes) {
        return { response: groqRes.text, provider: 'groq', model: groqRes.model, isEducational: true };
      }
    } else if (key.startsWith('sk-')) {
      const openAiRes = await callOpenAI(key, systemPrompt, history, userMessage);
      if (openAiRes) {
        return { response: openAiRes.text, provider: 'openai', model: openAiRes.model, isEducational: true };
      }
    }
  }

  // 3. Try Google Gemini API (from .env)
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiApiKey) {
    const geminiResult = await callGemini(geminiApiKey, systemPrompt, history, userMessage);
    if (geminiResult) {
      return {
        response: geminiResult.text,
        provider: 'gemini',
        model: geminiResult.model,
        isEducational: true,
      };
    }
  }

  // 4. Try Groq API (from .env)
  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  if (groqApiKey) {
    const groqResult = await callGroq(groqApiKey, systemPrompt, history, userMessage);
    if (groqResult) {
      return {
        response: groqResult.text,
        provider: 'groq',
        model: groqResult.model,
        isEducational: true,
      };
    }
  }

  // 5. Try OpenRouter API (from .env)
  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (openRouterApiKey) {
    const openRouterResult = await callOpenRouter(openRouterApiKey, systemPrompt, history, userMessage);
    if (openRouterResult) {
      return {
        response: openRouterResult.text,
        provider: 'openrouter',
        model: openRouterResult.model,
        isEducational: true,
      };
    }
  }

  // 6. Try OpenAI API (from .env)
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiApiKey) {
    const openAiResult = await callOpenAI(openAiApiKey, systemPrompt, history, userMessage);
    if (openAiResult) {
      return {
        response: openAiResult.text,
        provider: 'openai',
        model: openAiResult.model,
        isEducational: true,
      };
    }
  }

  // 7. Intelligent NLP Knowledge & Conversational Engine (Zero Crash Fallback)
  const fallbackText = generateDeterministicMentorResponse(request);
  return {
    response: fallbackText,
    provider: 'heuristic',
    model: 'CareerX Knowledge Engine',
    isEducational: true,
  };
}
