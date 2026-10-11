import { AIProvider, GeneratedStudyPlan, StudyPlanItem, WeeklyReviewResult } from './provider';

/**
 * Deterministic Rule-Based AI Engine
 * 100% offline, zero latency, guaranteed to produce reliable balanced study schedules.
 */
export class RuleBasedAIProvider implements AIProvider {
  name = 'Rule-Based Intelligence (Offline)';

  async generateStudyPlan(context: {
    availableMinutes: number;
    tasks: Array<{ id: string; title: string; priority: string; deadline?: Date | null; estimatedMinutes: number; isRevision?: boolean }>;
    revisionsDue: Array<{ id: string; title: string; subjectOrTopic: string }>;
    playlistVideosDue: Array<{ id: string; title: string; durationSeconds: number; playlistTitle: string }>;
    weakDSATopics: Array<{ name: string; confidence: number; problemsSolved: number }>;
    leetcodeTargetDaily: number;
    leetcodeSolvedToday: number;
  }): Promise<GeneratedStudyPlan> {
    const items: StudyPlanItem[] = [];
    let remainingMinutes = context.availableMinutes;

    // 1. Overdue or Urgent Tasks & Revisions (Priority 1)
    for (const rev of context.revisionsDue) {
      if (remainingMinutes < 20) break;
      const alloc = Math.min(30, remainingMinutes);
      items.push({
        id: `rev-${rev.id}`,
        title: `Spaced Revision: ${rev.title} (${rev.subjectOrTopic})`,
        category: 'Revision',
        allocatedMinutes: alloc,
        priority: 'CRITICAL',
        reason: 'Spaced repetition schedule indicates memory retention decay is due today.',
        type: 'REVISION',
        referenceId: rev.id,
      });
      remainingMinutes -= alloc;
    }

    // 2. Urgent / High Priority Tasks
    const urgentTasks = context.tasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH');
    for (const task of urgentTasks) {
      if (remainingMinutes < 20) break;
      const alloc = Math.min(task.estimatedMinutes || 45, remainingMinutes);
      items.push({
        id: `task-${task.id}`,
        title: task.title,
        category: 'Task',
        allocatedMinutes: alloc,
        priority: 'HIGH',
        reason: `High priority task scheduled before deadline.`,
        type: 'TASK',
        referenceId: task.id,
      });
      remainingMinutes -= alloc;
    }

    // 3. LeetCode Coding Target
    const leetcodeRemaining = Math.max(0, context.leetcodeTargetDaily - context.leetcodeSolvedToday);
    if (leetcodeRemaining > 0 && remainingMinutes >= 30) {
      const alloc = Math.min(leetcodeRemaining * 20, Math.min(60, remainingMinutes));
      items.push({
        id: 'lc-daily',
        title: `LeetCode Practice (${leetcodeRemaining} problems remaining)`,
        category: 'Coding',
        allocatedMinutes: alloc,
        priority: 'HIGH',
        reason: `Maintain problem-solving streak and daily target of ${context.leetcodeTargetDaily} problems.`,
        type: 'LEETCODE',
      });
      remainingMinutes -= alloc;
    }

    // 4. Active Playlist Video
    for (const vid of context.playlistVideosDue) {
      if (remainingMinutes < 25) break;
      const vidMinutes = Math.ceil(vid.durationSeconds / 60);
      const alloc = Math.min(vidMinutes + 10, remainingMinutes); // Add 10 mins for note-taking/pause
      items.push({
        id: `vid-${vid.id}`,
        title: `${vid.title} (${vid.playlistTitle})`,
        category: 'Learning',
        allocatedMinutes: alloc,
        priority: 'MEDIUM',
        reason: 'Active playlist roadmap milestone to keep completion target on schedule.',
        type: 'PLAYLIST_VIDEO',
        referenceId: vid.id,
      });
      remainingMinutes -= alloc;
      break; // Schedule 1-2 videos per session
    }

    // 5. Weak DSA Topic Practice
    if (context.weakDSATopics.length > 0 && remainingMinutes >= 30) {
      const weakest = context.weakDSATopics[0];
      const alloc = Math.min(45, remainingMinutes);
      items.push({
        id: `dsa-${weakest.name}`,
        title: `Deep Dive: ${weakest.name} (Confidence: ${weakest.confidence}%)`,
        category: 'DSA Practice',
        allocatedMinutes: alloc,
        priority: 'MEDIUM',
        reason: `Your self-rated confidence in ${weakest.name} is low. Targeted practice prevents interview bottlenecks.`,
        type: 'DSA_TOPIC',
      });
      remainingMinutes -= alloc;
    }

    // 6. Remaining Normal Tasks
    const normalTasks = context.tasks.filter(t => t.priority !== 'URGENT' && t.priority !== 'HIGH');
    for (const task of normalTasks) {
      if (remainingMinutes < 15) break;
      const alloc = Math.min(task.estimatedMinutes || 30, remainingMinutes);
      items.push({
        id: `task-${task.id}`,
        title: task.title,
        category: 'Task',
        allocatedMinutes: alloc,
        priority: 'NORMAL',
        reason: 'General study backlog task.',
        type: 'TASK',
        referenceId: task.id,
      });
      remainingMinutes -= alloc;
    }

    const totalPlannedMinutes = context.availableMinutes - remainingMinutes;

    return {
      totalAvailableMinutes: context.availableMinutes,
      totalPlannedMinutes,
      items,
      rationale: `Prioritized ${items.length} key learning blocks strictly within your ${Math.round(context.availableMinutes / 60 * 10) / 10}h time budget, front-loading critical revisions and problem-solving.`,
      pacingAdvice: remainingMinutes > 0 
        ? `You have ${remainingMinutes} mins of buffer time remaining for rest or deeper review.`
        : `Your schedule is packed efficiently. Take 5-minute Pomodoro breaks between blocks.`,
    };
  }

  async analyzeWeeklyProgress(data: {
    studySessions: Array<{ subject: string; durationSeconds: number }>;
    leetcodeCount: number;
    videosCompletedCount: number;
    habitsCompletedPercent: number;
    dsaTopics: Array<{ name: string; confidence: number }>;
  }): Promise<WeeklyReviewResult> {
    const totalSecs = data.studySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalStudyHours = Math.round((totalSecs / 3600) * 10) / 10;

    const sortedTopics = [...data.dsaTopics].sort((a, b) => a.confidence - b.confidence);
    const strongestTopic = sortedTopics[sortedTopics.length - 1]?.name || 'Arrays & Problem Solving';
    const weakestTopic = sortedTopics[0]?.name || 'Dynamic Programming';

    const recommendations = [
      `Maintain consistency: Your habit completion is at ${data.habitsCompletedPercent}%. Target > 85% next week.`,
      `Focus on weak spots: Dedicate a 90-minute deep work block to ${weakestTopic}.`,
      `LeetCode pace: Solved ${data.leetcodeCount} problems this period. Excellent velocity toward placement targets.`,
      `Video lessons: Completed ${data.videosCompletedCount} playlist roadmap videos. Keep taking active notes.`,
    ];

    return {
      periodLabel: 'Past 7 Days Review',
      totalStudyHours,
      leetcodeProblemsSolved: data.leetcodeCount,
      videosCompleted: data.videosCompletedCount,
      habitCompletionRate: data.habitsCompletedPercent,
      strongestArea: `${strongestTopic} (High confidence)`,
      needsImprovementArea: `${weakestTopic} (Needs active revision)`,
      recommendations,
      summaryNarrative: `Strong performance with ${totalStudyHours} hours logged across topics. Your focus in ${strongestTopic} shows clear mastery. Shifting 20% of your time to ${weakestTopic} will round out your interview readiness.`,
    };
  }

  async generateRevisionQuestions(topic: string): Promise<string[]> {
    const sampleQuestions: Record<string, string[]> = {
      Arrays: [
        'How do you find the second largest element in an array in O(N) time with O(1) space?',
        'Explain the Dutch National Flag algorithm for 3-way partitioning.',
        'What is Kadane algorithm and how does it handle arrays with all negative numbers?',
      ],
      'Dynamic Programming': [
        'Explain the difference between Memoization (top-down) and Tabulation (bottom-up).',
        'How do you identify optimal substructure and overlapping subproblems in a problem?',
        'Walk through space optimization from O(N^2) to O(N) in the 0/1 Knapsack problem.',
      ],
      Trees: [
        'What is the Morris Traversal and how does it achieve O(1) space for Inorder traversal?',
        'How do you check if a binary tree is height-balanced in O(N) time?',
        'Explain lowest common ancestor (LCA) in a Binary Tree vs a Binary Search Tree.',
      ],
    };

    return sampleQuestions[topic] || [
      `What are the core time and space complexities for operations on ${topic}?`,
      `What are the common edge cases to watch out for when implementing ${topic}?`,
      `How does ${topic} map to real-world software architecture and database design?`,
    ];
  }
}
