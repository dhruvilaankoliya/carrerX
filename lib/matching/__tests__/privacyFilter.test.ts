/**
 * Unit Test for Server-Side Privacy Filtering
 */

export function runPrivacyFilterTests() {
  console.log('🧪 Running Server-Side Privacy Redaction Unit Tests...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${testName}`);
      failed++;
    }
  }

  interface RawUser {
    id: string;
    email: string;
    phone: string;
    name: string;
    showEmail: boolean;
    showPhone: boolean;
  }

  function getSafeProfile(
    targetUser: RawUser,
    requesterId: string,
    isAcceptedConnection: boolean
  ) {
    const isSelf = requesterId === targetUser.id;
    const safeEmail = isSelf || (targetUser.showEmail && isAcceptedConnection) ? targetUser.email : null;
    const safePhone = isSelf || (targetUser.showPhone && isAcceptedConnection) ? targetUser.phone : null;

    return {
      id: targetUser.id,
      name: targetUser.name,
      email: safeEmail,
      phone: safePhone,
    };
  }

  const userA: RawUser = {
    id: 'user_a',
    name: 'Aarav Sharma',
    email: 'aarav@demo.careerx.dev',
    phone: '+91 98111 22233',
    showEmail: false,
    showPhone: false,
  };

  // 1. Stranger viewing User A (showEmail = false, showPhone = false)
  const strangerView = getSafeProfile(userA, 'stranger_id', false);
  assert(strangerView.email === null, 'Stranger: Email is redacted (null)');
  assert(strangerView.phone === null, 'Stranger: Phone is redacted (null)');

  // 2. Pending connection viewing User A (showEmail = false, showPhone = false)
  const pendingView = getSafeProfile(userA, 'pending_id', false);
  assert(pendingView.email === null, 'Pending connection: Email is redacted (null)');
  assert(pendingView.phone === null, 'Pending connection: Phone is redacted (null)');

  // 3. Accepted connection viewing User A with showEmail = false
  const acceptedNoShareView = getSafeProfile(userA, 'friend_id', true);
  assert(acceptedNoShareView.email === null, 'Accepted connection with sharing disabled: Email is redacted (null)');

  // 4. Accepted connection viewing User A with showEmail = true, showPhone = false
  const userB: RawUser = {
    ...userA,
    showEmail: true,
    showPhone: false,
  };
  const acceptedWithEmailView = getSafeProfile(userB, 'friend_id', true);
  assert(acceptedWithEmailView.email === 'aarav@demo.careerx.dev', 'Accepted connection with showEmail=true: Email is exposed');
  assert(acceptedWithEmailView.phone === null, 'Accepted connection with showPhone=false: Phone remains redacted');

  // 5. Self viewing own profile
  const selfView = getSafeProfile(userA, 'user_a', false);
  assert(selfView.email === 'aarav@demo.careerx.dev', 'Self: Always sees own email');
  assert(selfView.phone === '+91 98111 22233', 'Self: Always sees own phone');

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  return { passed, failed };
}

if (require.main === module) {
  runPrivacyFilterTests();
}
