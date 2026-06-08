import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { initializeApp } from 'firebase/app';
import {
  Timestamp,
  collection,
  getDocs,
  getFirestore,
} from 'firebase/firestore';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import {
  clearBonsaiData,
  importBonsaiData,
  type BonsaiTreeInput,
} from '../prisma/lib/import-bonsai-data';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const timestampToDate = (timestamp: Timestamp | string): string => {
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return timestamp.toDate().toISOString().split('T')[0];
};

async function fetchBonsaiFromFirebase(): Promise<BonsaiTreeInput[]> {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const snapshot = await getDocs(collection(db, 'bonsai'));

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      species: data.species,
      initialCost: data.initialCost,
      acquisitionDate: timestampToDate(data.acquisitionDate),
      status: data.status,
      type: data.type,
      location: data.location,
      potType: data.potType,
      age: data.age,
      notes: data.notes,
      photos: (data.photos || []).map((photo: Record<string, unknown>) => ({
        id: photo.id as string,
        url: photo.url as string,
        fileName: photo.fileName as string | undefined,
        fileSize: photo.fileSize as number | null | undefined,
        contentType: photo.contentType as string | undefined,
        uploadedAt: photo.uploadedAt as string,
        takenAt: photo.takenAt as string | undefined,
        width: photo.width as number | undefined,
        height: photo.height as number | undefined,
        source: photo.source as string | undefined,
        storagePath: photo.storagePath as string | undefined,
      })),
      events: (data.events || []).map((event: Record<string, unknown>) => ({
        id: event.id as string,
        description: event.description as string,
        date: timestampToDate(event.date as Timestamp | string),
        value: event.value as number | undefined,
        cost: (event.cost as number | undefined) ?? 0,
      })),
    };
  });
}

async function main() {
  const trees = await fetchBonsaiFromFirebase();
  const dataPath = join(process.cwd(), 'prisma', 'data', 'bonsai.json');
  writeFileSync(dataPath, JSON.stringify(trees, null, 2));

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    await clearBonsaiData(prisma);
    await importBonsaiData(prisma, trees);
    console.log(`Imported ${trees.length} bonsai trees from Firebase`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
