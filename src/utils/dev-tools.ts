import { seedFirebase, clearFirebase } from './seed-firebase';
import { migrateAddTypeField } from './migrate-add-type';

// Development tools for Firebase management
export const DevTools = {
  // Seed the database with mock data
  seedDatabase: async () => {
    try {
      await seedFirebase();
      alert('Database seeded successfully!');
    } catch (error) {
      alert(`Error seeding database: ${error}`);
    }
  },

  // Clear all data from the database
  clearDatabase: async () => {
    if (
      confirm('Are you sure you want to clear all data? This cannot be undone.')
    ) {
      try {
        await clearFirebase();
        alert('Database cleared successfully!');
      } catch (error) {
        alert(`Error clearing database: ${error}`);
      }
    }
  },

  // Get current database status
  getDatabaseStatus: async () => {
    try {
      const { BonsaiService } = await import('../services/bonsai-service');
      const data = await BonsaiService.getAllBonsai();
      alert(`Database contains ${data.length} bonsai trees`);
    } catch (error) {
      alert(`Error getting database status: ${error}`);
    }
  },

  // Migrate existing data to add type field
  migrateAddType: async () => {
    try {
      await migrateAddTypeField();
      alert('Migration completed successfully!');
    } catch (error) {
      alert(`Error during migration: ${error}`);
    }
  },
};

// Make DevTools available globally for easy access
if (typeof window !== 'undefined') {
  (window as any).DevTools = DevTools;
}
