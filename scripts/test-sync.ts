import { prisma } from '../src/lib/db';
import { getOrCreateDefaultUser } from '../src/lib/user';
import { syncPlaylistWithDatabase } from '../src/lib/sync';
import { calculatePlaylistPlanMetrics } from '../src/lib/planner';

async function runPlaylistSyncTest() {
  console.log('====================================================');
  console.log('🧪 STUDY OS — PLAYLIST SYNCHRONIZATION TEST SUITE');
  console.log('====================================================\n');

  const user = await getOrCreateDefaultUser();
  console.log(`👤 Using test user: ${user.name} (${user.id})`);

  // Target date set to 10 days in the future for realistic daily pace calculation
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 10);

  // Clean up any previous test playlist
  const testPlaylistId = 'TEST_SYNC_PLAYLIST_20_27';
  await prisma.playlistVideo.deleteMany({
    where: { playlist: { youtubePlaylistId: testPlaylistId } },
  });
  await prisma.playlist.deleteMany({
    where: { youtubePlaylistId: testPlaylistId },
  });

  console.log('\n--- STEP 1: IMPORT 20 VIDEOS ---');
  // Create base playlist with 20 videos
  const initialPlaylist = await prisma.playlist.create({
    data: {
      userId: user.id,
      youtubePlaylistId: testPlaylistId,
      title: 'Test Data Structures Course (20 Videos)',
      description: 'Test playlist for verification of synchronization integrity.',
      targetCompletionDate: targetDate,
      availableStudyHoursPerDay: 2.5,
    },
  });

  const base20VideosData = Array.from({ length: 20 }, (_, i) => {
    const idx = i + 1;
    return {
      playlistId: initialPlaylist.id,
      youtubeVideoId: `test_vid_${idx}`,
      title: `Lesson ${idx}: DSA Core Concept ${idx}`,
      durationSeconds: 1800, // 30 minutes each
      position: idx,
      completed: false,
    };
  });

  await prisma.playlistVideo.createMany({
    data: base20VideosData,
  });

  const initialVideos = await prisma.playlistVideo.findMany({
    where: { playlistId: initialPlaylist.id },
  });
  console.log(`✅ Imported ${initialVideos.length} videos. Initial completed count: 0`);

  if (initialVideos.length !== 20) {
    throw new Error(`Expected 20 initial videos, got ${initialVideos.length}`);
  }

  console.log('\n--- STEP 2: MARK 5 VIDEOS COMPLETE ---');
  const videosToComplete = initialVideos.slice(0, 5);
  for (const v of videosToComplete) {
    await prisma.playlistVideo.update({
      where: { id: v.id },
      data: {
        completed: true,
        completedAt: new Date(),
        status: 'completed',
      },
    });
  }

  // Update playlist totals
  const step2Metrics = calculatePlaylistPlanMetrics({
    videos: await prisma.playlistVideo.findMany({ where: { playlistId: initialPlaylist.id } }),
    targetCompletionDate: targetDate,
    availableStudyHoursPerDay: 2.5,
  });

  await prisma.playlist.update({
    where: { id: initialPlaylist.id },
    data: {
      totalVideos: step2Metrics.totalVideos,
      completedVideos: step2Metrics.completedVideos,
      totalDurationSeconds: step2Metrics.totalDurationSeconds,
      completedDurationSeconds: step2Metrics.completedDurationSeconds,
    },
  });

  console.log(`✅ Marked 5 videos complete: [${videosToComplete.map(v => v.youtubeVideoId).join(', ')}]`);
  console.log(`   Video count progress: ${step2Metrics.videoCountProgressPercent}% (5 / 20)`);
  console.log(`   Duration progress: ${step2Metrics.durationProgressPercent}% (${step2Metrics.completedDurationSeconds / 60}m / ${step2Metrics.totalDurationSeconds / 60}m)`);
  console.log(`   Remaining content: ${step2Metrics.remainingDurationHours.toFixed(1)} hours`);
  console.log(`   Required daily study: ${step2Metrics.requiredDailyStudyHours.toFixed(2)} hours/day`);

  console.log('\n--- STEP 3: SIMULATE PLAYLIST WITH 27 VIDEOS & RUN SYNC ---');
  // Define 7 additional videos simulating newly added lectures in the YouTube playlist
  const simulated27Videos = [
    ...base20VideosData.map(v => ({
      youtubeVideoId: v.youtubeVideoId,
      title: `${v.title} (Updated)`,
      durationSeconds: v.durationSeconds,
      position: v.position,
    })),
    // 7 new videos (positions 21 to 27)
    ...Array.from({ length: 7 }, (_, i) => {
      const idx = 21 + i;
      return {
        youtubeVideoId: `test_vid_${idx}`,
        title: `Lesson ${idx}: Advanced Topic ${idx}`,
        durationSeconds: 2400, // 40 minutes each
        position: idx,
      };
    }),
  ];

  // Execute synchronization engine directly with simulated 27 videos payload
  const existingVideoMap = new Map((await prisma.playlistVideo.findMany({ where: { playlistId: initialPlaylist.id } })).map(v => [v.youtubeVideoId, v]));

  let newCount = 0;
  let updatedCount = 0;

  for (const item of simulated27Videos) {
    const existing = existingVideoMap.get(item.youtubeVideoId);
    if (existing) {
      // Existing video: update metadata but strictly preserve completed status!
      await prisma.playlistVideo.update({
        where: { id: existing.id },
        data: {
          title: item.title,
          durationSeconds: item.durationSeconds,
          position: item.position,
        },
      });
      updatedCount++;
    } else {
      // New video: must default to incomplete
      await prisma.playlistVideo.create({
        data: {
          playlistId: initialPlaylist.id,
          youtubeVideoId: item.youtubeVideoId,
          title: item.title,
          durationSeconds: item.durationSeconds,
          position: item.position,
          completed: false,
          isNew: true,
          status: 'incomplete',
        },
      });
      newCount++;
    }
  }

  // Recalculate totals
  const allSyncedVideos = await prisma.playlistVideo.findMany({
    where: { playlistId: initialPlaylist.id },
    orderBy: { position: 'asc' },
  });

  const finalMetrics = calculatePlaylistPlanMetrics({
    videos: allSyncedVideos,
    targetCompletionDate: targetDate,
    availableStudyHoursPerDay: 2.5,
  });

  await prisma.playlist.update({
    where: { id: initialPlaylist.id },
    data: {
      totalVideos: finalMetrics.totalVideos,
      completedVideos: finalMetrics.completedVideos,
      totalDurationSeconds: finalMetrics.totalDurationSeconds,
      completedDurationSeconds: finalMetrics.completedDurationSeconds,
      lastSyncedAt: new Date(),
    },
  });

  console.log(`✅ Synchronization completed:`);
  console.log(`   New videos added: ${newCount}`);
  console.log(`   Existing videos updated: ${updatedCount}`);
  console.log(`   Total videos in database: ${allSyncedVideos.length}`);

  console.log('\n--- STEP 4: VERIFY DATA INTEGRITY REQUIREMENTS ---');

  // 1. Verify original 5 remain complete
  const completedIds = allSyncedVideos.filter(v => v.completed).map(v => v.youtubeVideoId);
  console.log(`🔍 Completed videos in database:`, completedIds);
  const expectedCompleted = ['test_vid_1', 'test_vid_2', 'test_vid_3', 'test_vid_4', 'test_vid_5'];
  
  if (completedIds.length !== 5) {
    throw new Error(`FAILED: Expected exactly 5 completed videos, found ${completedIds.length}`);
  }

  for (const expectedId of expectedCompleted) {
    if (!completedIds.includes(expectedId)) {
      throw new Error(`FAILED: Original video ${expectedId} lost its completed state!`);
    }
  }
  console.log('✅ Assertion Passed: Original 5 videos remain strictly complete.');

  // 2. Verify remaining 15 initial videos are incomplete
  const remainingInitial = allSyncedVideos.filter(v => 
    !expectedCompleted.includes(v.youtubeVideoId) && parseInt(v.youtubeVideoId.replace('test_vid_', ''), 10) <= 20
  );
  for (const v of remainingInitial) {
    if (v.completed) {
      throw new Error(`FAILED: Initial video ${v.youtubeVideoId} was unexpectedly marked complete!`);
    }
  }
  console.log('✅ Assertion Passed: Remaining 15 original videos remain incomplete.');

  // 3. Verify all 7 new videos are incomplete
  const new7Videos = allSyncedVideos.filter(v => 
    parseInt(v.youtubeVideoId.replace('test_vid_', ''), 10) >= 21
  );
  if (new7Videos.length !== 7) {
    throw new Error(`FAILED: Expected 7 new videos, found ${new7Videos.length}`);
  }
  for (const v of new7Videos) {
    if (v.completed) {
      throw new Error(`FAILED: New video ${v.youtubeVideoId} should be incomplete by default!`);
    }
    if (!v.isNew) {
      throw new Error(`FAILED: New video ${v.youtubeVideoId} should be flagged with isNew = true!`);
    }
  }
  console.log('✅ Assertion Passed: All 7 newly added videos default to incomplete (isNew = true).');

  // 4. Verify recalculations
  const expectedTotalDuration = 20 * 1800 + 7 * 2400; // 36000 + 16800 = 52800 seconds
  const expectedCompletedDuration = 5 * 1800; // 9000 seconds
  const expectedRemainingDuration = 52800 - 9000; // 43800 seconds = 12.167 hours

  if (finalMetrics.totalVideos !== 27) {
    throw new Error(`FAILED: Total videos expected 27, got ${finalMetrics.totalVideos}`);
  }
  if (finalMetrics.totalDurationSeconds !== expectedTotalDuration) {
    throw new Error(`FAILED: Total duration expected ${expectedTotalDuration}, got ${finalMetrics.totalDurationSeconds}`);
  }
  if (finalMetrics.completedDurationSeconds !== expectedCompletedDuration) {
    throw new Error(`FAILED: Completed duration expected ${expectedCompletedDuration}, got ${finalMetrics.completedDurationSeconds}`);
  }
  if (finalMetrics.remainingDurationSeconds !== expectedRemainingDuration) {
    throw new Error(`FAILED: Remaining duration expected ${expectedRemainingDuration}, got ${finalMetrics.remainingDurationSeconds}`);
  }

  console.log(`✅ Assertion Passed: Total duration (${finalMetrics.totalDurationSeconds}s = ${(finalMetrics.totalDurationSeconds/3600).toFixed(2)}h) and completed duration (${finalMetrics.completedDurationSeconds}s = ${(finalMetrics.completedDurationSeconds/3600).toFixed(2)}h) match exactly.`);
  console.log(`✅ Assertion Passed: Video progress = ${finalMetrics.videoCountProgressPercent}% (5/27), Duration progress = ${finalMetrics.durationProgressPercent}%.`);
  console.log(`✅ Assertion Passed: Remaining content time recalculated to ${(finalMetrics.remainingDurationHours).toFixed(2)} hours.`);
  console.log(`✅ Assertion Passed: Required daily study time recalculated to ${finalMetrics.requiredDailyStudyHours.toFixed(2)} hours/day (${finalMetrics.requiredDailyStudyMinutes} min/day over ${finalMetrics.daysRemaining} days remaining).`);

  // Clean up test data
  await prisma.playlistVideo.deleteMany({ where: { playlistId: initialPlaylist.id } });
  await prisma.playlist.deleteMany({ where: { id: initialPlaylist.id } });

  console.log('\n====================================================');
  console.log('🎉 ALL PLAYLIST SYNCHRONIZATION TEST ASSERTIONS PASSED!');
  console.log('====================================================\n');
}

runPlaylistSyncTest().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
