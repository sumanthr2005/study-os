'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Progress } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { Code2, Plus, ExternalLink, Clock, Sparkles, Filter, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function LeetCodeTrackerPage() {
  const { showToast } = useApp();
  const [problems, setProblems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, easy: 0, medium: 0, hard: 0, today: 0 });
  const [loading, setLoading] = useState(true);

  // Quick form state
  const [problemNumber, setProblemNumber] = useState('');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [topic, setTopic] = useState('Arrays');
  const [timeTaken, setTimeTaken] = useState('25');
  const [solutionUrl, setSolutionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProblems = async () => {
    try {
      const res = await fetch('/api/leetcode');
      if (res.ok) {
        const data = await res.json();
        setProblems(data.problems || []);
        setStats(data.stats || { total: 0, easy: 0, medium: 0, hard: 0, today: 0 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleLogProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leetcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemNumber: problemNumber ? Number(problemNumber) : undefined,
          title: title.trim(),
          difficulty,
          topic,
          timeTakenMinutes: timeTaken ? Number(timeTaken) : undefined,
          solutionUrl: solutionUrl.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast('Problem Logged! 💻', `+${data.xpEarned || 20} XP added. Great momentum!`, 'success');
        setTitle('');
        setProblemNumber('');
        setSolutionUrl('');
        await fetchProblems();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              LeetCode & Coding Tracker
            </h1>
            <Badge variant="success">{stats.total} Solved</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track interview algorithmic problems across Easy, Medium, and Hard tiers with automatic XP rewards.
          </p>
        </div>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-800 text-center p-4">
          <p className="text-xs text-slate-400">Total Solved</p>
          <h3 className="text-2xl font-black text-white mt-1">{stats.total}</h3>
        </Card>
        <Card className="border-emerald-500/20 text-center p-4">
          <p className="text-xs text-emerald-400 font-semibold">Easy</p>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">{stats.easy}</h3>
        </Card>
        <Card className="border-amber-500/20 text-center p-4">
          <p className="text-xs text-amber-400 font-semibold">Medium</p>
          <h3 className="text-2xl font-black text-amber-400 mt-1">{stats.medium}</h3>
        </Card>
        <Card className="border-rose-500/20 text-center p-4">
          <p className="text-xs text-rose-400 font-semibold">Hard</p>
          <h3 className="text-2xl font-black text-rose-400 mt-1">{stats.hard}</h3>
        </Card>
      </div>

      {/* Quick Log Form */}
      <Card className="border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 to-[#0c1220]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <Plus className="h-4 w-4 text-emerald-400" />
          Log Solved Problem
        </h4>
        <form onSubmit={handleLogProblem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="number"
            placeholder="# Number"
            value={problemNumber}
            onChange={e => setProblemNumber(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <input
            type="text"
            placeholder="Problem Title (e.g. 3Sum, LRU Cache)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="sm:col-span-2 rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as any)}
            className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="EASY">Easy (+10 XP)</option>
            <option value="MEDIUM">Medium (+20 XP)</option>
            <option value="HARD">Hard (+40 XP)</option>
          </select>

          <select
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="Arrays">Arrays</option>
            <option value="Strings">Strings</option>
            <option value="Two Pointers">Two Pointers</option>
            <option value="Sliding Window">Sliding Window</option>
            <option value="Linked Lists">Linked Lists</option>
            <option value="Trees">Trees</option>
            <option value="Graphs">Graphs</option>
            <option value="Dynamic Programming">DP</option>
            <option value="Binary Search">Binary Search</option>
            <option value="Heap">Heap</option>
          </select>

          <Button type="submit" variant="success" size="md" disabled={isSubmitting}>
            Log Problem
          </Button>
        </form>
      </Card>

      {/* Solved Problems List */}
      <Card className="p-0 overflow-x-auto border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
              <th className="p-3.5 font-semibold">#</th>
              <th className="p-3.5 font-semibold">Title</th>
              <th className="p-3.5 font-semibold">Difficulty</th>
              <th className="p-3.5 font-semibold">Topic</th>
              <th className="p-3.5 font-semibold">Date Solved</th>
              <th className="p-3.5 font-semibold text-right">XP Earned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {problems.map(prob => {
              const diffBadge =
                prob.difficulty === 'HARD'
                  ? 'danger'
                  : prob.difficulty === 'MEDIUM'
                  ? 'warning'
                  : 'success';

              return (
                <tr key={prob.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="p-3.5 font-mono text-slate-500">{prob.problemNumber || '-'}</td>
                  <td className="p-3.5 font-semibold text-white">{prob.title}</td>
                  <td className="p-3.5">
                    <Badge variant={diffBadge as any}>{prob.difficulty}</Badge>
                  </td>
                  <td className="p-3.5 text-slate-300">{prob.topic}</td>
                  <td className="p-3.5 text-slate-400">
                    {format(new Date(prob.solvedAt), 'MMM d, yyyy')}
                  </td>
                  <td className="p-3.5 text-right font-bold text-emerald-400">
                    +{prob.xpEarned} XP
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
