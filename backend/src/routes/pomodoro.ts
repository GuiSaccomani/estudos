import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { getAuthFilter } from "../middleware/auth.js";

const pomodoroSchema = z.object({
  label: z.string().min(1),
  minutes: z.number().int().min(1),
  completedAt: z.string().min(1),
});

export const pomodoroRouter = Router();

pomodoroRouter.get("/", async (req, res) => {
  const sessions = await prisma.pomodoroSession.findMany({ where: getAuthFilter(req.user), orderBy: { completedAt: "desc" } });
  res.json(sessions);
});

pomodoroRouter.post("/", async (req, res) => {
  const parsed = pomodoroSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const session = await prisma.pomodoroSession.create({
    data: {
      userId: req.user.id,
      label: parsed.data.label,
      minutes: parsed.data.minutes,
      completedAt: new Date(parsed.data.completedAt),
    },
  });
  return res.status(201).json(session);
});

pomodoroRouter.delete("/:id", async (req, res) => {
  await prisma.pomodoroSession.delete({ where: { id: req.params.id, ...getAuthFilter(req.user) } });
  return res.status(204).send();
});
