import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Setting up all demo users, passwords, and accepted network connections...');

  const studentPasswordHash = await bcrypt.hash('CareerX@2026', 10);
  const managerPasswordHash = await bcrypt.hash('CareerX@Manager2026', 10);

  // 1. Update Manager password
  const manager = await prisma.user.findUnique({ where: { email: 'manager@example.com' } });
  if (manager) {
    await prisma.user.update({
      where: { id: manager.id },
      data: { passwordHash: managerPasswordHash }
    });
    console.log('✓ Manager password verified');
  }

  // 2. Ensure Dhruvila password is set
  const dhruvila = await prisma.user.findUnique({ where: { email: 'dhruvila@careerx.dev' } });
  if (dhruvila) {
    await prisma.user.update({
      where: { id: dhruvila.id },
      data: { passwordHash: studentPasswordHash }
    });
    console.log('✓ Dhruvila password set to CareerX@2026');
  }

  // 3. Demo students list
  const demoStudents = [
    {
      email: 'aarav.sharma@demo.careerx.dev',
      name: 'Aarav Sharma',
      phone: '+91 98112 34567',
      college: 'IIT Bombay',
      course: 'B.Tech',
      branch: 'Computer Science',
      year: 4,
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
      careerGoal: 'Machine Learning Engineer',
    },
    {
      email: 'priya.patel@demo.careerx.dev',
      name: 'Priya Patel',
      phone: '+91 98223 45678',
      college: 'Dharmsinh Desai University',
      course: 'B.Tech',
      branch: 'Information Technology',
      year: 3,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      careerGoal: 'Machine Learning Engineer',
    },
    {
      email: 'rohit.verma@demo.careerx.dev',
      name: 'Rohit Verma',
      phone: '+91 98334 56789',
      college: 'Delhi Technological University',
      course: 'B.Tech',
      branch: 'Computer Science',
      year: 3,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      careerGoal: 'Cloud DevOps',
    },
    {
      email: 'vikram.mehta@demo.careerx.dev',
      name: 'Vikram Mehta',
      phone: '+91 98445 67890',
      college: 'BITS Pilani',
      course: 'B.Tech',
      branch: 'Computer Science',
      year: 4,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      careerGoal: 'Full Stack Architect',
    },
    {
      email: 'neha.kulkarni@demo.careerx.dev',
      name: 'Neha Kulkarni',
      phone: '+91 98556 78901',
      college: 'COEP Pune',
      course: 'B.Tech',
      branch: 'Computer Science',
      year: 4,
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
      careerGoal: 'Machine Learning Engineer',
    },
    {
      email: 'ananya.gupta@demo.careerx.dev',
      name: 'Ananya Gupta',
      phone: '+91 98667 89012',
      college: 'IIIT Hyderabad',
      course: 'B.Tech',
      branch: 'Computer Science',
      year: 2,
      photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
      careerGoal: 'Data Scientist',
    },
    {
      email: 'karan.singhal@demo.careerx.dev',
      name: 'Karan Singhal',
      phone: '+91 98778 90123',
      college: 'NIT Trichy',
      course: 'B.Tech',
      branch: 'Electrical & CS',
      year: 3,
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
      careerGoal: 'Machine Learning Engineer',
    },
    {
      email: 'siddharth.nair@demo.careerx.dev',
      name: 'Siddharth Nair',
      phone: '+91 98889 01234',
      college: 'RVCE Bangalore',
      course: 'B.Tech',
      branch: 'Computer Science',
      year: 2,
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
      careerGoal: 'Cloud DevOps',
    },
  ];

  const studentUserIds: { id: string; email: string; name: string }[] = [];
  if (dhruvila) {
    studentUserIds.push({ id: dhruvila.id, email: dhruvila.email, name: dhruvila.name });
  }

  for (const s of demoStudents) {
    let user = await prisma.user.findUnique({ where: { email: s.email }, include: { profile: true } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: s.email,
          name: s.name,
          phone: s.phone,
          passwordHash: studentPasswordHash,
          isDemo: true,
          profile: {
            create: {
              college: s.college,
              course: s.course,
              branch: s.branch,
              currentYear: s.year,
              profilePhoto: s.photo,
              careerGoal: s.careerGoal,
              preferredField: s.careerGoal,
              allowConnectionRequests: true,
              studyBuddyEnabled: true,
              availableToHelp: true,
            }
          }
        },
        include: { profile: true }
      });
      console.log(`✓ Created user ${s.name} (${s.email})`);
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: studentPasswordHash,
          isDemo: true,
        }
      });
      if (user.profile) {
        await prisma.profile.update({
          where: { id: user.profile.id },
          data: {
            profilePhoto: s.photo,
            college: s.college,
            course: s.course,
            branch: s.branch,
            currentYear: s.year,
            careerGoal: s.careerGoal,
            allowConnectionRequests: true,
            studyBuddyEnabled: true,
          }
        });
      }
      console.log(`✓ Updated password & profile for ${s.name} (${s.email})`);
    }
    studentUserIds.push({ id: user.id, email: user.email, name: user.name });
  }

  // 4. Create ACCEPTED Connection records between Dhruvila and ALL demo students
  if (dhruvila) {
    for (const other of studentUserIds) {
      if (other.id === dhruvila.id) continue;

      const existing = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId: dhruvila.id, receiverId: other.id },
            { senderId: other.id, receiverId: dhruvila.id },
          ]
        }
      });

      if (!existing) {
        await prisma.connection.create({
          data: {
            senderId: other.id,
            receiverId: dhruvila.id,
            status: 'accepted',
            message: `Hey Dhruvila! Connected via CareerX Study Network. Let's collaborate!`,
            respondedAt: new Date(),
          }
        });
        console.log(`✓ Connected Dhruvila <-> ${other.name} (accepted)`);
      } else if (existing.status !== 'accepted') {
        await prisma.connection.update({
          where: { id: existing.id },
          data: { status: 'accepted', respondedAt: new Date() }
        });
        console.log(`✓ Upgraded connection Dhruvila <-> ${other.name} to accepted`);
      }
    }
  }

  // 5. Connect all demo students with each other so they can chat among themselves too
  for (let i = 0; i < studentUserIds.length; i++) {
    for (let j = i + 1; j < studentUserIds.length; j++) {
      const u1 = studentUserIds[i];
      const u2 = studentUserIds[j];
      const existing = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId: u1.id, receiverId: u2.id },
            { senderId: u2.id, receiverId: u1.id },
          ]
        }
      });
      if (!existing) {
        await prisma.connection.create({
          data: {
            senderId: u1.id,
            receiverId: u2.id,
            status: 'accepted',
            message: `Hey! Connected via CareerX peer network.`,
            respondedAt: new Date(),
          }
        });
      }
    }
  }
  console.log('✓ All student peer connections established with accepted status!');

  console.log('\n🎉 ALL DONE! All users have password: CareerX@2026 and are mutually connected!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
