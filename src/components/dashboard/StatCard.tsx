import React from 'react';
import { Card } from '@/components/ui';

export function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  color = 'indigo',
  trend,
}: {
  title: string;
  value: string | number;
  subvalue?: string;
  icon: React.ElementType;
  color?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'purple' | 'rose';
  trend?: string;
}) {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/30 shadow-indigo-500/10',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30 shadow-amber-500/10',
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30 shadow-purple-500/10',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30 shadow-rose-500/10',
  };

  return (
    <Card className="relative overflow-hidden group hover:scale-[1.01] transition-transform">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider light:text-slate-500">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold tracking-tight text-white light:text-slate-900">
              {value}
            </h3>
            {trend && (
              <span className="text-xs font-semibold text-emerald-400">
                {trend}
              </span>
            )}
          </div>
          {subvalue && (
            <p className="text-xs text-slate-400 mt-1 light:text-slate-500">
              {subvalue}
            </p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br shadow-inner ${colorMap[color]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
