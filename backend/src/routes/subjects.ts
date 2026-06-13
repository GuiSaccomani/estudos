import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { getAuthFilter } from "../middleware/auth.js";

const subjectSchema = z.object({
  title: z.string().min(1),
  topics: z.number().int().min(0),
  tags: z.array(z.string()).default([]),
  content: z.string().optional().default(""),
  imageUrls: z.array(z.string()).optional().default([]),
  aiSummary: z.string().optional().nullable(),
});

export const subjectsRouter = Router();

subjectsRouter.get("/", async (req, res) => {
  const subjects = await prisma.subject.findMany({ where: getAuthFilter(req.user), orderBy: { updatedAt: "desc" } });
  res.json(subjects);
});

subjectsRouter.post("/", async (req, res) => {
  const parsed = subjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const subject = await prisma.subject.create({ data: { ...parsed.data, userId: req.user.id } });
  return res.status(201).json(subject);
});

subjectsRouter.put("/:id", async (req, res) => {
  const parsed = subjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const subject = await prisma.subject.update({
    where: { id: req.params.id, ...getAuthFilter(req.user) },
    data: parsed.data,
  });
  return res.json(subject);
});

subjectsRouter.delete("/:id", async (req, res) => {
  await prisma.subject.delete({ where: { id: req.params.id, ...getAuthFilter(req.user) } });
  return res.status(204).send();
});
