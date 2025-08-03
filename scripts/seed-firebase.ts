// This script seeds Firebase with mock data
// Run with: npx ts-node scripts/seed-firebase.ts

import { seedFirebase } from '../src/utils/seed-firebase.js';

console.info('Starting Firebase seeding...');
seedFirebase()
  .then(() => {
    console.info('Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
