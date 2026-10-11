'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Progress } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { Droplets, Plus, Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export default function WaterTrackerPage() {
  const { showToast } = useApp();
  const [todayMl, setTodayMl] = useState(0);
  const [dailyTargetMl, setDailyTargetMl] = useState(3000);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWater = async () => {
    try {
      const res = await fetch('/api/water');
      if (res.ok) {
        const data = await res.json();
        setTodayMl(data.todayTotalMl || 0);
        setDailyTargetMl(data.dailyTargetMl || 3000);
        setEntries(data.entries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWater();
  }, []);

  const handleAddWater = async (amount: number) => {
    try {
      const res = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMl: amount }),
      });
      if (res.ok) {
        showToast('Hydration Logged! 💧', `+${amount}ml added to daily intake.`, 'info');
        await fetchWater();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const percent = Math.min(100, Math.round((todayMl / Math.max(1, dailyTargetMl)) * 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-cyan-400 fill-cyan-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              Daily Hydration Tracker
            </h1>
            <Badge variant="info">{todayMl} / {dailyTargetMl} ml</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain cognitive peak performance and mental stamina with consistent water intake throughout study blocks.
          </p>
        </div>
      </div>

      {/* Hero Hydration Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 flex flex-col items-center justify-center p-8 border-cyan-500/30 bg-gradient-to-b from-[#081726] to-[#0c1220] text-center">
          <div className="relative my-4">
            <div className="text-6xl sm:text-7xl font-mono font-black text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.3)]">
              {todayMl}
              <span className="text-2xl text-cyan-500/70 font-sans ml-1">ml</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-semibold uppercase tracking-wider">
              {percent}% of your {dailyTargetMl}ml daily goal
            </p>
          </div>

          <div className="w-full max-w-md my-4">
            <Progress value={percent} barClassName="bg-gradient-to-r from-cyan-500 to-blue-500 h-3" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
            {[250, 500, 750, 1000].map(amount => (
              <button
                key={amount}
                onClick={() => handleAddWater(amount)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all active:scale-95 shadow-sm"
              >
                +{amount}ml
              </button>
            ))}
          </div>
        </Card>

        {/* Today's Log */}
        <Card className="p-6 border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-cyan-400" />
            Today's Log Entries
          </h4>

          {entries.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No water logged today yet.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <span className="font-semibold text-cyan-400">+{entry.amountMl} ml</span>
                  <span className="text-slate-500">
                    {format(new Date(entry.timestamp), 'h:mm a')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
