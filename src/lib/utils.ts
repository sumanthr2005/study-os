import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  if (mins > 0) {
    return secs > 0 && hrs === 0 && mins < 5 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  return `${secs}s`;
}

export function formatDurationDetailed(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 hours 0 minutes';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
}

export function formatSecondsToClock(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  const hh = hrs.toString().padStart(2, '0');
  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');

  return hrs > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDateToYYYYMMDD(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface PlaylistMetrics {
  totalVideos: number;
  completedVideos: number;
  videoProgressPercent: number;
  totalDurationSeconds: number;
  completedDurationSeconds: number;
  timeProgressPercent: number;
  remainingDurationSeconds: number;
  daysRemaining: number;
  requiredDailySeconds: number;
  estimatedCompletionDate: Date | null;
  currentDailyPaceSeconds: number;
  paceDifferenceSeconds: number;
  statusLabel: string;
}

export function calculatePlaylistMetrics(
  totalVideos: number,
  completedVideos: number,
  totalDurationSeconds: number,
  completedDurationSeconds: number,
  targetDate: Date | string | null | undefined,
  historicalDailyAverageSeconds: number = 0
): PlaylistMetrics {
  const videoProgressPercent = totalVideos > 0 
    ? Math.round((completedVideos / totalVideos) * 1000) / 10 
    : 0;

  const timeProgressPercent = totalDurationSeconds > 0 
    ? Math.round((completedDurationSeconds / totalDurationSeconds) * 1000) / 10 
    : 0;

  const remainingDurationSeconds = Math.max(0, totalDurationSeconds - completedDurationSeconds);

  let daysRemaining = 0;
  let requiredDailySeconds = 0;
  let statusLabel = 'On Track';

  if (targetDate) {
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    if (diffTime < 0) {
      statusLabel = 'Target date passed';
      daysRemaining = 0;
      requiredDailySeconds = remainingDurationSeconds; // Need to finish ASAP
    } else {
      requiredDailySeconds = Math.round(remainingDurationSeconds / daysRemaining);
    }
  }

  // Current pace based on historical daily study time (or default 2h if not enough data)
  const currentDailyPaceSeconds = historicalDailyAverageSeconds > 0 ? historicalDailyAverageSeconds : 7200; // 2h fallback

  let estimatedCompletionDate: Date | null = null;
  if (remainingDurationSeconds > 0 && currentDailyPaceSeconds > 0) {
    const daysNeeded = Math.ceil(remainingDurationSeconds / currentDailyPaceSeconds);
    const est = new Date();
    est.setDate(est.getDate() + daysNeeded);
    estimatedCompletionDate = est;
  }

  const paceDifferenceSeconds = requiredDailySeconds - currentDailyPaceSeconds;
  if (daysRemaining > 0) {
    if (paceDifferenceSeconds > 600) {
      const behindMin = Math.round(paceDifferenceSeconds / 60);
      statusLabel = `${behindMin} min/day behind target`;
    } else if (paceDifferenceSeconds < -600) {
      const aheadMin = Math.round(Math.abs(paceDifferenceSeconds) / 60);
      statusLabel = `${aheadMin} min/day ahead of schedule`;
    } else {
      statusLabel = 'On Track';
    }
  }

  return {
    totalVideos,
    completedVideos,
    videoProgressPercent,
    totalDurationSeconds,
    completedDurationSeconds,
    timeProgressPercent,
    remainingDurationSeconds,
    daysRemaining,
    requiredDailySeconds,
    estimatedCompletionDate,
    currentDailyPaceSeconds,
    paceDifferenceSeconds,
    statusLabel,
  };
}

export interface ProductivityScoreResult {
  totalScore: number;
  studyComponent: number;
  codingComponent: number;
  learningComponent: number;
  habitsComponent: number;
  healthComponent: number;
  explanation: string[];
}

export function calculateProductivityScore(
  data: {
    actualStudyMinutes: number;
    studyGoalMinutes: number;
    leetcodeSolvedToday: number;
    leetcodeGoalToday: number;
    videosCompletedToday: number;
    videosGoalToday: number;
    habitsCompletedToday: number;
    totalHabitsToday: number;
    waterDrankMl: number;
    waterGoalMl: number;
  },
  weights = {
    study: 40,
    coding: 20,
    learning: 15,
    habits: 15,
    health: 10,
  }
): ProductivityScoreResult {
  const studyRatio = Math.min(1.2, data.studyGoalMinutes > 0 ? data.actualStudyMinutes / data.studyGoalMinutes : 0);
  const codingRatio = Math.min(1.2, data.leetcodeGoalToday > 0 ? data.leetcodeSolvedToday / data.leetcodeGoalToday : 0);
  const learningRatio = Math.min(1.2, data.videosGoalToday > 0 ? data.videosCompletedToday / data.videosGoalToday : 0);
  const habitsRatio = Math.min(1.0, data.totalHabitsToday > 0 ? data.habitsCompletedToday / data.totalHabitsToday : 0);
  const waterRatio = Math.min(1.0, data.waterGoalMl > 0 ? data.waterDrankMl / data.waterGoalMl : 0);

  const studyScore = Math.round(studyRatio * weights.study);
  const codingScore = Math.round(codingRatio * weights.coding);
  const learningScore = Math.round(learningRatio * weights.learning);
  const habitsScore = Math.round(habitsRatio * weights.habits);
  const healthScore = Math.round(waterRatio * weights.health);

  const totalScore = Math.min(100, studyScore + codingScore + learningScore + habitsScore + healthScore);

  const explanation: string[] = [
    `Study Time: ${studyScore}/${weights.study} pts (${Math.round(data.actualStudyMinutes / 60 * 10) / 10}h / ${Math.round(data.studyGoalMinutes / 60)}h goal)`,
    `Coding (LeetCode): ${codingScore}/${weights.coding} pts (${data.leetcodeSolvedToday}/${data.leetcodeGoalToday} problems)`,
    `Playlist Learning: ${learningScore}/${weights.learning} pts (${data.videosCompletedToday}/${data.videosGoalToday} videos)`,
    `Habits Completed: ${habitsScore}/${weights.habits} pts (${data.habitsCompletedToday}/${data.totalHabitsToday} habits)`,
    `Hydration & Health: ${healthScore}/${weights.health} pts (${(data.waterDrankMl / 1000).toFixed(1)}L / ${(data.waterGoalMl / 1000).toFixed(1)}L)`,
  ];

  return {
    totalScore,
    studyComponent: studyScore,
    codingComponent: codingScore,
    learningComponent: learningScore,
    habitsComponent: habitsScore,
    healthComponent: healthScore,
    explanation,
  };
}

export function calculateLevel(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progressPercent: number } {
  // Each level requires 250 XP
  const xpPerLevel = 250;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const currentLevelXp = xp % xpPerLevel;
  const nextLevelXp = xpPerLevel;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));

  return { level, currentLevelXp, nextLevelXp, progressPercent };
}
