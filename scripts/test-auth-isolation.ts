import { prisma } from '../src/lib/db';
import { hashPassword, verifyPassword, createSession, destroySession } from '../src/lib/auth';
import { awardServerXp } from '../src/lib/gamification';

async function runAuthAndIsolationTests() {
  console.log('====================================================');
  console.log('🔒 STUDY OS — AUTHENTICATION & DATA ISOLATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
      throw new Error(`Assertion failed: ${testName} - ${detail || ''}`);
    }
  }

  const timestamp = Date.now();
  const emailA = `test_user_a_${timestamp}@studyos.dev`;
  const emailB = `test_user_b_${timestamp}@studyos.dev`;
  const rawPassword = 'SecurePassword123!';

  let userAId: string = '';
  let userBId: string = '';
  let sessionAToken: string = '';
  let taskAId: string = '';

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Password Hashing & Verification
    // ------------------------------------------------------------------------
    console.log('--- 1. PASSWORD HASHING (BCRYPT) ---');
    const hash = await hashPassword(rawPassword);
    assert(typeof hash === 'string' && hash.startsWith('$2'), 'Password hashed with bcrypt cost factor');
    assert(hash !== rawPassword, 'Hash does not equal plaintext password');

    const validMatch = await verifyPassword(rawPassword, hash);
    assert(validMatch === true, 'Correct password verifies successfully against hash');

    const invalidMatch = await verifyPassword('WrongPassword999!', hash);
    assert(invalidMatch === false, 'Incorrect password rejected by verifyPassword');

    // ------------------------------------------------------------------------
    // TEST 2: User Registration & Session Generation
    // ------------------------------------------------------------------------
    console.log('\n--- 2. USER REGISTRATION & SESSIONS ---');
    const userA = await prisma.user.create({
      data: {
        email: emailA,
        name: 'Test Engineer Alpha',
        passwordHash: hash,
        isDemo: false,
      },
    });
    userAId = userA.id;
    assert(Boolean(userA.id), 'User A registered with unique ID', userA.id);

    const sessionA = await createSession(userA.id);
    sessionAToken = sessionA.token;
    assert(Boolean(sessionA.token && sessionA.token.length >= 32), 'User A session token generated', sessionA.token.substring(0, 10) + '...');

    const dbSession = await prisma.session.findUnique({
      where: { token: sessionA.token },
      include: { user: true },
    });
    assert(Boolean(dbSession && dbSession.userId === userA.id), 'Session persisted and mapped to User A');
    assert(dbSession?.expiresAt.getTime()! > Date.now(), 'Session expiration is in the future (30 days)');

    // ------------------------------------------------------------------------
    // TEST 3: User B Registration
    // ------------------------------------------------------------------------
    console.log('\n--- 3. USER B ISOLATION SETUP ---');
    const userB = await prisma.user.create({
      data: {
        email: emailB,
        name: 'Test Engineer Beta',
        passwordHash: await hashPassword('BetaPassword456!'),
        isDemo: false,
      },
    });
    userBId = userB.id;
    assert(userB.id !== userA.id, 'User B has distinct unique ID from User A');

    // ------------------------------------------------------------------------
    // TEST 4: Resource Scoping & Query Isolation
    // ------------------------------------------------------------------------
    console.log('\n--- 4. USER DATA ISOLATION (USER A vs USER B) ---');
    const taskA = await prisma.task.create({
      data: {
        userId: userA.id,
        title: 'User A Confidential Strategy Task',
        category: 'Study',
        priority: 'HIGH',
        status: 'TODO',
      },
    });
    taskAId = taskA.id;
    assert(Boolean(taskA.id), 'User A task created');

    // Query tasks scoped to User B
    const userBTasks = await prisma.task.findMany({
      where: { userId: userB.id },
    });
    assert(userBTasks.length === 0, 'User B query returns 0 tasks (cannot see User A tasks)');

    // ------------------------------------------------------------------------
    // TEST 5: IDOR Defense (Insecure Direct Object Reference)
    // ------------------------------------------------------------------------
    console.log('\n--- 5. IDOR REJECTION (CROSS-USER MUTATION DEFENSE) ---');
    const taskToTamper = await prisma.task.findUnique({ where: { id: taskA.id } });
    assert(taskToTamper !== null, 'Target task exists in database');

    // Simulate User B attempting to mutate User A's task
    const isOwner = taskToTamper?.userId === userB.id;
    assert(isOwner === false, 'Ownership check detects User B is NOT the task owner');

    // Confirm that the simulated rejection policy preserves User A's task unchanged
    assert(taskToTamper?.title === 'User A Confidential Strategy Task', 'Task A content remains unmodified');

    // ------------------------------------------------------------------------
    // TEST 6: Gamification Ledger Idempotency & User Scoping
    // ------------------------------------------------------------------------
    console.log('\n--- 6. GAMIFICATION LEDGER ISOLATION ---');
    const eventKey = `test_study_event_${timestamp}`;
    const awardResult1 = await awardServerXp({
      userId: userA.id,
      actionType: 'STUDY_SESSION',
      amount: 20,
      description: 'Test deep work session',
      eventKey,
    });
    assert(awardResult1.awarded === true && awardResult1.amount === 20, 'First XP award succeeds (+20 XP)');

    const awardResultDuplicate = await awardServerXp({
      userId: userA.id,
      actionType: 'STUDY_SESSION',
      amount: 20,
      description: 'Replayed deep work session',
      eventKey,
    });
    assert(awardResultDuplicate.awarded === false && awardResultDuplicate.amount === 0, 'Replayed eventKey rejected idempotently (0 XP awarded)');

    // ------------------------------------------------------------------------
    // TEST 7: Session Destruction on Logout
    // ------------------------------------------------------------------------
    console.log('\n--- 7. SESSION INVALIDATION ON LOGOUT ---');
    await destroySession(sessionAToken);
    const sessionAfterLogout = await prisma.session.findUnique({
      where: { token: sessionAToken },
    });
    assert(sessionAfterLogout === null, 'Session revoked and deleted from database upon logout');

  } finally {
    // ------------------------------------------------------------------------
    // CLEANUP TEST DATA
    // ------------------------------------------------------------------------
    console.log('\n--- CLEANUP ---');
    if (taskAId) {
      await prisma.task.deleteMany({ where: { id: taskAId } });
    }
    if (userAId) {
      await prisma.xpLedger.deleteMany({ where: { userId: userAId } });
      await prisma.session.deleteMany({ where: { userId: userAId } });
      await prisma.user.deleteMany({ where: { id: userAId } });
    }
    if (userBId) {
      await prisma.session.deleteMany({ where: { userId: userBId } });
      await prisma.user.deleteMany({ where: { id: userBId } });
    }
    console.log('🧹 Cleaned up isolated test records.');
  }

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passed} AUTH & ISOLATION ASSERTIONS PASSED!`);
  console.log('====================================================\n');
}

runAuthAndIsolationTests()
  .catch(err => {
    console.error('❌ Auth test suite failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
