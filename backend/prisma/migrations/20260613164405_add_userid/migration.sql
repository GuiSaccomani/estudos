-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "userId" TEXT NOT NULL DEFAULT 'legacy_user';

-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "userId" TEXT NOT NULL DEFAULT 'legacy_user';

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "userId" TEXT NOT NULL DEFAULT 'legacy_user';

-- AlterTable
ALTER TABLE "PhilosophyTheme" ADD COLUMN     "userId" TEXT NOT NULL DEFAULT 'legacy_user';

-- AlterTable
ALTER TABLE "PomodoroSession" ADD COLUMN     "userId" TEXT NOT NULL DEFAULT 'legacy_user';

-- AlterTable
ALTER TABLE "Reflection" ADD COLUMN     "userId" TEXT NOT NULL DEFAULT 'legacy_user';

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "userId" TEXT NOT NULL DEFAULT 'legacy_user';
