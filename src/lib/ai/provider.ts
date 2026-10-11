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
