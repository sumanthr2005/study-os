import { NextResponse } from 'next/server';
import { seedDemoData } from '@/lib/seed';

export async function POST(req: Request) {
  try {
    // Security Guard: Prevent data wiping on public or production deployments
    if (process.env.NODE_ENV === 'production') {
      const authHeader = req.headers.get('x-admin-secret');
      const adminSecret = process.env.ADMIN_SECRET || process.env.SEED_SECRET;
      
      if (!adminSecret || authHeader !== adminSecret) {
        return NextResponse.json(
          { error: 'Seeding endpoint is disabled in production to protect real database records.' },
          { status: 403 }
        );
      }
    }

    const { forceReset } = await req.json().catch(() => ({ forceReset: false }));
    const result = await seedDemoData(forceReset);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: error.message || 'Seeding failed' }, { status: 500 });
  }
}

