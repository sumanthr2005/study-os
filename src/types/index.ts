export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  dailyStudyTargetMinutes: number;
  leetcodeDailyTarget: number;
  waterDailyTargetMl: number;
  sleepTargetHours: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  studyWeight: number;
  codingWeight: number;
  learningWeight: number;
  habitsWeight: number;
  healthWeight: number;
}

export interface PlaylistVideoItem {
  id: string;
  playlistId: string;
  youtubeVideoId: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  durationSeconds: number;
  position: number;
  publishedAt?: Date | string | null;
  completed: boolean;
  completedAt?: Date | string | null;
  isNew: boolean;
  isUnavailable: boolean;
  notes?: string | null;
  difficulty?: string | null;
  priority?: string | null;
  status: string;
}

export interface PlaylistItem {
  id: string;
  userId: string;
  youtubePlaylistId: string;
  title: string;
  description?: string | null;
  channelTitle?: string | null;
  channelId?: string | null;
  thumbnailUrl?: string | null;
  targetCompletionDate?: Date | string | null;
  availableStudyHoursPerDay: number;
  preferredStudyDays?: string | null;
  maxVideosPerDay?: number | null;
  minVideosPerDay?: number | null;
  totalVideos: number;
  completedVideos: number;
  totalDurationSeconds: number;
  completedDurationSeconds: number;
  lastSyncedAt?: Date | string | null;
  syncFrequency: string;
  isArchived: boolean;
  videos?: PlaylistVideoItem[];
}

export interface StudySessionRecord {
  id: string;
  userId: string;
  subject: string;
  playlistId?: string | null;
  playlistVideoId?: string | null;
  taskId?: string | null;
  mode: string;
  startTime: Date | string;
  endTime: Date | string;
  durationSeconds: number;
  isDeepWork: boolean;
  notes?: string | null;
  xpEarned: number;
  playlist?: { id: string; title: string } | null;
  playlistVideo?: { id: string; title: string } | null;
  task?: { id: string; title: string } | null;
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline?: Date | string | null;
  estimatedMinutes: number;
  actualMinutes: number;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  tags?: string | null;
  playlistId?: string | null;
  playlistVideoId?: string | null;
  goalId?: string | null;
  isRevision: boolean;
  completedAt?: Date | string | null;
}

export interface HabitItem {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  category: string;
  icon?: string | null;
  color?: string | null;
  frequency: string;
  targetDaysPerWeek: number;
  currentStreak: number;
  longestStreak: number;
  isArchived: boolean;
  completions?: Array<{ id: string; date: string; completed: boolean }>;
}

export interface LeetCodeItem {
  id: string;
  userId: string;
  problemNumber?: number | null;
  title: string;
  slug?: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  notes?: string | null;
  solutionUrl?: string | null;
  solvedAt: Date | string;
  timeTakenMinutes?: number | null;
  xpEarned: number;
}

export interface DSATopicItem {
  id: string;
  userId: string;
  topicKey: string;
  name: string;
  progressPercent: number;
  problemsSolved: number;
  totalProblemsTarget: number;
  confidence: number;
  revisionStatus: string;
  lastRevisedAt?: Date | string | null;
  nextRevisionAt?: Date | string | null;
  notes?: string | null;
}

export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date | string;
  deadline: Date | string;
  status: string;
  milestones?: Array<{ id: string; title: string; targetValue: number; completed: boolean }>;
}

export interface RevisionItem {
  id: string;
  userId: string;
  title: string;
  subjectOrTopic: string;
  referenceType: string;
  referenceId?: string | null;
  intervalDays: number;
  scheduledFor: Date | string;
  completed: boolean;
  completedAt?: Date | string | null;
  repetitionNumber: number;
  notes?: string | null;
}

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags?: string | null;
  relatedType: string;
  relatedId?: string | null;
  isPinned: boolean;
  updatedAt: Date | string;
}

export interface PlacementCompanyItem {
  id: string;
  userId: string;
  name: string;
  role: string;
  stage: string;
  targetDate?: Date | string | null;
  dsaPrepPercent: number;
  coreCsPrepPercent: number;
  systemDesignPrepPercent: number;
  behavioralPrepPercent: number;
  notes?: string | null;
}
