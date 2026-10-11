'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Progress } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { GitFork, CheckCircle, AlertCircle, ArrowUpRight, Flame } from 'lucide-react';

export default function DSARoadmapPage() {
  const { showToast } = useApp();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/dsa');
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

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

  const overallAvgConfidence = topics.length > 0
    ? Math.round(topics.reduce((acc, t) => acc + t.confidence, 0) / topics.length)
    : 50;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              DSA Topic Mastery Roadmap
            </h1>
            <Badge variant="purple">{topics.length} Core Topics</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Systematic data structure and algorithm mastery tracking. Self-rate your confidence to guide AI study schedule generation.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Average Confidence</div>
          <div className="text-2xl font-black text-indigo-400">{overallAvgConfidence}%</div>
        </div>
      </div>

      {/* Grid of DSA Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map(topic => {
          const confidenceColor =
            topic.confidence >= 75
              ? 'emerald'
              : topic.confidence >= 50
              ? 'amber'
              : 'rose';

          return (
            <Card key={topic.id} className="p-5 border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-white light:text-slate-900">
                    {topic.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {topic.problemsSolved} / {topic.totalProblemsTarget} problems solved
                  </p>
                </div>
                <Badge
                  variant={
                    topic.confidence >= 75
                      ? 'success'
                      : topic.confidence >= 50
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {topic.confidence}% Confidence
                </Badge>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Topic Progress:</span>
                  <span className="font-semibold text-slate-200">{topic.progressPercent}%</span>
                </div>
                <Progress value={topic.progressPercent} />
              </div>

              {/* Confidence adjustment slider */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Confidence Slider:</span>
                  <span className="font-semibold text-indigo-400">{topic.confidence}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={topic.confidence}
                  onChange={e => handleUpdateConfidence(topic.id, Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
