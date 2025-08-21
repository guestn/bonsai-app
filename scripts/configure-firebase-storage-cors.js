#!/usr/bin/env node

/**
 * Script to configure Firebase Storage CORS rules
 * Run this script to allow uploads from localhost and other domains
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration for Firebase Storage
const corsConfig = [
  {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:8080',
      'https://your-production-domain.com', // Replace with your actual domain
    ],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
    maxAgeSeconds: 3600,
    responseHeader: [
      'Content-Type',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Headers',
    ],
  },
];

async function configureCors() {
  try {
    console.log('🚀 Configuring Firebase Storage CORS rules...');

    // Check if gcloud is installed
    try {
      execSync('gcloud --version', { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ Google Cloud CLI (gcloud) is not installed.');
      console.log(
        'Please install it from: https://cloud.google.com/sdk/docs/install',
      );
      console.log('Then run: gcloud auth login');
      return;
    }

    // Get the storage bucket from environment or config
    const storageBucket =
      process.env.VITE_FIREBASE_STORAGE_BUCKET ||
      process.env.FIREBASE_STORAGE_BUCKET;

    if (!storageBucket) {
      console.error(
        '❌ VITE_FIREBASE_STORAGE_BUCKET environment variable is not set',
      );
      console.log('Please set it in your .env file');
      return;
    }

    console.log(`📦 Using storage bucket: ${storageBucket}`);

    // Create temporary CORS config file
    const corsConfigPath = path.join(__dirname, 'cors-config.json');
    fs.writeFileSync(corsConfigPath, JSON.stringify(corsConfig, null, 2));

    // Apply CORS configuration
    const command = `gsutil cors set ${corsConfigPath} gs://${storageBucket}`;
    console.log(`🔧 Running: ${command}`);

    execSync(command, { stdio: 'inherit' });

    // Clean up
    fs.unlinkSync(corsConfigPath);

    console.log('✅ Firebase Storage CORS rules configured successfully!');
    console.log(
      '📝 You may need to wait a few minutes for changes to take effect.',
    );
  } catch (error) {
    console.error('❌ Error configuring CORS:', error.message);
    console.log('💡 Alternative solutions:');
    console.log('1. Check if you are authenticated: gcloud auth login');
    console.log(
      '2. Check if you have the correct permissions for the storage bucket',
    );
    console.log('3. Try running this script with elevated permissions');
  }
}

// Manual CORS configuration instructions
function showManualInstructions() {
  console.log('\n📋 Manual CORS Configuration Instructions:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com');
  console.log('2. Select your project');
  console.log('3. Go to Storage > Rules');
  console.log('4. Update the rules to include CORS headers:');
  console.log(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /bonsai/{bonsaiId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid != null;
    }
  }
}
  `);
  console.log('5. Or use the Firebase CLI: firebase deploy --only storage');
}

// Run the configuration
configureCors().then(() => {
  showManualInstructions();
});
