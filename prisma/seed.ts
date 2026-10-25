import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { computeReadinessIndex } from '../lib/scoring/readinessIndex';
import { computeCareerMatches } from '../lib/scoring/careerMatcher';
import { generatePersonalizedRoadmap } from '../lib/roadmap/roadmapGenerator';
import { computeLearningProfile } from '../lib/scoring/learningProfile';
import { seedDemoUsers } from './seedDemoUsers';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CareerX Database...');

  const managerEmail = (process.env.MANAGER_EMAIL || 'manager@example.com').toLowerCase().trim();
  const managerPassword = process.env.MANAGER_PASSWORD || 'CareerX@Manager2026';
  const managerPasswordHash = await bcrypt.hash(managerPassword, 10);
  const studentPasswordHash = await bcrypt.hash('CareerX@2026', 10);

  // Clean old test users
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['dhruvila@careerx.dev', 'student.demo@careerx.dev', managerEmail]
      }
    }
  });

  // 1. Seed Manager Account
  const managerUser = await prisma.user.create({
    data: {
      email: managerEmail,
      name: 'Platform Mentor Manager',
      passwordHash: managerPasswordHash,
      role: 'manager',
      isDemo: false,
      isOnline: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
      lastSeenAt: new Date(),
      loginLogs: {
        create: [
          {
            loginAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
            logoutAt: new Date(Date.now() - 1000 * 60 * 45),
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
          },
          {
            loginAt: new Date(Date.now() - 1000 * 60 * 10),
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
          }
        ]
      }
    }
  });
  console.log(`  ✓ Created Manager: ${managerUser.name} (${managerUser.email})`);

  // 2. Create fully verified test user (Dhruvila)
  const user1 = await prisma.user.create({
    data: {
      email: 'dhruvila@careerx.dev',
      name: 'Dhruvila',
      phone: '+91 9876543210',
      passwordHash: studentPasswordHash,
      role: 'user',
      isDemo: false,
      isOnline: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 25),
      lastSeenAt: new Date(),
      profile: {
        create: {
          college: 'Dharmsinh Desai University',
          course: 'B.Tech',
          branch: 'Computer Science & Engineering',
          currentYear: 3,
          gradYear: 2026,
          cgpa: 8.9,
          preferredField: 'AI & Machine Learning',
          careerGoal: 'Machine Learning Engineer',
          programmingLanguages: JSON.stringify(['Python', 'C++', 'JavaScript', 'SQL']),
          technicalSkills: JSON.stringify(['PyTorch', 'FastAPI', 'Pandas', 'NumPy', 'Docker', 'Git']),
          interests: JSON.stringify(['Generative AI', 'Deep Learning', 'Computer Vision']),
          linkedin: 'https://linkedin.com/in/dhruvila',
          github: 'https://github.com/dhruvilaankoliya',
          targetCareerId: 'ml-engineer',
          completenessStage: 6, // Unlocked
          completenessPercent: 100,
          streakDays: 8,
          availableToHelp: true,
          studyBuddyEnabled: true,
          profileVisibility: 'public',
          showEmail: false,
          showPhone: false,
          allowConnectionRequests: true,
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
      },
      loginLogs: {
        create: [
          {
            loginAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
            logoutAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
          },
          {
            loginAt: new Date(Date.now() - 1000 * 60 * 25),
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
          }
        ]
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

  // 3. Seed Demo Students
  await seedDemoUsers(prisma);

  // 4. Seed Skills & Resources
  console.log('🌱 Seeding Skills & Resources...');

  const skillsData = [
    {
      name: 'Kubernetes',
      whyItMatters: 'Industry standard for orchestrating distributed ML workloads, autoscaling GPU node pools, and zero-downtime canary model rollouts.',
      estimatedHours: '6.5 hrs',
      resources: [
        {
          id: 'res_k8s_3',
          title: 'Kubernetes for Beginners (Hands-on Labs)',
          type: 'course',
          provider: 'KodeKloud',
          durationHrs: 4.0,
          durationText: '4 hrs',
          badge: 'Most Popular',
          url: 'https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners-hands-on/',
        },
        {
          id: 'res_k8s_1',
          title: 'Kubernetes Core Concepts & Pod Architecture',
          type: 'doc',
          provider: 'Kubernetes Official',
          durationHrs: 1.5,
          durationText: '1.5 hrs',
          badge: null,
          url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
        },
        {
          id: 'res_k8s_2',
          title: 'Deploying Scalable ML Inference on K8s Cluster',
          type: 'article',
          provider: 'Towards Data Science',
          durationHrs: 1.0,
          durationText: '1 hr',
          badge: null,
          url: 'https://towardsdatascience.com/deploying-machine-learning-models-with-kubernetes-b28669c54e0b',
        },
      ]
    },
    {
      name: 'Docker',
      whyItMatters: 'Essential for containerizing ML inference microservices and guaranteeing reproducibility across dev, test, and GPU cloud environments.',
      estimatedHours: '4 hrs',
      resources: [
        {
          id: 'res_docker_2',
          title: 'Docker for Machine Learning & Python Crash Course',
          type: 'video',
          provider: 'freeCodeCamp',
          durationHrs: 2.5,
          durationText: '2.5 hrs',
          badge: 'Most Popular',
          url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
        },
        {
          id: 'res_docker_1',
          title: 'Official Docker Containerization Guide for ML Developers',
          type: 'doc',
          provider: 'Docker Docs',
          durationHrs: 0.75,
          durationText: '45 mins',
          badge: null,
          url: 'https://docs.docker.com/get-started/',
        },
        {
          id: 'res_docker_3',
          title: 'Production Multi-stage Docker Builds for PyTorch & CUDA',
          type: 'article',
          provider: 'Real Python',
          durationHrs: 1.0,
          durationText: '1 hr',
          badge: null,
          url: 'https://realpython.com/docker-continuous-integration/',
        },
      ]
    },
    {
      name: 'FastAPI',
      whyItMatters: 'The premier async Python framework for serving high-throughput LLMs and computer vision models with sub-10ms latency.',
      estimatedHours: '3 hrs',
      resources: [
        {
          id: 'res_fastapi_1',
          title: 'FastAPI Official Interactive Tutorial & Async Endpoints',
          type: 'doc',
          provider: 'FastAPI Docs',
          durationHrs: 1.0,
          durationText: '1 hr',
          badge: 'Most Popular',
          url: 'https://fastapi.tiangolo.com/tutorial/',
        },
        {
          id: 'res_fastapi_2',
          title: 'Serving PyTorch & HuggingFace Models with FastAPI',
          type: 'video',
          provider: 'freeCodeCamp',
          durationHrs: 2.0,
          durationText: '2 hrs',
          badge: null,
          url: 'https://www.youtube.com/watch?v=h5wZ283l58s',
        },
        {
          id: 'res_fastapi_3',
          title: 'Building High-Performance Async REST APIs in Python',
          type: 'article',
          provider: 'TestDriven.io',
          durationHrs: 1.5,
          durationText: '1.5 hrs',
          badge: null,
          url: 'https://testdriven.io/blog/fastapi-crud/',
        },
      ]
    },
    {
      name: 'MLOps',
      whyItMatters: 'Bridges prototype notebooks and production; covers experiment tracking, model registries, feature stores, and automated retraining.',
      estimatedHours: '8 hrs',
      resources: [
        {
          id: 'res_mlops_1',
          title: 'Made With ML: Production MLOps from Scratch',
          type: 'course',
          provider: 'MadeWithML (Goku Mohandas)',
          durationHrs: 6.0,
          durationText: '6 hrs',
          badge: 'Most Popular',
          url: 'https://madewithml.com/',
        },
        {
          id: 'res_mlops_2',
          title: 'MLflow Tracking, Registry & Model Packaging Tutorial',
          type: 'doc',
          provider: 'MLflow Official',
          durationHrs: 1.5,
          durationText: '1.5 hrs',
          badge: null,
          url: 'https://mlflow.org/docs/latest/tutorials-and-examples/index.html',
        },
        {
          id: 'res_mlops_3',
          title: 'Designing Enterprise Machine Learning Systems',
          type: 'article',
          provider: 'Chip Huyen (Stanford)',
          durationHrs: 2.0,
          durationText: '2 hrs',
          badge: null,
          url: 'https://chiphuyen.com/book-ml-systems-design/',
        },
      ]
    },
    {
      name: 'Vector DB',
      whyItMatters: 'Core architecture for Generative AI & RAG, enabling semantic search, dense embedding retrieval, and scalable knowledge indexing.',
      estimatedHours: '3 hrs',
      resources: [
        {
          id: 'res_vdb_2',
          title: 'Building Production RAG with LangChain & Vector Databases',
          type: 'course',
          provider: 'DeepLearning.AI',
          durationHrs: 2.0,
          durationText: '2 hrs',
          badge: 'Most Popular',
          url: 'https://www.deeplearning.ai/short-courses/building-evaluating-advanced-rag/',
        },
        {
          id: 'res_vdb_1',
          title: 'Pinecone Vector Search & Dense Embeddings Masterclass',
          type: 'doc',
          provider: 'Pinecone Docs',
          durationHrs: 1.0,
          durationText: '1 hr',
          badge: null,
          url: 'https://docs.pinecone.io/guides/get-started/overview',
        },
        {
          id: 'res_vdb_3',
          title: 'Vector Indexing (HNSW vs IVF) for High-Scale Retrieval',
          type: 'article',
          provider: 'Towards Data Science',
          durationHrs: 1.0,
          durationText: '1 hr',
          badge: null,
          url: 'https://towardsdatascience.com/vector-search-hnsw-vs-ivf',
        },
      ]
    }
  ];

  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {
        whyItMatters: s.whyItMatters,
        estimatedHours: s.estimatedHours,
      },
      create: {
        name: s.name,
        whyItMatters: s.whyItMatters,
        estimatedHours: s.estimatedHours,
      }
    });

    for (const r of s.resources) {
      await prisma.resource.upsert({
        where: { id: r.id },
        update: {
          title: r.title,
          type: r.type,
          provider: r.provider,
          durationHrs: r.durationHrs,
          durationText: r.durationText,
          badge: r.badge,
          url: r.url,
          skillId: skill.id,
        },
        create: {
          id: r.id,
          skillId: skill.id,
          title: r.title,
          type: r.type,
          provider: r.provider,
          durationHrs: r.durationHrs,
          durationText: r.durationText,
          badge: r.badge,
          url: r.url,
        }
      });
    }
  }

  // 5. Seed StudyProgress & Feedback for Demo Students & Dhruvila
  console.log('🌱 Seeding Study Progress, Ratings & Feedback...');

  const allStudents = await prisma.user.findMany({
    where: { role: 'user' },
  });

  const feedbackSamples = [
    {
      resId: 'res_k8s_3',
      rating: 5,
      comment: 'Super helpful hands-on labs! The pod lifecycle and multi-container debugging concepts clicked instantly.',
    },
    {
      resId: 'res_k8s_1',
      rating: 4,
      comment: 'Concise official overview. Good reference for services, ingress and config maps.',
    },
    {
      resId: 'res_k8s_2',
      rating: 5,
      comment: 'Practical deployment pattern for ML inference. Solved our GPU resource scheduling questions.',
    },
    {
      resId: 'res_docker_2',
      rating: 5,
      comment: 'Best crash course for containerizing PyTorch pipelines and managing CUDA layers without bloat.',
    },
    {
      resId: 'res_fastapi_1',
      rating: 5,
      comment: 'Interactive Swagger docs and Pydantic validation are game-changing for serving ML models.',
    },
    {
      resId: 'res_mlops_1',
      rating: 5,
      comment: 'Goku Mohandas covers production architectures thoroughly. Loved the CI/CD integration.',
    },
    {
      resId: 'res_vdb_2',
      rating: 4,
      comment: 'Solid breakdown of RAG evaluation metrics (faithfulness, answer relevance). Highly recommend!',
    },
  ];

  // Assign realistic progress to students
  for (let i = 0; i < allStudents.length; i++) {
    const student = allStudents[i];
    // Update presence for demo students
    const isOnlineNow = i % 2 === 0;
    const minutesAgo = (i + 1) * 7;
    await prisma.user.update({
      where: { id: student.id },
      data: {
        isOnline: isOnlineNow,
        lastLoginAt: new Date(Date.now() - 1000 * 60 * (minutesAgo + 20)),
        lastSeenAt: isOnlineNow ? new Date() : new Date(Date.now() - 1000 * 60 * minutesAgo),
      }
    });

    // Create login logs
    await prisma.loginLog.create({
      data: {
        userId: student.id,
        loginAt: new Date(Date.now() - 1000 * 60 * (minutesAgo + 20)),
        logoutAt: isOnlineNow ? null : new Date(Date.now() - 1000 * 60 * minutesAgo),
        ipAddress: `192.168.1.${10 + i}`,
        userAgent: 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36',
      }
    });

    // Mark 2-4 resources studied
    const resourcesToStudy = ['res_k8s_3', 'res_k8s_1', 'res_docker_2', 'res_fastapi_1', 'res_mlops_1'].slice(0, 2 + (i % 3));
    for (const rId of resourcesToStudy) {
      await prisma.studyProgress.upsert({
        where: {
          userId_resourceId: {
            userId: student.id,
            resourceId: rId,
          }
        },
        update: {},
        create: {
          userId: student.id,
          resourceId: rId,
          studiedAt: new Date(Date.now() - 1000 * 60 * 60 * (i * 4 + 2)),
        }
      });

      // Add feedback for some
      const sample = feedbackSamples.find(f => f.resId === rId);
      if (sample && (i % 2 === 0 || i === 0)) {
        await prisma.feedback.upsert({
          where: {
            userId_resourceId: {
              userId: student.id,
              resourceId: rId,
            }
          },
          update: {
            rating: sample.rating,
            comment: sample.comment,
          },
          create: {
            userId: student.id,
            resourceId: rId,
            rating: sample.rating,
            comment: sample.comment,
          }
        });
      }
    }
  }

  console.log('✅ Full Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
