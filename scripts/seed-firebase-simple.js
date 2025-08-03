// Simple script to seed Firebase with mock data
// Run with: node scripts/seed-firebase-simple.js

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
} from 'firebase/firestore';
import { mockBonsaiData } from '../src/data/mock-bonsai-data.js';

// Firebase configuration (you'll need to add your actual Firebase config here)
const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedFirebase = async () => {
  try {
    console.log('Starting to seed Firebase with mock data...');

    // Check if data already exists
    const existingData = await getDocs(collection(db, 'bonsai'));
    if (!existingData.empty) {
      console.log(
        `Database already contains ${existingData.size} bonsai trees. Skipping seeding.`,
      );
      return;
    }

    for (const tree of mockBonsaiData) {
      const { id, ...treeData } = tree;
      // Use the original ID instead of letting Firebase generate a new one
      await setDoc(doc(db, 'bonsai', id), treeData);
      console.log(`Created bonsai tree: ${tree.name} with ID: ${id}`);
    }

    console.log('Firebase seeding completed successfully!');
    console.log(`Created ${mockBonsaiData.length} bonsai trees.`);
  } catch (error) {
    console.error('Error seeding Firebase:', error);
    throw error;
  }
};

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
