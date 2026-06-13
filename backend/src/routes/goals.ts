import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { getAuthFilter } from "../middleware/auth.js";

const goalSchema = z.object({
  label: z.string().min(1),
  detail: z.string().default(""),
  progress: z.number().int().min(0).max(100),
});

export const goalsRouter = Router();

goalsRouter.get("/", async (req, res) => {
  const goals = await prisma.goal.findMany({ where: getAuthFilter(req.user), orderBy: { updatedAt: "desc" } });
  res.json(goals);
});

goalsRouter.post("/", async (req, res) => {
  const parsed = goalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const goal = await prisma.goal.create({ data: { ...parsed.data, userId: req.user.id } });
  return res.status(201).json(goal);
});

goalsRouter.put("/:id", async (req, res) => {
  const parsed = goalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const goal = await prisma.goal.update({
    where: { id: req.params.id, ...getAuthFilter(req.user) },
    data: parsed.data,
  });
  return res.json(goal);
});

goalsRouter.delete("/:id", async (req, res) => {
  await prisma.goal.delete({ where: { id: req.params.id, ...getAuthFilter(req.user) } });
  return res.status(204).send();
});
