import { extractPlaylistId } from './youtube';

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: string;
}

export function validatePlaylistInput(input: {
  urlOrId: string;
  targetCompletionDate?: string | Date | null;
  availableStudyHoursPerDay?: number;
}): ValidationResult<{
  playlistId: string;
  targetCompletionDate?: Date | null;
  availableStudyHoursPerDay: number;
}> {
  if (!input.urlOrId || typeof input.urlOrId !== 'string') {
    return { isValid: false, error: 'A valid YouTube playlist URL or ID is required.' };
  }

  const playlistId = extractPlaylistId(input.urlOrId);
  if (!playlistId) {
    return {
      isValid: false,
      error: 'Could not extract a valid YouTube playlist ID. Please verify the URL format (e.g. https://www.youtube.com/playlist?list=...).',
    };
  }

  let targetCompletionDate: Date | null = null;
  if (input.targetCompletionDate) {
    const d = new Date(input.targetCompletionDate);
    if (isNaN(d.getTime())) {
      return { isValid: false, error: 'Invalid target completion date provided.' };
    }
    targetCompletionDate = d;
  }

  const hours = typeof input.availableStudyHoursPerDay === 'number' && input.availableStudyHoursPerDay > 0
    ? input.availableStudyHoursPerDay
    : 2.0;

  return {
    isValid: true,
    data: {
      playlistId,
      targetCompletionDate,
      availableStudyHoursPerDay: hours,
    },
  };
}

export function validateStudySessionPayload(body: any): ValidationResult<{
  subject: string;
  durationSeconds: number;
  mode: string;
  isDeepWork: boolean;
  notes?: string;
  playlistId?: string;
  playlistVideoId?: string;
  taskId?: string;
}> {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a JSON object.' };
  }

  if (!body.subject || typeof body.subject !== 'string' || body.subject.trim() === '') {
    return { isValid: false, error: 'Study subject is required.' };
  }

  const durationSeconds = Number(body.durationSeconds);
  if (isNaN(durationSeconds) || durationSeconds <= 0) {
    return { isValid: false, error: 'Duration in seconds must be greater than zero.' };
  }

  return {
    isValid: true,
    data: {
      subject: body.subject.trim(),
      durationSeconds,
      mode: body.mode || 'stopwatch',
      isDeepWork: body.isDeepWork !== undefined ? Boolean(body.isDeepWork) : true,
      notes: body.notes ? String(body.notes) : undefined,
      playlistId: body.playlistId || undefined,
      playlistVideoId: body.playlistVideoId || undefined,
      taskId: body.taskId || undefined,
    },
  };
}

export function validateTaskPayload(body: any): ValidationResult<{
  title: string;
  category: string;
  priority: string;
  estimatedMinutes: number;
  deadline?: Date;
}> {
  if (!body?.title || typeof body.title !== 'string' || body.title.trim() === '') {
    return { isValid: false, error: 'Task title is required.' };
  }

  return {
    isValid: true,
    data: {
      title: body.title.trim(),
      category: body.category || 'Study',
      priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(body.priority) ? body.priority : 'MEDIUM',
      estimatedMinutes: Number(body.estimatedMinutes) > 0 ? Number(body.estimatedMinutes) : 30,
      deadline: body.deadline ? new Date(body.deadline) : undefined,
    },
  };
}
