import { Router } from "express";
import { prisma } from "../prisma.js";

export const authRouter = Router();

authRouter.post("/claim-legacy", async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Find if this user already claimed legacy data, or if legacy data exists
  const legacySubjects = await prisma.subject.count({ where: { userId: "legacy_user" } });
  
  if (legacySubjects === 0) {
    return res.json({ message: "No legacy data to claim" });
  }

  // Update all records with 'legacy_user' to the new userId
  await prisma.$transaction([
    prisma.subject.updateMany({ where: { userId: "legacy_user" }, data: { userId } }),
    prisma.flashcard.updateMany({ where: { userId: "legacy_user" }, data: { userId } }),
    prisma.goal.updateMany({ where: { userId: "legacy_user" }, data: { userId } }),
    prisma.calendarEvent.updateMany({ where: { userId: "legacy_user" }, data: { userId } }),
    prisma.philosophyTheme.updateMany({ where: { userId: "legacy_user" }, data: { userId } }),
    prisma.reflection.updateMany({ where: { userId: "legacy_user" }, data: { userId } }),
    prisma.pomodoroSession.updateMany({ where: { userId: "legacy_user" }, data: { userId } }),
  ]);

  res.json({ message: "Legacy data successfully claimed" });
});
