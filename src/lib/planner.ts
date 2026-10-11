import { differenceInCalendarDays, startOfDay } from 'date-fns';

export interface PlaylistCalculationMetrics {
  totalVideos: number;
  completedVideos: number;
  videoCountProgressPercent: number;
  totalDurationSeconds: number;
  completedDurationSeconds: number;
  durationProgressPercent: number;
  remainingDurationSeconds: number;
  remainingDurationHours: number;
  remainingVideosCount: number;
  targetCompletionDate: Date | null;
  daysRemaining: number | null;
  requiredDailyStudySeconds: number;
  requiredDailyStudyHours: number;
  requiredDailyStudyMinutes: number;
  estimatedCompletionDaysAtConfiguredPace: number;
  estimatedCompletionDateAtConfiguredPace: Date;
  paceStatus: 'completed' | 'ahead' | 'on_track' | 'behind' | 'no_target' | 'overdue';
}

/**
 * Calculates accurate playlist progress, remaining content time, target date constraints,
 * and required daily study hours.
 * 
 * Strict rule: YouTube video content duration is separate from actual study session time.
 */
export function calculatePlaylistPlanMetrics(params: {
  videos: Array<{
    durationSeconds: number;
    completed: boolean;
    isUnavailable?: boolean;
  }>;
  targetCompletionDate?: Date | string | null;
  availableStudyHoursPerDay?: number;
}): PlaylistCalculationMetrics {
  const { videos, targetCompletionDate, availableStudyHoursPerDay = 2.0 } = params;

  // Active videos (exclude permanently unavailable videos from pending workload if needed, but keep records)
  const activeVideos = videos.filter(v => !v.isUnavailable);
  const totalVideos = activeVideos.length;
  const completedVideos = activeVideos.filter(v => v.completed).length;

  const totalDurationSeconds = activeVideos.reduce((acc, v) => acc + (v.durationSeconds || 0), 0);
  const completedDurationSeconds = activeVideos
    .filter(v => v.completed)
    .reduce((acc, v) => acc + (v.durationSeconds || 0), 0);

  const remainingDurationSeconds = Math.max(0, totalDurationSeconds - completedDurationSeconds);
  const remainingDurationHours = remainingDurationSeconds / 3600;
  const remainingVideosCount = Math.max(0, totalVideos - completedVideos);

  const videoCountProgressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  const durationProgressPercent = totalDurationSeconds > 0
    ? Math.round((completedDurationSeconds / totalDurationSeconds) * 100)
    : 0;

  // Target Date calculations
  const parsedTargetDate = targetCompletionDate ? new Date(targetCompletionDate) : null;
  const today = startOfDay(new Date());

  let daysRemaining: number | null = null;
  let requiredDailyStudySeconds = 0;
  let requiredDailyStudyHours = 0;
  let requiredDailyStudyMinutes = 0;
  let paceStatus: PlaylistCalculationMetrics['paceStatus'] = 'no_target';

  if (completedVideos === totalVideos && totalVideos > 0) {
    paceStatus = 'completed';
  } else if (parsedTargetDate && !isNaN(parsedTargetDate.getTime())) {
    const targetStart = startOfDay(parsedTargetDate);
    daysRemaining = differenceInCalendarDays(targetStart, today);

    if (daysRemaining <= 0) {
      // Overdue or due today
      paceStatus = 'overdue';
      // If due today (0 days), required study is the entire remaining content
      daysRemaining = Math.max(1, daysRemaining);
      requiredDailyStudySeconds = remainingDurationSeconds;
      requiredDailyStudyHours = remainingDurationHours;
      requiredDailyStudyMinutes = Math.round(remainingDurationHours * 60);
    } else {
      requiredDailyStudySeconds = Math.round(remainingDurationSeconds / daysRemaining);
      requiredDailyStudyHours = Number((remainingDurationHours / daysRemaining).toFixed(2));
      requiredDailyStudyMinutes = Math.round((remainingDurationHours / daysRemaining) * 60);

      if (requiredDailyStudyHours <= availableStudyHoursPerDay * 0.8) {
        paceStatus = 'ahead';
      } else if (requiredDailyStudyHours <= availableStudyHoursPerDay * 1.15) {
        paceStatus = 'on_track';
      } else {
        paceStatus = 'behind';
      }
    }
  }

  // Estimated completion based on user's available study hours per day
  const effectivePaceHours = Math.max(0.5, availableStudyHoursPerDay);
  const estimatedCompletionDaysAtConfiguredPace = Math.ceil(remainingDurationHours / effectivePaceHours);
  const estimatedCompletionDateAtConfiguredPace = new Date();
  estimatedCompletionDateAtConfiguredPace.setDate(
    estimatedCompletionDateAtConfiguredPace.getDate() + estimatedCompletionDaysAtConfiguredPace
  );

  return {
    totalVideos,
    completedVideos,
    videoCountProgressPercent,
    totalDurationSeconds,
    completedDurationSeconds,
    durationProgressPercent,
    remainingDurationSeconds,
    remainingDurationHours,
    remainingVideosCount,
    targetCompletionDate: parsedTargetDate,
    daysRemaining,
    requiredDailyStudySeconds,
    requiredDailyStudyHours,
    requiredDailyStudyMinutes,
    estimatedCompletionDaysAtConfiguredPace,
    estimatedCompletionDateAtConfiguredPace,
    paceStatus,
  };
}
