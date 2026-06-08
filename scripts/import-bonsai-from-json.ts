import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import {
  clearBonsaiData,
  importBonsaiData,
  type BonsaiTreeInput,
} from '../prisma/lib/import-bonsai-data';

async function main() {
  const dataPath = join(process.cwd(), 'prisma', 'data', 'bonsai.json');
  const trees = JSON.parse(readFileSync(dataPath, 'utf-8')) as BonsaiTreeInput[];

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    await clearBonsaiData(prisma);
    await importBonsaiData(prisma, trees);
    console.info(`Imported ${trees.length} bonsai trees`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
