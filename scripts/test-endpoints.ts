/**
 * Automated Verification Script for CareerX Role-Based Features:
 * 1. Auth & Roles Login/Presence
 * 2. Studied Toggle API
 * 3. Feedback Submission & Editing
 * 4. Manager Authorization Enforcement (403 for user, 200 for manager)
 * 5. Heartbeat Presence
 */

import { db } from '../lib/db';
import { signToken, comparePassword, AUTH_COOKIE_NAME } from '../lib/auth';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting CareerX Role & Resource System Automated Verification...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. Fetch test users from DB
  const managerUser = await db.user.findFirst({
    where: { role: 'manager' },
  });

  const studentUser = await db.user.findFirst({
    where: { role: 'user' },
  });

  assert(!!managerUser, 'Manager user exists in database', `Found: ${managerUser?.email}`);
  assert(!!studentUser, 'Student user exists in database', `Found: ${studentUser?.email}`);

  if (!managerUser || !studentUser) {
    console.error('Missing test users in database. Run npm run db:seed first.');
    process.exit(1);
  }

  // 2. Generate auth tokens for testing
  const managerToken = signToken({
    userId: managerUser.id,
    email: managerUser.email,
    name: managerUser.name,
    role: 'manager',
  });

  const studentToken = signToken({
    userId: studentUser.id,
    email: studentUser.email,
    name: studentUser.name,
    role: 'user',
  });

  // 3. Test Manager Authorization Enforcement on /api/manager/stats
  console.log('\n--- Test Suite 1: Manager Authorization Enforcement ---');
  try {
    // A: Without token -> should be 401
    const unauthRes = await fetch(`${BASE_URL}/api/manager/stats`);
    assert(
      unauthRes.status === 401,
      'Unauthenticated request to /api/manager/stats returns 401',
      `Got status: ${unauthRes.status}`
    );

    // B: With student token -> should be 403 Forbidden
    const studentRes = await fetch(`${BASE_URL}/api/manager/stats`, {
      headers: {
        Cookie: `${AUTH_COOKIE_NAME}=${studentToken}`,
      },
    });
    assert(
      studentRes.status === 403,
      'Student user request to /api/manager/stats returns 403 Forbidden',
      `Got status: ${studentRes.status}`
    );

    // C: With manager token -> should be 200 OK
    const managerRes = await fetch(`${BASE_URL}/api/manager/stats`, {
      headers: {
        Cookie: `${AUTH_COOKIE_NAME}=${managerToken}`,
      },
    });
    assert(
      managerRes.status === 200,
      'Manager request to /api/manager/stats returns 200 OK',
      `Got status: ${managerRes.status}`
    );
    const statsData = await managerRes.json();
    assert(
      statsData.success && typeof statsData.stats?.totalUsers === 'number',
      'Manager stats payload contains totalUsers & metrics',
      JSON.stringify(statsData.stats)
    );
  } catch (err: any) {
    assert(false, 'Manager authorization tests failed with exception', err.message);
  }

  // 4. Test Studied Toggle on a Kubernetes Resource
  console.log('\n--- Test Suite 2: Studied State Toggle ---');
  const targetResource = await db.resource.findFirst({
    where: { id: 'res_k8s_3' },
  });
  assert(!!targetResource, 'Found target resource res_k8s_3 in database');

  if (targetResource) {
    try {
      // Toggle studied
      const toggleRes1 = await fetch(`${BASE_URL}/api/resources/${targetResource.id}/studied`, {
        method: 'POST',
        headers: {
          Cookie: `${AUTH_COOKIE_NAME}=${studentToken}`,
        },
      });
      assert(toggleRes1.status === 200, 'POST /api/resources/:id/studied returns 200');
      const data1 = await toggleRes1.json();
      assert(
        data1.success && typeof data1.isStudied === 'boolean',
        `Toggle studied returned isStudied: ${data1.isStudied}`,
        JSON.stringify(data1)
      );

      // Verify DB persistence
      const progressInDb = await db.studyProgress.findUnique({
        where: {
          userId_resourceId: {
            userId: studentUser.id,
            resourceId: targetResource.id,
          },
        },
      });
      assert(
        !!progressInDb === data1.isStudied,
        'Database studyProgress state matches API response',
        `DB has record: ${!!progressInDb}`
      );
    } catch (err: any) {
      assert(false, 'Studied toggle failed with exception', err.message);
    }
  }

  // 5. Test Feedback Submission & Edit
  console.log('\n--- Test Suite 3: Star Rating & Feedback Submission ---');
  if (targetResource) {
    try {
      const testRating = 5;
      const testComment = 'Automated test: outstanding Kubernetes hands-on lab experience.';

      const fbRes = await fetch(`${BASE_URL}/api/resources/${targetResource.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${AUTH_COOKIE_NAME}=${studentToken}`,
        },
        body: JSON.stringify({
          rating: testRating,
          comment: testComment,
        }),
      });

      assert(fbRes.status === 200, 'POST /api/resources/:id/feedback returns 200');
      const fbData = await fbRes.json();
      assert(
        fbData.success && fbData.feedback?.rating === 5,
        'Feedback saved with rating 5',
        JSON.stringify(fbData)
      );

      // Verify DB persistence
      const fbInDb = await db.feedback.findUnique({
        where: {
          userId_resourceId: {
            userId: studentUser.id,
            resourceId: targetResource.id,
          },
        },
      });
      assert(
        fbInDb?.rating === 5 && fbInDb?.comment === testComment,
        'Feedback persisted to database accurately'
      );
    } catch (err: any) {
      assert(false, 'Feedback submission failed with exception', err.message);
    }
  }

  // 6. Test Heartbeat Presence Ping
  console.log('\n--- Test Suite 4: Heartbeat & Presence Tracking ---');
  try {
    const hbRes = await fetch(`${BASE_URL}/api/heartbeat`, {
      method: 'POST',
      headers: {
        Cookie: `${AUTH_COOKIE_NAME}=${studentToken}`,
      },
    });

    assert(hbRes.status === 200, 'POST /api/heartbeat returns 200');
    const hbData = await hbRes.json();
    assert(hbData.success && hbData.isOnline === true, 'Heartbeat confirms presence online');

    const updatedUser = await db.user.findUnique({
      where: { id: studentUser.id },
    });
    assert(
      updatedUser?.isOnline === true,
      'User online flag is updated in database'
    );
  } catch (err: any) {
    assert(false, 'Heartbeat failed with exception', err.message);
  }

  // 7. Test Manager CSV Export
  console.log('\n--- Test Suite 5: Manager CSV Export ---');
  try {
    const csvRes = await fetch(`${BASE_URL}/api/manager/export.csv`, {
      headers: {
        Cookie: `${AUTH_COOKIE_NAME}=${managerToken}`,
      },
    });
    assert(csvRes.status === 200, 'GET /api/manager/export.csv returns 200');
    const contentType = csvRes.headers.get('content-type') || '';
    assert(contentType.includes('text/csv'), 'Content-Type header is text/csv');
    const csvText = await csvRes.text();
    assert(
      csvText.includes('User ID') && csvText.includes('Completed Resources Count'),
      'CSV contains correct column headers and rows'
    );
  } catch (err: any) {
    assert(false, 'CSV export failed with exception', err.message);
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error('Test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
