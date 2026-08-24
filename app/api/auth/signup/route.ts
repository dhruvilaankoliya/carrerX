import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      college,
      course,
      branch,
      currentYear,
      gradYear,
      cgpa,
      preferredField,
      programmingLanguages,
      technicalSkills,
      linkedin,
      github,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone || null,
        passwordHash,
        profile: {
          create: {
            college: college || 'University Student',
            course: course || 'B.Tech',
            branch: branch || 'Computer Science',
            currentYear: parseInt(currentYear, 10) || 1,
            gradYear: parseInt(gradYear, 10) || 2027,
            cgpa: cgpa ? parseFloat(cgpa) : null,
            preferredField: preferredField || null,
            programmingLanguages: JSON.stringify(programmingLanguages || []),
            technicalSkills: JSON.stringify(technicalSkills || []),
            linkedin: linkedin || null,
            github: github || null,
            completenessStage: 1,
            completenessPercent: 20,
          },
        },
      },
      include: { profile: true },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
