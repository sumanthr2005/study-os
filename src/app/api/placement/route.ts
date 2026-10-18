import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { PLACEMENT_SUBJECTS } from '@/lib/constants';

export async function GET(req: Request) {
  try {
    const user = await getOrCreateDefaultUser(req);

    const [companies, mockTests, dsaTopics] = await Promise.all([
      prisma.placementCompany.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.mockTest.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
      }),
      prisma.dsaTopic.findMany({
        where: { userId: user.id },
      }),
    ]);

    // Calculate core CS subject readiness
    const dsaAvg = dsaTopics.length > 0 
      ? Math.round(dsaTopics.reduce((acc, t) => acc + t.progressPercent, 0) / dsaTopics.length)
      : 68;

    const subjectReadiness = PLACEMENT_SUBJECTS.map(s => {
      let readiness = 60;
      if (s.key === 'dsa') readiness = dsaAvg;
      else if (s.key === 'dbms') readiness = 75;
      else if (s.key === 'os') readiness = 65;
      else if (s.key === 'cn') readiness = 55;
      else if (s.key === 'system_design') readiness = 45;
      else if (s.key === 'projects') readiness = 85;
      else if (s.key === 'aptitude') readiness = 70;
      else if (s.key === 'behavioral') readiness = 80;
      else if (s.key === 'mock_interviews') readiness = 50;

      return {
        ...s,
        readinessPercent: readiness,
      };
    });

    const averageTestScore = mockTests.length > 0
      ? Math.round(mockTests.reduce((acc, t) => acc + (t.score / t.maxScore) * 100, 0) / mockTests.length)
      : 0;

    return NextResponse.json({
      subjectReadiness,
      companies,
      mockTests,
      stats: {
        totalCompanies: companies.length,
        mockTestsTaken: mockTests.length,
        averageTestScore,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser(req);
    const body = await req.json();
    const { type } = body;

    if (type === 'MOCK_TEST') {
      const { title, platform = 'LeetCode', score, maxScore = 100, durationMinutes = 60, topicsTested, mistakesAnalysis, difficulty = 'Medium' } = body;
      const test = await prisma.mockTest.create({
        data: {
          userId: user.id,
          title: title.trim(),
          platform,
          score: parseFloat(score),
          maxScore: parseFloat(maxScore),
          durationMinutes: parseInt(durationMinutes, 10),
          topicsTested,
          mistakesAnalysis,
          difficulty,
        },
      });
      return NextResponse.json(test);
    }

    // Otherwise create company
    const { name, role = 'SDE 1', stage = 'APPLICATION', targetDate, dsaPrepPercent = 0, coreCsPrepPercent = 0, systemDesignPrepPercent = 0, behavioralPrepPercent = 0, notes } = body;

    if (!name) return NextResponse.json({ error: 'Company name is required' }, { status: 400 });

    const company = await prisma.placementCompany.create({
      data: {
        userId: user.id,
        name: name.trim(),
        role,
        stage,
        targetDate: targetDate ? new Date(targetDate) : null,
        dsaPrepPercent: parseInt(dsaPrepPercent, 10) || 0,
        coreCsPrepPercent: parseInt(coreCsPrepPercent, 10) || 0,
        systemDesignPrepPercent: parseInt(systemDesignPrepPercent, 10) || 0,
        behavioralPrepPercent: parseInt(behavioralPrepPercent, 10) || 0,
        notes,
      },
    });

    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
