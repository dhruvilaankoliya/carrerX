import { NextRequest, NextResponse } from 'next/server';

// In-memory / persistent cache for resource usage increments
const globalResourceCounts: Record<string, number> = {};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resourceId, action } = body;

    if (!resourceId) {
      return NextResponse.json({ error: 'resourceId is required' }, { status: 400 });
    }

    if (!globalResourceCounts[resourceId]) {
      globalResourceCounts[resourceId] = 0;
    }

    // Increment count
    globalResourceCounts[resourceId] += 1;

    return NextResponse.json({
      success: true,
      resourceId,
      action: action || 'click',
      newUsageCount: globalResourceCounts[resourceId],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update resource count' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    counts: globalResourceCounts,
  });
}
