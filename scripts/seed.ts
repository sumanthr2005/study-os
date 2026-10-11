import { seedDemoData } from '../src/lib/seed';

async function main() {
  console.log('Seeding Study OS demo data...');
  try {
    const res = await seedDemoData(true);
    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

main();
