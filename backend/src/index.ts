import "dotenv/config";
import cors from "cors";
import express from "express";

import { subjectsRouter } from "./routes/subjects.js";
import { flashcardsRouter } from "./routes/flashcards.js";
import { goalsRouter } from "./routes/goals.js";
import { calendarRouter } from "./routes/calendar.js";
import { philosophyRouter } from "./routes/philosophy.js";
import { reflectionsRouter } from "./routes/reflections.js";
import { pomodoroRouter } from "./routes/pomodoro.js";
import { chatRouter } from "./routes/chat.js";

const app = express();
// Use a safe fallback when PORT is empty or not set.
// If process.env.PORT is an empty string Number('') === 0, which is not desired.
const port = Number(process.env.PORT) || 4000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/subjects", subjectsRouter);
app.use("/api/flashcards", flashcardsRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/philosophy", philosophyRouter);
app.use("/api/reflections", reflectionsRouter);
app.use("/api/pomodoro", pomodoroRouter);
app.use("/api/chat", chatRouter);

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
