import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyManager } from '@/lib/managerAuth';
import { isUserOnline } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  const { errorResponse } = await verifyManager();
  if (errorResponse) return errorResponse;

  try {
    const users = await db.user.findMany({
      include: {
        profile: true,
        studyProgresses: {
          include: {
            resource: {
              select: { durationHrs: true },
            },
          },
        },
        feedbacks: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'User ID',
      'Name',
      'Email',
      'Role',
      'Online Status',
      'Last Login',
      'Last Seen',
      'College',
      'Branch',
      'Current Year',
      'CGPA',
      'Target Career Goal',
      'Completed Resources Count',
      'Total Study Hours',
      'Average Rating Given',
      'Feedbacks Submitted Count',
      'Registered At',
    ];

    const rows = users.map((u) => {
      const online = isUserOnline(u);
      const totalHours = u.studyProgresses.reduce(
        (sum, p) => sum + (p.resource?.durationHrs || 1),
        0
      );
      const ratings = u.feedbacks.map((f) => f.rating);
      const avgRating =
        ratings.length > 0
          ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
          : 'N/A';

      return [
        escapeCsv(u.id),
        escapeCsv(u.name),
        escapeCsv(u.email),
        escapeCsv(u.role),
        escapeCsv(online ? 'ONLINE' : 'OFFLINE'),
        escapeCsv(u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : 'Never'),
        escapeCsv(u.lastSeenAt ? new Date(u.lastSeenAt).toISOString() : 'Never'),
        escapeCsv(u.profile?.college || 'N/A'),
        escapeCsv(u.profile?.branch || 'N/A'),
        escapeCsv(u.profile?.currentYear || 'N/A'),
        escapeCsv(u.profile?.cgpa || 'N/A'),
        escapeCsv(u.profile?.careerGoal || 'N/A'),
        escapeCsv(u.studyProgresses.length),
        escapeCsv(totalHours.toFixed(1)),
        escapeCsv(avgRating),
        escapeCsv(u.feedbacks.length),
        escapeCsv(new Date(u.createdAt).toISOString()),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="careerx_users_progress_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('GET /api/manager/export.csv error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
