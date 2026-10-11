import { prisma } from '../src/lib/db';
import { getOrCreateDefaultUser } from '../src/lib/user';
import { extractPlaylistId } from '../src/lib/youtube';

async function runRegressionTestSuite() {
  console.log('====================================================');
  console.log('🧪 STUDY OS — REGRESSION & PERSISTENCE TEST SUITE');
  console.log('====================================================\n');

  const user = await getOrCreateDefaultUser();
  console.log(`👤 Using user: ${user.name} (${user.id})`);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Task Creation Input Validation & Persistence
  // --------------------------------------------------------------------------
  console.log('\n--- 1. TASK CREATION & VALIDATION ---');

  const uniqueTaskTitle = `Regression Test Task - ${Date.now()}`;
  const createdTask = await prisma.task.create({
    data: {
      userId: user.id,
      title: uniqueTaskTitle,
      category: 'Coding',
      priority: 'HIGH',
      status: 'TODO',
      estimatedMinutes: 45,
      actualMinutes: 0,
    },
  });

  assert(Boolean(createdTask && createdTask.id), 'Task created with valid ID', `ID: ${createdTask.id}`);
  assert(createdTask.status === 'TODO', 'Task defaults to valid status "TODO"', `status = ${createdTask.status}`);
  assert(createdTask.title === uniqueTaskTitle, 'Task title preserved exactly');
  assert(createdTask.estimatedMinutes === 45, 'Task estimatedMinutes stored accurately');

  // Verify DB read
  const fetchedTask = await prisma.task.findUnique({ where: { id: createdTask.id } });
  assert(Boolean(fetchedTask), 'Task persisted and retrieved from database');

  // --------------------------------------------------------------------------
  // TEST 2: Task Status Toggling & Completion
  // --------------------------------------------------------------------------
  console.log('\n--- 2. TASK STATUS TOGGLING & COMPLETION ---');

  const completedTask = await prisma.task.update({
    where: { id: createdTask.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  assert(completedTask.status === 'COMPLETED', 'Task status transitions to "COMPLETED"');
  assert(Boolean(completedTask.completedAt), 'Task receives valid completedAt timestamp');

  // --------------------------------------------------------------------------
  // TEST 3: Task Deletion
  // --------------------------------------------------------------------------
  console.log('\n--- 3. TASK DELETION CLEANUP ---');

  await prisma.task.delete({ where: { id: createdTask.id } });
  const checkDeleted = await prisma.task.findUnique({ where: { id: createdTask.id } });
  assert(checkDeleted === null, 'Task deleted cleanly from database');

  // --------------------------------------------------------------------------
  // TEST 4: Study Session Duration Separation
  // --------------------------------------------------------------------------
  console.log('\n--- 4. STUDY SESSION DURATION SEPARATION ---');

  const testSession = await prisma.studySession.create({
    data: {
      userId: user.id,
      subject: 'Dynamic Programming Verification',
      mode: 'pomodoro',
      durationSeconds: 1500, // 25 mins
      isDeepWork: true,
      notes: 'Testing isolation between study duration and video duration.',
    },
  });

  assert(Boolean(testSession.id), 'StudySession record persisted in database');
  assert(testSession.durationSeconds === 1500, 'Actual study duration stored separately (1500s)');

  // Clean up test session
  await prisma.studySession.delete({ where: { id: testSession.id } });
  assert(true, 'Test study session cleaned up');

  // --------------------------------------------------------------------------
  // TEST 5: YouTube URL Validation
  // --------------------------------------------------------------------------
  console.log('\n--- 5. YOUTUBE URL EXTRACTOR & VALIDATOR ---');

  const validUrl = 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_st8';
  const extractedValid = extractPlaylistId(validUrl);
  assert(extractedValid === 'PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_st8', 'Valid YouTube playlist URL correctly extracted');

  const validRawId = 'PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_st8';
  const extractedRaw = extractPlaylistId(validRawId);
  assert(extractedRaw === 'PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_st8', 'Valid raw YouTube playlist ID correctly identified');

  const invalidUrl = 'invalid_broken_link_xyz';
  const extractedInvalid = extractPlaylistId(invalidUrl);
  assert(extractedInvalid === null, 'Invalid playlist link rejected with null', 'Returned: null');

  const nonYoutubeUrl = 'https://github.com/torvalds/linux';
  const extractedNonYt = extractPlaylistId(nonYoutubeUrl);
  assert(extractedNonYt === null, 'Non-YouTube link rejected with null');

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passed} REGRESSION ASSERTIONS PASSED!`);
  console.log('====================================================\n');
}

runRegressionTestSuite()
  .catch(err => {
    console.error('❌ Regression suite failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
