import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { getAuthFilter } from "../middleware/auth.js";

const flashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  difficulty: z.string().min(1),
});

export const flashcardsRouter = Router();

flashcardsRouter.get("/", async (req, res) => {
  const flashcards = await prisma.flashcard.findMany({ where: getAuthFilter(req.user), orderBy: { updatedAt: "desc" } });
  res.json(flashcards);
});

flashcardsRouter.post("/", async (req, res) => {
  const parsed = flashcardSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const card = await prisma.flashcard.create({ data: { ...parsed.data, userId: req.user.id } });
  return res.status(201).json(card);
});

flashcardsRouter.put("/:id", async (req, res) => {
  const parsed = flashcardSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const card = await prisma.flashcard.update({
    where: { id: req.params.id, ...getAuthFilter(req.user) },
    data: parsed.data,
  });
  return res.json(card);
});

flashcardsRouter.delete("/:id", async (req, res) => {
  await prisma.flashcard.delete({ where: { id: req.params.id, ...getAuthFilter(req.user) } });
  return res.status(204).send();
});
