"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FocusSession = {
  id: string;
  label: string;
  minutes: number;
  completedAt: string;
};

export type StudyGoal = {
  id: string;
  label: string;
  target: number;
  progress: number;
  period: "daily" | "weekly" | "monthly";
};

type StudyState = {
  focusSessions: FocusSession[];
  goals: StudyGoal[];
  totalMinutesToday: number;
  streakDays: number;
  addSession: (session: FocusSession) => void;
  updateGoal: (goalId: string, progress: number) => void;
};

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      focusSessions: [],
      goals: [
        {
          id: "goal-daily",
          label: "2h de estudo profundo",
          target: 120,
          progress: 70,
          period: "daily",
        },
        {
          id: "goal-weekly",
          label: "6 revisoes ativas",
          target: 6,
          progress: 3,
          period: "weekly",
        },
        {
          id: "goal-monthly",
          label: "12 mapas filosoficos",
          target: 12,
          progress: 5,
          period: "monthly",
        },
      ],
      totalMinutesToday: 96,
      streakDays: 12,
      addSession: (session) =>
        set((state) => ({
          focusSessions: [session, ...state.focusSessions].slice(0, 20),
          totalMinutesToday: state.totalMinutesToday + session.minutes,
        })),
      updateGoal: (goalId, progress) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId ? { ...goal, progress } : goal
          ),
        })),
    }),
    {
      name: "study-flow-state",
      partialize: (state) => ({
        focusSessions: state.focusSessions,
        goals: state.goals,
        totalMinutesToday: state.totalMinutesToday,
        streakDays: state.streakDays,
      }),
    }
  )
);
