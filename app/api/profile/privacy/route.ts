import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile } = session;

    return NextResponse.json({
      success: true,
      privacy: {
        profileVisibility: profile?.profileVisibility || 'public',
        showEmail: profile?.showEmail ?? false,
        showPhone: profile?.showPhone ?? false,
        allowConnectionRequests: profile?.allowConnectionRequests ?? true,
        availableToHelp: profile?.availableToHelp ?? false,
        studyBuddyEnabled: profile?.studyBuddyEnabled ?? true,
      },
    });
  } catch (error: any) {
    console.error('Privacy GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch privacy settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await req.json();

    const updateData: any = {};
    if (body.profileVisibility !== undefined) {
      updateData.profileVisibility = body.profileVisibility === 'connections_only' ? 'connections_only' : 'public';
    }
    if (typeof body.showEmail === 'boolean') updateData.showEmail = body.showEmail;
    if (typeof body.showPhone === 'boolean') updateData.showPhone = body.showPhone;
    if (typeof body.allowConnectionRequests === 'boolean') updateData.allowConnectionRequests = body.allowConnectionRequests;
    if (typeof body.availableToHelp === 'boolean') updateData.availableToHelp = body.availableToHelp;
    if (typeof body.studyBuddyEnabled === 'boolean') updateData.studyBuddyEnabled = body.studyBuddyEnabled;

    const updatedProfile = await db.profile.update({
      where: { userId: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated successfully',
      privacy: {
        profileVisibility: updatedProfile.profileVisibility,
        showEmail: updatedProfile.showEmail,
        showPhone: updatedProfile.showPhone,
        allowConnectionRequests: updatedProfile.allowConnectionRequests,
        availableToHelp: updatedProfile.availableToHelp,
        studyBuddyEnabled: updatedProfile.studyBuddyEnabled,
      },
    });
  } catch (error: any) {
    console.error('Privacy PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update privacy settings' }, { status: 500 });
  }
}
