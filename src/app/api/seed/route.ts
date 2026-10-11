import { NextResponse } from 'next/server';
import { seedDemoData } from '@/lib/seed';

export async function POST(req: Request) {
  try {
    const { forceReset } = await req.json().catch(() => ({ forceReset: false }));
    const result = await seedDemoData(forceReset);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: error.message || 'Seeding failed' }, { status: 500 });
  }
}
