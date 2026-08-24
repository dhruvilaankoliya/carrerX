import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { extractResumeData } from '@/lib/ai/resumeExtractor';
import { generateResumeBasedQuestions } from '@/lib/ai/questionGenerator';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, profile } = session;
    let rawText = '';
    let fileName = 'Uploaded_Resume.pdf';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('resume') as File | null;
      const textParam = formData.get('rawText') as string | null;

      if (file && file.size > 0) {
        fileName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (file.name.toLowerCase().endsWith('.pdf')) {
          try {
            // pdf-parse dynamic import
            const pdfParse = (await import('pdf-parse')).default;
            const pdfData = await pdfParse(buffer);
            rawText = pdfData.text || '';
          } catch (pdfErr) {
            console.warn('PDF parse fallback to text:', pdfErr);
            rawText = buffer.toString('utf-8');
          }
        } else if (file.name.toLowerCase().endsWith('.docx')) {
          try {
            const mammoth = (await import('mammoth')).default;
            const result = await mammoth.extractRawText({ buffer });
            rawText = result.value || '';
          } catch (docxErr) {
            rawText = buffer.toString('utf-8');
          }
        } else {
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

    if (!rawText || rawText.trim().length < 15) {
      return NextResponse.json(
        { error: 'Unable to extract text. Please ensure your resume contains readable text.' },
        { status: 400 }
      );
    }

    // Extract structured JSON
    const parsed = await extractResumeData(rawText);

    // Save to Database
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

    for (const q of generatedQuestions) {
      await db.resumeQuestion.create({
        data: {
          userId: user.id,
          questionText: q.questionText,
          category: q.category,
          relatedItem: q.relatedItem,
          options: JSON.stringify(q.options),
        },
      });
    }

    // Update Profile Completeness
    const newStage = Math.max(profile.completenessStage || 1, 2);
    const newPercent = Math.max(profile.completenessPercent || 20, 40);

    await db.profile.update({
      where: { userId: user.id },
      data: {
        completenessStage: newStage,
        completenessPercent: newPercent,
        technicalSkills: JSON.stringify(
          Array.from(new Set([...JSON.parse(profile.technicalSkills || '[]'), ...parsed.technicalSkills]))
        ),
      },
    });

    return NextResponse.json({
      success: true,
      parsed,
      questionsGenerated: generatedQuestions.length,
      completenessPercent: newPercent,
    });
  } catch (error: any) {
    console.error('Resume parse error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse resume' }, { status: 500 });
  }
}
