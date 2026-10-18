'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button, Badge, Progress } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import {
  Code2,
  GitFork,
  Repeat,
  BookOpen,
  Plus,
  ExternalLink,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Sliders,
} from 'lucide-react';
import { format } from 'date-fns';

type TabType = 'leetcode' | 'dsa' | 'revisions' | 'notes';

function PracticeHubContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'leetcode';
  const [activeTab, setActiveTab] = useState<TabType>(
    ['leetcode', 'dsa', 'revisions', 'notes'].includes(initialTab) ? initialTab : 'leetcode'
  );

  const { showToast } = useApp();

  // LeetCode State
  const [problems, setProblems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, easy: 0, medium: 0, hard: 0, today: 0 });
  const [problemNumber, setProblemNumber] = useState('');
  const [problemTitle, setProblemTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [problemTopic, setProblemTopic] = useState('Arrays');
  const [timeTaken, setTimeTaken] = useState('25');
  const [solutionUrl, setSolutionUrl] = useState('');
  const [isSubmittingProblem, setIsSubmittingProblem] = useState(false);

  // DSA Topics State
  const [topics, setTopics] = useState<any[]>([]);

  // Revisions State
  const [revisions, setRevisions] = useState<any[]>([]);

  // Notes State
  const [notes, setNotes] = useState<any[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('DSA');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const [loading, setLoading] = useState(true);

  // Load all practice data
  const loadData = async () => {
    try {
      setLoading(true);
      const [lcRes, dsaRes, revRes, notesRes] = await Promise.all([
        fetch('/api/leetcode').then(r => r.ok ? r.json() : { problems: [], stats: {} }),
        fetch('/api/dsa').then(r => r.ok ? r.json() : { topics: [] }),
        fetch('/api/revisions').then(r => r.ok ? r.json() : { revisions: [] }),
        fetch('/api/notes').then(r => r.ok ? r.json() : { notes: [] }),
      ]);

      setProblems(lcRes.problems || []);
      setStats(lcRes.stats || { total: 0, easy: 0, medium: 0, hard: 0, today: 0 });
      setTopics(dsaRes.topics || []);
      setRevisions(revRes.revisions || []);
      setNotes(notesRes.notes || []);
    } catch (e) {
      console.error('Failed to load practice data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update active tab if URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && ['leetcode', 'dsa', 'revisions', 'notes'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Handle LeetCode Log
  const handleLogProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemTitle.trim()) return;

    setIsSubmittingProblem(true);
    try {
      const res = await fetch('/api/leetcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemNumber: problemNumber ? Number(problemNumber) : undefined,
          title: problemTitle.trim(),
          difficulty,
          topic: problemTopic,
          timeTakenMinutes: timeTaken ? Number(timeTaken) : undefined,
          solutionUrl: solutionUrl.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast('Problem Logged! 💻', `+${data.xpEarned || 20} XP awarded. Keep the streak going!`, 'success');
        setProblemTitle('');
        setProblemNumber('');
        setSolutionUrl('');
        // Refresh Leetcode list
        const lcRes = await fetch('/api/leetcode').then(r => r.json());
        setProblems(lcRes.problems || []);
        setStats(lcRes.stats || stats);
      }
    } finally {
      setIsSubmittingProblem(false);
    }
  };

  // Handle DSA Confidence
  const handleUpdateConfidence = async (topicId: string, confidence: number) => {
    try {
      const res = await fetch('/api/dsa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: topicId, confidence }),
      });
      if (res.ok) {
        setTopics(prev =>
          prev.map(t => (t.id === topicId ? { ...t, confidence } : t))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Revision Completion
  const handleCompleteRevision = async (id: string) => {
    try {
      const res = await fetch(`/api/revisions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
      if (res.ok) {
        showToast('Revision Completed! 🧠', 'Memory retention curve updated.', 'success');
        const revRes = await fetch('/api/revisions').then(r => r.json());
        setRevisions(revRes.revisions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Create Note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle.trim(),
          content: noteContent.trim(),
          tags: noteTag,
        }),
      });
      if (res.ok) {
        showToast('Note Saved! 📝', 'Study note stored permanently.', 'success');
        setNoteTitle('');
        setNoteContent('');
        const notesRes = await fetch('/api/notes').then(r => r.json());
        setNotes(notesRes.notes || []);
      }
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const overallAvgConfidence = topics.length > 0
    ? Math.round(topics.reduce((acc, t) => acc + t.confidence, 0) / topics.length)
    : 50;

  const dueRevisionsCount = revisions.filter(r => !r.completed).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Code2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Practice & DSA Mastery Hub
                </h1>
                <Badge variant="info">Interview Ready</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Solve LeetCode problems, master the 20 core DSA patterns, and retain concepts with spaced repetition.
              </p>
            </div>
          </div>
        </div>

        {/* Quick High-Level Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Problems Solved</span>
            <span className="text-lg font-black text-emerald-400">{stats.total}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">DSA Mastery</span>
            <span className="text-lg font-black text-indigo-400">{overallAvgConfidence}%</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Due Revisions</span>
            <span className="text-lg font-black text-rose-400">{dueRevisionsCount}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl w-full sm:w-auto overflow-x-auto">
        <button
          onClick={() => setActiveTab('leetcode')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'leetcode'
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>LeetCode Tracker</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dsa')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'dsa'
              ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <GitFork className="h-4 w-4" />
          <span>DSA 20-Topic Roadmap</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400 font-bold">
            {topics.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('revisions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'revisions'
              ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/40 text-rose-300 shadow-lg shadow-rose-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Repeat className="h-4 w-4" />
          <span>Revision Queue</span>
          {dueRevisionsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-400 font-bold">
              {dueRevisionsCount} due
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'notes'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Cheat Sheets & Notes</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-400 font-bold">
            {notes.length}
          </span>
        </button>
      </div>

      {/* TAB 1: LEETCODE TRACKER */}
      {activeTab === 'leetcode' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-slate-800 p-4 bg-slate-900/60 backdrop-blur-sm text-center">
              <p className="text-xs text-slate-400 font-semibold">Total Solved</p>
              <h3 className="text-2xl font-black text-white mt-1">{stats.total}</h3>
              <p className="text-[10px] text-slate-500 mt-1">Algorithmic Problems</p>
            </Card>
            <Card className="border-emerald-500/20 p-4 bg-emerald-950/20 backdrop-blur-sm text-center">
              <p className="text-xs text-emerald-400 font-semibold">Easy (+10 XP)</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{stats.easy}</h3>
              <p className="text-[10px] text-emerald-500/80 mt-1">Fundamentals & warmups</p>
            </Card>
            <Card className="border-amber-500/20 p-4 bg-amber-950/20 backdrop-blur-sm text-center">
              <p className="text-xs text-amber-400 font-semibold">Medium (+20 XP)</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{stats.medium}</h3>
              <p className="text-[10px] text-amber-500/80 mt-1">Core interview questions</p>
            </Card>
            <Card className="border-rose-500/20 p-4 bg-rose-950/20 backdrop-blur-sm text-center">
              <p className="text-xs text-rose-400 font-semibold">Hard (+35 XP)</p>
              <h3 className="text-2xl font-black text-rose-400 mt-1">{stats.hard}</h3>
              <p className="text-[10px] text-rose-500/80 mt-1">Advanced patterns</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Log Form */}
            <Card className="p-6 border-slate-800 bg-slate-900/60 backdrop-blur-sm lg:col-span-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Plus className="h-4 w-4 text-emerald-400" />
                Log Solved Problem
              </h3>
              <form onSubmit={handleLogProblem} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Problem Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3Sum, LRU Cache, Subsets"
                    value={problemTitle}
                    onChange={e => setProblemTitle(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Number (#)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={problemNumber}
                      onChange={e => setProblemNumber(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value as any)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="EASY">Easy (10 XP)</option>
                      <option value="MEDIUM">Medium (20 XP)</option>
                      <option value="HARD">Hard (35 XP)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Topic</label>
                    <select
                      value={problemTopic}
                      onChange={e => setProblemTopic(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Arrays">Arrays</option>
                      <option value="Two Pointers">Two Pointers</option>
                      <option value="Sliding Window">Sliding Window</option>
                      <option value="Binary Search">Binary Search</option>
                      <option value="Trees">Trees</option>
                      <option value="Dynamic Programming">Dynamic Programming</option>
                      <option value="Graphs">Graphs</option>
                      <option value="Backtracking">Backtracking</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Time (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={timeTaken}
                      onChange={e => setTimeTaken(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Solution / LeetCode URL</label>
                  <input
                    type="url"
                    placeholder="https://leetcode.com/problems/..."
                    value={solutionUrl}
                    onChange={e => setSolutionUrl(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center bg-gradient-to-r from-emerald-500 to-teal-500 border-none font-bold"
                  disabled={isSubmittingProblem}
                >
                  {isSubmittingProblem ? 'Validating & Logging...' : 'Record Problem & Claim XP'}
                </Button>
              </form>
            </Card>

            {/* Problem History */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>Recent Solved Problems</span>
                <span className="text-xs text-slate-400">{problems.length} recorded</span>
              </h3>

              {problems.length === 0 ? (
                <Card className="p-8 border-slate-800 text-center bg-slate-900/40">
                  <Code2 className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No problems recorded yet</p>
                  <p className="text-xs text-slate-500 mt-1">Log your first solved problem to begin earning XP and building topic mastery.</p>
                </Card>
              ) : (
                problems.map(prob => (
                  <Card
                    key={prob.id}
                    className="p-4 border-slate-800/80 bg-slate-900/50 hover:border-slate-700 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs font-bold">
                        #{prob.problemNumber || '—'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white truncate">{prob.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              prob.difficulty === 'HARD'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : prob.difficulty === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>{prob.topic}</span>
                          {prob.timeTakenMinutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {prob.timeTakenMinutes}m
                            </span>
                          )}
                          <span>{format(new Date(prob.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {prob.solutionUrl && (
                        <a
                          href={prob.solutionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <span className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                        +{prob.difficulty === 'HARD' ? 35 : prob.difficulty === 'MEDIUM' ? 20 : 10} XP
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DSA 20-TOPIC MASTERY */}
      {activeTab === 'dsa' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
            <div>
              <h3 className="font-bold text-white text-sm">Systematic 20-Topic Progression</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust confidence levels as you practice. These confidence ratings guide your daily study plan.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Mean Confidence</span>
              <div className="text-xl font-black text-indigo-400">{overallAvgConfidence}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map(topic => {
              const confidenceColor =
                topic.confidence >= 75
                  ? 'text-emerald-400'
                  : topic.confidence >= 50
                  ? 'text-amber-400'
                  : 'text-rose-400';

              return (
                <Card key={topic.id} className="p-5 border-slate-800 bg-slate-900/50 space-y-3 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">{topic.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{topic.category}</p>
                    </div>
                    <span className={`text-base font-black ${confidenceColor}`}>
                      {topic.confidence}%
                    </span>
                  </div>

                  <Progress
                    value={topic.confidence}
                    barClassName={topic.confidence >= 75 ? 'bg-emerald-500' : topic.confidence >= 50 ? 'bg-amber-500' : 'bg-rose-500'}
                    className="h-2"
                  />

                  {/* Quick Confidence Selector */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Sliders className="h-3 w-3" /> Adjust:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[25, 50, 75, 100].map(val => (
                        <button
                          key={val}
                          onClick={() => handleUpdateConfidence(topic.id, val)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                            topic.confidence === val
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SPACED REPETITION QUEUE */}
      {activeTab === 'revisions' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-rose-400" />
                Ebbinghaus Forgetting Curve Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Concepts are reviewed at expanding intervals (1d, 3d, 7d, 14d, 30d) to lock patterns into permanent memory.
              </p>
            </div>
            <Badge variant="danger">{dueRevisionsCount} Due for Review</Badge>
          </div>

          <div className="space-y-3">
            {revisions.length === 0 ? (
              <Card className="p-8 border-slate-800 text-center bg-slate-900/40">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">All Revisions Cleared!</p>
                <p className="text-xs text-slate-500 mt-1">Your memory retention schedule is up to date.</p>
              </Card>
            ) : (
              revisions.map(rev => (
                <Card
                  key={rev.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => handleCompleteRevision(rev.id)}
                      disabled={rev.completed}
                      className={`p-1.5 rounded-lg transition-colors ${
                        rev.completed
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                      }`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-white truncate">{rev.title}</h4>
                        <Badge variant="purple">Interval: {rev.intervalDays}d</Badge>
                        <Badge variant="default">Rep #{rev.repetitionNumber}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Topic: {rev.subjectOrTopic} • Due:{' '}
                        {format(new Date(rev.scheduledFor), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant={rev.completed ? 'ghost' : 'primary'}
                      size="sm"
                      disabled={rev.completed}
                      onClick={() => handleCompleteRevision(rev.id)}
                      className={rev.completed ? 'text-emerald-400 cursor-default' : 'bg-rose-600 hover:bg-rose-500 border-none'}
                    >
                      {rev.completed ? 'Mastered' : 'Mark Reviewed (+15 XP)'}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CHEAT SHEETS & NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 border-slate-800 bg-slate-900/60 lg:col-span-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                Add Code Template / Note
              </h3>
              <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Binary Search Template"
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Tag / Category</label>
                  <input
                    type="text"
                    value={noteTag}
                    onChange={e => setNoteTag(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Markdown / Code Content *</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Key patterns, complexity notes, or code templates..."
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center bg-cyan-600 hover:bg-cyan-500 border-none font-bold"
                  disabled={isSubmittingNote}
                >
                  {isSubmittingNote ? 'Saving...' : 'Save Study Note'}
                </Button>
              </form>
            </Card>

            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>Stored Notes & Cheat Sheets</span>
                <span className="text-xs text-slate-400">{notes.length} notes</span>
              </h3>

              {notes.length === 0 ? (
                <Card className="p-8 border-slate-800 text-center bg-slate-900/40">
                  <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No notes saved yet</p>
                  <p className="text-xs text-slate-500 mt-1">Record interview patterns and algorithmic snippets for fast review.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notes.map(note => (
                    <Card key={note.id} className="p-4 border-slate-800 bg-slate-900/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="info">{note.tags || 'General'}</Badge>
                        <span className="text-[10px] text-slate-500">
                          {format(new Date(note.updatedAt || note.createdAt), 'MMM d')}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{note.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-3 font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Practice Hub...</div>}>
      <PracticeHubContent />
    </Suspense>
  );
}
