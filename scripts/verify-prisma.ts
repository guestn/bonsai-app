import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const count = await prisma.bonsaiTree.count();
  console.log(`✅ Connected (${count} bonsai trees)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
