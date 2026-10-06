import { NextRequest, NextResponse } from 'next/server';
import { getStudentProfileById } from '@/lib/studentConnectService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = getStudentProfileById(id);

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Student profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('Student profile GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
