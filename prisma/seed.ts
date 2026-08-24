import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { computeReadinessIndex } from '../lib/scoring/readinessIndex';
import { computeCareerMatches } from '../lib/scoring/careerMatcher';
import { generatePersonalizedRoadmap } from '../lib/roadmap/roadmapGenerator';
import { computeLearningProfile } from '../lib/scoring/learningProfile';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CareerX Database...');

  // Clean old test users
  await prisma.user.deleteMany({
    where: { email: { in: ['dhruvila@careerx.dev', 'student.demo@careerx.dev'] } }
  });

  const passwordHash = await bcrypt.hash('CareerX@2026', 10);

  // 1. Create fully verified test user (Dhruvila)
  const user1 = await prisma.user.create({
    data: {
      email: 'dhruvila@careerx.dev',
      name: 'Dhruvila',
      phone: '+91 9876543210',
      passwordHash,
      profile: {
        create: {
          college: 'Dharmsinh Desai University',
          course: 'B.Tech',
          branch: 'Computer Science & Engineering',
          currentYear: 3,
          gradYear: 2026,
          cgpa: 8.9,
          preferredField: 'AI & Machine Learning',
          programmingLanguages: JSON.stringify(['Python', 'C++', 'JavaScript', 'SQL']),
          technicalSkills: JSON.stringify(['PyTorch', 'FastAPI', 'Pandas', 'NumPy', 'Docker', 'Git']),
          linkedin: 'https://linkedin.com/in/dhruvila',
          github: 'https://github.com/dhruvilaankoliya',
          targetCareerId: 'ml-engineer',
          completenessStage: 6, // Unlocked
          completenessPercent: 100,
          streakDays: 8,
        }
      },
      resumeData: {
        create: {
          fileName: 'Dhruvila_Resume_AI_ML.pdf',
          rawText: `Dhruvila - Computer Science & AI Student
Education: B.Tech Computer Science (2022-2026), CGPA: 8.9
Technical Skills: Python, PyTorch, FastAPI, Pandas, NumPy, Scikit-Learn, SQL, Docker, Git, Deep Learning, Linear Algebra
Projects:
• Multimodal RAG Research Assistant: Built a high-throughput semantic search pipeline with Llama-3 and Pinecone vector database. Containerized with Docker.
• ResNet Medical Vision Classifier: Trained deep convolutional neural network achieving 94.2% validation accuracy with PyTorch.
Certifications: DeepLearning.AI Deep Learning Specialization, Stanford Online CS229`,
          parsedJson: JSON.stringify({
            education: { institution: 'Dharmsinh Desai University', degree: 'B.Tech', fieldOfStudy: 'Computer Science & Engineering', gradYear: '2026', gpa: '8.9' },
            technicalSkills: ['Python', 'PyTorch', 'FastAPI', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL', 'Docker', 'Git', 'Deep Learning'],
            subjects: ['Data Structures & Algorithms', 'Linear Algebra', 'Operating Systems', 'Machine Learning'],
            projects: [
              { name: 'Multimodal RAG Research Assistant', technologies: ['Python', 'PyTorch', 'Pinecone', 'Docker'], domain: 'AI & Data', description: 'Semantic search pipeline with Llama-3 and vector search.', complexity: 'Advanced' },
              { name: 'ResNet Medical Vision Classifier', technologies: ['Python', 'PyTorch'], domain: 'AI & Data', description: 'Deep CNN achieving 94.2% validation accuracy.', complexity: 'Intermediate' }
            ],
            certifications: [
              { name: 'Deep Learning Specialization', platform: 'Coursera (DeepLearning.AI)', domain: 'AI & Data' }
            ],
            initialInterestEstimate: { 'AI & Data': 88, 'Software & Web': 45, 'Cloud & DevOps': 60, 'Cyber & Security': 20, 'Product & Management': 35 }
          }),
          initialInterests: JSON.stringify({ 'AI & Data': 88, 'Software & Web': 45, 'Cloud & DevOps': 60, 'Cyber & Security': 20, 'Product & Management': 35 })
        }
      }
    }
  });

  // Calculate scores for Dhruvila
  const studentData = {
    userId: user1.id,
    name: 'Dhruvila',
    college: 'Dharmsinh Desai University',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    currentYear: 3,
    gradYear: 2026,
    cgpa: 8.9,
    programmingLanguages: ['Python', 'C++', 'JavaScript', 'SQL'],
    technicalSkills: ['PyTorch', 'FastAPI', 'Pandas', 'NumPy', 'Docker', 'Git'],
    extractedSkills: ['Python', 'PyTorch', 'FastAPI', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL', 'Docker', 'Git'],
    extractedProjects: [
      { name: 'Multimodal RAG Research Assistant', technologies: ['Python', 'PyTorch', 'Docker'], domain: 'AI & Data' },
      { name: 'ResNet Medical Vision Classifier', technologies: ['Python', 'PyTorch'], domain: 'AI & Data' }
    ],
    extractedCertifications: [{ name: 'Deep Learning Specialization', platform: 'Coursera' }],
    resumeInitialInterests: { 'AI & Data': 88, 'Software & Web': 45, 'Cloud & DevOps': 60 },
    assessmentScores: {
      techInterest: { 'AI & Data': 92, 'Software & Web': 65, 'Cloud & DevOps': 70 },
      aptitude: 88,
      problemSolving: 85,
      mindGames: 82,
    },
    streakDays: 8,
  };

  const readiness = computeReadinessIndex(studentData, 'ml-engineer');
  const matches = computeCareerMatches(studentData);
  const learningProfile = computeLearningProfile(studentData);
  const roadmapPhases = generatePersonalizedRoadmap(studentData, 'ml-engineer');

  await prisma.readinessScore.create({
    data: {
      userId: user1.id,
      targetCareerId: 'ml-engineer',
      overallScore: readiness.overallScore,
      techScore: readiness.subscores.techSkills,
      projectsScore: readiness.subscores.projects,
      resumeScore: readiness.subscores.resume,
      problemSolvingScore: readiness.subscores.problemSolving,
      interestScore: readiness.subscores.interestAlignment,
      consistencyScore: readiness.subscores.learningConsistency,
    }
  });

  await prisma.learningProfile.create({
    data: {
      userId: user1.id,
      analyticalPreference: learningProfile.analyticalPreference,
      problemSolvingStyle: learningProfile.problemSolvingStyle,
      technicalInclination: learningProfile.technicalInclination,
      decisionMakingPattern: learningProfile.decisionMakingPattern,
      summary: learningProfile.summary,
    }
  });

  for (const match of matches) {
    await prisma.careerMatch.create({
      data: {
        userId: user1.id,
        careerId: match.careerId,
        matchScore: match.matchScore,
        whyRecommended: match.whyRecommended,
        whatsMissing: JSON.stringify(match.whatsMissing),
      }
    });
  }

  const roadmapRecord = await prisma.roadmap.create({
    data: {
      userId: user1.id,
      targetCareerId: 'ml-engineer',
      totalStages: roadmapPhases.length,
      completedStages: roadmapPhases.filter(p => p.status === 'COMPLETED').length,
      progressPercent: 42,
    }
  });

  for (const phase of roadmapPhases) {
    await prisma.roadmapPhase.create({
      data: {
        roadmapId: roadmapRecord.id,
        phaseNumber: phase.phaseNumber,
        title: phase.title,
        subtitle: phase.subtitle,
        duration: phase.duration,
        status: phase.status,
        progress: phase.progress,
        topics: JSON.stringify(phase.topics),
        deliverables: JSON.stringify(phase.deliverables),
      }
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
