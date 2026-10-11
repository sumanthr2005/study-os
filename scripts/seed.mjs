import { seedDemoData } from '../src/lib/seed.js';

async function main() {
  console.log('Seeding Study OS demo data...');
  try {
    const res = await seedDemoData(false);
    console.log('Seeding result:', res);
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

main();
