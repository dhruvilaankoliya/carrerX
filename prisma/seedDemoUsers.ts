import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedDemoUsers(prisma: PrismaClient) {
  console.log('🌱 Seeding Demo Students & Study Partners...');

  const passwordHash = await bcrypt.hash('CareerXDemo@2026', 10);

  // Demo users dataset
  const demoUsers = [
    {
      email: 'aarav.sharma@demo.careerx.dev',
      name: 'Aarav Sharma',
      phone: '+91 98112 34567',
      isDemo: true,
      profile: {
        college: 'IIT Bombay',
        course: 'B.Tech',
        branch: 'Computer Science & Engineering',
        currentYear: 4,
        gradYear: 2025,
        cgpa: 9.4,
        preferredField: 'AI & Machine Learning',
        careerGoal: 'Machine Learning Engineer',
        profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
        programmingLanguages: JSON.stringify(['Python', 'C++', 'Go', 'SQL']),
        technicalSkills: JSON.stringify(['Docker', 'Kubernetes', 'FastAPI', 'PyTorch', 'MLOps', 'Vector DB', 'CI/CD', 'TensorRT', 'Linux']),
        interests: JSON.stringify(['Distributed Systems', 'Generative AI', 'Model Quantization', 'High-Performance Computing']),
        availableToHelp: true,
        studyBuddyEnabled: true,
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowConnectionRequests: true,
        projects: JSON.stringify([
          {
            name: 'Distributed RAG Inference Cluster',
            technologies: ['Docker', 'Kubernetes', 'FastAPI', 'PyTorch', 'Vector DB'],
            domain: 'AI Infrastructure',
            description: 'Architected an autoscaling Kubernetes cluster for multi-GPU LLM inference with sub-15ms TTFT and Pinecone indexing.',
            complexity: 'Advanced',
            url: 'https://github.com/aarav-sharma/rag-k8s-cluster'
          },
          {
            name: 'MLOps Pipeline with DVC & MLflow',
            technologies: ['Docker', 'MLOps', 'CI/CD', 'Python'],
            domain: 'Machine Learning Engineering',
            description: 'Automated data drift detection and model retraining with GitHub Actions and Docker containers.',
            complexity: 'Advanced',
            url: 'https://github.com/aarav-sharma/mlops-dvc-pipeline'
          }
        ]),
        courses: JSON.stringify([
          { name: 'Docker & Kubernetes: The Practical Guide', provider: 'Udemy (Academind)', skills: ['Docker', 'Kubernetes', 'CI/CD'], completedAt: '2024-08-15' },
          { name: 'Full Stack MLOps & Production Machine Learning', provider: 'DeepLearning.AI', skills: ['MLOps', 'FastAPI', 'Docker', 'Model Monitoring'], completedAt: '2024-11-20' },
          { name: 'Deep Learning Specialization', provider: 'Coursera', skills: ['PyTorch', 'Deep Learning'], completedAt: '2024-03-10' }
        ]),
        certifications: JSON.stringify([
          { name: 'Certified Kubernetes Administrator (CKA)', platform: 'Linux Foundation', domain: 'Cloud & DevOps' },
          { name: 'DeepLearning.AI MLOps Specialization', platform: 'Coursera', domain: 'AI & Data' }
        ])
      }
    },
    {
      email: 'priya.patel@demo.careerx.dev',
      name: 'Priya Patel',
      phone: '+91 98223 45678',
      isDemo: true,
      profile: {
        college: 'Dharmsinh Desai University',
        course: 'B.Tech',
        branch: 'Information Technology',
        currentYear: 3,
        gradYear: 2026,
        cgpa: 8.8,
        preferredField: 'Data Science & MLOps',
        careerGoal: 'Machine Learning Engineer',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        programmingLanguages: JSON.stringify(['Python', 'SQL', 'R', 'JavaScript']),
        technicalSkills: JSON.stringify(['FastAPI', 'Docker', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-Learn', 'Model Monitoring', 'SQL']),
        interests: JSON.stringify(['Data Pipelines', 'Feature Stores', 'Predictive Modeling', 'Vector DB']),
        availableToHelp: true,
        studyBuddyEnabled: true,
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowConnectionRequests: true,
        projects: JSON.stringify([
          {
            name: 'FastAPI Realtime Recommendation Engine',
            technologies: ['FastAPI', 'Docker', 'Redis', 'Python'],
            domain: 'AI & Web Services',
            description: 'Asynchronous recommendation microservice handling 15,000 QPS with Redis caching and Docker containerization.',
            complexity: 'Advanced',
            url: 'https://github.com/priya-patel/fastapi-recs'
          },
          {
            name: 'Customer Churn Prediction & Model Drift Monitor',
            technologies: ['Python', 'Scikit-Learn', 'Model Monitoring', 'FastAPI'],
            domain: 'Data Science',
            description: 'End-to-end classification pipeline with Evidently AI drift detection alerts via Webhooks.',
            complexity: 'Intermediate',
            url: 'https://github.com/priya-patel/churn-monitor'
          }
        ]),
        courses: JSON.stringify([
          { name: 'FastAPI: Modern Python Web APIs', provider: 'Udemy', skills: ['FastAPI', 'Python', 'Docker'], completedAt: '2024-09-01' },
          { name: 'Applied Data Science with Python', provider: 'University of Michigan (Coursera)', skills: ['Pandas', 'NumPy', 'Scikit-Learn'], completedAt: '2024-05-18' }
        ]),
        certifications: JSON.stringify([
          { name: 'IBM Data Science Professional Certificate', platform: 'Coursera', domain: 'Data Science' }
        ])
      }
    },
    {
      email: 'rohit.verma@demo.careerx.dev',
      name: 'Rohit Verma',
      phone: '+91 98334 56789',
      isDemo: true,
      profile: {
        college: 'Dharmsinh Desai University',
        course: 'B.Tech',
        branch: 'Computer Science & Engineering',
        currentYear: 3,
        gradYear: 2026,
        cgpa: 8.6,
        preferredField: 'Software Engineering',
        careerGoal: 'Full Stack Architect',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        programmingLanguages: JSON.stringify(['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL']),
        technicalSkills: JSON.stringify(['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'Redis', 'CI/CD', 'FastAPI', 'System Design']),
        interests: JSON.stringify(['Full Stack Architecture', 'Microservices', 'Database Optimization', 'Cloud Platforms']),
        availableToHelp: true,
        studyBuddyEnabled: true,
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowConnectionRequests: true,
        projects: JSON.stringify([
          {
            name: 'Realtime Collaborative Workspace',
            technologies: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
            domain: 'Full Stack Development',
            description: 'Full-stack platform with WebSocket collaboration, PostgreSQL multi-tenancy, and Redis Pub/Sub.',
            complexity: 'Advanced',
            url: 'https://github.com/rohit-verma/collab-workspace'
          }
        ]),
        courses: JSON.stringify([
          { name: 'Mastering Next.js 14 and React Server Components', provider: 'Frontend Masters', skills: ['Next.js', 'React', 'TypeScript'], completedAt: '2024-07-22' },
          { name: 'Docker for Full Stack Developers', provider: 'Pluralsight', skills: ['Docker', 'CI/CD', 'PostgreSQL'], completedAt: '2024-04-10' }
        ]),
        certifications: JSON.stringify([
          { name: 'Meta Front-End Developer Professional Certificate', platform: 'Coursera', domain: 'Software & Web' }
        ])
      }
    },
    {
      email: 'vikram.mehta@demo.careerx.dev',
      name: 'Vikram Mehta',
      phone: '+91 98445 67890',
      isDemo: true,
      profile: {
        college: 'BITS Pilani',
        course: 'B.Tech',
        branch: 'Computer Science',
        currentYear: 4,
        gradYear: 2025,
        cgpa: 9.1,
        preferredField: 'Cloud & DevOps',
        careerGoal: 'Cloud DevOps Engineer',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        programmingLanguages: JSON.stringify(['Go', 'Python', 'Bash', 'Terraform']),
        technicalSkills: JSON.stringify(['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD', 'Prometheus', 'Grafana', 'Linux', 'System Design']),
        interests: JSON.stringify(['Infrastructure as Code', 'Site Reliability Engineering', 'Multi-Cloud Clusters', 'GitOps']),
        availableToHelp: true,
        studyBuddyEnabled: true,
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowConnectionRequests: true,
        projects: JSON.stringify([
          {
            name: 'GitOps Multi-Region Kubernetes Setup',
            technologies: ['Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'AWS'],
            domain: 'DevOps & SRE',
            description: 'ArgoCD GitOps pipeline managing automated blue-green deployments across AWS EKS clusters.',
            complexity: 'Advanced',
            url: 'https://github.com/vikram-mehta/gitops-k8s'
          },
          {
            name: 'Automated Prometheus & Grafana Observability Mesh',
            technologies: ['Prometheus', 'Grafana', 'Kubernetes', 'Docker'],
            domain: 'Observability',
            description: 'Cluster metrics collector with custom alerting rules for node memory leaks and pod crashloops.',
            complexity: 'Intermediate',
            url: 'https://github.com/vikram-mehta/k8s-observability'
          }
        ]),
        courses: JSON.stringify([
          { name: 'Kubernetes Certified Administrator Masterclass', provider: 'Udemy', skills: ['Kubernetes', 'Docker', 'Linux'], completedAt: '2024-06-10' },
          { name: 'Terraform on AWS with S3 Backend', provider: 'HashiCorp Learn', skills: ['Terraform', 'AWS', 'CI/CD'], completedAt: '2024-08-12' }
        ]),
        certifications: JSON.stringify([
          { name: 'AWS Certified Solutions Architect – Associate', platform: 'Amazon Web Services', domain: 'Cloud & DevOps' },
          { name: 'HashiCorp Certified: Terraform Associate', platform: 'HashiCorp', domain: 'Cloud & DevOps' }
        ])
      }
    },
    {
      email: 'neha.kulkarni@demo.careerx.dev',
      name: 'Neha Kulkarni',
      phone: '+91 98556 78901',
      isDemo: true,
      profile: {
        college: 'IIIT Hyderabad',
        course: 'B.Tech',
        branch: 'Computer Science',
        currentYear: 4,
        gradYear: 2025,
        cgpa: 9.3,
        preferredField: 'AI Systems',
        careerGoal: 'Machine Learning Engineer',
        profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
        programmingLanguages: JSON.stringify(['Python', 'C++', 'CUDA', 'SQL']),
        technicalSkills: JSON.stringify(['PyTorch', 'Transformers', 'Vector DB', 'FastAPI', 'Docker', 'Model Monitoring', 'CUDA', 'MLOps']),
        interests: JSON.stringify(['Large Language Models', 'Vector Search', 'Efficient Fine-Tuning (LoRA)', 'Kernel Optimization']),
        availableToHelp: true,
        studyBuddyEnabled: true,
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowConnectionRequests: true,
        projects: JSON.stringify([
          {
            name: 'Fine-Tuned LLaMA-3 Legal Document Summarizer',
            technologies: ['PyTorch', 'Transformers', 'FastAPI', 'Vector DB'],
            domain: 'Generative AI',
            description: 'QLoRA fine-tuning on 50,000 legal contracts with ChromaDB vector search and FastAPI REST backend.',
            complexity: 'Advanced',
            url: 'https://github.com/neha-k/legal-llama3-rag'
          }
        ]),
        courses: JSON.stringify([
          { name: 'Hugging Face NLP Course & Transformers in Production', provider: 'Hugging Face', skills: ['Transformers', 'PyTorch', 'Vector DB'], completedAt: '2024-04-30' },
          { name: 'Deploying Machine Learning Models in Production', provider: 'Coursera (DeepLearning.AI)', skills: ['MLOps', 'FastAPI', 'Docker'], completedAt: '2024-09-15' }
        ]),
        certifications: JSON.stringify([
          { name: 'NVIDIA Deep Learning Institute Certificate for Generative AI', platform: 'NVIDIA', domain: 'AI & Data' }
        ])
      }
    },
    {
      email: 'ananya.gupta@demo.careerx.dev',
      name: 'Ananya Gupta',
      phone: '+91 98667 89012',
      isDemo: true,
      profile: {
        college: 'NIT Trichy',
        course: 'B.Tech',
        branch: 'Computer Science & Engineering',
        currentYear: 2,
        gradYear: 2027,
        cgpa: 8.5,
        preferredField: 'Data Science',
        careerGoal: 'Data Scientist',
        profilePhoto: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
        programmingLanguages: JSON.stringify(['Python', 'SQL', 'R']),
        technicalSkills: JSON.stringify(['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL', 'Statistics', 'Docker']),
        interests: JSON.stringify(['Exploratory Data Analysis', 'Statistical Inference', 'Time Series Forecasting', 'Data Visualization']),
        availableToHelp: false,
        studyBuddyEnabled: true,
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowConnectionRequests: true,
        projects: JSON.stringify([
          {
            name: 'Global Supply Chain Disruption Predictor',
            technologies: ['Python', 'Pandas', 'Scikit-Learn', 'SQL'],
            domain: 'Data Analytics',
            description: 'Trained XGBoost and Random Forest regression models to forecast freight delay probabilities.',
            complexity: 'Intermediate',
            url: 'https://github.com/ananya-g/supply-chain-ml'
          }
        ]),
        courses: JSON.stringify([
          { name: 'Data Science & Machine Learning Bootcamp', provider: 'Udemy', skills: ['Python', 'Pandas', 'Scikit-Learn', 'SQL'], completedAt: '2024-06-01' }
        ]),
        certifications: []
      }
    },
    {
      email: 'karan.singhal@demo.careerx.dev',
      name: 'Karan Singhal',
      phone: '+91 98778 90123',
      isDemo: true,
      profile: {
        college: 'IIT Delhi',
        course: 'B.Tech',
        branch: 'Electrical Engineering',
        currentYear: 3,
        gradYear: 2026,
        cgpa: 8.7,
        preferredField: 'Backend & ML Systems',
        careerGoal: 'Machine Learning Engineer',
        profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
        programmingLanguages: JSON.stringify(['Python', 'C++', 'SQL', 'Rust']),
        technicalSkills: JSON.stringify(['FastAPI', 'PyTorch', 'Docker', 'Vector DB', 'Redis', 'PostgreSQL', 'CI/CD']),
        interests: JSON.stringify(['Vector Search Engines', 'High Concurrency APIs', 'Asynchronous Microservices', 'RAG']),
        availableToHelp: true,
        studyBuddyEnabled: true,
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowConnectionRequests: true,
        projects: JSON.stringify([
          {
            name: 'FastAPI Semantic Document Search Engine',
            technologies: ['FastAPI', 'Vector DB', 'Docker', 'PyTorch', 'Redis'],
            domain: 'AI Systems',
            description: 'Hybrid sparse-dense retrieval service with Qdrant vector index and FastAPI streaming responses.',
            complexity: 'Advanced',
            url: 'https://github.com/karan-singhal/fastapi-vector-engine'
          }
        ]),
        courses: JSON.stringify([
          { name: 'Modern Backend Engineering with Python & FastAPI', provider: 'TestDriven.io', skills: ['FastAPI', 'Docker', 'PostgreSQL'], completedAt: '2024-05-15' },
          { name: 'Vector Databases in Generative AI', provider: 'DeepLearning.AI', skills: ['Vector DB', 'PyTorch'], completedAt: '2024-08-20' }
        ]),
        certifications: [
          { name: 'Pinecone Certified Vector Search Specialist', platform: 'Pinecone', domain: 'AI & Data' }
        ]
      }
    },
    {
      email: 'siddharth.nair@demo.careerx.dev',
      name: 'Siddharth Nair',
      phone: '+91 98889 01234',
      isDemo: true,
      profile: {
        college: 'Dharmsinh Desai University',
        course: 'B.Tech',
        branch: 'Computer Science & Engineering',
        currentYear: 2,
        gradYear: 2027,
        cgpa: 8.3,
        preferredField: 'Cloud & AI',
        careerGoal: 'Machine Learning Engineer',
        profilePhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
        programmingLanguages: JSON.stringify(['Python', 'JavaScript', 'C++']),
        technicalSkills: JSON.stringify(['Python', 'Docker', 'Git', 'FastAPI', 'Pandas']),
        interests: JSON.stringify(['Learning Containerization', 'Building APIs', 'Machine Learning Foundations']),
        availableToHelp: false,
        studyBuddyEnabled: true,
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowConnectionRequests: true,
        projects: JSON.stringify([
          {
            name: 'Dockerized Flask Weather API',
            technologies: ['Python', 'Docker', 'Git'],
            domain: 'Web Services',
            description: 'Simple containerized weather service with OpenWeatherMap integration.',
            complexity: 'Beginner',
            url: 'https://github.com/siddharth-nair/docker-weather'
          }
        ]),
        courses: JSON.stringify([
          { name: 'Docker Crash Course for Beginners', provider: 'freeCodeCamp', skills: ['Docker', 'Git'], completedAt: '2024-09-10' }
        ]),
        certifications: []
      }
    }
  ];

  for (const item of demoUsers) {
    // Delete existing user if present
    const existing = await prisma.user.findUnique({ where: { email: item.email } });
    if (existing) {
      await prisma.user.delete({ where: { id: existing.id } });
    }

    const { profile, ...userData } = item;
    const user = await prisma.user.create({
      data: {
        ...userData,
        passwordHash,
        profile: {
          create: {
            ...profile,
            certifications: typeof profile.certifications === 'string' ? profile.certifications : JSON.stringify(profile.certifications || []),
            completenessStage: 6,
            completenessPercent: 95,
            streakDays: 6,
          }
        }
      }
    });

    console.log(`  ✓ Created Demo Student: ${user.name} (${item.email})`);
  }

  console.log('✅ Demo Students & Study Partners seeded successfully!');
}
