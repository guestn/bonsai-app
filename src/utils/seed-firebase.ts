import { BonsaiService } from '../services/bonsai-service';
import { mockBonsaiData } from '../data/mock-bonsai-data';

// Migration function to add type field to existing data
export const migrateAddTypeField = async () => {
  try {
    console.info(
      'Starting migration to add type field to existing bonsai trees...',
    );

    // Get all existing bonsai trees
    const existingData = await BonsaiService.getAllBonsai();

    if (existingData.length === 0) {
      console.info('No bonsai trees found in database. Nothing to migrate.');
      return;
    }

    console.info(`Found ${existingData.length} bonsai trees to migrate.`);

    for (const tree of existingData) {
      // Skip if the tree already has a type field
      if (tree.type) {
        console.info(`Tree ${tree.name} already has type field: ${tree.type}`);
        continue;
      }

      // Add a default type based on some logic or just use 'purchased' as default
      const updatedTree = {
        ...tree,
        type: 'purchased' as const, // Default to purchased
      };

      // Update the tree in the database
      await BonsaiService.updateBonsai(tree.id, updatedTree);
      console.info(`Updated tree ${tree.name} with type: purchased`);
    }

    console.info('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

export const seedFirebase = async () => {
  try {
    console.info('Starting to seed Firebase with mock data...');

    // First, let's check if data already exists
    const existingData = await BonsaiService.getAllBonsai();
    if (existingData.length > 0) {
      console.info(
        `Database already contains ${existingData.length} bonsai trees. Skipping seeding.`,
      );
      return;
    }

    for (const tree of mockBonsaiData) {
      const { id, ...treeData } = tree;
      // Use the original ID instead of letting Firebase generate a new one
      await BonsaiService.createBonsaiWithId(id, treeData);
      console.info(`Created bonsai tree: ${tree.name} with ID: ${id}`);
    }

    console.info('Firebase seeding completed successfully!');
    console.info(`Created ${mockBonsaiData.length} bonsai trees.`);
  } catch (error) {
    console.error('Error seeding Firebase:', error);
    throw error;
  }
};

// Function to clear all data (useful for testing)
export const clearFirebase = async () => {
  try {
    console.info('Clearing all bonsai data from Firebase...');
    const existingData = await BonsaiService.getAllBonsai();

    for (const tree of existingData) {
      await BonsaiService.deleteBonsai(tree.id);
      console.info(`Deleted bonsai tree: ${tree.name}`);
    }

    console.info('Firebase cleared successfully!');
  } catch (error) {
    console.error('Error clearing Firebase:', error);
    throw error;
  }
};

// Run this function to seed the database
// seedFirebase().catch(console.error);
