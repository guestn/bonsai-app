import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import {
  clearBonsaiData,
  importBonsaiData,
  type BonsaiTreeInput,
} from './lib/import-bonsai-data';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const dataPath = join(
    dirname(fileURLToPath(import.meta.url)),
    'data',
    'bonsai.json',
  );
  const trees = JSON.parse(readFileSync(dataPath, 'utf-8')) as BonsaiTreeInput[];

  await clearBonsaiData(prisma);
  await importBonsaiData(prisma, trees);

  console.info(`Imported ${trees.length} bonsai trees`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
