'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Bot, Sparkles, Brain, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AIPlannerPage() {
  const { showToast } = useApp();
  const [availableHours, setAvailableHours] = useState('4.0');
  const [studyPlan, setStudyPlan] = useState<any | null>(null);
  const [weeklyReview, setWeeklyReview] = useState<any | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);

  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableHours: Number(availableHours) }),
      });
      if (res.ok) {
        const data = await res.json();
        setStudyPlan(data.plan);
        showToast('Smart Schedule Generated', 'Balanced learning plan generated.', 'success');
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleWeeklyReview = async () => {
    setLoadingReview(true);
    try {
      const res = await fetch('/api/ai/weekly-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setWeeklyReview(data.review);
        showToast('Weekly Analysis Ready', 'Progress synthesis calculated.', 'success');
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              AI Study Assistant & Planner
            </h1>
            <Badge variant="purple">Rule-Based + Offline</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deterministic rule-based intelligence balances upcoming tasks, spaced revisions, playlist milestones, and weak DSA topics.
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 to-[#0c1220]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Generate Daily Schedule</h3>
              <p className="text-xs text-slate-400">
                How many hours can you commit today?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={availableHours}
              onChange={e => setAvailableHours(e.target.value)}
              className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
            >
              <option value="2.0">2.0 Hours</option>
              <option value="3.0">3.0 Hours</option>
              <option value="4.0">4.0 Hours</option>
              <option value="6.0">6.0 Hours</option>
              <option value="8.0">8.0 Hours</option>
            </select>

            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              disabled={loadingPlan}
              onClick={handleGeneratePlan}
            >
              {loadingPlan ? 'Synthesizing...' : 'Generate Plan'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              disabled={loadingReview}
              onClick={handleWeeklyReview}
            >
              {loadingReview ? 'Analyzing...' : 'Weekly Review'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Generated Study Plan Output */}
      {studyPlan && (
        <Card className="p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white">Recommended Study Roadmap</h3>
              <p className="text-xs text-slate-400 mt-0.5">{studyPlan.rationale}</p>
            </div>
            <Badge variant="success">
              {studyPlan.totalPlannedMinutes} mins planned
            </Badge>
          </div>

          <div className="space-y-2.5">
            {studyPlan.items?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">{item.title}</h5>
                    <p className="text-[11px] text-slate-400">{item.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.priority === 'CRITICAL' ? 'danger' : 'info'}>
                    {item.priority}
                  </Badge>
                  <span className="font-bold text-slate-300">{item.allocatedMinutes}m</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <strong>Pacing Advice:</strong> {studyPlan.pacingAdvice}
          </div>
        </Card>
      )}

      {/* Weekly Review Output */}
      {weeklyReview && (
        <Card className="p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white">{weeklyReview.periodLabel}</h3>
            <Badge variant="purple">{weeklyReview.totalStudyHours}h Logged</Badge>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            {weeklyReview.summaryNarrative}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <strong>Strongest Area:</strong> {weeklyReview.strongestArea}
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <strong>Needs Focus:</strong> {weeklyReview.needsImprovementArea}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
