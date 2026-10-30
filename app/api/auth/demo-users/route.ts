import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = await db.user.findMany({
      where: {
        OR: [
          { isDemo: true },
          { email: 'dhruvila@careerx.dev' },
          { role: 'manager' }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isDemo: true,
        profile: {
          select: {
            college: true,
            course: true,
            branch: true,
            currentYear: true,
            profilePhoto: true,
            careerGoal: true,
            preferredField: true,
          }
        }
      },
      orderBy: [
        { role: 'desc' },
        { email: 'asc' }
      ]
    });

    const formatted = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isDemo: u.isDemo,
      college: u.profile?.college || (u.role === 'manager' ? 'CareerX Head Office' : 'Engineering College'),
      course: u.profile?.course || 'B.Tech',
      branch: u.profile?.branch || 'Computer Science',
      year: u.profile?.currentYear || 3,
      profilePhoto: u.profile?.profilePhoto || null,
      careerGoal: u.profile?.careerGoal || u.profile?.preferredField || (u.role === 'manager' ? 'Platform Director' : 'Engineer'),
      password: u.role === 'manager' ? 'CareerX@Manager2026' : 'CareerX@2026',
    }));

    return NextResponse.json({
      success: true,
      users: formatted,
    });
  } catch (error: any) {
    console.error('Demo users GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch demo users' }, { status: 500 });
  }
}
