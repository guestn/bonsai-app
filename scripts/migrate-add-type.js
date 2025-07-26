// This script migrates existing data to add the type field
// Run with: node scripts/migrate-add-type.js

import { migrateAddTypeField } from '../src/utils/seed-firebase.js';

console.log('Starting migration to add type field...');
migrateAddTypeField()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
