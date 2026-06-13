import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Enabling Row Level Security (RLS) on all tables...');

  const tables = [
    'Subject',
    'Flashcard',
    'Goal',
    'CalendarEvent',
    'PhilosophyTheme',
    'Reflection',
    'PomodoroSession'
  ];

  try {
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`RLS enabled on table: ${table}`);
    }
    console.log('All done! Security warnings in Supabase should now be resolved.');
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
