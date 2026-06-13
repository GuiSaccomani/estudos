import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('Exporting data...');
  const subjects = await prisma.subject.findMany();
  const flashcards = await prisma.flashcard.findMany();
  const goals = await prisma.goal.findMany();
  const calendarEvents = await prisma.calendarEvent.findMany();
  const philosophyThemes = await prisma.philosophyTheme.findMany();
  const reflections = await prisma.reflection.findMany();
  const pomodoroSessions = await prisma.pomodoroSession.findMany();

  const data = {
    subjects,
    flashcards,
    goals,
    calendarEvents,
    philosophyThemes,
    reflections,
    pomodoroSessions
  };

  fs.writeFileSync('db_export.json', JSON.stringify(data, null, 2));
  console.log('Data exported to db_export.json successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
