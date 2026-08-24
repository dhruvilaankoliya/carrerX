import { ParsedResumeOutput, GeneratedResumeQuestion } from './types';

export function generateResumeBasedQuestions(parsed: ParsedResumeOutput): GeneratedResumeQuestion[] {
  const questions: GeneratedResumeQuestion[] = [];
  const skills = parsed.technicalSkills;
  const projects = parsed.projects;

  // 1. Skill Depth Question referencing actual extracted skill
  if (skills.includes('Python') || skills.includes('PyTorch')) {
    questions.push({
      questionText: 'You listed Python / PyTorch in your technical background. Which aspect of ML workflows do you find most intellectually stimulating?',
      category: 'Technical Depth',
      relatedItem: 'Python / PyTorch',
      options: [
        'Designing model architectures and training loss functions',
        'Data preprocessing, feature engineering & SQL pipelines',
        'Deploying low-latency microservices with FastAPI & Docker',
        'Fine-tuning Generative LLMs and RAG vector search pipelines',
      ],
    });
  } else if (skills.includes('JavaScript') || skills.includes('React') || skills.includes('TypeScript')) {
    questions.push({
      questionText: 'Your profile highlights modern Web Development with JavaScript/React. Where do you see yourself making the biggest technical contribution?',
      category: 'Technical Depth',
      relatedItem: 'React / Web Dev',
      options: [
        'Complex interactive client-side state management & animations',
        'Full-stack API orchestration and microservice backends',
        'High-scale database query optimization & Redis caching',
        'End-to-end cloud infrastructure and CI/CD pipelines',
      ],
    });
  } else if (skills.length > 0) {
    questions.push({
      questionText: `Your resume lists proficiency with ${skills[0]}. How comfortable are you architecting production solutions using ${skills[0]}?`,
      category: 'Technical Depth',
      relatedItem: skills[0],
      options: [
        'Expert: Built and shipped multiple end-to-end production systems',
        'Proficient: Comfortable with advanced patterns, APIs, and debugging',
        'Intermediate: Solved algorithmic problems and built academic projects',
        'Beginner: Familiar with syntax and basic introductory concepts',
      ],
    });
  }

  // 2. Project Architecture Question referencing user's actual project
  if (projects.length > 0) {
    const proj = projects[0];
    questions.push({
      questionText: `In your project "${proj.name}", what was the most challenging technical engineering hurdle you overcame?`,
      category: 'Project Architecture',
      relatedItem: proj.name,
      options: [
        'Handling asynchronous data flow and state synchronization',
        'Optimizing memory usage and execution latency',
        'Structuring clean modular code and reusable abstractions',
        'Configuring deployment containerization and environment variables',
      ],
    });
  }

  // 3. Systems & Cloud Deployment Question
  if (skills.includes('Docker') || skills.includes('Kubernetes') || skills.includes('AWS')) {
    questions.push({
      questionText: 'You have experience with Cloud & Containerization. How would you approach designing a zero-downtime deployment?',
      category: 'Cloud Systems',
      relatedItem: 'Cloud Infrastructure',
      options: [
        'Blue-Green deployment with automated traffic shifting via Load Balancers',
        'Canary rollouts on Kubernetes with metric-based progressive analysis',
        'Rolling updates with container health checks and automated rollback',
        'Serverless edge functions with instant global deployment',
      ],
    });
  } else {
    questions.push({
      questionText: 'When moving your code from local development to production, which deployment philosophy appeals to you most?',
      category: 'Cloud Systems',
      relatedItem: 'Infrastructure',
      options: [
        'Automated CI/CD pipelines with Docker containers on Kubernetes',
        'Managed cloud platforms like AWS ECS, Vercel, or GCP Cloud Run',
        'Serverless event-driven architecture (AWS Lambda / Cloudflare Workers)',
        'Traditional Linux VPS setup with Nginx reverse proxy',
      ],
    });
  }

  // 4. Career Workstyle Ambition Question
  questions.push({
    questionText: 'Which engineering environment allows you to do your highest-impact work?',
    category: 'Work Culture',
    relatedItem: 'Career Ambition',
    options: [
      'High-growth AI startup: Fast autonomy, wearing multiple hats, shipping weekly',
      'Tier-1 Global Tech (FAANG+): Massive scale, deep specialization, structured mentorship',
      'AI Research Lab: Testing unproven paradigms, algorithmic exploration, whitepapers',
      'Remote-first Global Product: Async communication, deep work focus, high ownership',
    ],
  });

  return questions;
}
