import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { extractResumeData } from '@/lib/ai/resumeExtractor';
import { extractTextFromPdf } from '@/lib/ai/pdfExtractor';
import { parseResumeWithAI } from '@/lib/ai/aiResumeParser';
import { generateResumeBasedQuestions } from '@/lib/ai/questionGenerator';
import { computeCareerMatches } from '@/lib/scoring/careerMatcher';
import { computeReadinessIndex } from '@/lib/scoring/readinessIndex';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const { user, profile } = session;
    let rawText = '';
    let fileName = 'Uploaded_Resume.pdf';
    let buffer: Buffer = Buffer.from('');

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('resume') as File | null;
      const textParam = formData.get('rawText') as string | null;

      if (file && file.size > 0) {
        fileName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);

        if (file.name.toLowerCase().endsWith('.pdf')) {
          try {
            rawText = await extractTextFromPdf(buffer, file.name);
          } catch (pdfErr: any) {
            console.error('PDF parsing error:', pdfErr);
            rawText = '';
          }
        } else if (file.name.toLowerCase().endsWith('.docx')) {
          try {
            const mammoth = (await import('mammoth')).default;
            const result = await mammoth.extractRawText({ buffer });
            rawText = result.value || '';
          } catch (docxErr) {
            console.error('DOCX parsing error:', docxErr);
            rawText = '';
          }
        } else {
          // Plaintext or other text files
          rawText = buffer.toString('utf-8');
        }
      } else if (textParam) {
        rawText = textParam;
      }
    } else {
      const body = await req.json();
      rawText = body.rawText || '';
      fileName = body.fileName || 'Pasted_Resume.txt';
    }

    const userApiKey = req.headers.get('x-gemini-key') || req.headers.get('x-api-key') || undefined;

    if ((!rawText || rawText.trim().length < 15) && !userApiKey && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'Unable to extract readable text from this file. If this is a Canva, scanned, or graphic resume, please switch to the "📋 Paste Plaintext Resume" tab, or enter a free Google Gemini API key to process scanned/graphical PDFs directly.',
          suggestion: 'paste_text_or_add_api_key',
        },
        { status: 400 }
      );
    }

    // Extract structured JSON using AI (Gemini / Groq) or Local Heuristic Engine
    const { parsed, provider } = await parseResumeWithAI(buffer, rawText, fileName, userApiKey);

    // Save Resume Data to Database
    await db.resumeData.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fileName,
        rawText,
        parsedJson: JSON.stringify(parsed),
        initialInterests: JSON.stringify(parsed.initialInterestEstimate),
      },
      update: {
        fileName,
        rawText,
        parsedJson: JSON.stringify(parsed),
        initialInterests: JSON.stringify(parsed.initialInterestEstimate),
        uploadedAt: new Date(),
      },
    });

    // Generate and store dynamic resume-based questions
    const generatedQuestions = generateResumeBasedQuestions(parsed);
    await db.resumeQuestion.deleteMany({ where: { userId: user.id } });

    const createdQuestions = [];
    for (const q of generatedQuestions) {
      const created = await db.resumeQuestion.create({
        data: {
          userId: user.id,
          questionText: q.questionText,
          category: q.category,
          relatedItem: q.relatedItem,
          options: JSON.stringify(q.options),
        },
      });
      createdQuestions.push({
        id: created.id,
        questionText: created.questionText,
        category: created.category,
        relatedItem: created.relatedItem,
        options: q.options,
      });
    }

    // Update Profile Completeness & merged technical skills
    const newStage = Math.max(profile?.completenessStage || 1, 2);
    const newPercent = Math.max(profile?.completenessPercent || 20, 45);
    const mergedSkills = Array.from(
      new Set([...JSON.parse(profile?.technicalSkills || '[]'), ...parsed.technicalSkills])
    );

    const profileUpdateData: any = {
      completenessStage: newStage,
      completenessPercent: newPercent,
      technicalSkills: JSON.stringify(mergedSkills),
    };

    if (parsed.personalInfo?.linkedin && !profile?.linkedin) {
      profileUpdateData.linkedin = parsed.personalInfo.linkedin;
    }
    if (parsed.personalInfo?.github && !profile?.github) {
      profileUpdateData.github = parsed.personalInfo.github;
    }
    if (
      parsed.education?.institution &&
      (!profile?.college || profile.college === 'Accredited Engineering University')
    ) {
      profileUpdateData.college = parsed.education.institution;
    }

    await db.profile.update({
      where: { userId: user.id },
      data: profileUpdateData,
    });

    // Compute preliminary career matches and readiness preview
    const studentData: any = {
      userId: user.id,
      name: user.name,
      college: profileUpdateData.college || profile?.college || 'Engineering College',
      course: profile?.course || 'B.Tech',
      branch: profile?.branch || 'Computer Science & Engineering',
      currentYear: profile?.currentYear || 3,
      gradYear: profile?.gradYear || 2026,
      cgpa: profile?.cgpa || 8.0,
      programmingLanguages: JSON.parse(profile?.programmingLanguages || '[]'),
      technicalSkills: mergedSkills,
      extractedSkills: parsed.technicalSkills || [],
      extractedProjects: parsed.projects || [],
      extractedCertifications: parsed.certifications || [],
      resumeInitialInterests: parsed.initialInterestEstimate,
      assessmentScores: {
        techInterest: parsed.initialInterestEstimate,
        aptitude: 75,
        problemSolving: 75,
        mindGames: 75,
      },
      streakDays: profile?.streakDays || 1,
    };

    const targetCareerId = profile?.targetCareerId || 'ml-engineer';
    const matches = computeCareerMatches(studentData);
    const readiness = computeReadinessIndex(studentData, targetCareerId);

    return NextResponse.json({
      success: true,
      provider,
      fileName,
      parsed,
      questions: createdQuestions,
      questionsGenerated: createdQuestions.length,
      completenessPercent: newPercent,
      completenessStage: newStage,
      careerMatches: matches.slice(0, 3),
      preliminaryReadiness: {
        overallScore: readiness.overallScore,
        tier: readiness.readinessTier,
        subscores: readiness.subscores,
      },
    });
  } catch (error: any) {
    console.error('Resume parse error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse resume' }, { status: 500 });
  }
}
