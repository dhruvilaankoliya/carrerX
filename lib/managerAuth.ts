import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function verifyManager() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      ),
      manager: null,
    };
  }

  if (user.role !== 'manager') {
    return {
      errorResponse: NextResponse.json(
        { error: 'Access denied. Manager role required.' },
        { status: 403 }
      ),
      manager: null,
    };
  }

  return { errorResponse: null, manager: user };
}
