import { ParsedResumeOutput } from './types';
import { extractResumeData } from './resumeExtractor';

export async function parseResumeWithAI(
  buffer: Buffer,
  rawText: string,
  fileName: string,
  userApiKey?: string
): Promise<{ parsed: ParsedResumeOutput; provider: string }> {
  const geminiKey = userApiKey || process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  // 1. If Gemini API Key is available, use multimodal Gemini Flash (can read raw PDF directly!)
  if (geminiKey) {
    try {
      const isPdf = fileName.toLowerCase().endsWith('.pdf');
      const base64Content = buffer.toString('base64');

      const parts: any[] = [];
      if (isPdf && buffer.length > 0) {
        parts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Content,
          },
        });
      } else if (rawText && rawText.length > 10) {
        parts.push({ text: `Resume Content:\n${rawText}` });
      }

      parts.push({
        text: `You are an expert technical ATS and career intelligence parser. Extract structured intelligence from this candidate resume.
Return ONLY a valid JSON object matching this schema:
{
  "personalInfo": {
    "name": "Candidate Full Name",
    "email": "email@example.com",
    "phone": "+91 9876543210",
    "linkedin": "https://linkedin.com/in/...",
    "github": "https://github.com/..."
  },
  "education": {
    "institution": "University / College Name",
    "degree": "B.Tech / B.E. / M.Tech / BS / BCA",
    "fieldOfStudy": "Computer Science & Engineering / Data Science",
    "gradYear": "2026",
    "gpa": "8.9"
  },
  "technicalSkills": ["Python", "PyTorch", "React", "Docker", "SQL"],
  "categorizedSkills": {
    "AI & Data": ["Python", "PyTorch", "SQL"],
    "Software & Web": ["React", "JavaScript"],
    "Cloud & DevOps": ["Docker", "AWS"],
    "Cyber & Security": [],
    "Product & Management": []
  },
  "subjects": ["Data Structures & Algorithms", "Operating Systems", "DBMS", "Computer Networks"],
  "projects": [
    {
      "name": "Project Name",
      "technologies": ["Python", "FastAPI"],
      "domain": "AI & Data",
      "description": "2-3 sentence technical description of what was built and achieved.",
      "complexity": "Intermediate"
    }
  ],
  "certifications": [
    {
      "name": "Certificate Name",
      "platform": "Coursera / AWS / Google"
    }
  ],
  "initialInterestEstimate": {
    "AI & Data": 75,
    "Software & Web": 60,
    "Cloud & DevOps": 45,
    "Cyber & Security": 20,
    "Product & Management": 30
  }
}
Do not include markdown ticks (\`\`\`json). Return purely the JSON object.`
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const rawJsonText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          const parsedObj = JSON.parse(rawJsonText);
          if (parsedObj.technicalSkills && parsedObj.education) {
            console.log('[AI Resume Parser] Gemini Flash succeeded!');
            return { parsed: parsedObj, provider: 'Google Gemini 1.5 Flash (Multimodal)' };
          }
        }
      } else {
        console.warn('[AI Resume Parser] Gemini API returned status:', response.status);
      }
    } catch (err) {
      console.warn('[AI Resume Parser] Gemini API call failed:', err);
    }
  }

  // 2. If Groq API Key is available and rawText exists
  if (groqKey && rawText && rawText.length > 20) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You are an expert resume parsing engine. Parse the candidate resume and output strict JSON matching the schema with personalInfo, education, technicalSkills, categorizedSkills, subjects, projects, certifications, and initialInterestEstimate.',
            },
            {
              role: 'user',
              content: `Resume text:\n${rawText}`,
            },
          ],
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsedObj = JSON.parse(content);
          if (parsedObj.technicalSkills) {
            return { parsed: parsedObj, provider: 'Groq (Llama 3.3 70B)' };
          }
        }
      }
    } catch (err) {
      console.warn('[AI Resume Parser] Groq API call failed:', err);
    }
  }

  // 3. Built-in Local Heuristic & Pattern Engine (100% Free, Offline, Zero-Config)
  const localParsed = await extractResumeData(rawText || buffer.toString('utf-8'));
  return { parsed: localParsed, provider: 'CareerX Built-in Heuristic Engine' };
}
