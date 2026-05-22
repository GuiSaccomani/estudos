import { Router } from "express";
import { z } from "zod";

import { prisma } from "../prisma.js";

const reflectionSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  philosophers: z.array(z.string()).default([]),
});

export const reflectionsRouter = Router();

reflectionsRouter.get("/", async (_req, res) => {
  const reflections = await prisma.reflection.findMany({ orderBy: { updatedAt: "desc" } });
  res.json(reflections);
});

reflectionsRouter.post("/", async (req, res) => {
  const parsed = reflectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const reflection = await prisma.reflection.create({ data: parsed.data });
  return res.status(201).json(reflection);
});

reflectionsRouter.put("/:id", async (req, res) => {
  const parsed = reflectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const reflection = await prisma.reflection.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  return res.json(reflection);
});

reflectionsRouter.delete("/:id", async (req, res) => {
  await prisma.reflection.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});
