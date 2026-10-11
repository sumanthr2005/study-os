import React from 'react';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user';
import { Card, Badge, Progress } from '@/components/ui';
import { Briefcase, Calendar, CheckCircle2, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export const revalidate = 0;

export default async function PlacementPage() {
  const user = await getOrCreateDefaultUser();

  const companies = await prisma.placementCompany.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const mockTests = await prisma.mockTest.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              Placement Preparation & Pipeline
            </h1>
            <Badge variant="purple">SDE Ready</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Target tech companies, application pipeline stages, core CS subject readiness, and mock assessments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map(company => (
          <Card key={company.id} className="p-5 border-slate-800 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-white">{company.name}</h3>
                <p className="text-xs text-slate-400">{company.role}</p>
              </div>
              <Badge variant="info">{company.stage}</Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>DSA Readiness</span>
                  <span className="font-semibold text-emerald-400">{company.dsaPrepPercent}%</span>
                </div>
                <Progress value={company.dsaPrepPercent} barClassName="bg-emerald-500" />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Core CS (OS/DBMS/CN)</span>
                  <span className="font-semibold text-indigo-400">{company.coreCsPrepPercent}%</span>
                </div>
                <Progress value={company.coreCsPrepPercent} barClassName="bg-indigo-500" />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>System Design</span>
                  <span className="font-semibold text-purple-400">{company.systemDesignPrepPercent}%</span>
                </div>
                <Progress value={company.systemDesignPrepPercent} barClassName="bg-purple-500" />
              </div>
            </div>

            {company.targetDate && (
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-400" />
                Target: {format(new Date(company.targetDate), 'MMM d, yyyy')}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
