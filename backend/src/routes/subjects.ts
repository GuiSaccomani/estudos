import { Router } from "express";
import { z } from "zod";

import { prisma } from "../prisma.js";

const subjectSchema = z.object({
  title: z.string().min(1),
  topics: z.number().int().min(0),
  tags: z.array(z.string()).default([]),
});

export const subjectsRouter = Router();

subjectsRouter.get("/", async (_req, res) => {
  const subjects = await prisma.subject.findMany({ orderBy: { updatedAt: "desc" } });
  res.json(subjects);
});

subjectsRouter.post("/", async (req, res) => {
  const parsed = subjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const subject = await prisma.subject.create({ data: parsed.data });
  return res.status(201).json(subject);
});

subjectsRouter.put("/:id", async (req, res) => {
  const parsed = subjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const subject = await prisma.subject.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  return res.json(subject);
});

subjectsRouter.delete("/:id", async (req, res) => {
  await prisma.subject.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});
