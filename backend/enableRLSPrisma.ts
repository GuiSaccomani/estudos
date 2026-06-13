import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Enabling RLS on _prisma_migrations table...');
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;`);
    console.log('RLS enabled on _prisma_migrations');
  } catch (error) {
    console.error('Error enabling RLS:', error);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
