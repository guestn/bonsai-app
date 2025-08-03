// This script seeds Firebase with mock data
// Run with: node scripts/seed-firebase.js

import { seedFirebase } from '../src/utils/seed-firebase.ts';

console.log('Starting Firebase seeding...');
seedFirebase()
  .then(() => {
    console.log('Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
