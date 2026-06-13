import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { getAuthFilter } from "../middleware/auth.js";

const calendarSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
});

export const calendarRouter = Router();

calendarRouter.get("/", async (req, res) => {
  const events = await prisma.calendarEvent.findMany({ where: getAuthFilter(req.user), orderBy: { updatedAt: "desc" } });
  res.json(events);
});

calendarRouter.post("/", async (req, res) => {
  const parsed = calendarSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const event = await prisma.calendarEvent.create({ data: { ...parsed.data, userId: req.user.id } });
  return res.status(201).json(event);
});

calendarRouter.put("/:id", async (req, res) => {
  const parsed = calendarSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const event = await prisma.calendarEvent.update({
    where: { id: req.params.id, ...getAuthFilter(req.user) },
    data: parsed.data,
  });
  return res.json(event);
});

calendarRouter.delete("/:id", async (req, res) => {
  await prisma.calendarEvent.delete({ where: { id: req.params.id, ...getAuthFilter(req.user) } });
  return res.status(204).send();
});
