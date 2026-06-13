import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('Reading db_export.json...');
  const fileContent = fs.readFileSync('db_export.json', 'utf8');
  const data = JSON.parse(fileContent);

  console.log('Importing data...');
  
  if (data.subjects && data.subjects.length > 0) {
    await prisma.subject.createMany({ data: data.subjects, skipDuplicates: true });
    console.log(`Imported ${data.subjects.length} subjects.`);
  }

  if (data.flashcards && data.flashcards.length > 0) {
    await prisma.flashcard.createMany({ data: data.flashcards, skipDuplicates: true });
    console.log(`Imported ${data.flashcards.length} flashcards.`);
  }

  if (data.goals && data.goals.length > 0) {
    await prisma.goal.createMany({ data: data.goals, skipDuplicates: true });
    console.log(`Imported ${data.goals.length} goals.`);
  }

  if (data.calendarEvents && data.calendarEvents.length > 0) {
    await prisma.calendarEvent.createMany({ data: data.calendarEvents, skipDuplicates: true });
    console.log(`Imported ${data.calendarEvents.length} calendar events.`);
  }

  if (data.philosophyThemes && data.philosophyThemes.length > 0) {
    await prisma.philosophyTheme.createMany({ data: data.philosophyThemes, skipDuplicates: true });
    console.log(`Imported ${data.philosophyThemes.length} philosophy themes.`);
  }

  if (data.reflections && data.reflections.length > 0) {
    await prisma.reflection.createMany({ data: data.reflections, skipDuplicates: true });
    console.log(`Imported ${data.reflections.length} reflections.`);
  }

  if (data.pomodoroSessions && data.pomodoroSessions.length > 0) {
    await prisma.pomodoroSession.createMany({ data: data.pomodoroSessions, skipDuplicates: true });
    console.log(`Imported ${data.pomodoroSessions.length} pomodoro sessions.`);
  }

  console.log('Data import complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
