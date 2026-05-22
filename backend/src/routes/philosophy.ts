import { Router } from "express";
import { z } from "zod";

import { prisma } from "../prisma.js";

const philosophySchema = z.object({
  theme: z.string().min(1),
  focus: z.string().min(1),
  insight: z.string().min(1),
  philosophers: z.array(z.string()).default([]),
});

export const philosophyRouter = Router();

philosophyRouter.get("/", async (_req, res) => {
  const themes = await prisma.philosophyTheme.findMany({ orderBy: { updatedAt: "desc" } });
  res.json(themes);
});

philosophyRouter.post("/", async (req, res) => {
  const parsed = philosophySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const theme = await prisma.philosophyTheme.create({ data: parsed.data });
  return res.status(201).json(theme);
});

philosophyRouter.put("/:id", async (req, res) => {
  const parsed = philosophySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const theme = await prisma.philosophyTheme.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  return res.json(theme);
});

philosophyRouter.delete("/:id", async (req, res) => {
  await prisma.philosophyTheme.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});
