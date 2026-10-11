import React from 'react';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { calculatePlaylistPlanMetrics } from '@/lib/planner';
import { StatCard } from '@/components/dashboard/StatCard';
import { PlaylistProgressWidget } from '@/components/dashboard/PlaylistProgressWidget';
import { DailyPaceWidget } from '@/components/dashboard/DailyPaceWidget';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { format } from 'date-fns';
import {
  Timer,
  PlaySquare,
  Code2,
  CheckSquare,
  Flame,
  Award,
  Droplets,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const revalidate = 0; // Always fresh database read

export default async function DashboardPage() {
  const user = await getOrCreateDefaultUser();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 1. Fetch real persisted playlists
  const playlists = await prisma.playlist.findMany({
    where: { userId: user.id, isArchived: false },
    include: { videos: true },
    orderBy: { updatedAt: 'desc' },
  });

  // Calculate each playlist's metrics
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
  });

  // 7. Calculate overall roadmap completion across all playlists
  const totalRoadmapVideos = playlists.reduce((acc, p) => acc + p.totalVideos, 0);
  const completedRoadmapVideos = playlists.reduce((acc, p) => acc + p.completedVideos, 0);
  const roadmapPercent = totalRoadmapVideos > 0
    ? Math.round((completedRoadmapVideos / totalRoadmapVideos) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Personal Learning Operating System
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Database
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white light:text-slate-900">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 mt-1 max-w-xl">
            Placement Prep Roadmap: <strong>Striver A2Z DSA</strong>, LeetCode target <strong>{user.leetcodeDailyTarget} problems/day</strong>, study target <strong>{(user.dailyStudyTargetMinutes / 60).toFixed(0)}h/day</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Study Streak</div>
            <div className="text-xl font-black text-amber-400 flex items-center justify-end gap-1">
              <Flame className="h-5 w-5 fill-amber-400" />
              {user.currentStreak} Days
            </div>
          </div>
          <div className="h-10 w-[1px] bg-slate-800" />
          <div className="text-right">
            <div className="text-xs text-slate-400">Level {user.level}</div>
            <div className="text-xl font-black text-indigo-400">{user.totalXp} XP</div>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Study Time"
          value={`${todayStudyHours}h`}
          subvalue={`Target: ${(user.dailyStudyTargetMinutes / 60).toFixed(0)}h / day`}
          icon={Timer}
          color="indigo"
          trend={Number(todayStudyHours) >= user.dailyStudyTargetMinutes / 60 ? '✓ Target Reached' : undefined}
        />

        <StatCard
          title="Roadmap Videos"
          value={`${completedRoadmapVideos} / ${totalRoadmapVideos}`}
          subvalue={`${roadmapPercent}% total roadmap completed`}
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
          title="Pending Tasks"
          value={pendingTasks.length}
          subvalue={`${habitsDoneToday}/${habits.length} habits done today`}
          icon={CheckSquare}
          color="amber"
        />
      </div>

      {/* Daily Pace & Target Velocity */}
      <DailyPaceWidget
        todayStudySeconds={todayStudySeconds}
        dailyTargetMinutes={user.dailyStudyTargetMinutes}
        leetcodeToday={todayLeetcode.length}
        leetcodeDailyTarget={user.leetcodeDailyTarget}
        waterTodayMl={todayWaterMl}
        waterDailyTargetMl={user.waterDailyTargetMl}
        habitsTodayDone={habitsDoneToday}
        habitsTotal={habits.length}
      />

      {/* Quick Action Toolbar */}
      <QuickActions />

      {/* Active Playlists Roadmap Widget */}
      <PlaylistProgressWidget playlists={playlists} />
    </div>
  );
}
