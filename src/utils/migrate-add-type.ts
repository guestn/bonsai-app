import { BonsaiService } from '../services/bonsai-service';

// Helper function to recursively remove undefined values from objects
const removeUndefinedValues = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues).filter((item) => item !== undefined);
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedValues(value);
      }
    }
    return cleaned;
  }

  return obj;
};

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

      // Recursively remove any undefined values from the object and its nested properties
      const cleanTree = removeUndefinedValues(updatedTree);

      // Use setDoc to replace the entire document to avoid undefined value issues
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      const docRef = doc(db, 'bonsai', tree.id);
      await setDoc(docRef, cleanTree, { merge: true });
      console.info(`Updated tree ${tree.name} with type: purchased`);
    }

    console.info('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

// Function to be called from browser console
export const runMigrationFromBrowser = async () => {
  try {
    console.info('Running migration from browser...');
    await migrateAddTypeField();
    console.info('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Make it available globally for browser console access
if (typeof window !== 'undefined') {
  (window as any).runMigration = runMigrationFromBrowser;
  console.info(
    'Migration function loaded. Use runMigration() in console to migrate data.',
  );
}
