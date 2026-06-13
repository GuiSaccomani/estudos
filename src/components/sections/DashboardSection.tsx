"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";

const container = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

type PomodoroSession = { completedAt: string; minutes: number };
type Goal = { progress: number };

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function DashboardSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(
    [] as Array<{ label: string; value: string; detail: string }>
  );
  const [weekly, setWeekly] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    Promise.all([
      apiFetch<{ id: string }[]>("/api/flashcards"),
      apiFetch<Goal[]>("/api/goals"),
      apiFetch<PomodoroSession[]>("/api/pomodoro"),
    ])
      .then(([flashcards, goals, sessions]) => {
        if (!isMounted) return;

        const today = new Date();
        const todayKey = dateKey(today);
        const sessionByDay = new Map<string, number>();
        sessions.forEach((session) => {
          const key = dateKey(new Date(session.completedAt));
          sessionByDay.set(key, (sessionByDay.get(key) ?? 0) + session.minutes);
        });

        const totalMinutesToday = sessionByDay.get(todayKey) ?? 0;
        const completedGoals = goals.filter((goal) => goal.progress >= 100).length;
        const goalLabel = `${completedGoals}/${goals.length}`;

        let streak = 0;
        const streakCursor = new Date(today);
        while (true) {
          const key = dateKey(streakCursor);
          if ((sessionByDay.get(key) ?? 0) > 0) {
            streak += 1;
            streakCursor.setDate(streakCursor.getDate() - 1);
          } else {
            break;
          }
        }

        const weeklyMinutes: number[] = [];
        for (let i = 6; i >= 0; i -= 1) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          weeklyMinutes.push(sessionByDay.get(dateKey(date)) ?? 0);
        }

        setWeekly(weeklyMinutes.map((value) => Math.min(100, value)));
        setStats([
          {
            label: "Tempo estudado hoje",
            value: `${Math.floor(totalMinutesToday / 60)}h ${totalMinutesToday % 60}m`,
            detail: totalMinutesToday ? "Atualizado agora" : "Sem sessoes hoje",
          },
          {
            label: "Sequencia atual",
            value: `${streak} dias`,
            detail: streak ? "Consistencia ativa" : "Inicie uma sessao hoje",
          },
          {
            label: "Metas do dia",
            value: goalLabel,
            detail: goals.length ? "Progresso em andamento" : "Crie sua primeira meta",
          },
          {
            label: "Revisoes inteligentes",
            value: `${flashcards.length} cards`,
            detail: flashcards.length ? "Pronto para revisar" : "Crie flashcards",
          },
        ]);
        setError(null);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message || "Erro ao carregar dashboard");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const hasWeekly = useMemo(() => weekly.some((value) => value > 0), [weekly]);
  const displayStats: ({ label: string; value: string; detail: string } | undefined)[] =
    isLoading
      ? Array.from({ length: 4 }).map(() => undefined)
      : stats;

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Painel geral"
        title="Clareza do dia"
        description="Tudo o que voce precisa para decidir o proximo passo com foco total."
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {displayStats.map((stat, index) => (
          <motion.div key={stat?.label ?? `stat-${index}`} variants={item}>
            <Card className="backdrop-blur-md bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                {isLoading ? (
                  <Skeleton className="h-4 w-28 bg-white/10" />
                ) : (
                  <CardDescription>{stat!.label}</CardDescription>
                )}
                {isLoading ? (
                  <Skeleton className="mt-3 h-7 w-24 bg-white/10" />
                ) : (
                  <CardTitle className="text-2xl">{stat!.value}</CardTitle>
                )}
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {isLoading ? <Skeleton className="h-3 w-24 bg-white/10" /> : stat!.detail}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Card className="overflow-hidden backdrop-blur-md bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300">
        <CardHeader>
          <CardTitle>Ritmo semanal</CardTitle>
          <CardDescription>Horas de estudo nos últimos 7 dias.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-7 items-end gap-3">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={`day-skel-${index}`} className="space-y-2">
                  <Skeleton className="h-24 w-full rounded-full" />
                  <Skeleton className="mx-auto h-3 w-6" />
                </div>
              ))}
            </div>
          ) : hasWeekly ? (
            <div className="grid grid-cols-7 items-end gap-3">
              {weekly.map((value, index) => (
                <div key={`day-${index}`} className="space-y-2">
                  <div className="h-24 rounded-full bg-white/5">
                    <div
                      className="h-full w-full rounded-full bg-gradient-to-t from-accent to-transparent"
                      style={{ height: `${Math.min(100, Math.max(0, value))}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    {index + 1}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sem sessoes recentes. Inicie um pomodoro para ver o ritmo semanal.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
