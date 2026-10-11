export interface StudyPlanItem {
  id: string;
  title: string;
  category: string;
  allocatedMinutes: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';
  reason: string;
  type: 'REVISION' | 'PLAYLIST_VIDEO' | 'TASK' | 'LEETCODE' | 'DSA_TOPIC';
  referenceId?: string;
}

export interface GeneratedStudyPlan {
  totalAvailableMinutes: number;
  totalPlannedMinutes: number;
  items: StudyPlanItem[];
  rationale: string;
  pacingAdvice: string;
}

export interface WeeklyReviewResult {
  periodLabel: string;
  totalStudyHours: number;
  leetcodeProblemsSolved: number;
  videosCompleted: number;
  habitCompletionRate: number;
  strongestArea: string;
  needsImprovementArea: string;
  recommendations: string[];
  summaryNarrative: string;
}

export interface AIProvider {
  name: string;
  generateStudyPlan(context: {
    availableMinutes: number;
    tasks: Array<{ id: string; title: string; priority: string; deadline?: Date | null; estimatedMinutes: number; isRevision?: boolean }>;
    revisionsDue: Array<{ id: string; title: string; subjectOrTopic: string }>;
    playlistVideosDue: Array<{ id: string; title: string; durationSeconds: number; playlistTitle: string }>;
    weakDSATopics: Array<{ name: string; confidence: number; problemsSolved: number }>;
    leetcodeTargetDaily: number;
    leetcodeSolvedToday: number;
  }): Promise<GeneratedStudyPlan>;

  analyzeWeeklyProgress(data: {
    studySessions: Array<{ subject: string; durationSeconds: number }>;
    leetcodeCount: number;
    videosCompletedCount: number;
    habitsCompletedPercent: number;
    dsaTopics: Array<{ name: string; confidence: number }>;
  }): Promise<WeeklyReviewResult>;

  generateRevisionQuestions(topic: string): Promise<string[]>;
}

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

    // Group study by subject
    const subjectMap: Record<string, number> = {};
    for (const s of data.studySessions) {
      subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.durationSeconds;
    }

    let strongestArea = 'DSA';
    let maxStudySecs = 0;
    for (const [sub, secs] of Object.entries(subjectMap)) {
      if (secs > maxStudySecs) {
        maxStudySecs = secs;
        strongestArea = sub;
      }
    }

    // Identify weak DSA topic
    const sortedTopics = [...data.dsaTopics].sort((a, b) => a.confidence - b.confidence);
    const needsImprovementArea = sortedTopics.length > 0 ? sortedTopics[0].name : 'System Design';

    const recommendations = [
      `Maintain your current ${strongestArea} consistency; you spent over ${Math.round(maxStudySecs / 3600)}h on it this week.`,
      `Allocate at least 3 dedicated revision blocks for ${needsImprovementArea} in the coming 7 days.`,
      data.leetcodeCount >= 20 
        ? `Great coding volume (${data.leetcodeCount} solved)! Shift 30% of problems to Medium/Hard tier.`
        : `Aim to increase LeetCode problem cadence by 1 additional problem per day.`,
      data.habitsCompletedPercent >= 80 
        ? `Outstanding habit discipline (${data.habitsCompletedPercent}% completion rate). Keep your sleep and hydration locked in.`
        : `Habit compliance was ${data.habitsCompletedPercent}%. Focus on anchoring your study sessions to a fixed morning routine.`,
    ];

    return {
      periodLabel: 'Past 7 Days Review',
      totalStudyHours,
      leetcodeProblemsSolved: data.leetcodeCount,
      videosCompleted: data.videosCompletedCount,
      habitCompletionRate: data.habitsCompletedPercent,
      strongestArea,
      needsImprovementArea,
      recommendations,
      summaryNarrative: `You logged ${totalStudyHours} hours of actual study time across ${data.studySessions.length} sessions, solved ${data.leetcodeCount} coding problems, and completed ${data.videosCompletedCount} playlist roadmap videos. Your primary focus was ${strongestArea}, while ${needsImprovementArea} represents your highest leverage improvement opportunity for placement preparation.`,
    };
  }

  async generateRevisionQuestions(topic: string): Promise<string[]> {
    const questionBank: Record<string, string[]> = {
      'Binary Search': [
        'How do you calculate mid safely to prevent integer overflow?',
        'What is the difference between lower_bound and upper_bound condition logic?',
        'Can binary search be applied on a non-monotonic predicate function?',
        'Explain the search space reduction logic in Rotated Sorted Array.',
      ],
      'Trees': [
        'What is the difference between recursion call stack space and Morris Traversal for O(1) space?',
        'How do you compute the diameter of a binary tree in single O(N) post-order pass?',
        'Explain LCA (Lowest Common Ancestor) logic for Binary Tree vs BST.',
      ],
      'Dynamic Programming': [
        'How do you identify optimal substructure and overlapping subproblems?',
        'Walk through space optimization from 2D DP matrix to 1D rolling array in 0/1 Knapsack.',
        'What is the difference between Subsequence and Substring recurrence relations?',
      ],
    };

    return questionBank[topic] || [
      `What are the core time and space complexities associated with ${topic}?`,
      `What edge cases frequently fail interview test cases in ${topic}?`,
      `How does ${topic} compare to its most common alternative data structure or algorithm?`,
      `Explain the step-by-step intuition behind the optimal solution for a standard ${topic} problem.`,
    ];
  }
}

/**
 * Cloud LLM Provider (Optional OpenAI / Gemini)
 * Falls back to RuleBasedAIProvider if keys are absent or API call fails.
 */
export class CloudAIProvider implements AIProvider {
  name = 'Cloud LLM Assistant';
  private fallback = new RuleBasedAIProvider();

  async generateStudyPlan(context: any): Promise<GeneratedStudyPlan> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return this.fallback.generateStudyPlan(context);
    }

    try {
      if (process.env.OPENAI_API_KEY) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an elite study strategist for Study OS. Given study time and tasks, generate a structured study schedule in JSON.',
              },
              {
                role: 'user',
                content: JSON.stringify(context),
              },
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const parsed = JSON.parse(json.choices[0].message.content);
          if (parsed.items && Array.isArray(parsed.items)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Cloud LLM call failed; using rule-based fallback engine:', e);
    }

    return this.fallback.generateStudyPlan(context);
  }

  async analyzeWeeklyProgress(data: any): Promise<WeeklyReviewResult> {
    return this.fallback.analyzeWeeklyProgress(data);
  }

  async generateRevisionQuestions(topic: string): Promise<string[]> {
    return this.fallback.generateRevisionQuestions(topic);
  }
}

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || 'rule-based';
  if (providerType === 'openai' || providerType === 'gemini') {
    return new CloudAIProvider();
  }
  return new RuleBasedAIProvider();
}
