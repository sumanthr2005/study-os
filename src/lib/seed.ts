import { prisma } from './prisma';
import { getOrCreateDefaultUser } from './user';
import { DSA_TOPICS, PRESET_HABITS } from './constants';
import { formatDateToYYYYMMDD } from './utils';

export async function seedDemoData(forceReset: boolean = false) {
  const user = await getOrCreateDefaultUser();

  if (forceReset) {
    // Delete related records
    await prisma.studySession.deleteMany({ where: { userId: user.id } });
    await prisma.playlistVideo.deleteMany({});
    await prisma.playlist.deleteMany({ where: { userId: user.id } });
    await prisma.task.deleteMany({ where: { userId: user.id } });
    await prisma.habitCompletion.deleteMany({});
    await prisma.habit.deleteMany({ where: { userId: user.id } });
    await prisma.waterEntry.deleteMany({ where: { userId: user.id } });
    await prisma.leetCodeProblem.deleteMany({ where: { userId: user.id } });
    await prisma.dsaTopic.deleteMany({ where: { userId: user.id } });
    await prisma.goalMilestone.deleteMany({});
    await prisma.goal.deleteMany({ where: { userId: user.id } });
    await prisma.revision.deleteMany({ where: { userId: user.id } });
    await prisma.note.deleteMany({ where: { userId: user.id } });
    await prisma.placementCompany.deleteMany({ where: { userId: user.id } });
    await prisma.mockTest.deleteMany({ where: { userId: user.id } });
    await prisma.wellnessEntry.deleteMany({ where: { userId: user.id } });
    await prisma.notification.deleteMany({ where: { userId: user.id } });
  }

  // 1. Check if playlist already exists
  const existingPlaylist = await prisma.playlist.findFirst({
    where: { userId: user.id, youtubePlaylistId: 'PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_st8' },
  });

  if (!existingPlaylist) {
    // Target date: 15 October (or +10 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 10);

    const playlist = await prisma.playlist.create({
      data: {
        userId: user.id,
        youtubePlaylistId: 'PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_st8',
        title: 'Striver A2Z DSA Course',
        description: 'Complete Data Structures & Algorithms Roadmap from Basics to Advanced by take U forward (Striver).',
        channelTitle: 'take U forward',
        channelId: 'UCJskGeByzRRSvmOyZOz61ig',
        thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60',
        targetCompletionDate: targetDate,
        availableStudyHoursPerDay: 3.5,
        totalVideos: 30,
        completedVideos: 3,
        totalDurationSeconds: 88200, // ~24h 30m
        completedDurationSeconds: 8100, // 2h 15m
        lastSyncedAt: new Date(Date.now() - 2 * 3600 * 1000), // 2 hours ago
      },
    });

    // 30 Videos (First 3 completed: 2h 15m = 8100s)
    const videoData = [
      { youtubeVideoId: '0bHoB3568eE', title: 'L1: Introduction to DSA & Time Complexity Basics', durationSeconds: 2700, position: 1, completed: true, completedAt: new Date(Date.now() - 2 * 86400000) },
      { youtubeVideoId: 'FPu9Uld7W-E', title: 'L2: Space Complexity and Asymptotic Notations Explained', durationSeconds: 2700, position: 2, completed: true, completedAt: new Date(Date.now() - 1 * 86400000) },
      { youtubeVideoId: 'ear-BSGAnHQ', title: 'L3: Arrays Basics - Representation & Memory Allocation', durationSeconds: 2700, position: 3, completed: true, completedAt: new Date() },
      { youtubeVideoId: '37E9ckMDdTk', title: 'L4: Find Largest Element in Array & Second Largest', durationSeconds: 2100, position: 4, completed: false },
      { youtubeVideoId: 'wvcQg43_V8U', title: 'L5: Remove Duplicates from Sorted Array (Two Pointers)', durationSeconds: 1950, position: 5, completed: false },
      { youtubeVideoId: 'WPp7sVbXh9U', title: 'L6: Left Rotate Array by K Places (Reversal Algorithm)', durationSeconds: 2400, position: 6, completed: false },
      { youtubeVideoId: 'bYWLJb3vCWY', title: 'L7: Move Zeroes to End - Optimal In-place Solution', durationSeconds: 1600, position: 7, completed: false },
      { youtubeVideoId: 'wDzfZLODQ08', title: 'L8: Linear Search vs Binary Search Introduction', durationSeconds: 2200, position: 8, completed: false },
      { youtubeVideoId: 'j7vdD6hE8pQ', title: 'L9: Find the Union and Intersection of Two Sorted Arrays', durationSeconds: 2800, position: 9, completed: false },
      { youtubeVideoId: '7s4a1kU7K5Q', title: 'L10: Find Missing Number in Array (Sum & XOR methods)', durationSeconds: 1900, position: 10, completed: false },
      { youtubeVideoId: 'mKjHjDk3eXw', title: 'L11: Maximum Consecutive Ones & Subarray with given sum', durationSeconds: 2500, position: 11, completed: false },
      { youtubeVideoId: 'UXDSeD9mN-k', title: 'L12: Two Sum - Brute, Better (HashMap) & Optimal', durationSeconds: 3100, position: 12, completed: false },
      { youtubeVideoId: 'tp8JIuCXBaU', title: 'L13: Sort an Array of 0s, 1s and 2s (Dutch National Flag)', durationSeconds: 2400, position: 13, completed: false },
      { youtubeVideoId: 'nP_ns3uVths', title: 'L14: Majority Element (> n/2 times) - Moore Voting Algorithm', durationSeconds: 2600, position: 14, completed: false },
      { youtubeVideoId: 'AHZpyQ8496E', title: 'L15: Kadane Algorithm - Maximum Subarray Sum', durationSeconds: 3300, position: 15, completed: false },
      { youtubeVideoId: 'excAOvwF_Wk', title: 'L16: Print Subarray with Maximum Subarray Sum', durationSeconds: 2150, position: 16, completed: false },
      { youtubeVideoId: 'excAOvwF_W2', title: 'L17: Best Time to Buy and Sell Stock (Dynamic Logic)', durationSeconds: 1900, position: 17, completed: false },
      { youtubeVideoId: 'excAOvwF_W3', title: 'L18: Rearrange Array Elements by Sign', durationSeconds: 2200, position: 18, completed: false },
      { youtubeVideoId: 'excAOvwF_W4', title: 'L19: Next Permutation - Intuition and In-depth Walkthrough', durationSeconds: 3600, position: 19, completed: false },
      { youtubeVideoId: 'excAOvwF_W5', title: 'L20: Leaders in an Array - Superior Elements', durationSeconds: 1850, position: 20, completed: false },
      { youtubeVideoId: 'excAOvwF_W6', title: 'L21: Longest Consecutive Sequence in an Array', durationSeconds: 2900, position: 21, completed: false },
      { youtubeVideoId: 'excAOvwF_W7', title: 'L22: Set Matrix Zeroes - In-Place Space Optimization', durationSeconds: 3400, position: 22, completed: false },
      { youtubeVideoId: 'excAOvwF_W8', title: 'L23: Rotate Image / Matrix by 90 Degrees Clockwise', durationSeconds: 2500, position: 23, completed: false },
      { youtubeVideoId: 'excAOvwF_W9', title: 'L24: Spiral Traversal of a Matrix - Step by Step', durationSeconds: 3000, position: 24, completed: false },
      { youtubeVideoId: 'excAOvwF_10', title: 'L25: Count Subarrays with Given Sum (Prefix Sum Technique)', durationSeconds: 3100, position: 25, completed: false },
      { youtubeVideoId: 'excAOvwF_11', title: 'L26: Pascal Triangle - 3 Types of Questions Solved', durationSeconds: 2600, position: 26, completed: false },
      { youtubeVideoId: 'excAOvwF_12', title: 'L27: Majority Element (> n/3 times) - Extended Boyer-Moore', durationSeconds: 3100, position: 27, completed: false },
      { youtubeVideoId: 'excAOvwF_13', title: 'L28: 3 Sum - Optimal Two Pointers Approach', durationSeconds: 3700, position: 28, completed: false },
      { youtubeVideoId: 'excAOvwF_14', title: 'L29: 4 Sum - Quadruplets with Target Sum', durationSeconds: 3900, position: 29, completed: false },
      { youtubeVideoId: 'excAOvwF_15', title: 'L30: Largest Subarray with 0 Sum (Prefix Sum & HashMap)', durationSeconds: 2600, position: 30, completed: false },
    ];

    for (const v of videoData) {
      await prisma.playlistVideo.create({
        data: {
          playlistId: playlist.id,
          ...v,
          thumbnailUrl: `https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=60`,
          status: v.completed ? 'completed' : 'incomplete',
        },
      });
    }

    // Second playlist: CS50
    const cs50 = await prisma.playlist.create({
      data: {
        userId: user.id,
        youtubePlaylistId: 'PLhQjrBD2T382_RPoAz-zfYGFiPW42TzRQ',
        title: 'CS50 Introduction to Computer Science',
        description: 'Harvard University CS50 lectures covering Memory, Data Structures, SQL, and Web.',
        channelTitle: 'CS50',
        channelId: 'UCcabW7890RKJzL968QWEykA',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
        availableStudyHoursPerDay: 2.0,
        totalVideos: 6,
        completedVideos: 2,
        totalDurationSeconds: 49990,
        completedDurationSeconds: 16320,
        lastSyncedAt: new Date(Date.now() - 4 * 3600 * 1000),
      },
    });

    await prisma.playlistVideo.createMany({
      data: [
        { playlistId: cs50.id, youtubeVideoId: 'jjqgP9dpD1k', title: 'Lecture 0 - Computational Thinking & Algorithms', durationSeconds: 8400, position: 1, completed: true },
        { playlistId: cs50.id, youtubeVideoId: '3fR_H63X38o', title: 'Lecture 1 - C: Variables, Conditionals, Loops, Types', durationSeconds: 7920, position: 2, completed: true },
        { playlistId: cs50.id, youtubeVideoId: '4B3eZ_Wp-6M', title: 'Lecture 2 - Arrays, Compiling, Memory, Strings', durationSeconds: 8100, position: 3, completed: false },
        { playlistId: cs50.id, youtubeVideoId: 'j8e8s6Q9KkY', title: 'Lecture 3 - Algorithms: Linear Search, Binary Search', durationSeconds: 8350, position: 4, completed: false },
        { playlistId: cs50.id, youtubeVideoId: '5Z1W5C1m2xQ', title: 'Lecture 4 - Memory: Pointers, Dynamic Allocation', durationSeconds: 8520, position: 5, completed: false },
        { playlistId: cs50.id, youtubeVideoId: '8d_P8q-q7p8', title: 'Lecture 5 - Data Structures: Linked Lists, Hash Tables', durationSeconds: 8700, position: 6, completed: false },
      ],
    });
  }

  // 2. Study Sessions (Today: 6h 24m = 23040s, exactly matching prompt requirement #9!)
  // DSA — 2h 10m (7800s), DBMS — 1h 20m (4800s), Projects — 1h 45m (6300s), LeetCode — 1h 09m (4140s)
  const existingSessions = await prisma.studySession.count({ where: { userId: user.id } });
  if (existingSessions === 0) {
    const today = new Date();
    await prisma.studySession.createMany({
      data: [
        {
          userId: user.id,
          subject: 'DSA',
          mode: 'pomodoro',
          durationSeconds: 7800, // 2h 10m
          isDeepWork: true,
          startTime: new Date(today.getTime() - 7 * 3600 * 1000),
          endTime: new Date(today.getTime() - 4 * 3600 * 1000),
          notes: 'Covered Kadane Algorithm and Next Permutation implementations in C++.',
          xpEarned: 45,
        },
        {
          userId: user.id,
          subject: 'DBMS',
          mode: 'stopwatch',
          durationSeconds: 4800, // 1h 20m
          isDeepWork: true,
          startTime: new Date(today.getTime() - 4 * 3600 * 1000),
          endTime: new Date(today.getTime() - 2.5 * 3600 * 1000),
          notes: 'Transactions, ACID properties, and B+ Tree indexing.',
          xpEarned: 30,
        },
        {
          userId: user.id,
          subject: 'Projects',
          mode: 'countdown',
          durationSeconds: 6300, // 1h 45m
          isDeepWork: true,
          startTime: new Date(today.getTime() - 2.5 * 3600 * 1000),
          endTime: new Date(today.getTime() - 0.75 * 3600 * 1000),
          notes: 'Next.js App Router architecture & full-text search implementation.',
          xpEarned: 35,
        },
        {
          userId: user.id,
          subject: 'LeetCode',
          mode: 'custom',
          durationSeconds: 4140, // 1h 09m
          isDeepWork: true,
          startTime: new Date(today.getTime() - 0.75 * 3600 * 1000),
          endTime: new Date(),
          notes: 'Solved 4 problems: Two Sum, 3Sum, Valid Palindrome, Subarray Sum Equals K.',
          xpEarned: 50,
        },
        // Historical sessions over past 7 days for heatmap & analytics
        {
          userId: user.id,
          subject: 'DSA',
          durationSeconds: 18000, // 5h
          startTime: new Date(Date.now() - 1 * 86400000),
          endTime: new Date(Date.now() - 1 * 86400000 + 18000 * 1000),
          xpEarned: 100,
        },
        {
          userId: user.id,
          subject: 'System Design',
          durationSeconds: 14400, // 4h
          startTime: new Date(Date.now() - 2 * 86400000),
          endTime: new Date(Date.now() - 2 * 86400000 + 14400 * 1000),
          xpEarned: 80,
        },
        {
          userId: user.id,
          subject: 'LeetCode',
          durationSeconds: 10800, // 3h
          startTime: new Date(Date.now() - 3 * 86400000),
          endTime: new Date(Date.now() - 3 * 86400000 + 10800 * 1000),
          xpEarned: 60,
        },
      ],
    });
  }

  // 3. LeetCode Problems (Total 77: Easy: 42, Medium: 31, Hard: 4; Daily: 4 / 5)
  const existingLC = await prisma.leetCodeProblem.count({ where: { userId: user.id } });
  if (existingLC === 0) {
    const today = new Date();
    // 4 Solved today
    await prisma.leetCodeProblem.createMany({
      data: [
        { userId: user.id, problemNumber: 1, title: 'Two Sum', difficulty: 'EASY', topic: 'Arrays', solvedAt: today, timeTakenMinutes: 12, xpEarned: 10 },
        { userId: user.id, problemNumber: 15, title: '3Sum', difficulty: 'MEDIUM', topic: 'Two Pointers', solvedAt: today, timeTakenMinutes: 28, xpEarned: 20 },
        { userId: user.id, problemNumber: 125, title: 'Valid Palindrome', difficulty: 'EASY', topic: 'Strings', solvedAt: today, timeTakenMinutes: 10, xpEarned: 10 },
        { userId: user.id, problemNumber: 560, title: 'Subarray Sum Equals K', difficulty: 'MEDIUM', topic: 'Hashing', solvedAt: today, timeTakenMinutes: 25, xpEarned: 20 },
        // Sample of remaining 73 historical problems
        { userId: user.id, problemNumber: 42, title: 'Trapping Rain Water', difficulty: 'HARD', topic: 'Two Pointers', solvedAt: new Date(Date.now() - 2 * 86400000), timeTakenMinutes: 45, xpEarned: 40 },
        { userId: user.id, problemNumber: 23, title: 'Merge k Sorted Lists', difficulty: 'HARD', topic: 'Heap', solvedAt: new Date(Date.now() - 4 * 86400000), timeTakenMinutes: 50, xpEarned: 40 },
        { userId: user.id, problemNumber: 76, title: 'Minimum Window Substring', difficulty: 'HARD', topic: 'Sliding Window', solvedAt: new Date(Date.now() - 6 * 86400000), timeTakenMinutes: 40, xpEarned: 40 },
        { userId: user.id, problemNumber: 84, title: 'Largest Rectangle in Histogram', difficulty: 'HARD', topic: 'Stack', solvedAt: new Date(Date.now() - 8 * 86400000), timeTakenMinutes: 48, xpEarned: 40 },
      ],
    });
  }

  // 4. DSA Topics (20 topics with progress: Arrays 100%, Strings 70%, Trees 40%, etc.)
  const existingDSA = await prisma.dsaTopic.count({ where: { userId: user.id } });
  if (existingDSA === 0) {
    for (const dt of DSA_TOPICS) {
      let progress = 35;
      let solved = 8;
      let confidence = 60;
      let revisionStatus = 'PENDING';

      if (dt.key === 'arrays') {
        progress = 100;
        solved = 30;
        confidence = 95;
        revisionStatus = 'MASTERED';
      } else if (dt.key === 'strings') {
        progress = 70;
        solved = 18;
        confidence = 80;
        revisionStatus = 'REVIEWED';
      } else if (dt.key === 'trees') {
        progress = 40;
        solved = 14;
        confidence = 50;
        revisionStatus = 'PENDING';
      } else if (dt.key === 'dp') {
        progress = 25;
        solved = 10;
        confidence = 40;
        revisionStatus = 'PENDING';
      }

      await prisma.dsaTopic.create({
        data: {
          userId: user.id,
          topicKey: dt.key,
          name: dt.name,
          progressPercent: progress,
          problemsSolved: solved,
          totalProblemsTarget: dt.defaultTarget,
          confidence,
          revisionStatus,
          notes: dt.key === 'arrays' ? 'Mastered Kadane, Dutch National Flag, and Next Permutation.' : null,
        },
      });
    }
  }

  // 5. Habits & Completions (8 / 10 today)
  const existingHabits = await prisma.habit.count({ where: { userId: user.id } });
  if (existingHabits === 0) {
    const todayStr = formatDateToYYYYMMDD(new Date());

    for (let i = 0; i < PRESET_HABITS.length; i++) {
      const h = PRESET_HABITS[i];
      const habit = await prisma.habit.create({
        data: {
          userId: user.id,
          name: h.name,
          category: h.category,
          icon: h.icon,
          color: h.color,
          currentStreak: 12 + (i % 6),
          longestStreak: 20 + (i % 10),
        },
      });

      // Complete 8 out of 10 today
      if (i < 8) {
        await prisma.habitCompletion.create({
          data: {
            habitId: habit.id,
            date: todayStr,
            completed: true,
          },
        });
      }

      // Add last 7 days completions for heatmap
      for (let day = 1; day <= 7; day++) {
        if ((i + day) % 3 !== 0) {
          const pastDate = new Date();
          pastDate.setDate(pastDate.getDate() - day);
          await prisma.habitCompletion.create({
            data: {
              habitId: habit.id,
              date: formatDateToYYYYMMDD(pastDate),
              completed: true,
            },
          });
        }
      }
    }
  }

  // 6. Water Entries (2.4L / 3L = 80%)
  const todayStr = formatDateToYYYYMMDD(new Date());
  const existingWater = await prisma.waterEntry.count({
    where: { userId: user.id, date: todayStr },
  });
  if (existingWater === 0) {
    await prisma.waterEntry.createMany({
      data: [
        { userId: user.id, date: todayStr, amountMl: 500 },
        { userId: user.id, date: todayStr, amountMl: 500 },
        { userId: user.id, date: todayStr, amountMl: 750 },
        { userId: user.id, date: todayStr, amountMl: 650 },
      ],
    });
  }

  // 7. Tasks (7 / 9 completed today)
  const existingTasks = await prisma.task.count({ where: { userId: user.id } });
  if (existingTasks === 0) {
    const taskList = [
      { title: 'Solve 4 LeetCode Array Problems', category: 'Coding', priority: 'HIGH', status: 'COMPLETED', estimatedMinutes: 60, actualMinutes: 65 },
      { title: 'Watch Striver L1-L3 Arrays', category: 'Study', priority: 'HIGH', status: 'COMPLETED', estimatedMinutes: 135, actualMinutes: 135 },
      { title: 'Revise DBMS ACID Properties', category: 'Revision', priority: 'URGENT', status: 'COMPLETED', estimatedMinutes: 45, actualMinutes: 40 },
      { title: 'Implement Dutch National Flag in C++', category: 'Coding', priority: 'MEDIUM', status: 'COMPLETED', estimatedMinutes: 30, actualMinutes: 25 },
      { title: 'Review System Design Rate Limiter paper', category: 'Study', priority: 'MEDIUM', status: 'COMPLETED', estimatedMinutes: 45, actualMinutes: 45 },
      { title: 'Drink 2.5L Water Goal milestone', category: 'Health', priority: 'LOW', status: 'COMPLETED', estimatedMinutes: 5, actualMinutes: 5 },
      { title: 'Push daily commits to GitHub', category: 'Project', priority: 'LOW', status: 'COMPLETED', estimatedMinutes: 15, actualMinutes: 10 },
      { title: 'Solve Binary Trees Diameter on LeetCode', category: 'Coding', priority: 'HIGH', status: 'IN_PROGRESS', estimatedMinutes: 45, actualMinutes: 0 },
      { title: 'Revise Computer Networks Transport Layer (TCP vs UDP)', category: 'Revision', priority: 'URGENT', status: 'TODO', estimatedMinutes: 30, actualMinutes: 0 },
    ];

    for (const t of taskList) {
      await prisma.task.create({
        data: {
          userId: user.id,
          ...t,
          completedAt: t.status === 'COMPLETED' ? new Date() : null,
        },
      });
    }
  }

  // 8. Revisions Due Today (Requirement 19: Binary Search, DBMS Normalization, Trees, CN Transport Layer)
  const existingRevisions = await prisma.revision.count({ where: { userId: user.id } });
  if (existingRevisions === 0) {
    const today = new Date();
    await prisma.revision.createMany({
      data: [
        { userId: user.id, title: 'Binary Search Predicate Functions', subjectOrTopic: 'DSA', referenceType: 'DSA_TOPIC', intervalDays: 3, scheduledFor: today, completed: false, notes: 'Lower bound, Upper bound, Search space reduction' },
        { userId: user.id, title: 'DBMS Normalization (1NF, 2NF, 3NF, BCNF)', subjectOrTopic: 'DBMS', referenceType: 'GENERAL', intervalDays: 7, scheduledFor: today, completed: false, notes: 'Functional dependencies, lossless join decomposition' },
        { userId: user.id, title: 'Trees: Diameter & LCA logic', subjectOrTopic: 'DSA', referenceType: 'DSA_TOPIC', intervalDays: 3, scheduledFor: today, completed: false, notes: 'Morris Traversal O(1) space review' },
        { userId: user.id, title: 'CN Transport Layer (TCP 3-way handshake & Flow Control)', subjectOrTopic: 'Computer Networks', referenceType: 'GENERAL', intervalDays: 14, scheduledFor: today, completed: false, notes: 'Sliding window protocol, Congestion window' },
      ],
    });
  }

  // 9. Goals (Requirement 15)
  const existingGoals = await prisma.goal.count({ where: { userId: user.id } });
  if (existingGoals === 0) {
    const g1 = await prisma.goal.create({
      data: {
        userId: user.id,
        title: 'Complete Striver A2Z Roadmap',
        description: 'Finish all 30 fundamental DSA roadmap videos and problem sets.',
        category: 'PLAYLIST',
        targetValue: 30,
        currentValue: 3,
        unit: 'videos',
        startDate: new Date(Date.now() - 5 * 86400000),
        deadline: new Date(Date.now() + 25 * 86400000),
      },
    });

    await prisma.goalMilestone.createMany({
      data: [
        { goalId: g1.id, title: 'Complete Step 1: Basics & Math', targetValue: 5, completed: false },
        { goalId: g1.id, title: 'Complete Step 2: Sorting & Arrays Medium', targetValue: 15, completed: false },
        { goalId: g1.id, title: 'Complete Step 3: Binary Search & Trees', targetValue: 25, completed: false },
      ],
    });

    await prisma.goal.create({
      data: {
        userId: user.id,
        title: 'Solve 100 LeetCode Problems',
        description: 'Achieve 100 total solved problems before placement season begins.',
        category: 'LEETCODE',
        targetValue: 100,
        currentValue: 77,
        unit: 'problems',
        startDate: new Date(Date.now() - 30 * 86400000),
        deadline: new Date(Date.now() + 15 * 86400000),
      },
    });

    await prisma.goal.create({
      data: {
        userId: user.id,
        title: 'Study 150 Hours in October',
        description: 'Maintain deep work discipline of 5+ hours daily.',
        category: 'STUDY_HOURS',
        targetValue: 150,
        currentValue: 84.5,
        unit: 'hours',
        startDate: new Date(Date.now() - 14 * 86400000),
        deadline: new Date(Date.now() + 17 * 86400000),
      },
    });
  }

  // 10. Placement Preparation (Requirement 29, 30, 31)
  const existingCompanies = await prisma.placementCompany.count({ where: { userId: user.id } });
  if (existingCompanies === 0) {
    await prisma.placementCompany.createMany({
      data: [
        {
          userId: user.id,
          name: 'Amazon',
          role: 'SDE 1 (Full Time)',
          stage: 'OA',
          dsaPrepPercent: 70,
          coreCsPrepPercent: 60,
          systemDesignPrepPercent: 45,
          behavioralPrepPercent: 65,
          notes: 'Prepare 14 Leadership Principles with STAR method stories. Focus on Trees, Graphs & DP.',
        },
        {
          userId: user.id,
          name: 'Google',
          role: 'Software Engineer (Early Career)',
          stage: 'APPLICATION',
          dsaPrepPercent: 80,
          coreCsPrepPercent: 70,
          systemDesignPrepPercent: 50,
          behavioralPrepPercent: 40,
          notes: 'High emphasis on clean code, optimal time/space complexity, and graphs/greedy.',
        },
        {
          userId: user.id,
          name: 'Microsoft',
          role: 'Software Engineer',
          stage: 'CODING',
          dsaPrepPercent: 75,
          coreCsPrepPercent: 70,
          systemDesignPrepPercent: 60,
          behavioralPrepPercent: 75,
          notes: 'Core OS concepts (threads, deadlocks) and Trees/Linked Lists questions.',
        },
      ],
    });

    await prisma.mockTest.createMany({
      data: [
        {
          userId: user.id,
          title: 'LeetCode Biweekly Contest 138',
          platform: 'LeetCode',
          score: 12,
          maxScore: 18,
          durationMinutes: 90,
          topicsTested: 'Prefix Sum, Sliding Window, DP on Trees',
          mistakesAnalysis: 'TLE on Q3 due to quadratic state transitions; need to optimize with mono-stack.',
          difficulty: 'Medium-Hard',
        },
        {
          userId: user.id,
          title: 'Amazon Online Assessment Simulation #2',
          platform: 'HackerRank',
          score: 95,
          maxScore: 100,
          durationMinutes: 70,
          topicsTested: 'Arrays, Two Pointers, String manipulation',
          mistakesAnalysis: 'Passed all 15/15 testcases with 15 mins to spare.',
          difficulty: 'Medium',
        },
      ],
    });
  }

  // 11. Notes (Requirement 20)
  const existingNotes = await prisma.note.count({ where: { userId: user.id } });
  if (existingNotes === 0) {
    await prisma.note.create({
      data: {
        userId: user.id,
        title: 'Binary Search: Lower Bound, Upper Bound & Search Space Reduction',
        content: `### Binary Search Notes & Cheatsheet

#### 1. Avoid Integer Overflow
\`\`\`cpp
int mid = low + (high - low) / 2;
\`\`\`

#### 2. Lower Bound Condition
Smallest index \`idx\` such that \`arr[idx] >= target\`:
\`\`\`cpp
int low = 0, high = n - 1, ans = n;
while (low <= high) {
    int mid = low + (high - low) / 2;
    if (arr[mid] >= target) {
        ans = mid;
        high = mid - 1; // look for smaller index on left
    } else {
        low = mid + 1;
    }
}
\`\`\`

#### 3. Search Space Reduction on Answers
When monotonic predicate \`f(x)\` holds, we can search on answer range \`[min_val, max_val]\` (e.g., Koko Eating Bananas, Book Allocation, Capacity to Ship Packages).`,
        tags: 'binary_search,dsa,algorithms',
        relatedType: 'DSA_TOPIC',
        isPinned: true,
      },
    });
  }

  // 12. Wellness (Sleep, Workout, Reading)
  const existingWellness = await prisma.wellnessEntry.count({
    where: { userId: user.id, date: todayStr },
  });
  if (existingWellness === 0) {
    await prisma.wellnessEntry.create({
      data: {
        userId: user.id,
        date: todayStr,
        sleepHours: 7.8,
        sleepQuality: 4,
        workoutMinutes: 45,
        workoutType: 'Strength & Core',
        readingMinutes: 30,
        readingBook: 'Designing Data-Intensive Applications',
        readingPages: 22,
      },
    });
  }

  // 13. Notifications
  const existingNotifications = await prisma.notification.count({ where: { userId: user.id } });
  if (existingNotifications === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: user.id, title: 'Revision Due Today', message: 'Binary Search & DBMS Normalization revisions are due today.', type: 'REVISION', actionUrl: '/revisions' },
        { userId: user.id, title: 'LeetCode Target', message: '1 LeetCode problem remaining to achieve your daily target of 5.', type: 'SYSTEM', actionUrl: '/leetcode' },
        { userId: user.id, title: 'Playlist Progress', message: 'You completed 3 videos in Striver A2Z. 22h 15m remaining.', type: 'SYNC', actionUrl: '/playlists' },
      ],
    });
  }

  return { success: true, message: 'Study OS demo environment successfully seeded!' };
}
