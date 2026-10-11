import { prisma } from './db';
import { fetchPlaylistFromYouTube, EXPANDED_STRIVER_VIDEOS } from './youtube';
import { calculatePlaylistPlanMetrics } from './planner';

export interface SyncOptions {
  forceSimulatedExpansion?: boolean;
}

export interface SyncDetails {
  new_videos: number;
  removed_videos: number;
  updated_videos: number;
  total_videos: number;
  completed_videos: number;
  total_duration_seconds: number;
  completed_duration_seconds: number;
  remaining_duration_seconds: number;
  required_daily_study_hours: number;
  details: {
    addedVideoIds: string[];
    unavailableVideoIds: string[];
    preservedCompletedIds: string[];
  };
}

/**
 * Synchronizes an imported YouTube playlist with the database.
 * 
 * Rules enforced:
 * 1. Uses `youtube_video_id` as the primary stable identifier.
 * 2. Playlist reordering updates position without altering `completed` status.
 * 3. Any new videos default to `completed = false`, `isNew = true`.
 * 4. Missing or unavailable videos are marked `isUnavailable = true` and preserved with all history.
 * 5. Totals, durations, remaining content time, and required daily study time are recalculated.
 */
export async function syncPlaylistWithDatabase(
  playlistIdInDb: string,
  options: SyncOptions = {}
): Promise<SyncDetails> {
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistIdInDb },
    include: { videos: true },
  });

  if (!playlist) {
    throw new Error(`Playlist ${playlistIdInDb} not found`);
  }

  // Fetch current videos from YouTube API (or fallback extractor)
  let fetchedData = await fetchPlaylistFromYouTube(playlist.youtubePlaylistId);

  // If simulation requested (e.g. 20 -> 27 test verification), merge extra videos
  if (options.forceSimulatedExpansion) {
    const existingIds = new Set(fetchedData.videos.map(v => v.youtubeVideoId));
    const newVidsToAdd = EXPANDED_STRIVER_VIDEOS.filter(v => !existingIds.has(v.youtubeVideoId));
    fetchedData = {
      ...fetchedData,
      videos: [...fetchedData.videos, ...newVidsToAdd],
    };
  }

  const existingVideoMap = new Map(playlist.videos.map(v => [v.youtubeVideoId, v]));
  const fetchedVideoMap = new Map(fetchedData.videos.map(v => [v.youtubeVideoId, v]));

  let newCount = 0;
  let updatedCount = 0;
  let removedCount = 0;
  const addedVideoIds: string[] = [];
  const unavailableVideoIds: string[] = [];
  const preservedCompletedIds: string[] = [];

  // Step 1: Process fetched videos (updates & additions)
  for (const fv of fetchedData.videos) {
    const existing = existingVideoMap.get(fv.youtubeVideoId);

    if (existing) {
      if (existing.completed) {
        preservedCompletedIds.push(existing.youtubeVideoId);
      }

      // Update metadata and order, STRICTLY preserving completed flag
      await prisma.playlistVideo.update({
        where: { id: existing.id },
        data: {
          title: fv.title,
          description: fv.description || existing.description,
          thumbnailUrl: fv.thumbnailUrl || existing.thumbnailUrl,
          durationSeconds: fv.durationSeconds,
          position: fv.position,
          isUnavailable: false, // restore if it was previously unavailable
        },
      });
      updatedCount++;
    } else {
      // New video added to playlist
      await prisma.playlistVideo.create({
        data: {
          playlistId: playlist.id,
          youtubeVideoId: fv.youtubeVideoId,
          title: fv.title,
          description: fv.description,
          thumbnailUrl: fv.thumbnailUrl,
          durationSeconds: fv.durationSeconds,
          position: fv.position,
          publishedAt: fv.publishedAt,
          completed: false, // New videos default to incomplete
          isNew: true,
          status: 'incomplete',
        },
      });
      newCount++;
      addedVideoIds.push(fv.youtubeVideoId);
    }
  }

  // Step 2: Handle videos present in DB but missing from the latest YouTube fetch
  for (const existing of playlist.videos) {
    if (!fetchedVideoMap.has(existing.youtubeVideoId)) {
      if (!existing.isUnavailable) {
        await prisma.playlistVideo.update({
          where: { id: existing.id },
          data: { isUnavailable: true },
        });
        removedCount++;
        unavailableVideoIds.push(existing.youtubeVideoId);
      }
    }
  }

  // Step 3: Fetch updated collection and recalculate metrics
  const allUpdatedVideos = await prisma.playlistVideo.findMany({
    where: { playlistId: playlist.id },
  });

  const metrics = calculatePlaylistPlanMetrics({
    videos: allUpdatedVideos,
    targetCompletionDate: playlist.targetCompletionDate,
    availableStudyHoursPerDay: playlist.availableStudyHoursPerDay,
  });

  await prisma.playlist.update({
    where: { id: playlist.id },
    data: {
      totalVideos: metrics.totalVideos,
      completedVideos: metrics.completedVideos,
      totalDurationSeconds: metrics.totalDurationSeconds,
      completedDurationSeconds: metrics.completedDurationSeconds,
      lastSyncedAt: new Date(),
    },
  });

  return {
    new_videos: newCount,
    removed_videos: removedCount,
    updated_videos: updatedCount,
    total_videos: metrics.totalVideos,
    completed_videos: metrics.completedVideos,
    total_duration_seconds: metrics.totalDurationSeconds,
    completed_duration_seconds: metrics.completedDurationSeconds,
    remaining_duration_seconds: metrics.remainingDurationSeconds,
    required_daily_study_hours: metrics.requiredDailyStudyHours,
    details: {
      addedVideoIds,
      unavailableVideoIds,
      preservedCompletedIds,
    },
  };
}
