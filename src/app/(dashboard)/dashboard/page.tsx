import React from 'react';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { calculatePlaylistPlanMetrics } from '@/lib/planner';
import { calculateProductivityScore } from '@/lib/utils';
import { calculateRankAndLevel, getLiveDailyQuests, ACHIEVEMENT_DEFINITIONS } from '@/lib/gamification';
import { HolographicCore } from '@/components/dashboard/HolographicCore';
import { DailyQuestsWidget } from '@/components/dashboard/DailyQuestsWidget';
import { TodayStrategicPlan, StrategicItem } from '@/components/dashboard/TodayStrategicPlan';
import { WeeklyReviewCard } from '@/components/dashboard/WeeklyReviewCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { PlaylistProgressWidget } from '@/components/dashboard/PlaylistProgressWidget';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { format, subDays } from 'date-fns';
import {
  Timer,
  PlaySquare,
  Code2,
  CheckSquare,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

export const revalidate = 0; // Always fresh database read

export default async function DashboardPage() {
  const user = await getOrCreateDefaultUser();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // 1. Fetch playlists & metrics
  const playlists = await prisma.playlist.findMany({
    where: { userId: user.id, isArchived: false },
    include: { videos: true },
    orderBy: { updatedAt: 'desc' },
  });

  const playlistMetrics = playlists.map(p => {
    const metrics = calculatePlaylistPlanMetrics({
      videos: p.videos,
      targetCompletionDate: p.targetCompletionDate,
      availableStudyHoursPerDay: p.availableStudyHoursPerDay,
    });
    return {
      ...p,
      metrics,
    };
  });

  // 2. Fetch today's study sessions
  const todaySessions = await prisma.studySession.findMany({
    where: {
      userId: user.id,
      startTime: { gte: todayStart },
    },
  });
  const todayStudySeconds = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const todayStudyHours = (todayStudySeconds / 3600).toFixed(1);

  // 3. Fetch LeetCode problems solved today
  const todayLeetcode = await prisma.leetCodeProblem.findMany({
    where: {
      userId: user.id,
      solvedAt: { gte: todayStart },
    },
  });

  // 4. Fetch water intake today
  const todayWaterEntries = await prisma.waterEntry.findMany({
    where: {
      userId: user.id,
      date: todayStr,
    },
  });
  const todayWaterMl = todayWaterEntries.reduce((acc, w) => acc + w.amountMl, 0);

  // 5. Fetch habits and today's completions
  const habits = await prisma.habit.findMany({
    where: { userId: user.id, isArchived: false },
    include: {
      completions: {
        where: { date: todayStr },
      },
    },
  });
  const habitsDoneToday = habits.filter(h => h.completions.length > 0 && h.completions[0].completed).length;

  // 6. Fetch pending tasks
  const pendingTasks = await prisma.task.findMany({
    where: { userId: user.id, status: { not: 'COMPLETED' } },
    orderBy: [{ priority: 'desc' }, { deadline: 'asc' }],
    take: 5,
  });

  // 7. Fetch revisions due today
  const revisionsDue = await prisma.revision.findMany({
    where: {
      userId: user.id,
      completed: false,
      scheduledFor: { lte: endOfToday },
    },
    take: 3,
  });

  // 8. Fetch upcoming placement companies
  const upcomingCompanies = await prisma.placementCompany.findMany({
    where: { userId: user.id, targetDate: { not: null } },
    orderBy: { targetDate: 'asc' },
    take: 2,
  });

  // 9. Fetch next incomplete playlist video
  const nextVideo = await prisma.playlistVideo.findFirst({
    where: {
      playlist: { userId: user.id, isArchived: false },
      completed: false,
    },
    include: { playlist: true },
    orderBy: { position: 'asc' },
  });

  // 10. Gamification Data
  const rankInfo = calculateRankAndLevel(user.totalXp);
  const dailyQuests = await getLiveDailyQuests(user.id);
  const achievementsCount = await prisma.achievementUnlock.count({
    where: { userId: user.id },
  });

  // 11. Productivity Score
  const scoreResult = calculateProductivityScore(
    {
      actualStudyMinutes: Math.round(todayStudySeconds / 60),
      studyGoalMinutes: user.dailyStudyTargetMinutes,
      leetcodeSolvedToday: todayLeetcode.length,
      leetcodeGoalToday: user.leetcodeDailyTarget,
      videosCompletedToday: playlists.reduce((acc, p) => acc + p.videos.filter(v => v.completed && v.completedAt && v.completedAt >= todayStart).length, 0),
      videosGoalToday: 4,
      habitsCompletedToday: habitsDoneToday,
      totalHabitsToday: habits.length || 1,
      waterDrankMl: todayWaterMl,
      waterGoalMl: user.waterDailyTargetMl,
    },
    {
      study: user.studyWeight,
      coding: user.codingWeight,
      learning: user.learningWeight,
      habits: user.habitsWeight,
      health: user.healthWeight,
    }
  );

  // 12. Build Today's Strategic Plan Items
  const strategicItems: StrategicItem[] = [];

  // Add revisions due
  for (const r of revisionsDue) {
    strategicItems.push({
      id: `rev-${r.id}`,
      title: `Revise: ${r.title}`,
      subtitle: `${r.subjectOrTopic} • Due for spaced repetition today`,
      category: 'REVISION',
      priority: 'HIGH',
      estimatedMinutes: 25,
      actionUrl: '/practice',
    });
  }

  // Add top priority tasks
  for (const t of pendingTasks.slice(0, 3)) {
    strategicItems.push({
      id: `task-${t.id}`,
      title: t.title,
      subtitle: `${t.category} backlog task${t.deadline ? ` • Due ${format(new Date(t.deadline), 'MMM d')}` : ''}`,
      category: 'TASK',
      priority: t.priority as any,
      estimatedMinutes: t.estimatedMinutes,
      actionUrl: '/tasks',
    });
  }

  // Add next roadmap video
  if (nextVideo) {
    strategicItems.push({
      id: `vid-${nextVideo.id}`,
      title: nextVideo.title,
      subtitle: `${nextVideo.playlist.title} (Module #${nextVideo.position})`,
      category: 'ROADMAP',
      priority: 'MEDIUM',
      estimatedMinutes: Math.round(nextVideo.durationSeconds / 60),
      actionUrl: `/playlists/${nextVideo.playlistId}`,
    });
  }

  // Add upcoming placement assessment
  for (const c of upcomingCompanies) {
    if (c.targetDate) {
      strategicItems.push({
        id: `comp-${c.id}`,
        title: `${c.name} (${c.role}) Assessment`,
        subtitle: `Stage: ${c.stage} • Target date ${format(new Date(c.targetDate), 'MMM d, yyyy')}`,
        category: 'PLACEMENT',
        priority: 'URGENT',
        actionUrl: '/placement',
      });
    }
  }

  // 13. Past 7 days weekly analysis
  const weekStart = subDays(new Date(), 6);
  weekStart.setHours(0, 0, 0, 0);

  const pastWeekSessions = await prisma.studySession.findMany({
    where: { userId: user.id, startTime: { gte: weekStart } },
  });

  const pastWeekProblems = await prisma.leetCodeProblem.findMany({
    where: { userId: user.id, solvedAt: { gte: weekStart } },
  });

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayKey = format(d, 'yyyy-MM-dd');
    const dayLabel = format(d, 'EEE');
    const daySessions = pastWeekSessions.filter(s => format(new Date(s.startTime), 'yyyy-MM-dd') === dayKey);
    const seconds = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    return {
      day: dayLabel,
      hours: Math.round((seconds / 3600) * 10) / 10,
      isToday: dayKey === todayStr,
    };
  });

  const totalWeeklyHours = weeklyData.reduce((acc, d) => acc + d.hours, 0);

  // Roadmap metrics
  const totalRoadmapVideos = playlists.reduce((acc, p) => acc + p.totalVideos, 0);
  const completedRoadmapVideos = playlists.reduce((acc, p) => acc + p.completedVideos, 0);
  const roadmapPercent = totalRoadmapVideos > 0
    ? Math.round((completedRoadmapVideos / totalRoadmapVideos) * 100)
    : 0;

  // Intelligent suggestion based on evidence
  let heuristicSuggestion = 'Maintain regular Pomodoro intervals to sustain deep focus without fatigue.';
  if (revisionsDue.length > 0) {
    heuristicSuggestion = `Prioritize clearing your ${revisionsDue.length} due revision topics before beginning new roadmap lectures.`;
  } else if (todayLeetcode.length < user.leetcodeDailyTarget) {
    heuristicSuggestion = `Solve ${user.leetcodeDailyTarget - todayLeetcode.length} more DSA problem(s) today to fulfill your daily problem-solving target.`;
  } else if (Number(todayStudyHours) < user.dailyStudyTargetMinutes / 60) {
    heuristicSuggestion = `Log one more 45-minute focus session on ${nextVideo?.playlist.title || 'Core CS'} to achieve your daily study hours target.`;
  }

  return (
    <div className="space-y-6">
      {/* 1. Flagship 3D Holographic Command Core */}
      <HolographicCore
        level={rankInfo.level}
        rankTitle={rankInfo.title}
        totalXp={user.totalXp}
        todayStudySeconds={todayStudySeconds}
        dailyTargetMinutes={user.dailyStudyTargetMinutes}
        currentStreak={user.currentStreak}
        completedQuests={dailyQuests.filter(q => q.completed).length}
        totalQuests={dailyQuests.length}
        productivityScore={scoreResult.totalScore}
      />

      {/* 2. Top Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Focus Time"
          value={`${todayStudyHours}h`}
          subvalue={`Target: ${(user.dailyStudyTargetMinutes / 60).toFixed(0)}h / day`}
          icon={Timer}
          color="indigo"
          trend={Number(todayStudyHours) >= user.dailyStudyTargetMinutes / 60 ? '✓ Target Reached' : undefined}
        />

        <StatCard
          title="Roadmap Progress"
          value={`${completedRoadmapVideos} / ${totalRoadmapVideos}`}
          subvalue={`${roadmapPercent}% total roadmap modules`}
          icon={PlaySquare}
          color="emerald"
        />

        <StatCard
          title="LeetCode Today"
          value={`${todayLeetcode.length} / ${user.leetcodeDailyTarget}`}
          subvalue="Daily problem target"
          icon={Code2}
          color="purple"
        />

        <StatCard
          title="Action Backlog"
          value={pendingTasks.length}
          subvalue={`${habitsDoneToday}/${habits.length} habits done today`}
          icon={CheckSquare}
          color="amber"
        />
      </div>

      {/* 3. Daily Quests & Strategic Plan Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <DailyQuestsWidget
            quests={dailyQuests}
            achievementsCount={achievementsCount}
            totalAchievements={ACHIEVEMENT_DEFINITIONS.length}
          />
        </div>

        <div className="lg:col-span-7">
          <TodayStrategicPlan items={strategicItems} />
        </div>
      </div>

      {/* 4. Weekly Review Chart & Suggestions */}
      <WeeklyReviewCard
        weeklyData={weeklyData}
        totalWeeklyHours={totalWeeklyHours}
        totalProblemsWeek={pastWeekProblems.length}
        weeklyHabitRate={Math.round((habitsDoneToday / (habits.length || 1)) * 100)}
        heuristicSuggestion={heuristicSuggestion}
      />

      {/* 5. Quick Actions Bar */}
      <QuickActions />

      {/* 6. Active Roadmaps Widget */}
      <PlaylistProgressWidget playlists={playlists} />
    </div>
  );
}
