'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { Settings, Save, RotateCcw, User, Shield, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const { showToast, refreshUserSummary } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('Alex Vance');
  const [dailyStudyHours, setDailyStudyHours] = useState('6.0');
  const [leetcodeTarget, setLeetcodeTarget] = useState('5');
  const [waterTarget, setWaterTarget] = useState('3000');
  const [studyWeight, setStudyWeight] = useState(40);
  const [codingWeight, setCodingWeight] = useState(20);
  const [learningWeight, setLearningWeight] = useState(15);
  const [habitsWeight, setHabitsWeight] = useState(15);
  const [healthWeight, setHealthWeight] = useState(10);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        const u = data?.user || data;
        if (u) {
          setName(u.name || 'Alex Vance');
          setDailyStudyHours(((u.dailyStudyTargetMinutes || 360) / 60).toFixed(1));
          setLeetcodeTarget(String(u.leetcodeDailyTarget || 5));
          setWaterTarget(String(u.waterDailyTargetMl || 3000));
          setStudyWeight(u.studyWeight || 40);
          setCodingWeight(u.codingWeight || 20);
          setLearningWeight(u.learningWeight || 15);
          setHabitsWeight(u.habitsWeight || 15);
          setHealthWeight(u.healthWeight || 10);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          dailyStudyTargetMinutes: Math.round(Number(dailyStudyHours) * 60),
          leetcodeDailyTarget: Number(leetcodeTarget),
          waterDailyTargetMl: Number(waterTarget),
          studyWeight,
          codingWeight,
          learningWeight,
          habitsWeight,
          healthWeight,
        }),
      });
      if (res.ok) {
        showToast('Settings Saved', 'Target configurations updated.', 'success');
        await refreshUserSummary();
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalWeight = studyWeight + codingWeight + learningWeight + habitsWeight + healthWeight;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              System Settings & Weights
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure your daily target thresholds, gamification parameters, and custom productivity weights.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Identity */}
        <Card className="p-6 border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-400" />
            User Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Daily Study Target (Hours)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="18"
                value={dailyStudyHours}
                onChange={e => setDailyStudyHours(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">LeetCode Daily Target</label>
              <input
                type="number"
                min="1"
                max="20"
                value={leetcodeTarget}
                onChange={e => setLeetcodeTarget(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Hydration Daily Target (ml)</label>
              <input
                type="number"
                step="250"
                min="1000"
                max="6000"
                value={waterTarget}
                onChange={e => setWaterTarget(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </Card>

        {/* Productivity Score Weights */}
        <Card className="p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Productivity Score Calculation Weights
            </h3>
            <Badge variant={totalWeight === 100 ? 'success' : 'warning'}>
              Total: {totalWeight} / 100
            </Badge>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Study Sessions & Deep Work ({studyWeight}%)</span>
                <span className="font-bold text-indigo-400">{studyWeight} pts</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                value={studyWeight}
                onChange={e => setStudyWeight(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Coding & LeetCode Velocity ({codingWeight}%)</span>
                <span className="font-bold text-emerald-400">{codingWeight} pts</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={codingWeight}
                onChange={e => setCodingWeight(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Roadmap Video Progress ({learningWeight}%)</span>
                <span className="font-bold text-cyan-400">{learningWeight} pts</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={learningWeight}
                onChange={e => setLearningWeight(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Habit Consistency ({habitsWeight}%)</span>
                <span className="font-bold text-amber-400">{habitsWeight} pts</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={habitsWeight}
                onChange={e => setHabitsWeight(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Hydration & Health ({healthWeight}%)</span>
                <span className="font-bold text-rose-400">{healthWeight} pts</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={healthWeight}
                onChange={e => setHealthWeight(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" icon={Save} disabled={saving}>
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
