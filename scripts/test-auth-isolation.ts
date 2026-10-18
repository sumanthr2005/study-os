import { prisma } from '../src/lib/db';
import { hashPassword, verifyPassword, createSession, destroySession } from '../src/lib/auth';
import { awardServerXp } from '../src/lib/gamification';
import { GET as getTasks, POST as postTasks } from '../src/app/api/tasks/route';
import { PATCH as patchTask, DELETE as deleteTask } from '../src/app/api/tasks/[id]/route';
import { POST as postNote, PATCH as patchNote } from '../src/app/api/notes/route';

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
  let sessionBToken: string = '';
  let taskAId: string = '';
  let taskBId: string = '';
  let noteAId: string = '';

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
    // TEST 3: User B Registration & Session Generation
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

    const sessionB = await createSession(userB.id);
    sessionBToken = sessionB.token;
    assert(Boolean(sessionB.token), 'User B session token generated');

    // ------------------------------------------------------------------------
    // TEST 4: Direct API Unauthorized Request Defense (HTTP 401)
    // ------------------------------------------------------------------------
    console.log('\n--- 4. UNAUTHORIZED REQUEST DEFENSE ---');
    const unauthReq = new Request('http://localhost:3000/api/tasks');
    const unauthRes = await getTasks(unauthReq);
    assert(unauthRes.status === 401, 'Direct API call without token rejected with 401 Unauthorized', `Status: ${unauthRes.status}`);

    // ------------------------------------------------------------------------
    // TEST 5: User Data Creation & Isolation (User A vs User B)
    // ------------------------------------------------------------------------
    console.log('\n--- 5. USER DATA ISOLATION (USER A vs USER B) ---');
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

    // Query tasks for User B via DB query
    const userBTasks = await prisma.task.findMany({
      where: { userId: userB.id },
    });
    assert(userBTasks.length === 0, 'User B query returns 0 tasks (cannot see User A tasks)');

    // Query tasks for User B via API handler with User B's session token
    const userBReq = new Request('http://localhost:3000/api/tasks', {
      headers: { Authorization: `Bearer ${sessionBToken}` },
    });
    const userBTasksRes = await getTasks(userBReq);
    const userBTasksData = await userBTasksRes.json();
    assert(Array.isArray(userBTasksData) && userBTasksData.length === 0, 'User B API response contains 0 tasks');

    // ------------------------------------------------------------------------
    // TEST 6: Request Body Spoofing Defense (Supplying Forged userId)
    // ------------------------------------------------------------------------
    console.log('\n--- 6. REQUEST BODY USERID SPOOFING DEFENSE ---');
    // User B attempts to create a task claiming it belongs to User A
    const spoofReq = new Request('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionBToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userA.id, // Tampered field
        title: 'User B Injected Task',
        category: 'Exploit',
      }),
    });
    const spoofRes = await postTasks(spoofReq);
    const spoofData = await spoofRes.json();
    taskBId = spoofData.id || spoofData.task?.id;
    assert(spoofRes.status === 201, 'Task created successfully');
    assert(spoofData.userId === userB.id, 'Task userId forced strictly to authenticated User B session', `Owner: ${spoofData.userId}`);
    assert(spoofData.userId !== userA.id, 'User A did NOT receive the spoofed task');

    // Verify User A tasks count remains exactly 1
    const userATasksAfter = await prisma.task.findMany({ where: { userId: userA.id } });
    assert(userATasksAfter.length === 1, 'User A tasks count remains exactly 1');

    // ------------------------------------------------------------------------
    // TEST 7: IDOR Defense via Real Route Handlers (PATCH & DELETE)
    // ------------------------------------------------------------------------
    console.log('\n--- 7. IDOR DEFENSE VIA ROUTE HANDLERS ---');
    // User B attempts to PATCH User A's task
    const idorPatchReq = new Request(`http://localhost:3000/api/tasks/${taskAId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${sessionBToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Hacked by User B' }),
    });
    const idorPatchRes = await patchTask(idorPatchReq, { params: { id: taskAId } });
    assert(idorPatchRes.status === 403, 'Cross-user task PATCH rejected with 403 Unauthorized', `Status: ${idorPatchRes.status}`);

    const verifiedTaskA = await prisma.task.findUnique({ where: { id: taskAId } });
    assert(verifiedTaskA?.title === 'User A Confidential Strategy Task', 'Task A title completely intact and unmodified');

    // User B attempts to DELETE User A's task
    const idorDeleteReq = new Request(`http://localhost:3000/api/tasks/${taskAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sessionBToken}` },
    });
    const idorDeleteRes = await deleteTask(idorDeleteReq, { params: { id: taskAId } });
    assert(idorDeleteRes.status === 403, 'Cross-user task DELETE rejected with 403 Unauthorized', `Status: ${idorDeleteRes.status}`);

    const verifiedTaskAAfter = await prisma.task.findUnique({ where: { id: taskAId } });
    assert(verifiedTaskAAfter !== null, 'Task A remains safely persisted in database');

    // ------------------------------------------------------------------------
    // TEST 8: Notes Isolation & Cross-User Mutation Defense
    // ------------------------------------------------------------------------
    console.log('\n--- 8. NOTES DATA ISOLATION & IDOR ---');
    const noteA = await prisma.note.create({
      data: {
        userId: userA.id,
        title: 'User A Secret Strategy Note',
        content: 'Confidential algorithms research',
      },
    });
    noteAId = noteA.id;

    const idorNotePatch = new Request('http://localhost:3000/api/notes', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${sessionBToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: noteAId, title: 'Tampered Note Title' }),
    });
    const idorNoteRes = await patchNote(idorNotePatch);
    assert(idorNoteRes.status === 403, 'Cross-user note PATCH rejected with 403 Unauthorized', `Status: ${idorNoteRes.status}`);

    const verifiedNote = await prisma.note.findUnique({ where: { id: noteAId } });
    assert(verifiedNote?.title === 'User A Secret Strategy Note', 'Note A content remains untampered');

    // ------------------------------------------------------------------------
    // TEST 9: Gamification Ledger Idempotency & User Scoping
    // ------------------------------------------------------------------------
    console.log('\n--- 9. GAMIFICATION LEDGER ISOLATION ---');
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
    // TEST 10: Session Invalidation on Logout
    // ------------------------------------------------------------------------
    console.log('\n--- 10. SESSION INVALIDATION ON LOGOUT ---');
    await destroySession(sessionAToken);
    const sessionAfterLogout = await prisma.session.findUnique({
      where: { token: sessionAToken },
    });
    assert(sessionAfterLogout === null, 'Session revoked and deleted from database upon logout');

  } finally {
    // ------------------------------------------------------------------------
    // CLEANUP TEST DATA: Zero pollution of real database
    // ------------------------------------------------------------------------
    console.log('\n--- CLEANUP ---');
    if (taskAId) {
      await prisma.task.deleteMany({ where: { id: taskAId } });
    }
    if (taskBId) {
      await prisma.task.deleteMany({ where: { id: taskBId } });
    }
    if (noteAId) {
      await prisma.note.deleteMany({ where: { id: noteAId } });
    }
    if (userAId) {
      await prisma.xpLedger.deleteMany({ where: { userId: userAId } });
      await prisma.session.deleteMany({ where: { userId: userAId } });
      await prisma.user.deleteMany({ where: { id: userAId } });
    }
    if (userBId) {
      await prisma.xpLedger.deleteMany({ where: { userId: userBId } });
      await prisma.session.deleteMany({ where: { userId: userBId } });
      await prisma.user.deleteMany({ where: { id: userBId } });
    }
    console.log('🧹 Cleaned up all isolated test records.');
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
